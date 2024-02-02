const io = require("socket.io")();
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const Notification = require("../models/notofication");
const copy=require("../models/copyModel")
const post=require("../models/postModel")
//  const cp = require("./copyService");

exports.deleteOne = (Model, Modelname = "") =>
  asyncHandler(async (req, res, next) => {
    let filter = {};
    filter._id = req.params.id;
    if (Modelname === "copies" && req.user) {
      req.body.status = req.Pstatus;
      if (req.user.role === "author") {
        filter.author = req.user._id;
        filter.status = "draft";
      } else if (req.user.role === "admin") {
        filter.author = req.user._id;
        filter.status = "pending";
      }
    }
    const document = await Model.findOneAndDelete(filter);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    if (Modelname === "post") {
      const notification = new Notification({
        userId: document.author,
        articleId: document._id,
        message: `Your article has been deleted by  ${req.user.userName}.`,
        details: `updated article: ${document} `,
        comment: req.body.feedback,
      }); //design message

      await notification.save();
    }
    // Trigger "remove" event when update document
    // document.remove();
    res.status(204).send("deleted successfully");
  });

exports.updateOne = (Model, Modelname = "") =>
  asyncHandler(async (req, res, next) => {
    console.log("up")
    let filter = {};
    filter._id = req.params.id;
    if ((Modelname === "posts" || Modelname === "copies") && req.user) {
      req.body.status = req.Pstatus;
      if (req.user.role === "editor") {
        filter.editor = req.user._id;
        filter.status = "under-review";
      } else if (req.user.role === "author") {
        filter.author = req.user._id;
        filter.status = "draft";
      } else if (req.user.role === "admin") {
        filter.status = "pending"; //if update admins post?
      }
    }
    
    console.log(filter);

    const document = await Model.findOneAndUpdate(filter, req.body, {
      new: true,
    });

    console.log(document);
    if (Modelname === "copy") {
      const notification = new Notification({
        userId: document.author,
        articleId: document._id,
        message: `Your article has been updated by the ${document.editor}.`,
        details: `updated article: ${document} `,
        comment: req.body.feedback,
      }); //design message

      await notification.save();
    }
    console.log(`donw`);
    if (!document) {
      return next(
        new ApiError(
          `No document for this id ${req.params.id} or not allowed access`,
          404
        )
      );
    }
    // Trigger "save" event when update document
    await document.save();
    if (req.body.process === "next" && req.user.role === "admin") {
      // createpost();
      if (req.params.id) {
        const foundPost = await copy.findById(req.params.id);
        console.log(foundPost);
        if (!foundPost) {
          return res
            .status(404)
            .json({ status: "error", message: "Post not found" });
        }
        const newDoc = await post.create({
          title: foundPost.title,
          slug: foundPost.slug,
          content: foundPost.content,
          imageCover: foundPost.imageCover,
          images: foundPost.images,
          links: foundPost.links,
          tags: foundPost.tags,
          section: foundPost.section, // assuming section is a reference
          author: foundPost.author,
        });
        console.log(foundPost);
        const document = await copy.findOneAndDelete({ _id: req.params.id });
        res.status(201).json({ data: newDoc, id: newDoc._id });
      } 
    }
    res.status(200).json({ data: document }); 
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    console.log(req.user.role);
    console.log(req.status);

    res.status(201).json({ data: newDoc });
  });
exports.getOne = (Model, populationOpt, filter = {}) =>
  asyncHandler(async (req, res, next) => {
    filter._id = req.params.id;
    // 1) Build query
    let query = Model.find(filter);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = "", filter = {}) =>
  asyncHandler(async (req, res) => {
    if (req.filterObj) {
      filter = req.filterObj;
    }
    //(modelName === "posts" || modelName === "copies")
    if ((modelName === "posts" || "copies") && req.user) {
      console.log(req.user);
      if (req.user.role === "editor") filter.editor = req.user._id;
      else if (req.user.role === "author"||req.user.role === "author") {
        filter.author = req.user._id;
      } else if (req.user.role === "admin")    {
        filter.author = req.user._id;
      }
    } //delete if all posts
    if (modelName === "nots" && req.user) {
      filter.userId = req.user._id;
    }

    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .limitFields()
      .sort()
      .search(modelName);

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

// const fs = require('fs'); //delete photos
// const path = require('path');
// const Post = require('./models/Post');

// exports.deletePost = async (req, res) => {
//   const postId = req.params.id;

//   try {
//     // Find the post to get the image file names
//     const post = await Post.findById(postId);

//     // Delete the post document
//     await Post.findByIdAndDelete(postId);

//     // Delete the images from the file system
//     post.images.forEach((imageName) => {
//       const imagePath = path.join(__dirname, 'public/uploads', imageName);
//       fs.unlinkSync(imagePath);
//     });

//     res.status(200).json({ message: 'Post deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
