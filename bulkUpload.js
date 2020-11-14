// BABEL NOT CONFIGURED FOR THE FILE
// SO WILL NEEDTO CHANGE DB IMPORTS AS WELL

const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
// const Bootcamp = require('./models/Bootcamp');
const Course = require("./models/Course");
const User = require("./models/User");
//load env vars
dotenv.config({ path: "./config/config.env" });

// Connect DB

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
// console.log(
//   `MongoDB connected: ${connection.connection.host}`.cyan.underline.bold
// );

// Read JSON

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

// Import into DB Bulk Upload
const importData = async () => {
  try {
    // await Bootcamp.create(bootcamps);
    // await Course.create(courses);
    await User.create(users);
    console.log("Data Import....".green.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

// DELETE DATA
// DELETE EVERYTHING
const deleteData = async () => {
  // try {
  //   await Bootcamp.deleteMany();
  //   await Course.deleteMany();
  //   await User.deleteMany();
  //   console.log("Data Destroyed....".red.inverse);
  //   process.exit();
  // } catch (error) {
  //   console.error(error);
  // }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
