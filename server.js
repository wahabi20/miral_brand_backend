require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/drive', require('./routes/drive.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Miral Brand API is running' });
});

// Error handler
app.use(require('./middleware/errorHandler.middleware'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Miral Brand server running on port ${PORT}`);
});
