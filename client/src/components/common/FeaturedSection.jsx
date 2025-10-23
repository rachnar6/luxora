// src/components/common/FeaturedSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// You'll import your ProductCard component here
// import ProductCard from './ProductCard'; 

// This component will show the products. 
// You can copy your "Top Selling Products" grid logic into here.
const ProductGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* This is where you map over your products.
        I'm just using a placeholder. You already have this logic.
      */}
      {products.slice(0, 4).map((product) => (
        <div key={product.id} className="border p-2 rounded-lg">
           {/* Replace this div with your actual <ProductCard /> component */}
           <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded" />
           <h3 className="font-semibold">{product.name}</h3>
           <p>₹{product.price}</p>
        </div>
      ))}
    </div>
  );
};


// This is the main component
const FeaturedSection = ({ title, products, seeAllLink }) => {
  return (
    <section className="container mx-auto px-4 py-8">
      {/* 1. THE HEADER WITH "SEE ALL" LINK */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link 
          to={seeAllLink} 
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          See All
        </Link>
      </div>

      {/* 2. THE PRODUCT GRID */}
      {/* Pass a limited number of products here. 
        You would fetch these products and pass them as a prop.
      */}
      <ProductGrid products={products} />
    </section>
  );
};

export default FeaturedSection;