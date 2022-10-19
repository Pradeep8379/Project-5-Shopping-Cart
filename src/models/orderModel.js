const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const orderSchema = new mongoose.Schema({
    userId: { type: ObjectId, ref: 'users' },
    items: [{
        productId: { type: ObjectId, ref: 'products' },
        quantity: { type: Number },_id:0
    }],
    totalPrice: { type: Number },
    totalItems: { type: Number },
    totalQuantity: { type: Number },
    cancellable: { type: Boolean, default: true },
    status: { type: String, default: 'pending', enum: ["pending", "completed", "cancled"] },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('orders', orderSchema);