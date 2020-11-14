import mongoose from "mongoose";
import slugify from "slugify";
import geocoder from "../utils/geocoder";
const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description cannot be more than 50 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number cannot be more than 20 character"],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    location: {
      // GEO_JSON
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      Street: String,
      City: String,
      State: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating mustbe atleat 1"],
      max: [10, "Rating cannot be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// MIDDLEWARE DIRECTLY FROM MONGOOSE
// READ MONGOOSE DOCS

// Create bootcamp slug from name
BootcampSchema.pre("save", function (next) {
  // console.log('Slugify ran', this.name)
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & create location field from address
// change from mapquest to google maps

// BootcampSchema.pre('save', async function(next) {
//   // console.log('Slugify ran', this.name)
//   const loc = await geocoder.geocode(this.address)
//   this.location = {
//     type: 'Point',
//     coordinates: [loc[0].longitude, loc[0].latittude],
//     formattedAddress: loc[0].formattedAddress,
//     streetName: loc[0].streetName,
//     city: loc[0].city,
//     state: loc[0].stateCode,
//     zipcode: loc[0].zipcode,
//     countryCode: loc[0].countryCode
//   }
//   // Do not save address in DB
//   this.address = undefined;
//   next();
// })

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre("remove", async function (next) {
  await this.model("Course").deleteMany({ bootcamp: this._id });
  next();
});

// Reverse populate with virtuals
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
