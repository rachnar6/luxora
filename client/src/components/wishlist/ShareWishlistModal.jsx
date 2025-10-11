import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { searchUsers } from '../../services/userService';
import { updateShareList } from '../../services/wishlistService';
import { X } from 'lucide-react';

const ShareWishlistModal = ({ currentWishlist, onClose }) => {
    const { token } = useAuth();
    const [sharedUsers, setSharedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Pre-populate with users already on the share list
        if (currentWishlist.sharedWith) {
            setSharedUsers(currentWishlist.sharedWith);
        }
    }, [currentWishlist]);
    
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            const results = await searchUsers(searchQuery, token);
            // Filter out users who are already on the share list
            setSearchResults(results.filter(user => !sharedUsers.some(su => su._id === user._id)));
        }, 500); // Debounce search

        return () => clearTimeout(handler);
    }, [searchQuery, token, sharedUsers]);

    const addUser = (user) => {
        setSharedUsers([...sharedUsers, user]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeUser = (userId) => {
        setSharedUsers(sharedUsers.filter(user => user._id !== userId));
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        const userIds = sharedUsers.map(user => user._id);
        await updateShareList(currentWishlist._id, userIds, token);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4">Share "{currentWishlist.name}"</h3>
                
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search for users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute w-full bg-white border mt-1 rounded-md shadow-lg z-10">
                            {searchResults.map(user => (
                                <div key={user._id} onClick={() => addUser(user)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <p className="font-medium mb-2">Shared with:</p>
                <div className="border rounded-md p-2 min-h-[80px]">
                    {sharedUsers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {sharedUsers.map(user => (
                                <div key={user._id} className="bg-blue-100 text-blue-800 flex items-center gap-2 px-2 py-1 rounded-full">
                                    <span>{user.name}</span>
                                    <button onClick={() => removeUser(user._id)} className="hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500 text-sm">Not shared with anyone yet.</p>}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleSaveChanges} disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-gray-400">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareWishlistModal;