const express = require('express');
const router = express.Router();
const middleWare=require("../middleware/auth");
const userController=require("../controller/userController")


 

router.post('/register',userController.createUser)
router.post('/login',userController.userLogin)

router.get("/user/:userId/profile",middleWare.authentication,userController.getUserDetail)

router.put("/user/:userId/profile",middleWare.authentication,userController.updateUser)

// router.all("/*", function (req, res) {
//     return res.status(400).send({status: false,message: "Path Not Found"});
//  });
module.exports = router;