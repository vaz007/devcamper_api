import express from "express";
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

import User from "../models/User";

import { protect, authorize } from "../middleware/auth";
import advancedResults from "../middleware/advancedResults";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);


module.exports = router;
