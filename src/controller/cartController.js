const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");

const {
  isValidBody,
  isValidObjectId,
  isValid,
} = require("../validator/validate");

//_______________________ Create Cart ___________________________//
const createCart = async function (req, res) {
  try {
    let userIdByParams = req.params.userId;
    let requestBody = req.body;
    let userIdbyToken = req.userId;

    const { productId, cartId } = requestBody;

    if (!isValidObjectId(userIdByParams)) {
      return res.status(400).send({ status: false, msg: "userId is invalid" });
    }

    const userByuserId = await userModel.findById(userIdByParams);

    if (!userByuserId) {
      return res
        .status(404)
        .send({ status: false, message: "user not found." });
    }

    if (userIdbyToken != userIdByParams) {
      return res.status(403).send({
        status: false,
        message: "Unauthorized access.",
      });
    }
    if (!isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "productId is required" });
    }

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "productId is not valid" });
    }

    let findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!findProduct) {
      return res
        .status(400)
        .send({ status: false, message: "product is not found" });
    }

    let existCart = await cartModel.findOne({ userId: userIdByParams });

    if (!existCart) {
      let newCart = {
        productId: findProduct._id,
        quantity: 1,
      };
      productPrice = findProduct.price * newCart.quantity;
      let createCart = await cartModel.create({
        userId: userIdByParams,
        items: newCart,
        totalPrice: productPrice,
        totalItems: 1,
      });
      return res.status(201).send({
        status: true,
        message: "Success",
        data: createCart,
      });
    }

    if (existCart) {
      if (!cartId) {
        return res
          .status(400)
          .send({ status: false, message: "please enter cart id" });
      }
      if (!isValidObjectId(cartId)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid cart id" });
      }
      let findUserFromCart = await cartModel.findById(cartId);
      if (!findUserFromCart) {
        return res
          .status(404)
          .send({ status: false, message: "Cart not found" });
      }
      if (userIdbyToken !== findUserFromCart.userId.toString())
        return res.status(403).send({
          status: false,
          message: "not authorized to update this cart",
        });

      let findProduct = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
      const newTotalPrice = existCart.totalPrice + findProduct.price * 1;
      let flag = 0;
      const items = existCart.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].productId.toString() === productId) {
          items[i].quantity = items[i].quantity + 1;
          var newCartData = {
            items: items,
            totalPrice: newTotalPrice,
            quantity: 1,
          };
          flag = 1;
          const saveData = await cartModel
            .findOneAndUpdate({ userId: userIdByParams }, newCartData, {
              new: true,
            })
            .populate({
              path: "items.productId",
              select: "title price productImage -_id ",
            });
          return res.status(201).send({
            status: true,
            message: "Success",
            data: saveData,
          });
        }
      }
      if (flag === 0) {
        let addItems = {
          productId: productId,
          quantity: 1,
        };
        const saveData = await cartModel.findOneAndUpdate(
          { userId: userIdByParams },
          {
            $addToSet: { items: addItems },
            $inc: { totalItems: 1, totalPrice: findProduct.price * 1 },
          },
          { new: true, upsert: true }
        );
        return res.status(201).send({
          status: true,
          message: "product added to the cart successfully",
          data: saveData,
        });
      }
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//___________________update cart_______________________//

const updateCart = async function (req, res) {
  try {
    const userId = req.params.userId;

    //validations
    //userid validation
    if (!userId)
      return res
        .status(400)
        .send({ status: false, message: "userId is mandatory" });
    if (!isValid(userId))
      return res
        .status(400)
        .send({ status: false, message: "Incorrect userId" });
    if (!isValidObjectId(userId))
      return res.status(400).send({ status: false, message: "invalid userId" });

    const requestBody = req.body;
    if (!isValidBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "plz enter some data for upadate" });
    }
    let { cartId, productId, removeProduct } = requestBody;

    //cartId validations
    if (!cartId)
      return res
        .status(400)
        .send({ status: false, message: "cartId is mandatory" });
    if (!isValid(cartId))
      return res
        .status(400)
        .send({ status: false, message: "Incorrect cartId" });
    if (!isValidObjectId(cartId))
      return res.status(400).send({ status: false, message: "invalid cartId" });

    //productId validations
    if (!productId)
      return res
        .status(400)
        .send({ status: false, message: "productId is mandatory" });
    if (!isValid(productId))
      return res
        .status(400)
        .send({ status: false, message: "Incorrect productId" });
    if (!isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "invalid productId" });

    //removeProduct validations
    if (removeProduct == 0 || removeProduct == 1);
    else
      return res.status(400).send({
        status: false,
        message: "please set removeProduct either 1 or 0 ",
      });

    //cart validations-
    //Make sure that cart exist-
    const cartFind = await cartModel
      .findById(cartId)
      .populate([{ path: "items.productId" }]);

    if (!cartFind)
      return res
        .status(404)
        .send({ status: false, message: "No products found in the cart" });

    //authorization
    let loggedInUser = req.userId;
    if (loggedInUser !== userId)
      return res.status(403).send({ status: false, message: "not authorized" });
    if (loggedInUser !== cartFind.userId.toString())
      return res
        .status(403)
        .send({ status: false, message: "not authorized to update this cart" });

    
    //Make sure the user exist-
    const userFind = await userModel.findById(userId);
    if (!userFind)
      return res.status(404).send({
        status: false,
        message: "user not found for the given userId",
      });

    //Check if the productId exists and is not deleted before updating the cart
    let productfind = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!productfind)
      return res.status(404).send({
        status: false,
        message: "Product not found for the given productId",
      });

    //removeProduct and update
    let itemsArr = cartFind.items;
    let initialItems = itemsArr.length;
    let totalPrice = cartFind.totalPrice;
    let totalItems = cartFind.totalItems;

    if (itemsArr.length === 0)
      return res
        .status(400)
        .send({ status: false, message: "cart is empty nothing to delete" });

    if (removeProduct == 0) {
      for (let i = 0; i < itemsArr.length; i++) {
        if (productId == itemsArr[i].productId._id) {
          totalPrice -= itemsArr[i].productId.price * itemsArr[i].quantity;
          totalItems--;
          itemsArr.splice(i, 1);
        }
      }
      if (initialItems === itemsArr.length)
        return res.status(404).send({
          status: false,
          message: "product does not exist in the cart",
        });
    }

    if (removeProduct == 1) {
      initialItems = totalItems;
      let flag = false;
      for (let i = 0; i < itemsArr.length; i++) {
        if (productId == itemsArr[i].productId._id) {
          flag = true;
          totalPrice -= itemsArr[i].productId.price;
          itemsArr[i].quantity--;
          if (itemsArr[i].quantity == 0) {
            totalItems--;
            itemsArr.splice(i, 1);
          }
        }
      }
      if (!flag)
        return res.status(404).send({
          status: false,
          message: "product does not exist in the cart",
        });
    }

    totalPrice = totalPrice.toFixed(2);
    const updatedCart = await cartModel
      .findOneAndUpdate(
        { _id: cartId },
        { items: itemsArr, totalPrice: totalPrice, totalItems: totalItems },
        { new: true }
      )
      .populate({
        path: "items.productId",
        select: "title price productImage -_id ",
      });

    if (!updatedCart)
      return res.status(404).send({ status: false, message: "cart not found" });

    return res
      .status(200)
      .send({ status: true, message: "Success", data: updatedCart });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//________________________get cart_______________________________//

const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    if (!userId)
      return res
        .status(400)
        .send({ status: false, message: "plz enter the userId" });
    if (!isValid(userId))
      return res
        .status(400)
        .send({ status: false, message: "incorrect userId userId" });
    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "incorrect userId" });

    let user = await userModel.findById(userId);
    if (!user)
      return res.status(404).send({ status: false, message: "user not found" });
    if (req.userId != userId)
      return res.status(403).send({ status: false, message: "Not Authorised" });

    let cart = await cartModel
      .findOne({ userId })
      .populate([
        { path: "items.productId", select: "title price productImage -_id" },
      ]);
    if (!cart)
      return res
        .status(404)
        .send({ status: false, message: "Cart not found for this user" });
    return res
      .status(200)
      .send({ status: true, message: "Success", data: cart });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//_____________________delete cart__________________________//
const deleteCartById = async (req, res) => {
  try {
    let userId = req.params.userId;
    const userCart = await cartModel.findOne({ userId: userId });
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: `Invalid ID!` });
    }

    if (req.userId != userId)
      return res
        .status(403)
        .send({ status: false, message: `Not Authorised user` });
    if (userCart.items.length === 0) {
      return res
        .status(400)
        .send({ status: false, message: `cart is empty` });
    }
    if (!userCart) {
      return res.status(404).send({ status: false, msg: `No Cart Found!` });
    }
    const deleteCart = await cartModel.findOneAndUpdate(
      { userId: userId },
      { $set: { totalItems: 0, totalPrice: 0, items: [] } },
      { new: true }
    );

    return res
      .status(204)
      .send({ status: true, message: `success`, data: deleteCart });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCartById };
