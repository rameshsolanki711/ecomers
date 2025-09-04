const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Helper: find or create cart by cartId header
async function getOrCreateCart(cartId) {
  if (!cartId) throw Object.assign(new Error('Missing X-Cart-Id header'), { status: 400 });
  let cart = await Cart.findOne({ cartId });
  if (!cart) {
    cart = await Cart.create({ cartId, items: [] });
  }
  return cart;
}

/**
 * GET /api/cart
 * Header: X-Cart-Id
 * Returns cart with populated items
 */
router.get('/', async (req, res, next) => {
  try {
    const cartId = req.header('X-Cart-Id');
    const cart = await getOrCreateCart(cartId);
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart/add
 * Header: X-Cart-Id
 * Body: { productId, qty (default 1) }
 */
router.post('/add', async (req, res, next) => {
  try {
    const cartId = req.header('X-Cart-Id');
    const { productId, qty = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const qtyNum = Math.max(1, Number(qty));
    if (product.stock < qtyNum) return res.status(400).json({ error: 'Insufficient stock' });

    const cart = await getOrCreateCart(cartId);
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx >= 0) {
      cart.items[idx].qty += qtyNum;
    } else {
      cart.items.push({ product: product._id, qty: qtyNum });
    }
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/cart/:productId
 * Update quantity
 * Body: { qty }
 */
router.put('/:productId', async (req, res, next) => {
  try {
    const cartId = req.header('X-Cart-Id');
    const { qty } = req.body;
    const qtyNum = Math.max(0, Number(qty)); // 0 removes item
    const cart = await getOrCreateCart(cartId);

    const idx = cart.items.findIndex(i => i.product.toString() === req.params.productId);
    if (idx === -1) return res.status(404).json({ error: 'Item not in cart' });

    if (qtyNum === 0) {
      cart.items.splice(idx, 1);
    } else {
      const product = await Product.findById(req.params.productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.stock < qtyNum) return res.status(400).json({ error: 'Insufficient stock' });
      cart.items[idx].qty = qtyNum;
    }
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart/:productId
 * Remove an item from the cart
 */
router.delete('/:productId', async (req, res, next) => {
  try {
    const cartId = req.header('X-Cart-Id');
    const cart = await getOrCreateCart(cartId);
    const before = cart.items.length;
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    if (cart.items.length === before) return res.status(404).json({ error: 'Item not in cart' });
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart
 * Clear cart
 */
router.delete('/', async (req, res, next) => {
  try {
    const cartId = req.header('X-Cart-Id');
    const cart = await getOrCreateCart(cartId);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
