import express from 'express';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// This route will handle a single file upload with the field name 'image'
router.post('/', upload.single('image'), (req, res) => {
  // After upload, req.file will contain file details from Cloudinary
  if (req.file) {
    res.send({
      message: 'Image Uploaded Successfully',
      image: req.file.path, // The secure URL from Cloudinary
    });
  } else {
    res.status(400).send({ message: 'No file uploaded.' });
  }
});

export default router;