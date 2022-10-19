const mongoose = require("mongoose");
const userModel = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim:true
    },
    lname: {
      type: String,
      required: true,
      trim:true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim:true
    },
    profileImage: {
      type: String,
       required: true,
      trim:true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim:true
    },
    password: {
      type: String,
      required: true,
      trim:true
    },
    address: {
      shipping: {
        street: {
          type: String,
          requried: true,
          trim:true
        },
        city: {
          type: String,
          required: true,
          trim:true
        },
        pincode: {
          type: Number,
          required: true,
          trim:true
        },
      },
      billing: {
        street: {
            type: String,
             requried: true,
            trim:true
          },
          city: {
            type: String,
             required: true,
            trim:true
          },
          pincode: {
            type: Number,
             required: true,
            trim:true
          },
        },
      },
    },
  { timestamps: true }
);

module.exports = mongoose.model("user", userModel);