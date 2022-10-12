const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../controller/awsController")

const { isValidPassword, isValid, isValidPincode, isValidbody } = require("../validator/validate")

const nameRegex = /^[A-Z][a-z]$/
const emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
const phoneRegex = /^[6-9]\d{9}$/


const updateUser = async function (req, res) {
    try {
        const userId = req.params.userId;
        let data = req.body;

        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, message: "enter something to update..." })
        }
        // userId validation
        if (!userId) {
            return res.status(400).send({ status: false, message: "enter user Id..." })
        }

        const isValidId = mongoose.Types.ObjectId.isValid(userId);
        if (!isValidId) {
            return res.status(400).send({ status: false, message: "enter valid user Id..." })
        }

        let user = await userModel.findById({ _id: userId});

        if (!user) {
            return res.status(404).send({ status: false, message: " user not found..." })
        }

        if (userId != req.userId) {
            return res.status(403).send({ status: false, message: "unauthorised  user..." })
        }

        // Destructuring
        const { fname, lname, email, phone, password, address } = data;

        if (fname) {
            if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is in incorrect format..." })
            if (!fname.match(nameRegex)) return res.status(400).send({ status: false, message: "fname is in incorrect format..." })
        }
        if (lname) {
            if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is in incorrect format..." })
            if (!lname.match(nameRegex)) return res.status(400).send({ status: false, message: "lname is in incorrect format..." })
        }
        if (email) {
            if (!isValid(email)) return res.status(400).send({ status: false, message: "email is in incorrect format..." })
            if (!email.match(emailRegex)) return res.status(400).send({ status: false, message: "email is in incorrect format..." })
            let user = await userModel.findOne({ email })
            if (user) return res.status(400).send({ status: false, message: "email already used" })
        }
        if (phone) {
            if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is in incorrect format" })
            if (!phone.match(phoneRegex)) return res.status(400).send({ status: false, message: "phone is in incorrect format" })
            let user = await userModel.findOne({ phone })
            if (user) return res.status(400).send({ status: false, message: "phone already used" })
        }
        if (password) {
            if (!isValid(password)) return res.status(400).send({ status: false, message: "password is in incorrect format" })
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password should be 8-15 characters in length." })
            data.password = await bcrypt.hash(password, 10);
        }

        // storing updates.
        let updates = {};

        if (address) {
            address = JSON.parse(address)
            if (typeof address != "object") return res.status(400).send({ status: false, message: "address is in incorrect format" })
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "shipping street is in incorrect format" })
                    updates["address.shipping.street"] = address.shipping.street
                }
                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city is in incorrect format" })
                    updates["address.shipping.city"] = address.shipping.city
                }
                if (address.shipping.pincode) {
                    if (typeof address.shipping.pincode != "number") return res.status(400).send({ status: false, message: "shipping pincode is in incorrect format" })
                    if (!isValidPincode(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode should be 6 characters long" })
                    updates["address.shipping.pincode"] = address.shipping.pincode
                }
            }
            if (address.billing) {
                if (address.billing.street) {
                    if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "billing street is in incorrect format" })
                    updates["address.billing.street"] = address.billing.street
                }
                if (address.billing.city) {
                    if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "billing city is in incorrect format" })
                    updates["address.billing.city"] = address.billing.city
                }
                if (address.billing.pincode) {
                    if (typeof address.billing.pincode != "number") return res.status(400).send({ status: false, message: "billing pincode is in incorrect format" })
                    if (!isValidPincode(address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode should be 6 characters long" })
                    updates["address.billing.pincode"] = address.billing.pincode
                }
            }
            delete data.address
        }

        if (req.files) {
            let image = req.files[0]
            if (image) {
                let url = await uploadFile(image)
                data.profileImage = url
            }
        }

        let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, { ...data, ...updates }, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser })

    }

    catch (error) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { updateUser };
