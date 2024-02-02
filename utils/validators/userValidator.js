const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.createUserValidator = [
  check("firstName")
    .notEmpty()
    .withMessage("first name required")
    .isLength({ min: 2 })
    .withMessage("Too short User name"),
  check("lastName")
    .notEmpty()
    .withMessage("last name required")
    .isLength({ min: 2 })
    .withMessage("Too short User name"),

  check("userName")
    .notEmpty()
    .withMessage("Username required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      User.findOne({ userName: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("username already in user"));
        }
      });
      return true;
    }),
  check("section")
    .notEmpty()
    .withMessage("user must be belong to a section")
    .isMongoId()
    .withMessage("Invalid ID formate"),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),

  check("profileImg").optional(),
  check("role")
    .optional()
    .isIn(["admin", "editorInChief", "editor", "author", "techSupport"])
   ,

  validatorMiddleware,
];

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("userName")
    .optional()
    .custom(async (val, { req }) => {
      req.body.slug = slugify(val);
      const exist = User.findOne({ userName: val });
      if (exist && exist.id !== req.params._id) {
        return Promise.reject(new Error("username already used"));
      }
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val, { req }) => {
      const existingUser = await User.findOne({ email: val });
      if (existingUser && existingUser.id !== req.params.id) {
        throw new Error("Email already in use");
      }
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),

  check("profileImg").optional(),
  check("role")
    .optional()
    .isIn(["admin", "editorInChief", "editor", "author", "techSupport"]),
  //.custom in sections
  check("section")
    .notEmpty()
    .withMessage("user must be belong to a section")
    .isMongoId()
    .withMessage("Invalid ID formate"),

  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  body("role")
    .optional()
    .custom((value, { req }) => {
      // Check if the role is being changed
      if (req.user.role) {
        throw new Error(`"Changing user role is not allowed"${value}`);
      }
      return true;
    }),
  body("section")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((value, { req }) => {
      // Check if the sec is being changed
      console.log(req.user);
      if (value !== req.user.section) {
        // If the se is being changed, reject the request
        throw new Error("Changing user section is not allowed");
      }
      return true;
    }),
  body("userName")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val, { req }) => {
      const existingUser = await User.findOne({ email: val });

      if (existingUser && existingUser.id !== req.user._id.toString()) {
        throw new Error("Email already in use");
      }
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),

  validatorMiddleware,
];
