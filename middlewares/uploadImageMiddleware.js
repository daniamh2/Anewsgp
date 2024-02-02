const multer = require('multer');
const ApiError = require('../utils/apiError');

const multerOptions = () => {

  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only Images allowed', 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
// const multer = require('multer');
// const path= require("path")
// const ApiError = require('../utils/apiError');


// const multerOptions = () => {

//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null,path.join(__dirname,"../uploads"))
//     }
//   })
//   // const multerStorage = multer.memoryStorage();

//   const multerFilter = function (req, file, cb) {
//     if (file.mimetype.startsWith('image')) {
//       cb(null, true);
//     } else {
//       cb(new ApiError('Only Images allowed', 400), false);
//     }
//   };

//   const upload = multer({ storage, fileFilter: multerFilter });

//   return upload;
// };

// exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

// exports.uploadMixOfImages = (arrayOfFields) =>
//   multerOptions().fields(arrayOfFields);
