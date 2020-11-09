import ErrorResponse from "../utils/errorResponse";

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  // Log to console for dev
  console.log(err);
  // Mongoose bad ObjectId
  console.log(err.name);
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    console.log(err.message.red);
    error = new ErrorResponse(message, 404);
  }
  // Mongoose duplicate key
  // using code because Mongo Name error is also used for other mongo errors
  if (err.code === 11000) {
    const message = `Duplicate field value entered ${err.value}`;
    console.log(err.message.green);
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error for various required fields
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  // custom error if not server error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;