import path from "path";
import Bootcamp from "../models/Bootcamp";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middleware/async";
import geocoder from "../utils/geocoder";
// @desc: get all bootcamps
// @route: GET /api/v1/bootcamps
// @access:

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
// @desc: get Sigle bootcamps
// @route: GET /api/v1/bootcamps/:id
// @access: Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.id);
  if (!bootcamps) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamps });
});

// @desc: Create new bootcamps
// @route: POST /api/v1/bootcamps
// @access: Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  // check for published bootcamps
  const publishedBootcamps = await Bootcamp.findOne({ user: req.user.id });
  // if user is not admin then they can add only one admin
  if (publishedBootcamps && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `user with id ${req.user.id} has already published a bootcamp`
      ),
      400
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc: Update bootcamps
// @route: PUT /api/v1/bootcamps/:id
// @access: Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update the bootcamp`,
        401
      )
    );
  }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc: Delete  bootcamps
// @route: DELETE /api/v1/bootcamps/:id
// @access: Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.id);
  if (!bootcamps) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  // Make sure user is bootcamp owner
  if (bootcamps.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete the bootcamp`,
        401
      )
    );
  }

  bootcamps.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc: GET  bootcamps within radius
// @route: DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access: Private

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // GET lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate radius using radius
  // Divide distance by radius of earth
  // Earth radius = 3,963 miles / 6378 kms
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat]], radius } },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc: Upload photo for bootcamps
// @route: PUT /api/v1/bootcamps/:id/photo
// @access: Private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.id);
  if (!bootcamps) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
   // Make sure user is bootcamp owner
   if (bootcamps.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update the bootcamp`,
        401
      )
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  // console.log(req.files.file);
  const file = req.files.file;
  // make sure it is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
  // check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`Please upload an image less than 10 MB`, 400)
    );
  }
  // create custom file name
  file.name = `photo_${bootcamps._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
