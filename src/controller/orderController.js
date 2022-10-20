const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");

const {
  isValidObjectId,
  isValid,
  isValidStatus,
  isValidBody,
} = require("../validator/validate");

//______________________ Create Order ________________________//

const createOrder = async function (req, res) {
  try {
    const userIdByparam = req.params.userId;
    const userIdbytoken = req.userId;

    const requestBody = req.body;

    if (!isValidBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "Request body can not be empty" });
    }

    let { cartId, cancellable } = requestBody;

    if (!cartId) {
      return res
        .status(400)
        .send({ status: false, message: "cartId is required" });
    }

    if (!isValidObjectId(cartId)) {
      return res
        .status(400)
        .send({ status: false, message: "cartId is invalid" });
    }

    if (!isValidObjectId(userIdByparam)) {
      return res
        .status(400)
        .send({ status: false, message: "userId is invalid" });
    }

    const userByuserId = await userModel.findById(userIdByparam);

    if (!userByuserId) {
      return res
        .status(400)
        .send({ status: false, message: "User is not found" });
    }

    if (userIdByparam != userIdbytoken) {
      return res.status(403).send({
        status: false,
        message: "unauthorize access..!",
      });
    }

    const findUserCart = await cartModel.findById(cartId);

    if (!findUserCart) {
      return res
        .status(400)
        .send({ status: false, message: "User cart is not found" });
    }
    if (findUserCart.items.length === 0) {
      return res.status(400).send({ status: false, message: "Cart is empty" });
    }
    if (cancellable) {
      if (typeof (cancellable) !== "boolean") {
        return res
          .status(400)
          .send({
            status: false,
            message: "cancellable should in boolean format",
          });
      }
    }
    let totalQuantity1 = 0;
    for (let i = 0; i < findUserCart.items.length; i++) {
      totalQuantity1 = totalQuantity1 + findUserCart.items[i].quantity;
    }

    const newOrder = {
      userId: userIdByparam,
      items: findUserCart.items,
      totalPrice: findUserCart.totalPrice,
      totalItems: findUserCart.totalItems,
      totalQuantity: totalQuantity1,
      cancellable: cancellable,
    };

    await cartModel.findOneAndUpdate(
      { _id: cartId },
      { $set: { totalItems: 0, totalPrice: 0, items: [] } }
    );

    let saveOrder = await orderModel.create(newOrder);

    return res
      .status(201)
      .send({ status: true, message: "Success", data: saveOrder });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//_____________________update order_________________________//

const updateOrder = async function (req, res) {
  try {
    let userId = req.params.userId;
    let requestBody = req.body;
    let { orderId, status } = requestBody;

    if (!isValidBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Body can't be empty,Enter some data",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "UserId inValid" });
    }

    

    if (!isValid(orderId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter order id" });
    }

    if (!isValidObjectId(orderId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid order Id" });
    }

    if (!status) {
      return res
        .status(400)
        .send({ status: false, message: "Status is required" });
    }

    if (!isValidStatus(status)) {
      return res.status(400).send({
        status: false,
        message: "Status must be completed or cancelled  ",
      });
    }

    const findUser = await userModel.findById(userId);

    if (!findUser) {
      return res.status(404).send({ status: false, message: "User not exist" });
    }

    const findOrder = await orderModel.findById(orderId);
    if (findOrder.status === "completed" || findOrder.status === "cancelled") {
      return res
        .status(400)
        .send({ status: false, message: "This order can not be updated" });
    }

    // Authorization :-

    if (req.userId !== userId) {
      return res
        .status(400)
        .send({ status: false, message: "Unauthorize acces!.." });
    }
    if (findOrder.userId.toString() !== userId) {
      return res.status(400).send({
        status: false,
        message: "This order is not belong to this user",
      });
    }

    if (!findOrder) {
      return res
        .status(404)
        .send({ status: false, message: "order not found " });
    }

    if (status == "completed") {
      let updateData = await orderModel.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: status } },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "The Order is completed Successfully",
        data: updateData,
      });
    } else if (status == "cancelled") {
      let updatedCancled = await orderModel.findOneAndUpdate(
        { _id: orderId, cancellable: false },
        { $set: { status: status, isDeleted: true, deletedAt: new Date() } },
        { new: true }
      );

      if (!updatedCancled) {
        return res
          .status(400)
          .send({ status: false, message: "This order is not cancellable " });
      }

      return res
        .status(200)
        .send({ status: true, message: "The Order is cancelled Successfully" });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createOrder, updateOrder };
