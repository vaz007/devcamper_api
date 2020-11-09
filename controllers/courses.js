import Course from "../models/Course";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middleware/async";

// @desc: get all courses
// @route: GET /api/v1/courses
// @route: GET /api/v1/courses/bootcamps/:bootcampId/courses
// @access: Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find();
  }
  const courses = await query;
  res.status(200).json({ success: true, count: courses.length, data: courses });
});
