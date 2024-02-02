const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getsectionValidator = [
  check('id').isMongoId().withMessage('Invalid section id format'),
  validatorMiddleware,
]; 

exports.createsectionValidator = [
  check('name')
    .notEmpty()
    .withMessage('section required')
    .isLength({ min: 2 })
    .withMessage('Too short section name')
    .isLength({ max: 32 })
    .withMessage('Too long section name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.updatesectionValidator = [
  check('id').isMongoId().withMessage('Invalid section id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deletesectionValidator = [
  check('id').isMongoId().withMessage('Invalid section id format'),
  validatorMiddleware,
];
