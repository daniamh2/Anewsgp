const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const section = require("../../models/sectionModel");
const user = require("../../models/userModel");

exports.createpostValidator = [
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
  //insure if available section id
  check("section") //section,auth,adeitor cons
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
        .findById(req.user._id) //id?????????????????//
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
    ), //draft
  check("type").optional().isIn(["news", "blog", "breaking"]), // publishing?
  check("editor")
    .optional()
    // .withMessage("post must be belong to a section")
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

  validatorMiddleware,
];

exports.getpostValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];

exports.updatepostValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
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
  //insure if available section id
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
        .findById(req.user._id) //id?????????????????//
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
  check("type").optional().isIn(["news", "blog", "breaking"]),
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

  validatorMiddleware,
];

exports.deletepostValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];
