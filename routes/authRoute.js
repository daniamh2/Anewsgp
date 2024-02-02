const express = require("express");
const {
  signupValidator,
  loginByEmailValidator,
  loginByUsernameValidator,
} = require("../utils/validators/authValidator");

const {
  signup,
  loginn,
  logine,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../services/authService");

const router = express.Router();
 
router.post("/logine", loginByEmailValidator, logine);//after loggging in add check if no user profile or email or phone then add
router.post("/loginn", loginByUsernameValidator, loginn);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyPassResetCode);
router.put("/resetPassword", resetPassword);

module.exports = router;
