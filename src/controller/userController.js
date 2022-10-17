const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../controller/awsController")
const jwt = require('jsonwebtoken')

const { isValidPassword, isVAlidEmail, isValidPhone, isValid, isValidPincode, isValidbody, isValidName, isValidObjectId } = require("../validator/validate")


//------------------create user---------------------------//

const createUser = async function (req, res) {
    try {
        const requestBody = req.body;
        let files = req.files;

        if (files.length === 0) {
            return res.status(400).send({ status: false, message: "Photo is required" });
        }

        if (files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman

            let validImage = files[0].mimetype.split('/')
            if (validImage[0] != "image") {
                return res.status(400).send({ status: false, message: "Please Provide Valid Image.." })
            }
            let imageUrl = await uploadFile(files[0]);

            requestBody.profileImage = imageUrl;
        }

        if (!isValidbody(requestBody)) {
            return res.status(400).send({ status: false, message: "Request body can not be empty" });
        }

        let { fname, lname, email, phone, password, address } = requestBody;

        if (!fname) {
            return res.status(400).send({ status: false, message: "Please provide fname" });
        }

        if (!isValidName(fname)) {
            return res.status(400).send({ status: false, message: "fname is in incorrect format..." })
        }

        if (!lname) {
            return res.status(400).send({ status: false, message: "Please provide lname" });
        }

        if (!isValidName(lname)) {
            return res.status(400).send({ status: false, message: "fname is in incorrect format..." })
        }

        if (!email) {
            return res.status(400).send({ status: false, message: "Please provide E-mail" });
        }

        if (!isVAlidEmail(email)) {
            return res.status(400).send({ status: false, message: "email is in incorrect format..." })
        }

        if (!phone) {
            return res.status(400).send({ status: false, message: "Please provide phone number" });
        }

        if (!isValidPhone(phone)) {
            return res.status(400).send({ status: false, message: "Please provide valid phone number" });
        }

        if (!password) {
            return res.status(400).send({ status: false, message: "Please provide password" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({ staus: false, message: "Length of the password must be between 8 to 15 charaxters" });
        }

        //===============encrypted password===========================//

        const salt = await bcrypt.genSalt(10);
        const createPwd = await bcrypt.hash(password, salt);
        requestBody.password = createPwd;

        let uniquePhoneAndEmail = await userModel.find({
            $or: [{ email: requestBody.email }, { phone: requestBody.phone }]
        });

        if (uniquePhoneAndEmail.length !== 0) {
            if (uniquePhoneAndEmail[0].email == requestBody.email) {
                return res.status(400).send({ status: false, data: "Email Id Already Exists,Please Input Another Email Id" });
            }
            else {
                return res.status(400).send({ status: false, data: "Phone Number Already Exists,Please Input Another phone Number" });
            }
        }

        if (!address) {
            return res.status(400).send({ status: false, message: "Please provide address" });
        }
        try {
            address = JSON.parse(address)
        }
        catch (err) {
            return res.status(400).send({ status: false, message: "enter address in object form" });
        }

        if (!address.shipping.street) {
            return res.status(400).send({ status: false, message: "Please provide shipping street" });
        }

        if (!isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, message: "shipping street is in incorrect format" })
        }

        if (!address.shipping.pincode) {
            return res.status(400).send({ status: false, message: "Please provide shipping pincode" });
        }

        if (!isValidPincode(address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "shipping pincode is in incorrect format" })
        }

        if (!address.shipping.city) {
            return res.status(400).send({ status: false, message: "Please provide shipping city" });
        }

        if (!isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, message: "shipping street is in incorrect format" })
        }

        if (!address.billing.street) {
            return res.status(400).send({ status: false, message: "Please provide shipping street" });
        }

        if (!isValid(address.billing.street)) {
            return res.status(400).send({ status: false, message: "shipping street is in incorrect format" })
        }

        if (!address.billing.pincode) {
            return res.status(400).send({ status: false, message: "Please provide shipping pincode" });
        }

        if (!isValidPincode(address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "shipping pincode is in incorrect format" })
        }

        if (!address.billing.city) {
            return res.status(400).send({ status: false, message: "Please provide shipping city" });
        }

        if (!isValid(address.billing.city)) {
            return res.status(400).send({ status: false, message: "shipping street is in incorrect format" })
        }

        requestBody.address = address;
        const createData = await userModel.create(requestBody);
        return res.status(201).send({ status: true, message: "User created successfully", data: createData });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
};

//-----------------------user login-------------------------//

const userLogin = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data).length === 0)
            return res.status(400).send({ status: false, error: "Body can't be empty" });

        let { email, password } = data;

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required !!" })
        }

        if (!isVAlidEmail(email)) {
            return res.status(400).send({ status: false, message: "Enter valid email" });
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Invalid password !!" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({ staus: false, message: "Length of the password must be between 8 to 15 charaxters" });
        }

        let passwords = await userModel.findOne({ email: email })
        let datas = await bcrypt.compare(password, passwords.password)
        if (!datas) {
            return res.status(400).send({ status: false, message: "Invalid credentials" })
        }

        let userid = await userModel.findOne({ email: email, password: passwords.password });

        // creating Token
        let token = jwt.sign(
            {
                userId: userid._id,
                group: "group-52",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (60 * 60)
            },
            "project-5",
        );
        let obj = {
            userId: userid._id,
            token: token
        }

        return res.status(200).send({ status: true, message: "User login successfull", data: obj });
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};

// =====================================get user deatils==================================//
const getUserDetail = async function (req, res) {
    try {
        const userIdFromParams = req.params.userId;
        const userIdFromToken = req.userId

        if (!isValidObjectId(userIdFromParams)) {
            return res.status(400).send({ status: false, message: "userId is invalid" });
        }

        const userByuserId = await userModel.findById(userIdFromParams);

        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }

        if (userIdFromToken != userIdFromParams) {
            return res.status(403).send({ status: false, message: "Unauthorized access." });
        }

        return res.status(200).send({ status: true, message: "User details", data: userByuserId });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

// ===================================== Update USER==========================================//
const updateUser = async function (req, res) {
    try {
        const userId = req.params.userId;
        let data = req.body;

        if (!isValidbody(data) && !req.files) {
            return res.status(400).send({ status: false, message: "enter something to update..." })
        }
        // userId validation
        if (!userId) {
            return res.status(400).send({ status: false, message: "enter user Id..." })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "enter valid user Id..." })
        }

        let user = await userModel.findById({ _id: userId });

        if (!user) {
            return res.status(404).send({ status: false, message: " user not found..." })
        }

        if (userId != req.userId) {
            return res.status(403).send({ status: false, message: "unauthorised  user..." })
        }

        // Destructuring
        let { fname, lname, email, phone, password, address } = data;

        // storing updates.
        let updates = {};
        // fname validation.
        if (fname) {
            if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is in incorrect format..." })
            updates.fname = fname;
        }
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "fname is in incorrect format..." })

        if (lname) {
            if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is in incorrect format..." })
            if (!isValidName(lname)) return res.status(400).send({ status: false, message: "lname is in incorrect format..." })
            updates.lname = lname;
        }


        if (email) {
            if (!isValid(email)) return res.status(400).send({ status: false, message: "email is in incorrect format..." })
            if (!isVAlidEmail(email)) return res.status(400).send({ status: false, message: "email is in incorrect format..." })
            let user = await userModel.findOne({ email })
            if (user) return res.status(400).send({ status: false, message: "email already used" })
            updates.email = email;
        }
        if (phone) {
            if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is in incorrect format" })
            if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "phone is in incorrect format" })
            let user = await userModel.findOne({ phone })
            if (user) return res.status(400).send({ status: false, message: "phone already used" })
            updates.phone = phone;
        }
        if (password) {
            if (!isValid(password)) return res.status(400).send({ status: false, message: "password is in incorrect format" })
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password should be 8-15 characters in length." })
            updates.password = await bcrypt.hash(password, 10);
        }

        if (address) {
            try {
                address = JSON.parse(address)
            }
            catch (err) {
                return res.status(400).send({ status: false, message: "enter address in object form" });
            }

            if (address.shipping) {

                if (address.shipping.street) {

                    if (!isValid(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: "shipping street is in incorrect format" })
                    }
                    updates["address.shipping.street"] = address.shipping.street
                }

                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: "shipping city is in incorrect format" })
                    }
                    updates["address.shipping.city"] = address.shipping.city
                }

                if (address.shipping.pincode) {

                    if (!isValidPincode(address.shipping.pincode)) {
                        return res.status(400).send({ status: false, message: "shipping pincode is in incorrect format" })
                    }
                    updates["address.shipping.pincode"] = address.shipping.pincode
                }
            }

            if (address.billing) {

                if (address.billing.street) {
                    if (!isValid(address.billing.street)) {
                        return res.status(400).send({ status: false, message: "billing street is in incorrect format" })
                    }
                    updates["address.billing.street"] = address.billing.street
                }

                if (address.billing.city) {
                    if (!isValid(address.billing.city)) {
                        return res.status(400).send({ status: false, message: "billing city is in incorrect format" })
                    }
                    updates["address.billing.city"] = address.billing.city
                }

                if (address.billing.pincode) {

                    if (!isValidPincode(address.billing.pincode)) {
                        return res.status(400).send({ status: false, message: "Pincode should be 6 characters long" })
                    }
                    updates["address.billing.pincode"] = address.billing.pincode
                }
            }

        }

        if (req.files.length > 0) {

            let image = req.files[0]
            if (image === undefined) {
                return res.status(400).send({ status: false, message: "Please Provide A File To Update..." })
            }

            if (image) {

                let validImage = image.mimetype.split('/')
                if (validImage[0] != "image") {
                    return res.status(400).send({ status: false, message: "Please Provide Valid Image.." })
                }
                let url = await uploadFile(image)
                updates.profileImage = url
            }
        }

        let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, { ...updates }, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser })
    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createUser, userLogin, updateUser, getUserDetail };

