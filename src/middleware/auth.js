const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

function isvalidObjectId(ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
}


//---------------------------authentication---------------------------//
exports.authentication = function (req, res, next) {
    try {
        // const token = req.headers('Authorization');

        const token = req.headers['authorization'];
        console.log(token)
        //check if bearer is undefined
        if (!token) {
          return res.status(401).send({ status: false, message: "login is required" })
      }

      let splitToken = token.split(" ")

      

        // token validation.
        if (!token) {
            return res.status(400).send({ status: false, message: "token must be present" })
        }
        //Seting userId in headers for Future Use
        else {
            jwt.verify(splitToken[1], "project-5", function (err, data) {
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


