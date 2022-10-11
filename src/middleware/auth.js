const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

function isvalidObjectId(ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
}


//---------------------------authentication---------------------------//
exports.authentication = function (req, res, next) {
    try {
        const token = req.headers["x-api-key"]

        // token validation.
        if (!token) {
            return res.status(400).send({ status: false, message: "token must be present" })
        }
        else {
            jwt.verify(token, "project-5", function (err, data) {
                if (err) {
                    return res.status(400).send({ status: false, message: err.message })
                }
                else {
                    req.userId = data.userId
                    next()

                }
            })
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//---------------------Autherization part--------------------------//

exports.autherization = async function (req, res, next) {
  try {
    if (req.params.userId) {
      if (!isvalidObjectId(req.params.userId)) {
        return res
          .status(400)
          .send({ status: false, msg: "Not a valid userId" })
      }
      let findUserId = await bookModel.findById(req.params.userId)
      if(!findUserId){
        return res
        .status(404)
        .send({ status: false, msg: "No such user found" }) 
      }
      if (findUserId.userId != req.decode.userId) {
        return res
        .status(403)
        .send({ status: false, msg: "Not an Authorized user" }) 
      }return next()
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      msg: " Authrization Server Error !!",
      errMessage: err.message,
    });
  }
};