import express from "express";
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

import advancedResults from "../middleware/advancedResults";
import Course from "../models/Course";
// Merge params will take the bootcampId
// from the bootcamp routes file which is getting
// redirected to theis folder
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(addCourse);
router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
