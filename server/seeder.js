import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

const seedProducts = async () => {
    try {
        await connectDB();
        
        console.log('--- Deleting all existing products... ---');
        await Product.deleteMany();
        console.log('Products deleted.');
        
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error('CRITICAL: No admin user found. Please create an admin user first.');
            process.exit(1);
        }
        const adminUserId = adminUser._id;
        console.log(`--- Found admin user: ${adminUser.name} ---`);

        const apis = [
            'https://fakestoreapi.com/products',
            'https://dummyjson.com/products/category/smartphones',
            'http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline'
        ];

        console.log('--- Fetching data from external APIs... ---');
        const responses = await Promise.all(apis.map(url => axios.get(url)));
        
        const [fakeStoreResponse, smartphonesResponse, makeupResponse] = responses;

        console.log('--- Transforming API data... ---');

        const apparelProducts = fakeStoreResponse.data.map(product => ({
            name: product.title,
            image: product.image,
            description: product.description,
            brand: 'Fashion Co.',
            category: 'Apparel',
            price: product.price,
            countInStock: Math.floor(Math.random() * 100) + 10,
            rating: product.rating.rate,
            numReviews: product.rating.count,
            user: adminUserId,
        }));

        const smartphoneProducts = smartphonesResponse.data.products.map(product => ({
            name: product.title,
            image: product.thumbnail,
            description: product.description,
            brand: product.brand,
            category: 'Electronics',
            price: product.price,
            countInStock: product.stock,
            rating: product.rating,
            numReviews: Math.floor(Math.random() * 200) + 20,
            user: adminUserId,
        }));
        
        const makeupProducts = makeupResponse.data.map(product => ({
            name: product.name,
            image: product.image_link,
            description: product.description || 'A quality cosmetic product.',
            brand: product.brand || 'BeautyBrand',
            category: 'Cosmetics',
            price: parseFloat(product.price) || 12.99,
            countInStock: Math.floor(Math.random() * 150) + 25,
            rating: parseFloat(product.rating) || 4.0,
            numReviews: Math.floor(Math.random() * 150),
            user: adminUserId,
        }));
        
        const allProducts = [...apparelProducts, ...smartphoneProducts, ...makeupProducts];
        
        // --- ADD THIS FILTERING STEP ---
        const validProducts = allProducts.filter(p => p && p.name && p.image && p.price > 0);
        console.log(`--- Filtered out invalid data. Total valid products: ${validProducts.length} ---`);
        // --- END OF NEW STEP ---

        await Product.insertMany(validProducts); // CHANGED: Insert the filtered list

        console.log('✅ Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

seedProducts();