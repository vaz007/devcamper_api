import express from "express";
const {
    getReviews
} = require("../controllers/reviews");

import { protect, authorize } from "../middleware/auth";

import advancedResults from "../middleware/advancedResults";
import Review, { model } from "../models/Review";
// Merge params will take the bootcampId
// from the bootcamp routes file which is getting
// redirected to theis folder
const router = express.Router({ mergeParams: true });


router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
//   .post(protect, authorize("publisher", "admin"), addCourse);
// router
//   .route("/:id")
//   .get(getCourse)
//   .put(protect, authorize("publisher", "admin"), updateCourse)
//   .delete(protect, authorize("publisher", "admin"), deleteCourse);


module.exports = router;

