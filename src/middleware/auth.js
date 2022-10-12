const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

function isvalidObjectId(ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
}


//---------------------------authentication---------------------------//
exports.authentication = function (req, res, next) {
  try {
    let checkHeader = req.headers["x-api-key"];
    if (!checkHeader) {
      return res
        .status(400)
        .send({ status: false, msg: "In headers section token is madatory" });
    }

    //verifing that token
    let decodedToken = jwt.verify(
      checkHeader,
      "Group-27-Secret-Key",
      (err, decode) => {
        if (err) {
          let msg =
            err.message === "jwt expired"
              ? "Token is expired"
              : "Token is invalid";
          return res.status(400).send({ status: false, message: msg });
        }
        //Seting userId in headers for Future Use
        req.userId = decode.userId;
        next();
      }
    );
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

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