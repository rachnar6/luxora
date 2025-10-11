import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with the credentials from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mern-ecommerce-reviews', // This will create a folder in your Cloudinary account
    resource_type: 'auto', // This lets Cloudinary automatically detect file type (image or video)
    allowed_formats: ['jpeg', 'png', 'jpg', 'mp4', 'mov', 'webm'],
  },
});

// Initialize Multer with the Cloudinary storage engine
const upload = multer({ storage: storage });

export default upload;