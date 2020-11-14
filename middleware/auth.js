import jwt from "jsonwebtoken";
import asyncHandler from "./async";
import ErrorResponse from "../utils/errorResponse";
import User from "../models/User";

// Protect Routes

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // else if(req.cookies.token){
  //     token = req.cookies.token;

  // }

  // make sure token exist
  if (!token) {
    return next(new ErrorResponse("Not Authorized to access this route"), 401);
  }
  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {}
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`
        ),
        403
      );
    }
    next();
  };
};
