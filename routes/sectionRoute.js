const express = require("express");

const {
  getsectionValidator,
  createsectionValidator,
  updatesectionValidator,
  deletesectionValidator,
} = require("../utils/validators/sectionValidator");

const {
  getsections,
  getsection,
  createsection,
  updatesection,
  deletesection,
} = require("../services/sectionService");

const authService = require("../services/authService");

// const subsectionsRoute = require('./subsectionRoute');

const router = express.Router();

// Nested route
// router.use('/:sectionId/subsections', subsectionsRoute);

// "admin", "editorInChief", "editor"

router
  .route("/")
  .get(getsections)
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    createsectionValidator,
    createsection
  );
router
  .route("/:id")
  .get(getsectionValidator, getsection)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    updatesectionValidator,
    updatesection
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),

    deletesectionValidator,
    deletesection
  );

module.exports = router;
