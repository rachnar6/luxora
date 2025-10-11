import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProducts as fetchAllProducts } from '../services/productService';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [rating, setRating] = useState(0); // ✅ ADD RATING STATE

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const allProducts = await fetchAllProducts({});
                setProducts(allProducts);
            } catch (err) {
                setError("Failed to load products.");
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const value = {
        products, loading, error,
        category, setCategory,
        brand, setBrand,
        minPrice, setMinPrice,
        maxPrice, setMaxPrice,
        rating, setRating // ✅ EXPORT RATING STATE
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    return useContext(ProductContext);
};