const express = require('express');
const router = express.Router();
const middleWare=require("../middleware/auth");
const userController=require("../controller/userController")
const productController=require("../controller/productController")
const cartController=require("../controller/cartController")
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

//==========================Cart Api==================//

router.post("/users/:userId/cart",middleWare.authentication,cartController.createCart)
router.put('/users/:userId/cart',middleWare.authentication,cartController.updateCart)
router.get("/users/:userId/cart",middleWare.authentication,cartController.getCart)
router.delete("/users/:userId/cart",middleWare.authentication,cartController.deleteCartById)

module.exports = router;