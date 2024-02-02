const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const ApiError = require("../utils/apiError");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const factory = require("./handlersFactory");
const copy = require("../models/copyModel");
const Post = require("../models/postModel");
const Notification = require("../models/notofication");

exports.uploadpostImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizepostImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  console.log(req.files);
  //1- Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `post-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/posts/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  //2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `post-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/posts/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
    next();
  }
});

// @desc    Get list of published copies
// @route   GET /api/v1/copies
// @access  Public
exports.getcopies = factory.getAll(copy, "copies");

// @desc    Get list of pending copies
// @route   GET /api/v1/pending
// @access  private
exports.getpends = factory.getAll(copy, "copies", { status: "pending" });

// @desc    Get list of draft copies
// @route   GET /api/v1/draft
// @access  private
exports.getdrafts = factory.getAll(copy, "copies", { status: "draft" });

// @desc    Get list of review copies
// @route   GET /api/v1/review
// @access  private
exports.getrevs = factory.getAll(copy, "copies", { status: "under-review" });

exports.confirm = asyncHandler(async (req, res, next) => {
  const copy = await copy.findById(req.params.postId);
  //nnotify  msg
  if (copy.status === "pending") {
    copy.status = "published";
  } else if (copy.status === "under-review") {
    copy.status = "pending";
  } else if (Post.status === "draft") {
    Post.status = "under-review";
  }

  const msg = req.body.message;
  copy.save();
  res.status(200).json({
    success: true,
    data: { copy, msg },
  });
});

exports.cancle = asyncHandler(async (req, res, next) => {
  const copy = await copy.findById(req.params.id);
  if (copy.status === "published") {
    copy.status = "pending";
  } else if (copy.status === "pending") {
    copy.status = "under-review";
  } else if (copy.status === "under-review") {
    copy.status = "draft";
  }
  const notification = new Notification({
    userId: copy.author,
    articleId: copy._id,
    message: `Your article has been updated by the ${copy.editor}.`,
    details: `updated article: ${copy} `,
    comment: req.body.feedback,
  }); //design message

  await notification.save();
  const msg = req.body.message; //notify
  copy.save();
  res.status(200).json({
    success: true,
    data: { copy, msg },
  });
});
// @desc    Get specific copy by id
// @route   GET /api/v1/copies/:id
// @access  Public
exports.getcopy = factory.getOne(copy, {
  path: "editor",
  select: "-_id userName",
});

// @desc    Create copy
// @route   POST  /api/v1/copies
// @access  Private
exports.createcopy = asyncHandler(async (req, res) => {
  console.log("ser")
  let dataDoc;
  if (req.params.id) {
    const foundPost = await Post.findById(req.params.id).lean();
    if (
      (req.user.role === "author" && foundPost.author === req.user._id) ||
      req.user.role === "admin"
    ) {
      if (!foundPost) {
        return res
          .status(404)
          .json({ status: "error", message: "Post not found" });
      }
      dataDoc = foundPost;
      dataDoc.postId = req.params.id;
      dataDoc._id = req.params.id;
      dataDoc.status = "draft";
      dataDoc.admin = req.user._id;
      console.log(dataDoc);
    } else {
      dataDoc = req.body;
      console.log(dataDoc);
    }
    const newDoc = await copy.create(dataDoc);
    res.status(201).json({ data: newDoc, id: newDoc._id });
  } else {
    return next(
      new ApiError(
        `No document for this id ${req.params.id} or not allowed access`,
        404
      )
    );
  }
});
//  factory.createOne(copy);

// @desc    Update specific copy
// @route   PUT /api/v1/copies/:id
// @access  Private
exports.updatecopy = factory.updateOne(copy, "copies");

// @desc    Delete specific copy
// @route   DELETE /api/v1/copies/:id
// @access  Private
exports.deletecopy = factory.deleteOne(copy);

// @desc    Get list of copies
// @route   GET /api/v1/copies
// @access  Public
exports.getrevcopies = factory.getAll(copy, "copies", "under-review");

// @desc    Get specific copy by id
// @route   GET /api/v1/copies/:id
// @access  Public
exports.getrevcopy = factory.getOne(copy);

// @desc    Update specific copy
// @route   PUT /api/v1/copies/:id
// @access  Private
exports.updaterevcopy = factory.updateOne(copy, "under-review");
