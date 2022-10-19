const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const orderModel = require("../models/orderModel")

const { isValidObjectId, isValid, isValidStatus } = require("../validator/validate")


//_____________________________________ Create Order _______________________________________________________//

const createOrder = async function (req, res) {
    try {

        const userIdByparam = req.params.userId
        const userIdbytoken = req.userId

        const data = req.body;

        let { cartId, cancellable } = data;

        if (!cartId) {
            return res.status(400).send({ status: false, message: "cartId is required" })
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "cartId is invalid" })
        }

        if (!isValidObjectId(userIdByparam)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }

        const userByuserId = await userModel.findById(userIdByparam);

        if (!userByuserId) {
            return res.status(400).send({ status: false, message: "User is not found" })

        }

        if (userIdByparam != userIdbytoken) {
            return res.status(403).send({
                status: false,
                message: "unauthorize access..!",
            })
        }

        const findUserCart = await cartModel.findById(cartId)

        if (!findUserCart) {
            return res.status(400).send({ status: false, message: "User cart is not found" })
        }
        if (findUserCart.items.length === 0) {
            return res.status(400).send({ status: false, message: "Cart is empty" });
        }


        if (cancellable) {
            if (typeof (cancellable != "boolean")) {
                return res.status(400).send({ status: false, message: "cancellable should in boolean format" })
            }
        }

        let totalQuantity1 = 0;
        for (let i = 0; i < findUserCart.items.length; i++) {
            totalQuantity1 = totalQuantity1 + findUserCart.items[i].quantity
        }

        //   console.log(totalQuantity1)

        const newOrder = {

            userId: userIdByparam,
            items: findUserCart.items,
            totalPrice: findUserCart.totalPrice,
            totalItems: findUserCart.totalItems,
            totalQuantity: totalQuantity1,
            cancellable: cancellable,

        }

        await cartModel.findOneAndUpdate({ _id: cartId },
            { $set: { totalItems: 0, totalPrice: 0, items: [] } });

        let saveOrder = await orderModel.create(newOrder)

        return res.status(201).send({ status: true, message: "Success", data: saveOrder })


    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }

}


const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        let { orderId, status } = data


        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId inValid" })
        if (!isValid(orderId)) return res.status(400).send({ status: false, message: "please enter order id" })
        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "invalid order Id" })
        if (!status) return res.status(400).send({ status: false, message: "status is required" })
        if (!isValidStatus(status)) return res.status(400).send({ status: false, message: "status must be completed or cancelled  " })

        const findUser = await userModel.findById(userId)
        if (!findUser) return res.status(404).send({ status: false, message: "user not exist" })

        const findOrder = await orderModel.findById(orderId)
        if (!findOrder) return res.status(404).send({ status: false, message: "order not found " })

        //-----------Authorization----------------

        if (req.userId !== userId) return res.status(400).send({ status: false, message: "Unauthorize" })
        if (findOrder.userId.toString() !== userId) return res.status(400).send({ status: false, message: "this order is not belong to this user" })

        console.log(findOrder.userId)
        let updateData = await orderModel.findOneAndUpdate({ _id: orderId, cancellable: true }, { $set: { status: status } }, { new: true })
        if (!updateData) return res.status(400).send({ status: false, message: "This order is not cancellable " })
        return res.status(200).send({ status: true, message: "Success", data: updateData })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createOrder, updateOrder }