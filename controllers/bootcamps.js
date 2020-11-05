import Bootcamp from "../models/Bootcamp";

// @desc: get all bootcamps
// @route: GET /api/v1/bootcamps
// @access:

exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

// @desc: get all bootcamps
// @route: GET /api/v1/bootcamps/:id
// @access: Public

exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.findById(req.params.id);
    if (!bootcamps) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: bootcamps });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

// @desc: Create new bootcamps
// @route: POST /api/v1/bootcamps
// @access: Private

exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

// @desc: Update bootcamps
// @route: PUT /api/v1/bootcamps/:id
// @access: Private

exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, 
      {
      new: true, 
      runValidators: true
    })
    if (!bootcamps) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: bootcamps });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

// @desc: Delete  bootcamps
// @route: DELETE /api/v1/bootcamps/:id
// @access: Private

exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.findByIdAndDelete(req.params.id)
    if (!bootcamps) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: `Succesfully deleted ${bootcamps}` });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};
