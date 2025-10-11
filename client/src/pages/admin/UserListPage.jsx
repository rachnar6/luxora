import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Edit, Trash2, UserPlus } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getUsers, deleteUser } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // 1. Get the token from the auth context
    const { user: loggedInUser, token } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                // 2. Pass the token to the API call
                const data = await getUsers(token);
                setUsers(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch users.');
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if the token is available
        if (token) {
            fetchUsers();
        }
    }, [token]); // 3. Add token to the dependency array

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
            try {
                // 4. Pass the token to the delete function
                await deleteUser(userId, token);
                setUsers(users.filter((user) => user._id !== userId));
            } catch (err) {
                alert('Failed to delete user.');
            }
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-center text-red-500 text-xl p-8">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Shield className="mr-3 text-indigo-600" size={32} />
                    User Management
                </h1>
                <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center transition-colors">
                    <UserPlus className="mr-2" size={20} />
                    Add User
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{user._id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.role === 'admin' ? 'bg-green-100 text-green-800' :
                                        user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <Link to={`/admin/user/${user._id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <Edit size={18} />
                                    </Link>
                                    {loggedInUser?._id !== user._id && (
                                         <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserListPage;