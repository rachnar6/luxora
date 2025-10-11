import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios'; // Import axios
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js'; // Assuming you have a user model

dotenv.config();
connectDB();

const importDataFromAPI = async () => {
  try {
    // 1. Clear existing data to avoid duplicates
    await Product.deleteMany();
    console.log('Old products cleared...');

    // 2. Fetch data from the Fake Store API
    console.log('Fetching products from Fake Store API...');
    const { data: apiProducts } = await axios.get('https://fakestoreapi.com/products');
    console.log(`${apiProducts.length} products fetched.`);

    // 3. Find an Admin User to assign to the products
    // NOTE: Make sure you have at least one admin user in your database.
    // You can use your original seeder script to create one if needed.
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
        console.error('No admin user found. Please create an admin user first.');
        process.exit(1);
    }

    // 4. Map the API data to match YOUR Product Schema
    const productsToInsert = apiProducts.map((apiProduct) => {
      return {
        user: adminUser._id,
        name: apiProduct.title,
        image: apiProduct.image,
        description: apiProduct.description,
        brand: 'Generic Brand', // The API doesn't provide a brand, so we set a default
        category: apiProduct.category,
        price: apiProduct.price,
        countInStock: Math.floor(Math.random() * 100) + 1, // Generate random stock count
        rating: apiProduct.rating.rate, // The API has rating inside an object
        numReviews: apiProduct.rating.count, // The API has review count inside rating object
        isDeal: Math.random() < 0.2, // Randomly make 20% of items a deal
        salesCount: Math.floor(Math.random() * 500), // Generate random sales count
      };
    });

    // 5. Insert the mapped products into your database
    console.log('Inserting new products into the database...');
    await Product.insertMany(productsToInsert);

    console.log('✅ Data Imported Successfully from API!');
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
  } finally {
    // 6. Close the database connection and exit the script
    await mongoose.connection.close();
    process.exit();
  }
};

// Run the function
importDataFromAPI();