import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import fileupload from "express-fileupload";
import colors from "colors";
import path from "path";
import cookieParser from "cookie-parser";

// import DB
import connectDB from "./config/db";

// Route Files
import bootcamps from "./routes/bootcamps";
import courses from "./routes/courses";
import auth from "./routes/auth";
import users from './routes/users'
import reviews from './routes/reviews'

// Middleware Logger
// import logger from './middleware/logger';

// Error Handler
import errorHandler from "./middleware/error";

// Load env vars
dotenv.config({ path: "./config/config.env" });

// connect to database
connectDB();
const app = express();
// Body Parser
app.use(express.json());
// Cookie Parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "developmet") {
  app.use(morgan("dev"));
}
// File upload
app.use(fileupload());
// set static folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/admin", users);
app.use("/api/v1/reviews", reviews);
app.use(errorHandler);

const PORT = process.env.PORT;
const server = app.listen(PORT || 5000, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err, promise) => {
  // console.log(`Error: ${err.message}`.red)
  // close server and exit process
  server.close(() => {
    process.exit(1);
  });
});
