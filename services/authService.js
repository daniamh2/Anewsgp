const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const copy = require("../models/copyModel");

const User = require("../models/userModel");

// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await User.create({
    userName: req.body.userName,
    email: req.body.email,
    role: req.body.role,
    section: req.body.section,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // 2- Generate token
  const token = createToken(user._id); //delete

  res.status(201).json({ data: user, token });
});

// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
exports.logine = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user exist & check if password is correct
  const user = await User.findOne({ email: req.body.email });
  console.log(user);

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  if (user.active === false) {
    return next(new ApiError("user deleted", 401));
  }

  // 3) generate token
  const token = createToken(user._id);

  // Delete password from response
  delete user._doc.password;
  // 4) send response to client side
  res.status(200).json({ data: user, token });
});

// @desc    Loginn
// @route   GET /api/v1/auth/login
// @access  Public
exports.loginn = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user exist & check if password is correct
  const user = await User.findOne({ userName: req.body.userName });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect user name or password", 401));
  }
  if (user.active === false) {
    console.log(user.active);
    return next(new ApiError("user deleted", 401));
  }

  // 3) generate token
  const token = createToken(user._id);

  // Delete password from response
  delete user._doc.password;
  // 4) send response to client side
  res.status(200).json({ data: user, token });
});

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  const header = req.headers.authorization || req.headers.Authorization;

  if (header && header.startsWith("Bearer")) {
    token = header.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        ` لم تقم بتسجيل الدخول
        الرجاء تسجيل الدخول للوصول إلى هذه الخاصية`,
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        // "The user that belong to this token does no longer exist",
        "عملية تسجيل الدخول لم تعد صالحة",
        401
      )
    );
  }

  // 4) Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          // "User recently changed his password. please login again..",
          `لقد قمت بتغيير كلمة السر
           الرجاء معاودة تسجيل لدخول`,
          401
        )
      );
    }
  }
  req.user = currentUser;
  console.log(req.user.role);
  next();
});

// @desc    Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    console.log(roles)
    console.log((req.user.role))
    if (!roles.includes(req.user.role)) {
      console.log(req.user.role);
      return next(new ApiError(" أنت لا تمتلك صلاحية الوصول لهذه الخاصية", 403));
    }
    // console.log(req.body)
    next();
  });

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(
        `لا يوجد حساب ينتمي لهذا البريد 
      ${req.body.email}`,
        404
      )
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();
  console.log("Hashed Reset Code:", user.passwordResetCode, resetCode);
  console.log("Expires:", user.passwordResetExpires);
  console.log("Verified:", user.passwordResetVerified);

  // 3) Send the reset code via email
  const message = `Hi ${user.firstName},
  \n We received a request to reset the password on your Account in our E-news website. 
  \n ${resetCode} \n Enter this code to complete the reset. 
  \n Thanks for helping us keep your account secure.\n E-news Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      html: `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
          }
          .container {
            width: 80%;
            margin: auto;
            background-color: #f7f7f7;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .content {
            margin-top: 20px;
            line-height: 2;
            color: #999;
          }
          .code {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            display: inline-block;
            color: #c7254e;
            border: 1px solid #f9f9f9;
            font-size: 1.5em;

          }
          .footer {
            margin-top: 30px;
            font-size: 0.8em;
            color: #888;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="header">🔑 E-news Password Reset</h2>
          <div class="content">
            <p>Hi ${user.firstName},</p>
            <p>We received a request to reset the password on your Account in our E-news website.</p>
            <p>Your reset code is: <span class="code">${resetCode}</span></p>
            <p>Enter this code to complete the reset.</p>
            <p>Thanks for helping us keep your account secure. 🔒</p>
          </div>
          <div class="footer">📰 E-news Team</div>
        </div>
      </body>
      </html>
      `,
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }
  console.log("Verified:", user.passwordResetVerified);

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  //trim pass
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});

exports.isTheWritter = asyncHandler(async (req, res, next) => {
  // 1) access roles
  // 2) access registered user (req.user.role)
  if (req.user.role === "author") {
    const doc = await copy.findById(req.params.id);
    if(String(doc.author._id) !== String(req.user._id))
    return next(new ApiError("wrأنت لا تمتلك صلاحية الوصول لهذه الخاصية", 403));
  }

  // console.log(req.body)
  next();
});

exports.isTheEditor = asyncHandler(async (req, res, next) => {
  // 1) access roles
  // 2) access registered user (req.user.role)
  if (req.user.role === "editor") {
    const doc = await copy.findById(req.params.id);
    console.log(doc.editor._id)
    console.log(req.user._id)
    if(String(doc.editor._id) !== String(req.user._id))
    return next(new ApiError("l;أنت لا تمتلك صلاحية الوصول لهذه الخاصية", 403));
  }
  // console.log(req.body)
  next();
});
