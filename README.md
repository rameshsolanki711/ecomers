# ShopLite – Simple E‑Commerce (Full Stack)

This bundle includes a **backend (Express + MongoDB)** and a **frontend (HTML/CSS/JS)**.

## Setup

### Prereqs
- Node.js 18+
- MongoDB running locally (or Atlas connection string)

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed   # add sample products
npm start
```
Back end runs at `http://localhost:4000`.

### Frontend
Open `frontend/index.html` using a static server (e.g., VS Code Live Server) or double-click to open in your browser. It calls the backend at `http://localhost:4000`.

### Notes
- Cart is identified by a generated `cartId` stored in `localStorage` and sent via `X-Cart-Id` header.
- API includes search, sort, and filtering capabilities.
- No payment gateway or authentication included by default.
