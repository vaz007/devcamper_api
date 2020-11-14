import Review from "../models/Review";
import Bootcamp from "../models/Bootcamp";

import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middleware/async";

// @desc: get all Reviews
// @route: GET /api/v1/reviews
// @route: GET /api/v1/bootcamps/:bootcampId/reviews
// @access: Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});