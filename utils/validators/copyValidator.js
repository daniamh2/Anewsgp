const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const section = require("../../models/sectionModel");
const user = require("../../models/userModel");
const post = require("../../models/postModel");
const copy = require("../../models/copyModel");
const User = require("../../models/userModel");

exports.createcopyValidator = [
  // check("type").optional().isIn(["news", "blog", "breaking"]),
  // check("postId")
  //   .isMongoId()
  //   .withMessage("Invalid ID formate")
  //   .custom((postId) =>
  //     post.findById(postId).then((post) => {
  //       if (!post) {
  //         return Promise.reject(new Error(`No section for this id: ${postId}`));
  //       }
  //     })
  //   ),
     check("status")
    .optional()
    .isIn(["pending", "published", "under-review", "draft"])
  .custom((val, { req }) =>
    user
      .findById(req.user._id)
      .then((per) => {
        if (
          (req.user.role === "author" &&
            !["draft", "under-review"].includes(val)) ||
          (req.user.role === "editor" &&
            !["pending", "under-review"].includes(val))
        ) {
          return Promise.reject(
            new Error(`no permission to set this status`)
          );
        }
      })
  ),
  // check("oldTitle")
  //   .isLength({ min: 3 })
  //   .withMessage("must be at least 2 chars")
  //   .notEmpty()
  //   .withMessage("post must be belong to post"),

  // check("title")
  //   .isLength({ min: 3 })
  //   .withMessage("must be at least 2 chars")
  //   .notEmpty()
  //   .withMessage("post required")
  //   .custom((val, { req }) => {
  //     req.body.slug = slugify(val);
  //     return true;
  //   }),
  // check("status")
  //   .optional()
  //   .isIn(["pending", "updated", "under-review", "draft"]),

    check("content")
    .notEmpty()
    .withMessage("post content is required")
    .isLength({ max: 2000 })
    .withMessage("Too long content"),
    //  check("oldContent")
    // .notEmpty()
    // .withMessage("post content is required")
    // .isLength({ max: 2000 })
    // .withMessage("Too long content"),
  //insure if available section id
  check("section")
    .notEmpty()
    .withMessage("post must be belong to a section")
    .isMongoId()
    .withMessage("Invalid ID sec formate")
    .custom((sectionId) =>
      section.findById(sectionId).then((section) => {
        if (!section) {
          return Promise.reject(
            new Error(`No section for this id: ${sectionId}`)
          );
        }
      })
    ),
  check("editor")
    .notEmpty()
    .withMessage("post must be belong to a section")
    .isMongoId()
    .withMessage("Invalid ed ID formate")
    .custom((editorId) =>
      user
        .findById(editorId)
        .where("role")
        .equals("editor")
        .then((editor) => {
          if (!editor) {
            return Promise.reject(
              new Error(`No editor for this edt id: ${editorId}`)
            );
          }
        })
    ),
  check("author")
    .notEmpty()
    .isMongoId()
    .withMessage("Invalid aut ID formate")
    .custom((authorId, { req }) =>
      user
        .findById(authorId)
        .where("section")
        .equals(req.body.section)
        .then((author) => {
          if (!author) {
            return Promise.reject(
              new Error(`No author for this id: ${authorId}`)
            );
          }
        })
    ),

  validatorMiddleware,
];

exports.getcopyValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];

exports.updatecopyValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  //optional
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 2 chars")
    .notEmpty()
    .withMessage("post required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("content")
    .notEmpty()
    .withMessage("post content is required")
    .isLength({ max: 2000 })
    .withMessage("Too long content"),
  check("section")
    .notEmpty()
    .withMessage("post must be belong to a section")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((sectionId) =>
      section.findById(sectionId).then((section) => {
        if (!section) {
          return Promise.reject(
            new Error(`No section for this id: ${sectionId}`)
          );
        }
      })
    ),
  check("status")
    .optional()
    .isIn(["pending", "published", "under-review", "draft"])
  .custom((val, { req }) =>
    user
      .findById(req.user._id)
      .then((per) => {
        if (
          (req.user.role === "author" &&
            !["draft", "under-review"].includes(val)) ||
          (req.user.role === "editor" &&
            !["pending", "under-review"].includes(val))
        ) {
          return Promise.reject(
            new Error(`no permission to set this status`)
          );
        }
      })
  ),
  check("process")
    .notEmpty()
    .withMessage("you shold select processing type: save, next, reject ")
    .isIn(["save", "next", "reject"])
    .custom(async (val, { req }) => {

      const user = await User.findById(req.user._id);
      const post = await copy.findById(req.params.id);
      if (!post || !user) {
        throw new Error("There is no doc for this id");
      }
      if (req.body.process === "reject") {
        if (post.status === "published" && req.user.role === "admin") {
          req.Pstatus = "pending";
        } else if (post.status === "pending" && req.user.role === "admin") {
          req.Pstatus = "draft";
        } else if (
          post.status === "under-review" &&
          req.user.role === "editor"
        ) {
          req.Pstatus = "draft";
        }
      } else if (req.body.process === "next") {
        console.log("draf");
        // if (post.status === "pending" && req.user.role === "admin") {
        //   req.Pstatus = "published";
          
        // } else
         if (
          post.status === "under-review" &&
          req.user.role === "editor"
        ) {
          req.Pstatus = "pending";
        } else if (post.status === "draft" && req.user.role === "author") {
          req.Pstatus = "under-review";
          console.log(post);
        }
      } else req.Pstatus = post.status;
      return true;
    }),
  check("type").optional().isIn(["news","breaking"]),

  check("postId")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((postId, { req }) =>
      copy.findById(postId).then((post) => {
        if (!post) {
          console.log(postId);
          return Promise.reject(new Error(`No post for this id: ${postId}`));
        }
      })
    ),
  check("author")
    .notEmpty()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((authorId, { req }) =>
      user
        .findById(authorId)
        .where("section")
        .equals(req.body.section)
        .then((author) => {
          if (!author) {
            return Promise.reject(
              new Error(`No author for this id: ${authorId}`)
            );
          }
        })
    ),
  check("editor")
    .notEmpty()
    .withMessage("post must be belong to an editor")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((editorId) =>
      user
        .findById(editorId)
        .where("role")
        .equals("editor")
        .then((editor) => {
          if (!editor) {
            return Promise.reject(
              new Error(`No section for this id: ${editorId}`)
            );
          }
        })
    ),

  validatorMiddleware,
];

exports.deletecopyValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];
