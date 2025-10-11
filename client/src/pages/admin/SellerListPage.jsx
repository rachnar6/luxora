import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// CHANGED: Import getSellers instead of getUsers
import { getSellers } from '../../services/adminService'; 
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users } from 'lucide-react';

const SellerListPage = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                // CHANGED: Call the new getSellers function
                const data = await getSellers(token); 
                setSellers(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch sellers.');
            } finally {
                setLoading(false);
            }
        };
        if (token) {
            fetchSellers();
        }
    }, [token]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
                <Users className="mr-3 text-indigo-600" size={32} />
                Sellers List
            </h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sellers.length > 0 ? sellers.map((seller) => (
                            <tr key={seller._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{seller.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{seller.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link to={`/admin/seller/${seller._id}/products`} className="text-indigo-600 hover:underline">
                                        View Products
                                    </Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="text-center py-8 text-gray-500">No sellers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellerListPage;