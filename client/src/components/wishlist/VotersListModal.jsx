import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const VotersListModal = ({ title, users, onClose, voteType }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          {voteType === 'like' && <ThumbsUp className="text-blue-500" />}
          {voteType === 'dislike' && <ThumbsDown className="text-red-500" />}
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {users.map(user => (
            <li key={user._id} className="bg-gray-100 p-2 rounded-md">{user.name}</li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 p-2 mt-6 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VotersListModal;