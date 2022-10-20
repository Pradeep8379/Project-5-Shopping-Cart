const mongoose = require("mongoose");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
};

//-------------------valid password-------------------------//

const isValidPassword = function (password) {
  password = password.trim();
  if (password.length < 8 || password.length > 15) {
    return false;
  }
  return true;
};
//--------------------- email regex ----------------------//

const isVAlidEmail = function (email) {
  return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
};

//---------------------- phone regex --------------------//

const isValidPhone = function (phone) {
  return /^[6789]\d{9}$/.test(phone);
};

//----------------------- pincode -----------------------//

const isValidPincode = function (pincode) {
  return /^[1-9][0-9]{5}$/.test(pincode);
};

//-------------------valid body----------------------//
const isValidBody = function (x) {
  return Object.keys(x).length > 0;
};

//-------------------valid name------------------------//
const isValidName = function (name) {
  const nameRegex = /^[a-zA-Z]+$/;
  return nameRegex.test(name);
};

//-------------------valid object Id------------------//
const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

//-----------------valid number--------------------//
const isValidPrice = function (price) {
  return /^\d+(\.\d{1,2})?$/.test(price);
};

//-----------------valid size---------------------//
function isValidSize(size) {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(size) !== -1;
}

//------------------valid status--------------------//

function isValidStatus(status) {
  return ["pending", "completed", "cancelled"].indexOf(status) !== -1;
}

module.exports = {
  isValidPassword,
  isVAlidEmail,
  isValidPhone,
  isValid,
  isValidPincode,
  isValidBody,
  isValidName,
  isValidObjectId,
  isValidPrice,
  isValidSize,
  isValidStatus,
};
