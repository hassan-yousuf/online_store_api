const express = require('express');
const router = express.Router();
const Product = require('../model/product');
const multer = require('multer');
const { uploadProduct } = require('../uploadFile');
const asyncHandler = require('express-async-handler');

// Get all products
router.get('/', asyncHandler(async (req, res) => {
    try {
        const products = await Product.find()
        .populate('proCategoryId', 'id name')
        .populate('proSubCategoryId', 'id name')
        .populate('proBrandId', 'id name')
        .populate('proVariantTypeId', 'id type')
        .populate('proVariantId', 'id name');
        res.json({ success: true, message: "Products retrieved successfully.", data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Get a product by ID
router.get('/:id', asyncHandler(async (req, res) => {
    try {
        const productID = req.params.id;
        const product = await Product.findById(productID)
            .populate('proCategoryId', 'id name')
            .populate('proSubCategoryId', 'id name')
            .populate('proBrandId', 'id name')
            .populate('proVariantTypeId', 'id name')
            .populate('proVariantId', 'id name');
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        res.json({ success: true, message: "Product retrieved successfully.", data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));



// create new product
router.post('/', asyncHandler(async (req, res) => {
    try {
        // Execute the Multer middleware to handle multiple file fields
        uploadProduct.fields([
            { name: 'image1', maxCount: 1 },
            { name: 'image2', maxCount: 1 },
            { name: 'image3', maxCount: 1 },
            { name: 'image4', maxCount: 1 },
            { name: 'image5', maxCount: 1 }
        ])(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // Handle Multer errors, if any
                if (err.code === 'LIMIT_FILE_SIZE') {
                    err.message = 'File size is too large. Maximum filesize is 5MB per image.';
                }
                console.log(`Add product: ${err}`);
                return res.json({ success: false, message: err.message });
            } else if (err) {
                // Handle other errors, if any
                console.log(`Add product: ${err}`);
                return res.json({ success: false, message: err });
            }

            // Extract product data from the request body
            const { name, description, quantity, price, offerPrice, proCategoryId, proSubCategoryId, proBrandId, proVariantTypeId, proVariantId } = req.body;

            // Check if any required fields are missing
            if (!name || !quantity || !price || !proCategoryId || !proSubCategoryId) {
                return res.status(400).json({ success: false, message: "Required fields are missing." });
            }

            // Initialize an array to store image URLs
            const imageUrls = [];

            // Iterate over the file fields
            const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];
            fields.forEach((field, index) => {
            //     if (req.files[field] && req.files[field].length > 0) {
            //         const file = req.files[field][0];
            //         const imageUrl = `http://localhost:3000/image/products/${file.filename}`;
            //         imageUrls.push({ image: index + 1, url: imageUrl });
            //     }
            // });
                if (req.imageUrls[field]) {
                    imageUrls.push({ image: index + 1, url: req.imageUrls[field] });
                }
            });

            // Create a new product object with data
            const newProduct = new Product({ name, description, quantity, price, offerPrice, proCategoryId, proSubCategoryId, proBrandId,proVariantTypeId, proVariantId, images: imageUrls });

            // Save the new product to the database
            await newProduct.save();

            // Send a success response back to the client
            res.json({ success: true, message: "Product created successfully.", data: null });
        });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}));



// Update a product
router.put('/:id', asyncHandler(async (req, res) => {
    const productId = req.params.id;
    try {
        // Execute the Multer middleware to handle file fields
        uploadProduct.fields([
            { name: 'image1', maxCount: 1 },
            { name: 'image2', maxCount: 1 },
            { name: 'image3', maxCount: 1 },
            { name: 'image4', maxCount: 1 },
            { name: 'image5', maxCount: 1 }
        ])(req, res, async function (err) {
            if (err) {
                console.log(`Update product: ${err}`);
                return res.status(500).json({ success: false, message: err.message });
            }

            const { name, description, quantity, price, offerPrice, proCategoryId, proSubCategoryId, proBrandId, proVariantTypeId, proVariantId } = req.body;

            // Find the product by ID
            const productToUpdate = await Product.findById(productId);
            if (!productToUpdate) {
                return res.status(404).json({ success: false, message: "Product not found." });
            }

            // Update product properties if provided
            productToUpdate.name = name || productToUpdate.name;
            productToUpdate.description = description || productToUpdate.description;
            productToUpdate.quantity = quantity || productToUpdate.quantity;
            productToUpdate.price = price || productToUpdate.price;
            productToUpdate.offerPrice = offerPrice || productToUpdate.offerPrice;
            productToUpdate.proCategoryId = proCategoryId || productToUpdate.proCategoryId;
            productToUpdate.proSubCategoryId = proSubCategoryId || productToUpdate.proSubCategoryId;
            productToUpdate.proBrandId = proBrandId || productToUpdate.proBrandId;
            productToUpdate.proVariantTypeId = proVariantTypeId || productToUpdate.proVariantTypeId;
            productToUpdate.proVariantId = proVariantId || productToUpdate.proVariantId;

            // Iterate over the file fields to update images
            const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];
            fields.forEach((field, index) => {
                if (req.files[field] && req.files[field].length > 0) {
                    const file = req.files[field][0];
                    const imageUrl = `http://localhost:3000/image/products/${file.filename}`;
                    // Update the specific image URL in the images array
                    let imageEntry = productToUpdate.images.find(img => img.image === (index + 1));
                    if (imageEntry) {
                        imageEntry.url = imageUrl;
                    } else {
                        // If the image entry does not exist, add it
                        productToUpdate.images.push({ image: index + 1, url: imageUrl });
                    }
                }
            });

            // Save the updated product
            await productToUpdate.save();
            res.json({ success: true, message: "Product updated successfully." });
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Delete a product
router.delete('/:id', asyncHandler(async (req, res) => {
    const productID = req.params.id;
    try {
        const product = await Product.findByIdAndDelete(productID);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Product = require('../model/product');
// const { uploadProduct } = require('../uploadFile');
// const asyncHandler = require('express-async-handler');

// // Get all products
// router.get('/', asyncHandler(async (req, res) => {
//   const products = await Product.find()
//     .populate('proCategoryId', 'id name')
//     .populate('proSubCategoryId', 'id name')
//     .populate('proBrandId', 'id name')
//     .populate('proVariantTypeId', 'id type')
//     .populate('proVariantId', 'id name');
//   res.json({ success: true, message: "Products retrieved successfully.", data: products });
// }));

// // Get a product by ID
// router.get('/:id', asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.id)
//     .populate('proCategoryId', 'id name')
//     .populate('proSubCategoryId', 'id name')
//     .populate('proBrandId', 'id name')
//     .populate('proVariantTypeId', 'id name')
//     .populate('proVariantId', 'id name');
//   if (!product) {
//     return res.status(404).json({ success: false, message: "Product not found." });
//   }
//   res.json({ success: true, message: "Product retrieved successfully.", data: product });
// }));

// // Create a new product
// router.post('/', uploadProduct, asyncHandler(async (req, res) => {
//   const { name, description, quantity, price, offerPrice, proCategoryId, proSubCategoryId, proBrandId, proVariantTypeId, proVariantId } = req.body;

//   if (!name || !quantity || !price || !proCategoryId || !proSubCategoryId) {
//     return res.status(400).json({ success: false, message: "Required fields are missing." });
//   }

//   // req.imageUrls will hold an object of { image1, image2, ... }
//   const imageUrls = [];
//   const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];

//   fields.forEach((field, index) => {
//     if (req.imageUrls && req.imageUrls[field]) {
//       imageUrls.push({ image: index + 1, url: req.imageUrls[field] });
//     }
//   });

//   const newProduct = new Product({
//     name,
//     description,
//     quantity,
//     price,
//     offerPrice,
//     proCategoryId,
//     proSubCategoryId,
//     proBrandId,
//     proVariantTypeId,
//     proVariantId,
//     images: imageUrls
//   });

//   await newProduct.save();
//   res.json({ success: true, message: "Product created successfully.", data: null });
// }));

// // Update a product
// router.put('/:id', uploadProduct, asyncHandler(async (req, res) => {
//   const productId = req.params.id;
//   const { name, description, quantity, price, offerPrice, proCategoryId, proSubCategoryId, proBrandId, proVariantTypeId, proVariantId } = req.body;

//   const productToUpdate = await Product.findById(productId);
//   if (!productToUpdate) {
//     return res.status(404).json({ success: false, message: "Product not found." });
//   }

//   productToUpdate.name = name || productToUpdate.name;
//   productToUpdate.description = description || productToUpdate.description;
//   productToUpdate.quantity = quantity || productToUpdate.quantity;
//   productToUpdate.price = price || productToUpdate.price;
//   productToUpdate.offerPrice = offerPrice || productToUpdate.offerPrice;
//   productToUpdate.proCategoryId = proCategoryId || productToUpdate.proCategoryId;
//   productToUpdate.proSubCategoryId = proSubCategoryId || productToUpdate.proSubCategoryId;
//   productToUpdate.proBrandId = proBrandId || productToUpdate.proBrandId;
//   productToUpdate.proVariantTypeId = proVariantTypeId || productToUpdate.proVariantTypeId;
//   productToUpdate.proVariantId = proVariantId || productToUpdate.proVariantId;

//   // Update images if provided
//   if (req.imageUrls) {
//     const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];
//     fields.forEach((field, index) => {
//       if (req.imageUrls[field]) {
//         const existing = productToUpdate.images.find(img => img.image === index + 1);
//         if (existing) {
//           existing.url = req.imageUrls[field];
//         } else {
//           productToUpdate.images.push({ image: index + 1, url: req.imageUrls[field] });
//         }
//       }
//     });
//   }

//   await productToUpdate.save();
//   res.json({ success: true, message: "Product updated successfully." });
// }));

// // Delete a product
// router.delete('/:id', asyncHandler(async (req, res) => {
//   const product = await Product.findByIdAndDelete(req.params.id);
//   if (!product) {
//     return res.status(404).json({ success: false, message: "Product not found." });
//   }
//   res.json({ success: true, message: "Product deleted successfully." });
// }));

// module.exports = router;
