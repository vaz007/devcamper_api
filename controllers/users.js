import User from "../models/User";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middleware/async";

// Admin Functionalities

// @desc: Get all Users
// @route: GET /api/v1/admin
// @access: Private/admin

exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc: Get Single Users
// @route: GET /api/v1/admin/:id
// @access: Private/admin

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  console.log(user)
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc: Create Single User
// @route: POST /api/v1/admin
// @access: Private/admin

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc: Update Single User
// @route: PUT /api/v1/admin/:id
// @access: Private/admin

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});



// @desc: Delete Single User
// @route: DELETE /api/v1/auth/users/:id
// @access: Private/admin

exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
    });
  });