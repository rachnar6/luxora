import React, { useState, useEffect } from 'react';
import { getCategories, getBrands } from '../services/productService';

const QuickFilters = ({ onFilterChange }) => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    // Effect to fetch all categories when the component loads
    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getCategories();
            setCategories(data);
        };
        fetchCategories();
    }, []);

    // Effect to fetch brands whenever the selected category changes
    useEffect(() => {
        const fetchBrands = async () => {
            if (selectedCategory) {
                const data = await getBrands(selectedCategory);
                setBrands(data);
            } else {
                setBrands([]); // Clear brands if no category is selected
            }
        };
        fetchBrands();
        setSelectedBrand(''); // Reset brand selection when category changes
    }, [selectedCategory]);
    
    // ... handler functions to update state and call onFilterChange

    return (
        <div className="quick-filters">
            {/* Category Dropdown */}
            <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            {/* Brand Dropdown */}
            <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                disabled={!selectedCategory} // Disable until a category is chosen
            >
                <option value="">All Brands</option>
                {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                ))}
            </select>
            
            {/* ... Price Range and other filters */}
        </div>
    );
};

export default QuickFilters;