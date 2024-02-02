const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
} = require("../services/userService");

const authService = require("../services/authService");

const router = express.Router();
//user data
router.get("/getMe", authService.protect, getLoggedUserData, getUser);
router.put("/changeMyPassword", authService.protect, updateLoggedUserPassword);
router.patch(
  "/updateMe",
  authService.protect,
  updateLoggedUserValidator,
  updateLoggedUserData
);

// Admin
router.put(
  "/changePassword/:id",
  authService.protect,
  authService.allowedTo("admin"),
  changeUserPasswordValidator,
  changeUserPassword
);
router
  .route("/")
  .get(getUsers)
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    // uploadUserImage,
    // resizeImage,
    createUserValidator,
    createUser
  );
//
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    updateUserValidator,
    updateUser
  )
  // uploadUserImage, resizeImage,
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
