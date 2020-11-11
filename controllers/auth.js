import path from "path";
import User from "../models/User";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middleware/async";

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
  const token = user.getSignedJwtToken();
  res.status(200).json({
    success: true,
    token,
  });
});
