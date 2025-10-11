import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSellerApplications, approveSellerApplication, rejectSellerApplication } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationToast from '../../components/common/NotificationToast';
import { Briefcase, Check, X } from 'lucide-react';

const SellerApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth(); // Assuming your context provides the token

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');

    // Function to fetch applications
    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await getSellerApplications(token);
            setApplications(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch applications.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch applications when the component mounts
    useEffect(() => {
        if (token) {
            fetchApplications();
        }
    }, [token]);

    const handleApprove = async (userId) => {
        if (window.confirm('Are you sure you want to approve this user as a seller?')) {
            try {
                await approveSellerApplication(userId, token);
                setToastMessage('User approved successfully!');
                setToastType('success');
                setShowToast(true);
                // Remove the approved user from the list for instant UI feedback
                setApplications(prev => prev.filter(app => app._id !== userId));
            } catch (err) {
                setToastMessage('Failed to approve application.');
                setToastType('error');
                setShowToast(true);
            }
        }
    };

    const handleReject = async (userId) => {
        if (window.confirm('Are you sure you want to reject this application?')) {
            try {
                await rejectSellerApplication(userId, token);
                setToastMessage('Application rejected.');
                setToastType('info');
                setShowToast(true);
                // Remove the rejected user from the list
                setApplications(prev => prev.filter(app => app._id !== userId));
            } catch (err) {
                setToastMessage('Failed to reject application.');
                setToastType('error');
                setShowToast(true);
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 text-xl p-8">{error}</div>;

    return (
        <>
            <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
                    <Briefcase className="mr-3 text-indigo-600" size={32} />
                    Seller Applications
                </h1>
                
                {applications.length === 0 ? (
                    <p className="text-gray-500">There are no pending seller applications.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-4">
                                            <button onClick={() => handleApprove(app._id)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200" title="Approve">
                                                <Check size={18} />
                                            </button>
                                            <button onClick={() => handleReject(app._id)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200" title="Reject">
                                                <X size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {showToast && (
                <NotificationToast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
            )}
        </>
    );
};

export default SellerApplicationsPage;