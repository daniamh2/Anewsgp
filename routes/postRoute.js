const express = require("express");
const {
  getpostValidator,
  createpostValidator,
  updatepostValidator,
  deletepostValidator,
} = require("../utils/validators/postValiditor");

const {
  getprcessed,
  getposts,
  getdrafts,
  getpends,
  getrevs,
  getpost,
  getrevpost,
  createpost,
  updatepost,
  updaterevpost,
  deletepost,
  uploadpostImages,
  resizepostImages,
  createcopy,
} = require("../services/postService");
const authService = require("../services/authService");
// const reviewsRoute = require('./reviewRoute');
const copyRoute = require("./copyRoute");
const { deletecopy } = require("../services/copyService");

const router = express.Router();
router.use("/:id/update", copyRoute);

// authService.allowedTo('admin', 'manager'),
//
router
  .route("/")
  .get(getposts)
  .post(
    authService.protect,
    authService.allowedTo("admin", "author"),
    uploadpostImages,
    resizepostImages,
    createpostValidator,
    createcopy
  );  



router
  .route("/myposts")
  .get(authService.protect, authService.allowedTo("author", "admin"), getposts);
  
router
  .route("/prosisingposts") //test
  .get(
    authService.protect,
    authService.allowedTo("author", "admin"),
    getprcessed
  );

router
  .route("/draft")
  .get(
    authService.protect,
    authService.allowedTo("admin", "author", "editor"),
    getdrafts
  );

//put status ,cont,ed
router
  .route("/pending")
  .get(
    authService.protect,
    authService.allowedTo("admin", "author", "editor"),
    getpends
  );

router
  .route("/review")
  .get(
    authService.protect,
    authService.allowedTo("admin", "author", "editor"),
    getrevs
  );

router
  .route("/:id")
  .get(getpostValidator, getpost)
  // .patch(
  //   authService.protect,
  //   authService.allowedTo("admin", "author"),
  //   uploadpostImages,
  //   resizepostImages,
  //   updatepostValidator,
  //   updatepost
  // )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deletepostValidator,
    deletepost
  );


module.exports = router;
