/**
 * Seed sample products into the database.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_starter';

const sample = [
  {
    title: 'Classic White T-Shirt',
    description: '100% cotton crew neck tee. Soft and breathable.',
    price: 499,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
    category: 'Apparel',
    stock: 50
  },
  {
    title: 'Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with 30h battery life.',
    price: 3999,
    image: 'https://images.unsplash.com/photo-1518441902110-000528e6a9d4?q=80&w=1200&auto=format&fit=crop',
    category: 'Electronics',
    stock: 35
  },
  {
    title: 'Ceramic Coffee Mug',
    description: '350ml, dishwasher safe with a matte finish.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1509463531434-c7dee10dee67?q=80&w=1200&auto=format&fit=crop',
    category: 'Home & Kitchen',
    stock: 120
  },
  {
    title: 'Fitness Smartwatch',
    description: 'Heart rate, GPS, sleep tracking, and water resistant.',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1511396275276-5a935d88789e?q=80&w=1200&auto=format&fit=crop',
    category: 'Electronics',
    stock: 20
  }
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for seeding');
  await Product.deleteMany({});
  await Product.insertMany(sample);
  console.log('Seeded products:', sample.length);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
