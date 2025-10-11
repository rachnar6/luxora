// client/src/components/wishlist/CommentSection.jsx
// Component for displaying and adding comments to a shared wishlist

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { addComment, getComments } from '../../services/wishlistService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import NotificationToast from '../common/NotificationToast';

const CommentSection = ({ shareToken }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [addingComment, setAddingComment] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const fetchComments = async () => {
    setLoadingComments(true);
    setError(null);
    try {
      const data = await getComments(shareToken);
      setComments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch comments.');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (shareToken) {
      fetchComments();
    }
  }, [shareToken]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      setToastMessage('Please log in to add a comment.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    if (!newComment.trim()) {
      setToastMessage('Comment cannot be empty.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setAddingComment(true);
    setError(null);
    try {
      const addedComment = await addComment(shareToken, newComment);
      setComments([...comments, addedComment]);
      setNewComment('');
      setToastMessage('Comment added successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment.');
      setToastMessage(err.response?.data?.message || 'Failed to add comment.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-primary" /> Comments
      </h3>

      {loadingComments ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-600 text-center">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-800">{comment.userName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.text}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAddComment} className="mt-6 border-t pt-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Add a Comment</h4>
        <div className="flex items-center space-x-3">
          <textarea
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-24"
            placeholder={user ? "Write your comment here..." : "Log in to add a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user || addingComment}
          ></textarea>
          <button
            type="submit"
            className="p-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!user || addingComment}
          >
            {addingComment ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </form>
      {showToast && (
        <NotificationToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default CommentSection;
