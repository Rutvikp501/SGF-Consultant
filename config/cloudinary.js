// cloudinaryUtil.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

async function cloudinaryUpload() {
  // Set up Cloudinary configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  // Configure Cloudinary storage for multer
  const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
          folder: 'uploads', // Folder in Cloudinary
          format: async (req, file) => 'png', // You can change this to any format or keep the original
          public_id: (req, file) => file.originalname.split('.')[0], // Name without file extension
        },
    });
    
    try {
        // Initialize multer with Cloudinary storage
        const upload = multer({ storage: storage });
        return upload;
  } catch (error) {
    console.error('Error Uploading file:', error);
    throw error;
  }
}

module.exports = { cloudinaryUpload };
