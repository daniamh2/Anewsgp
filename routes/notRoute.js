const express = require("express");

// const {
//   getnotValidator,
//   createnotValidator,
//   updatenotValidator,
//   deletenotValidator,
// } = require("../utils/validators/notValidator");

const {
  getnots,
  getnot,
  createnot,
  updatenot,
  deletenot,
} = require("../services/notService");

const authService = require("../services/authService");

const router = express.Router();

// Nested route
// router.use('/:notId/posts', subnotsRoute);

// "admin", "editorInChief", "editor"

router
  .route("/")
  .get(authService.protect,
     getnots
    )
//   .post(
//     authService.protect,
//     authService.allowedTo("admin"),
//     // createnotValidator,
//     createnot
//   );
router
  .route("/:id")
  .get(authService.protect,
    // getnotValidator
     getnot)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    // updatenotValidator,
    updatenot
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),

    // deletenotValidator,
    deletenot
  );

module.exports = router;
