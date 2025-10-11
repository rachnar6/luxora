import mongoose from 'mongoose';

// ** START: NEW REVIEW SCHEMA **
// This defines the structure for a single review.
const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true }, // We'll store the user's name to avoid a DB query
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    images: [{ type: String }], // Array of image URLs from Cloudinary
    videos: [{ type: String }], // Array of video URLs from Cloudinary
  },
  {
    timestamps: true,
  }
);
// ** END: NEW REVIEW SCHEMA **


const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    // ** ADDED: Embed the reviews schema here **
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    isDeal: {
      type: Boolean,
      required: true,
      default: false,
    },
    salesCount: {
      type: Number,
      required: true,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;