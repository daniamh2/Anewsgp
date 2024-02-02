const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const factory = require("./handlersFactory");
const post = require("../models/postModel");
const copy = require("../models/copyModel");
const process = require("./copyService");
const Breaking = require("../models/breaking");

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

// @desc    Get list of published posts
// @route   GET /api/v1/posts
// @access  Public
exports.getposts = factory.getAll(post, "posts"); //delete status, { status: "published" }
exports.getprcessed = factory.getAll(copy, "copies");

// @desc    Get list of pending posts
// @route   GET /api/v1/pending
// @access  private
exports.getpends = factory.getAll(post, "posts", { status: "pending" });

// @desc    Get list of draft posts
// @route   GET /api/v1/draft
// @access  private
exports.getdrafts = factory.getAll(copy, "copies", { status: "draft" });

// @desc    Get list of review posts
// @route   GET /api/v1/review
// @access  private
exports.getrevs = factory.getAll(copy, "copies", { status: "under-review" });

// @desc    Get specific post by id
// @route   GET /api/v1/posts/:id
// @access  Public
exports.getpost = factory.getOne(post);

// @desc    Create post
// @route   POST  /api/v1/posts
// @access  Private
exports.createcopy = factory.createOne(copy);
exports.createpost = asyncHandler(async (req, res) => {
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
  } else if (req.body.type === "breaking") {
    const newDoc = await Breaking.create({
      content: req.body.content,
      tags: req.body.tags,
      title: req.body.details,
      author: req.user._id,
    }); //io
    res.status(201).json({ data: newDoc });
  }
});

// @desc    Update specific post
// @route   PUT /api/v1/posts/:id
// @access  Private
// exports.updatepost = factory.updateOne(post,"post");
exports.updatepost = process.updatecopy;

// @desc    Delete specific post
// @route   DELETE /api/v1/posts/:id
// @access  Private
exports.deletepost = factory.deleteOne(post);

// @desc    Get specific post by id
// @route   GET /api/v1/posts/:id
// @access  Public
exports.getrevpost = factory.getOne(copy, "", { status: "under-review" });

// // @desc    Update specific post
// // @route   PUT /api/v1/posts/:id
// // @access  Private
// exports.updaterevpost = factory.updateOne(post, "under-review");
