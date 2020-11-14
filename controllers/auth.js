import path from "path";
import crypto from "crypto";
import User from "../models/User";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middleware/async";
import sendEmail from "../utils/sendEmail";

// @desc: Register User
// @route: Post /api/v1/auth/register
// @access: Public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  // Create User
  // static is called directly on the schema and method is called on that variable
  // For example static will be called in User where as
  // method will be called into the variable user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  sendTokenResponse(user, 200, res);
});

// @desc: Sign In User / GET USER
// @route: POST /api/v1/auth/login
// @access: Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // Get a  User
  // validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password"), 400);
  }
  // Check for user if it exist
  // +passsword because in model password select is false
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials"), 401);
  }
  // check if password matches
  const isMatch = await user.matchPassword(password);
  console.log(isMatch)
  if (!isMatch) {
    
    // console.log(user)
    return next(new ErrorResponse("Invalid Credentials"), 401);
  }
  sendTokenResponse(user, 200, res);
});

// @desc: Get current logged In User / GET USER
// @route: POST /api/v1/auth/me
// @access: Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc: Forgot Password
// @route: POST /api/v1/auth/forgotPassword
// @access: Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse("No User with that email"), 404);
  }
  // reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `You are receiving this email because you requested to reset password. Please make a PUT request to : \n\n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    res.status(200).json({
      success: true,
      data: "Email Sent",
    });
  } catch (error) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    return next(new ErrorResponse("Email could not be sent"), 500);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc:   Reset Password
// @route:  PUT /api/v1/auth/resetPassword/:resettoken
// @access: Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed Token
  const resetPassowrdToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  // console.log("Reset Token", resetPasswordToken);
  const user = await User.findOne({
    resetPassowrdToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  // console.log(user);
  if (!user) {
    return next(new ErrorResponse("Invalid Token"), 400);
  }
  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc: Update USER details
// @route: Put /api/v1/auth/updateDetails
// @access: Private

exports.updateUserDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc: Update USER Password
// @route: PUT /api/v1/auth/me
// @access: Private

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  // check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Passwords is incorrect"), 401);
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// Get token from model and create cookie and send response

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
