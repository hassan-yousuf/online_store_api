// const multer = require('multer');
// const path = require('path');

// const storageCategory = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, './public/category');
//   },
//   filename: function(req, file, cb) {
//     // Check file type based on its extension
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     if (extname) {
//       cb(null, Date.now() + "_" + Math.floor(Math.random() * 1000) + path.extname(file.originalname));
//     } else {
//       cb("Error: only .jpeg, .jpg, .png files are allowed!");
//     }
//   }
// });

// const uploadCategory = multer({
//   storage: storageCategory,
//   limits: {
//     fileSize: 1024 * 1024 * 5 // limit filesize to 5MB
//   },
// });

// const storageProduct = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, './public/products');
//   },
//   filename: function(req, file, cb) {
//     // Check file type based on its extension
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     if (extname) {
//       cb(null, Date.now() + "_" + file.originalname);
//     } else {
//       cb("Error: only .jpeg, .jpg, .png files are allowed!");
//     }
//   }
// });

// const uploadProduct = multer({
//   storage: storageProduct,
//   limits: {
//     fileSize: 1024 * 1024 * 5 // limit filesize to 5MB
//   },
// });


// const storagePoster = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, './public/posters');
//   },
//   filename: function(req, file, cb) {
//     // Check file type based on its extension
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     if (extname) {
//       cb(null, Date.now() + "_" + file.originalname);
//     } else {
//       cb("Error: only .jpeg, .jpg, .png files are allowed!");
//     }
//   }
// });

// const uploadPosters = multer({
//   storage: storagePoster,
//   limits: {
//     fileSize: 1024 * 1024 * 5 // limit filesize to 5MB
//   },
// });

// module.exports = {
//     uploadCategory,
//     uploadProduct,
//     uploadPosters,
// };


// const axios = require('axios');
// const FormData = require('form-data');
// const multer = require('multer');

// const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// const uploadToImgbb = async (fileBuffer, originalname) => {
//   const form = new FormData();
//   form.append('image', fileBuffer.toString('base64'));
//   form.append('name', originalname.split('.')[0]);

//   const imgbbApiKey = process.env.IMGBB_API_KEY;

//   const res = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, form, {
//     headers: form.getHeaders(),
//   });

//   return res.data.data.url;
// };

// const handleImgbbUpload = (fieldName) => [
//   upload.single(fieldName),
//   async (req, res, next) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ success: false, message: 'No file uploaded' });
//       }
//       const imageUrl = await uploadToImgbb(req.file.buffer, req.file.originalname);
//       req.imageUrl = imageUrl;
//       next();
//     } catch (error) {
//       next(error);
//     }
//   }
// ];

// module.exports = {
//   uploadCategory: handleImgbbUpload('category'),
//   uploadProduct: handleImgbbUpload('product'),
//   uploadPosters: handleImgbbUpload('poster'),
// };


const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// Upload a single image buffer to imgbb
const uploadToImgbb = async (fileBuffer, originalname) => {
  const form = new FormData();
  form.append('image', fileBuffer.toString('base64'));
  form.append('name', originalname.split('.')[0]);

  const imgbbApiKey = process.env.IMGBB_API_KEY;
  const res = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, form, {
    headers: form.getHeaders()
  });

  return res.data.data.url;
};

// For single field image uploads (category, poster)
const handleImgbbUpload = (fieldName) => [
  upload.single(fieldName),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const imageUrl = await uploadToImgbb(req.file.buffer, req.file.originalname);
      req.imageUrl = imageUrl;
      next();
    } catch (error) {
      next(error);
    }
  }
];

// For multi-image fields (product: image1 to image5)
const handleMultipleImgbbUpload = () => [
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'image5', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];
      req.imageUrls = {};

      for (const field of fields) {
        if (req.files[field] && req.files[field].length > 0) {
          const file = req.files[field][0];
          const url = await uploadToImgbb(file.buffer, file.originalname);
          req.imageUrls[field] = url;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  }
];

module.exports = {
  uploadCategory: handleImgbbUpload('category'),
  uploadPosters: handleImgbbUpload('poster'),
  uploadProduct: handleMultipleImgbbUpload()
};
