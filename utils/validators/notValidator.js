const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const user = require("../../models/userModel");

exports.getnotValidator = [
  check("id").isMongoId().withMessage("Invalid not id format"),
  validatorMiddleware,
];

exports.createnotValidator = [
  check("message")
    .notEmpty()
    .withMessage("not required")
    .isLength({ min: 2 })
    .withMessage("Too short not message")
    .isLength({ max: 32 })
    .withMessage("Too long not message")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("userId")
    .notEmpty()
    .withMessage("not required")
    .isMongoId()
    .withMessage("Invalid not id format")
    .custom((urerId, { req }) =>
      user
        .findById(urerId)
        .where("section")
        .equals(req.body.section)
        .then((usere) => {
          if (!usere) {
            return Promise.reject(new Error(`No user for this id: ${urerId}`));
          }
        })
    ),
  check("articleId")
    .notEmpty()
    .withMessage("not required")
    .isMongoId()
    .withMessage("Invalid not id format")
    .custom((artid, { req }) =>
      user.findById(artid).then((article) => {
        if (!article) {
          return Promise.reject(new Error(`No user for this id: ${artid}`));
        }
      })
    ),
  validatorMiddleware,
];

exports.updatenotValidator = [
  check("id").isMongoId().withMessage("Invalid not id format"),
  body("message")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("userId")
    .notEmpty()
    .withMessage("not required")
    .isMongoId()
    .withMessage("Invalid not id format")
    .custom((urerId, { req }) =>
      user
        .findById(urerId)
        .where("section")
        .equals(req.body.section)
        .then((usere) => {
          if (!usere) {
            return Promise.reject(new Error(`No user for this id: ${urerId}`));
          }
        })
    ),
    check("articleId")
    .notEmpty()
    .withMessage("not required")
    .isMongoId()
    .withMessage("Invalid not id format")
    .custom((artid, { req }) =>
      user
        .findById(artid)
        .then((article) => {
          if (!article) {
            return Promise.reject(new Error(`No user for this id: ${artid}`));
          }
        })
    ),
  validatorMiddleware,
];

exports.deletenotValidator = [
  check("id").isMongoId().withMessage("Invalid not id format"),
  validatorMiddleware,
];
