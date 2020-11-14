import express from "express";
const {
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  createBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");
import { protect, authorize } from "../middleware/auth";
import advancedResults from "../middleware/advancedResults";
import Bootcamp from "../models/Bootcamp";
//Include other resource routers
const courseRouter = require("./courses");
const reviewRouter = require('./reviews');

const router = express.Router();

// Re-route into other resourse routers
// will send to the routes file of courses
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

// Ends here

//photo upload
router.route("/:id/photo").put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);
router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize('publisher', 'admin'),createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'),updateBootcamp)
  .delete(protect,authorize('publisher', 'admin'), deleteBootcamp);
module.exports = router;
