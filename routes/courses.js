import express from "express";
const { getCourses } = require("../controllers/courses");
// Merge params will take the bootcampId
// from the bootcamp routes file which is getting
// redirected to theis folder
const router = express.Router({ mergeParams: true });

router.route("/").get(getCourses);
module.exports = router;
