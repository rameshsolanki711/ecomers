const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, default: 1, min: 1 },
}, { _id: false });

const CartSchema = new Schema({
  cartId: { type: String, required: true, unique: true, index: true },
  items: [CartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
