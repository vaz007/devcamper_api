import Course from "../models/Course";
import Bootcamp from "../models/Bootcamp";

import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middleware/async";

// @desc: get all courses
// @route: GET /api/v1/courses
// @route: GET /api/v1/courses/bootcamps/:bootcampId/courses
// @access: Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    // Populate will get some data or the entire document from bootcamp schemas
    res.status(200).json(res.advancedResults);
  }
});

// @desc: get single courses
// @route: GET /api/v1/courses/:id
// @access: Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!course) {
    return next(
      new ErrorResponse(`Course does not exist${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: course });
});

// @desc: Add course
// @route: POST /api/v1/bootcamps/:bootcampId/courses
// @access: Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp does not exist${req.params.bootcampId}`, 404)
    );
  }
  const course = await Course.create(req.body);
  res.status(200).json({
    success: true,
    data: course,
  });
  res.status(200).json({ success: true, data: course });
});

// @desc: Update course
// @route: PUT /api/v1/courses/:id
// @access: Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse(`course was not found${req.params.id}`, 404));
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: course,
  });
  res.status(200).json({ success: true, data: course });
});

// @desc: Delete course
// @route: DELETE /api/v1/courses/:id
// @access: Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse(`course was not found${req.params.id}`, 404));
  }
  await course.remove();
  res.status(200).json({ success: true, data: {} });
});
