import express from 'express'
import dotenv from 'dotenv';
import morgan from 'morgan'
import colors from 'colors';

// import DB 
import connectDB from './config/db'

// Route Files
import bootcamps from "./routes/bootcamps";

// Middleware Logger
import logger from './middleware/logger';

// Load env vars
dotenv.config({ path: "./config/config.env" });


// connect to database
connectDB();
const app = express();
// Body Parser
app.use(express.json())

// Dev logging middleware
if(process.env.NODE_ENV === 'developmet'){
    app.use(morgan('dev'));
}
app.use(logger)
app.use("/api/v1/bootcamps", bootcamps);

const PORT = process.env.PORT;
const server = app.listen(PORT || 5000, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    // close server and exit process
    server.close(() => {
        process.exit(1);
    });
})