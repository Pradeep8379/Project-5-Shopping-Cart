const express = require('express');
const router = express.Router();
const middleWare=require("../middleware/auth");
const userController=require("../controller/userController")
const productController=require("../controller/productController")

 //========================USER API================//
 
router.post('/register',userController.createUser)
router.post('/login',userController.userLogin)
router.get("/user/:userId/profile",middleWare.authentication,userController.getUserDetail)
router.put("/user/:userId/profile",middleWare.authentication,userController.updateUser)

//===========================PRODUCT API===============//

router.post("/products",productController.createProduct)
router.get('/products',productController.getProduct)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId',productController.updateProduct)
router.delete('/products/:productId', productController.deleteProductById)




module.exports = router;