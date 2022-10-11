const userModel = require("../models/userModel");
const validator = require("../validator/validate");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../controller/awsController");
const jwt = require('jsonwebtoken')



//------------------create user---------------------------//

const createUser = async function (req, res) {
  try {
    const requestBody = req.body;
    let files = req.files;
    if (!files) {
      return res
        .status(400)
        .send({ status: false, message: "Photo is required" });
    }
    if (files && files.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      let imageUrl = await uploadFile(files[0]);
      requestBody.profileImage = imageUrl;
    }

    if (!validator.isvalidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "Request body can not be empty" });
    }

    let { fname, lname, email, phone, password, address } = requestBody;
    if (!fname) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide fname" });
    }

    if (!lname) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide lname" });
    }

    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide E-mail" });
    }

    if (!phone) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide phone number" });
    }
    if (!validator.isValidPhone(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid phone number" });
    }

    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide password" });
    }
    const salt = await bcrypt.genSalt(10);
    const createPwd = await bcrypt.hash(password, salt);
    requestBody.password = createPwd;
    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({
        staus: false,
        message: "Length of the password must be between 8 to 15 charaxters",
      });
    }
    let uniquePhoneAndEmail = await userModel.find({
      $or: [{ email: requestBody.email }, { phone: requestBody.phone }],
    });
    if (uniquePhoneAndEmail.length !== 0) {
      if (uniquePhoneAndEmail[0].email == requestBody.email)
        return res
          .status(400)
          .send({
            status: false,
            data: "Email Id Already Exists,Please Input Another Email Id",
          });
      else {
        return res
          .status(400)
          .send({
            status: false,
            data: "Phone Number Already Exists,Please Input Another phone Number",
          });
      }
    }

    address = JSON.parse(address);

    if (!address.shipping.street) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide shipping street" });
    }
    if (!address.shipping.pincode) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide shipping pincode" });
    }
    if (!address.shipping.city) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide shipping city" });
    }
    if (!address.billing.street) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide shipping street" });
    }
    if (!address.billing.pincode) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide shipping pincode" });
    }
    if (!address.billing.city) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide shipping city" });
    }
    requestBody.address = address;
    const createData = await userModel.create(requestBody);
    res
      .status(201)
      .send({
        status: true,
        message: "User created successfully",
        data: createData,
      });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};


//-----------------------user login-------------------------//

const userLogin = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length === 0)
      return res
        .status(400)
        .send({ status: false, error: "Body can't be empty" });

    let { email, password } = data;

    if (!validator.isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "Email is required !!" });
    if (!validator.isVAlidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Enter valid email" });

    if (!validator.isValid(password))
      return res
        .status(400)
        .send({ status: false, message: "Invalid password !!" });

        if (password.length < 8 || password.length > 15) {
          return res.status(400).send({
            staus: false,
            message: "Length of the password must be between 8 to 15 charaxters",
          });
        }
   
      let passwords=await userModel.findOne({email:email})
        let datas=await bcrypt.compare(password,passwords.password)
        if(!datas){
          return res.status(400).send({status:false,message:"Invalid credentials"})
        }

    let userid = await userModel.findOne({ email: email, password: passwords.password });
    // creating Token
    let token = jwt.sign(
      {
        userId: userid._id,
        group: "group-52",
        iat: Math.floor(Date.now()/1000) ,
        exp: Math.floor(Date.now()/1000) + (60*60)
      },
      "project-5",
    );
    let obj={
      userId:userid._id,
      token:token
    }
    res
      .status(200)
      .send({ status: true, message: "User login successfull", data: obj });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports.createUser = createUser;
module.exports.userLogin=userLogin
