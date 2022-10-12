const express = require('express');
const router = express.Router();
const middleWare=require("../middleware/auth");
const userController=require("../controller/userController")



roter.put("/user/:userId/profile",middleWare.authentication,userController.updateUser)

module.exports = router;