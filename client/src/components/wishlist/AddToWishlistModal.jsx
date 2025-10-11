import React, { useState } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { Check } from 'lucide-react';

const AddToWishlistModal = ({ product, onClose, productInWishlists }) => {
  const { wishlists, addItem, removeItem, createNewWishlist } = useWishlist();
  const [newWishlistName, setNewWishlistName] = useState('');

  const handleToggleExisting = async (wishlistId) => {
    const isAlreadyInThisList = productInWishlists.includes(wishlistId);

    if (isAlreadyInThisList) {
      const list = wishlists.find(w => w._id === wishlistId);
      const item = list.items.find(i => i.product?._id === product._id);
      if (item) {
        await removeItem(wishlistId, item._id);
      }
    } else {
      await addItem(wishlistId, product._id);
    }
    onClose();
  };

  const handleCreateAndAdd = async () => {
    if (!newWishlistName.trim()) return;
    try {
      const newWishlist = await createNewWishlist(newWishlistName);
      await addItem(newWishlist._id, product._id);
      onClose();
    } catch (error) {
      console.error("Failed to create and add to new wishlist", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Add "{product.name}" to...</h3>
        <div className="mb-4">
          <p className="font-medium mb-2">Select a wishlist:</p>
          <div className="max-h-40 overflow-y-auto border rounded-md">
            {wishlists.map((list) => {
              const isAlreadyInThisList = productInWishlists.includes(list._id);
              return (
                <button
                  key={list._id}
                  onClick={() => handleToggleExisting(list._id)}
                  className="block w-full text-left p-3 hover:bg-gray-100"
                >
                  <div className="flex justify-between items-center">
                    <span className={isAlreadyInThisList ? 'font-bold text-primary' : ''}>
                      {list.name}
                    </span>
                    {isAlreadyInThisList && <Check size={20} className="text-green-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="border-t pt-4">
            <p className="font-medium mb-2">Or create a new one:</p>
            <input
                type="text"
                value={newWishlistName}
                onChange={(e) => setNewWishlistName(e.target.value)}
                placeholder="e.g., Birthday Gifts"
                className="w-full p-2 border rounded-md"
            />
            <button
                onClick={handleCreateAndAdd}
                className="w-full bg-primary text-white p-2 mt-2 rounded-md hover:bg-primary-dark"
            >
                Create & Add
            </button>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 p-2 mt-4 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddToWishlistModal;