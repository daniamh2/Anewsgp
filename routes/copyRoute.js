const express = require("express");
const {
  getcopyValidator,
  createcopyValidator,
  updatecopyValidator,
  deletecopyValidator,
} = require("../utils/validators/copyValidator");
const {
  createpostValidator,
} = require("../utils/validators/postValiditor");

const {
  createpost,
} = require("../services/postService");


const {
  getcopies,
  getdrafts,
  getpends,
  getrevs,
  getcopy,
  getrevcopies,
  getrevcopy,
  createcopy,
  updatecopy,
  updaterevcopy,
  deletecopy,
  uploadpostImages,
  resizepostImages, 
} = require("../services/copyService");
const authService = require("../services/authService");
// const reviewsRoute = require('./reviewRoute');

const router = express.Router({ mergeParams: true });

// authService.allowedTo('admin', 'manager'),
 router
  .route("/")
  .get(authService.protect,getcopies)
  .post(
    authService.protect,
    authService.allowedTo("admin", "author"), 
    createcopy
  );
  router
  .route("/:id/publish")
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    createpost, 
  );
  router
  .route("/publish")
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    createpost, 
  );
  
router
  .route("/:id")
  .get(getcopyValidator, getcopy)
  .put(
    authService.protect,
    authService.allowedTo("author","editor","admin" ),
    authService.isTheEditor,
    authService.isTheWritter,
    uploadpostImages,
    resizepostImages,
    updatecopyValidator,
    updatecopy
  )
  
  .delete(//test it
    authService.protect,
    authService.allowedTo("admin","author"),
    deletecopyValidator,
    deletecopy
  );

module.exports = router;
