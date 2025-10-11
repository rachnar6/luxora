import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, createProduct } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Trash2, Edit, PlusCircle } from 'lucide-react';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchProducts(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const createProductHandler = async () => {
    if (window.confirm('Are you sure you want to create a new product?')) {
      try {
        const newProduct = await createProduct();
        navigate(`/admin/product/${newProduct._id}/edit`);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create product');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-7xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <button
          onClick={createProductHandler}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Create Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">NAME</th>
              <th className="py-3 px-4 text-left">PRICE</th>
              <th className="py-3 px-4 text-left">CATEGORY</th>
              <th className="py-3 px-4 text-left">BRAND</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="py-4 px-4 text-sm text-gray-500">{product._id}</td>
                <td className="py-4 px-4 text-sm text-gray-800">{product.name}</td>
                <td className="py-4 px-4 text-sm text-gray-800">${product.price}</td>
                <td className="py-4 px-4 text-sm text-gray-800">{product.category}</td>
                <td className="py-4 px-4 text-sm text-gray-800">{product.brand}</td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <Link to={`/admin/product/${product._id}/edit`} className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => deleteHandler(product._id)} className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductListPage;