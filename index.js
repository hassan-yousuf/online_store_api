const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
//?Middle wair
app.use(cors({ origin: '*' }))
app.use(bodyParser.json());
//? setting static folder path
// app.use('/image/products', express.static('public/products'));
// app.use('/image/category', express.static('public/category'));
// app.use('/image/poster', express.static('public/posters'));

const URL = process.env.MONGO_URL;
mongoose.connect(URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

// Routes
app.use('/categories', require('./routes/category'));
app.use('/subCategories', require('./routes/subCategory'));
app.use('/brands', require('./routes/brand'));
app.use('/variantTypes', require('./routes/variantType'));
app.use('/variants', require('./routes/variant'));
app.use('/products', require('./routes/product'));
app.use('/couponCodes', require('./routes/couponCode'));
app.use('/posters', require('./routes/poster'));
app.use('/users', require('./routes/user'));
app.use('/orders', require('./routes/order'));
app.use('/payment', require('./routes/payment'));
app.use('/notification', require('./routes/notification'));


// Example route using asyncHandler directly in app.js
app.get('/', asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'API working successfully', data: null });
}));

// Global error handler
app.use((error, req, res, next) => {
    res.status(500).json({ success: false, message: error.message, data: null });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const asyncHandler = require('express-async-handler');
// const dotenv = require('dotenv');
// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors({ origin: '*' }));
// app.use(bodyParser.json());

// // DB Connection
// mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;
// db.on('error', console.error);
// db.once('open', () => console.log('Connected to Database'));

// // Routes
// app.use('/categories', require('./routes/category'));
// app.use('/subCategories', require('./routes/subCategory'));
// app.use('/brands', require('./routes/brand'));
// app.use('/variantTypes', require('./routes/variantType'));
// app.use('/variants', require('./routes/variant'));
// app.use('/products', require('./routes/product'));
// app.use('/couponCodes', require('./routes/couponCode'));
// app.use('/posters', require('./routes/poster'));
// app.use('/users', require('./routes/user'));
// app.use('/orders', require('./routes/order'));
// app.use('/payment', require('./routes/payment'));
// app.use('/notification', require('./routes/notification'));

// // Health check
// app.get('/', asyncHandler(async (req, res) => {
//   res.json({ success: true, message: 'API working successfully', data: null });
// }));

// // Global error handler
// app.use((error, req, res, next) => {
//   console.error(error);
//   res.status(500).json({ success: false, message: error.message, data: null });
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const asyncHandler = require('express-async-handler');
// const dotenv = require('dotenv');
// const fs = require('fs');
// const path = require('path');

// dotenv.config();

// const app = express();

// // Ensure required folders exist
// const folders = ['public/products', 'public/category', 'public/posters'];
// folders.forEach(folder => {
//   const fullPath = path.join(__dirname, folder);
//   if (!fs.existsSync(fullPath)) {
//     fs.mkdirSync(fullPath, { recursive: true });
//     console.log(`Created folder: ${fullPath}`);
//   }
// });

// // Middleware
// app.use(cors({ origin: '*' }));
// app.use(bodyParser.json());

// // Serve static image folders
// app.use('/image/products', express.static('public/products'));
// app.use('/image/category', express.static('public/category'));
// app.use('/image/poster', express.static('public/posters'));

// // Database Connection
// mongoose.connect(process.env.MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });
// const db = mongoose.connection;
// db.on('error', console.error);
// db.once('open', () => console.log('Connected to Database'));

// // Routes
// app.use('/categories', require('./routes/category'));
// app.use('/subCategories', require('./routes/subCategory'));
// app.use('/brands', require('./routes/brand'));
// app.use('/variantTypes', require('./routes/variantType'));
// app.use('/variants', require('./routes/variant'));
// app.use('/products', require('./routes/product'));
// app.use('/couponCodes', require('./routes/couponCode'));
// app.use('/posters', require('./routes/poster'));
// app.use('/users', require('./routes/user'));
// app.use('/orders', require('./routes/order'));
// app.use('/payment', require('./routes/payment'));
// app.use('/notification', require('./routes/notification'));

// // Health check route
// app.get('/', asyncHandler(async (req, res) => {
//   res.json({ success: true, message: 'API working successfully', data: null });
// }));

// // Global error handler
// app.use((error, req, res, next) => {
//   console.error(error);
//   res.status(500).json({ success: false, message: error.message, data: null });
// });

// // Start server
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
