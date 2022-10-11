const mongoose = require("mongoose");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
};

//------------------------------- password regex ------------------------------------------//

const isValidPassword = function (password) {
  return /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,15}$/.test(
    password
  );
};

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


function isvalidRequestBody(requestBody) {
    return Object.keys(requestBody).length > 0;
  }

module.exports = { isValidPassword, isVAlidEmail, isValidPhone, isValid, isValidUrl,isvalidRequestBody };
