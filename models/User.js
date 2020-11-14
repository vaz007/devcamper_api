import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "please add an email"],
    unique: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  resetPassowrdToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if(!this.isModified('password')){
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
// MATCH USER PASSWORD TO THE HASHED PASSWORD IN DATABASE
UserSchema.methods.matchPassword = async function (enteredPassword) {
  console.log(this.password, enteredPassword)
  return await bcrypt.compare(enteredPassword, this.password);
};
// generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate Token
  const resetToken = crypto.randomBytes(20).toString('hex');
  // Hash Token and set resetPassword Field
  this.resetPassowrdToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  console.log(resetToken)
  return resetToken;
}

module.exports = mongoose.model("User", UserSchema);
