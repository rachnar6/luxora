import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getUserDetails, updateUser } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationToast from '../../components/common/NotificationToast';

const UserEditPage = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user'); // Use 'role' instead of 'isAdmin'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const data = await getUserDetails(userId);
        setName(data.name);
        setEmail(data.email);
        setRole(data.role); // Set the role from the fetched data
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateUser(userId, { name, email, role }); // Send 'role' in the update
      setShowToast(true);
      setTimeout(() => navigate('/admin/userlist'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 my-8">
        <Link to="/admin/userlist" className="inline-block text-primary hover:underline mb-6">
          &larr; Go Back to User List
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit User</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="role-select" className="block text-lg font-medium text-gray-700 mb-2">User Role</label>
            <select 
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition">
            Update User
          </button>
        </form>
      </div>
      
      {showToast && (
        <NotificationToast
          message="User updated successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default UserEditPage;