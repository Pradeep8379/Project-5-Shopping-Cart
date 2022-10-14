const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const cartSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user" },
    items: [
      {
        productId: { type: ObjectId, ref: "product" },
        quantity: { type: Number }
      },
    ],
    totalPrice: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart", cartSchema);
