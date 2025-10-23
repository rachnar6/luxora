// src/components/products/ProductGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard'; // Make sure this path is correct

/**
 * A component to display a featured section of products on the homepage.
 * @param {string} title - The heading for the section (e.g., "Top Selling").
 * @param {array} products - The array of product objects to display.
 * @param {string} seeAllLink - The URL to navigate to when "See All" is clicked.
 */
const ProductGrid = ({ title, products, seeAllLink }) => {
  
  // Don't render the section if there are no products
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      
      {/* 1. The Header with Title and "See All" link */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        {seeAllLink && (
          <Link 
            to={seeAllLink} 
            className="text-primary font-semibold hover:underline"
          >
            See All
          </Link>
        )}
      </div>

      {/* 2. The Product Grid */}
      {/* We slice(0, 4) to only show the first 4 products for a "featured" grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

    </section>
  );
};

export default ProductGrid;