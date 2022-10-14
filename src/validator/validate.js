const mongoose = require("mongoose");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
};



const isValidPassword = function (password) {
  password = password.trim()
  if (password.length < 8 || password.length > 15) {
    return false
  } return true
}
//------------------------------- email regex --------------------------------------------//

const isVAlidEmail = function (email) {
  return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
};

//---------------------- phone regex --------------------//

const isValidPhone = function (phone) {
  return /^[6789]\d{9}$/.test(phone);
};

//-----------------------profileImage-----------------------//

const isValidUrl = function (profileImage) {
  return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(
    profileImage
  );
};

// const isValidPincode = function (pincode) {
//     if (pincode.toString().length != 6) {
//         return false
//     } return true
// }

const isValidPincode = function (pincode) {
  return (/^[1-9][0-9]{5}$/).test(pincode)

}

const isValidbody = function (x) {
  return Object.keys(x).length > 0
}


// const isValidName = function (name) {
//   return (/^[A-Z][a-z]$/).test(name)

// }

const isValidName = function (name) {
  const nameRegex = /^[a-zA-Z]+$/;
  return nameRegex.test(name);
};


const isvalidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
}

const isValidPrice=function(price){
  return (/^\d+(\.\d{1,2})?$/).test(price)

}

function isValidSize(size) {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(size) !== -1;
}

module.exports = { isValidPassword, isVAlidEmail, isValidPhone, isValid, isValidPincode, isValidbody, isValidName,isvalidObjectId, isValidPrice, isValidSize }



