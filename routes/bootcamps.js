import express from "express";
const {
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  createBootcamp,
  getBootcampsInRadius,
} = require("../controllers/bootcamps");
//Include other resource routers
const courseRouter = require("./courses");

const router = express.Router();

// Re-route into other resourse routers
// will send to the routes file of courses
router.use("/:bootcampId/courses", courseRouter);

// Ends here

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/").get(getBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);
module.exports = router;
