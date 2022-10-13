const express = require('express');
const router = express.Router();
const middleWare=require("../middleware/auth");
const userController=require("../controller/userController")
const productController=require("../controller/productController")

 

router.post('/register',userController.createUser)
router.post('/login',userController.userLogin)

router.get("/user/:userId/profile",middleWare.authentication,userController.getUserDetail)

router.put("/user/:userId/profile",middleWare.authentication,userController.updateUser)
router.post("/products",productController.createProduct)
router.get('/products',productController.getProduct)

router.all("/*", function (req, res) {
    return res.status(400).send({status: false,message: "Path Not Found"});
 });
module.exports = router;