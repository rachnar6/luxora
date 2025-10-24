import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api'; // <-- CORRECTED IMPORT PATH
import { Send, MessageCircle, X } from 'lucide-react';

// --- THIS IS THE FIX ---
// Connects to your live backend URL from the .env variable
const socket = io(process.env.REACT_APP_API_URL);

const ChatBox = ({ wishlistId, initialMessages = [] }) => {
    const { user, token } = useAuth(); // Token is no longer needed for API call
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        socket.emit('joinWishlist', wishlistId);

        socket.on('receiveMessage', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [wishlistId]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const messageData = {
            user: user._id,
            name: user.name,
            text: newMessage,
            createdAt: new Date().toISOString()
        };

        socket.emit('sendMessage', { wishlistId, message: messageData });
        
        try {
            // --- THIS IS THE FIX ---
            // Use the API instance. The token is added automatically.
            await API.post(`/wishlist/${wishlistId}/chat`, { text: newMessage });
        } catch (error) {
            console.error("Failed to save message", error);
        }

        setNewMessage('');
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {isOpen ? (
                // --- IF OPEN: Show the full chat window ---
                <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col animate-fade-in-up">
                    <div className="bg-primary text-white p-3 font-semibold rounded-t-lg flex justify-between items-center">
                        <span>Live Chat</span>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-primary-dark rounded-full p-1">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-grow p-3 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`mb-2 flex ${msg.user === user._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2 rounded-lg max-w-[80%] ${msg.user === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                    <div className="text-xs font-bold mb-1">{msg.name}</div>
                                    <div className="text-sm break-words">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow p-2 border rounded-md"
                        />
                        <button type="submit" className="bg-primary text-white p-2 rounded-md hover:bg-primary-dark">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            ) : (
                // --- IF CLOSED: Show only the floating icon button ---
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-transform hover:scale-110"
                    title="Open Chat"
                >
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
};

export default ChatBox;