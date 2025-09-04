const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

/**
 * GET /api/products
 * Query params:
 *  - search: string (full-text on title)
 *  - category: string
 *  - minPrice, maxPrice: numbers
 *  - sort: "price" | "createdAt" | "title"
 *  - order: "asc" | "desc"
 *  - page, limit: pagination (optional)
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      search = '',
      category,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortObj = {};
    const allowedSort = ['price', 'createdAt', 'title'];
    const dir = order === 'asc' ? 1 : -1;
    sortObj[allowedSort.includes(sort) ? sort : 'createdAt'] = dir;

    const pageNum = Math.max(1, Number(page));
    const lim = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * lim;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(lim),
      Product.countDocuments(filter)
    ]);

    res.json({ items, total, page: pageNum, limit: lim });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    res.json(prod);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
