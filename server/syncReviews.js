import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';

dotenv.config();
connectDB();

const syncProductReviews = async () => {
  try {
    console.log('Fetching all products...');
    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      const actualNumReviews = product.reviews.length;
      const actualRating =
        actualNumReviews > 0
          ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / actualNumReviews
          : 0;

      // Check if the stored values are different from the actual values
      if (product.numReviews !== actualNumReviews || product.rating !== actualRating) {
        console.log(`Syncing product: ${product.name}`);
        product.numReviews = actualNumReviews;
        product.rating = actualRating;
        await product.save();
        updatedCount++;
      }
    }

    console.log(`\n✅ Synchronization complete.`);
    console.log(`${updatedCount} products were updated.`);
  } catch (error) {
    console.error(`❌ Error during synchronization: ${error.message}`);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

syncProductReviews();