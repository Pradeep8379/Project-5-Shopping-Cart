const mongoose = require("mongoose");
const userModel = require("../models/userModel");


const updateUser = async function (req, res) {
    const userId = req.params.userId;
    // userId validation
    if (!userId) {
        return res.status(400).send({ status: false, message: "enter user Id..." })
    }

    const isValidId = mongoose.Types.ObjectId.isValid(userId);
    if (!isValidId) {
        return res.status(400).send({ status: false, message: "enter valid user Id..." })
    }

    let user = await userModel.findOne({ _id: userId, isDeleted: false });

    if (!user) {
        return res.status(400).send({ status: false, message: "enter valid user Id..." })
    }

    if (userId != req.userId) {
        return res.status(403).send({ status: false, message: "unauthorised  user..." })
    }
     
    // Destructuring
    const {fname,lname,email,profileImage,phone,password}=req.body;
    const address=req.body;
    address=JSON.parse(address);
    const sStreet= address.shipping.street;
    const sPincode= address.shipping.pincode;
    const sCity= address.shipping.city;
    const bStreet= address.billing.street;
    const bPincode= address.billing.pincode;
    const bCity= address.billing.city;

   }