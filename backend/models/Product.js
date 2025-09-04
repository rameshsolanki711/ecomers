const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, index: 'text' }, // text index for search
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  category: { type: String, index: true },
  stock: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
