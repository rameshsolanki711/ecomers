# E-Commerce Starter (Express + MongoDB + Vanilla JS)

## Overview
A minimal full-stack e-commerce demo:
- **Backend:** Express.js + Mongoose (MongoDB)
- **Frontend:** HTML + CSS + Vanilla JS
- **Features:** Product list, search/sort/filter, cart (add/update/remove/clear), checkout summary.
- **No payment gateway**, optional auth omitted for simplicity.

## Quick Start

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm start
```
- Server runs at `http://localhost:4000`
- Health check: `GET /api/health`

### 2) Frontend
Open `frontend/index.html` **via Live Server** (VS Code) or any static server.
If you double-click the HTML file, most browsers still allow fetch to `http://localhost:4000`.

### 3) Cart Identification
The frontend generates a persistent `cartId` in `localStorage` and sends it in the `X-Cart-Id` header for each API call.

## API Endpoints

### Products
- `GET /api/products?search=&category=&minPrice=&maxPrice=&sort=price|createdAt|title&order=asc|desc&page=1&limit=50`
- `GET /api/products/:id`

### Cart
- `GET /api/cart`
- `POST /api/cart/add` body: `{ productId, qty }`
- `PUT /api/cart/:productId` body: `{ qty }` (0 to remove)
- `DELETE /api/cart/:productId`
- `DELETE /api/cart` clear cart

## Database Schema

### Product
```js
{
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  stock: Number
}
```

### Cart
```js
{
  cartId: String,
  items: [{ product: ObjectId<Product>, qty: Number }]
}
```

## Notes
- Keep MONGODB running locally, or point `MONGODB_URI` to Atlas.
- Error handling returns JSON with `error` message and appropriate status codes.
- UI is responsive and accessible; see comments in code for details.
