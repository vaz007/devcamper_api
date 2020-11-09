import Bootcamp from "../models/Bootcamp";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middleware/async";
import geocoder from "../utils/geocoder";
// @desc: get all bootcamps
// @route: GET /api/v1/bootcamps
// @access:

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  // req.query will get query from the url string
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];
  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  // console.log(reqQuery);

  // Create query String
  let queryStr = JSON.stringify(reqQuery);

  // Create Operators ($gt, $gte, etc read mongoos docs for more info)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
  // console.log(queryStr)

  // Finding resource
  query = Bootcamp.find(JSON.parse(queryStr));

  // Select fields
  // just to retrive particular fields instead of entire object
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query.sort("-createdAt");
  }
  // Pagination
  // good for fetching small amounts of data
  // but if we use cache system then we wont need this
  const page = parseInt(req.query.page, 10 || 1);
  const limit = parseInt(req.query.limit, 10 || 1);
  const startIndex = (page -1) * limit;
  const endIndex = page * limit;
  const skip = (page -1) * limit;
  const total = await Bootcamp.countDocuments();
  query = query.skip(skip).limit(limit)


  // Execute query
  const bootcamps = await query;
  // Pagination result
  const pagination = {}
  if(endIndex < total){
    pagination.next = {
      page: page +1,
      limit
    }
  }
  if(startIndex > 0 ){
    pagination.prev = {
      page: page - 1,
      limit
    }
  }
  
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
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
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
  // custom error handler
});

// @desc: Update bootcamps
// @route: PUT /api/v1/bootcamps/:id
// @access: Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamps) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamps });
});

// @desc: Delete  bootcamps
// @route: DELETE /api/v1/bootcamps/:id
// @access: Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamps) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res
    .status(200)
    .json({ success: true, data: `Succesfully deleted ${bootcamps}` });
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
