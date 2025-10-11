import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Send, MessageCircle, X } from 'lucide-react';

const socket = io('http://localhost:5000'); // Your backend URL

const ChatBox = ({ wishlistId, initialMessages = [] }) => {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // --- STEP 1: Add state to manage the open/closed state of the chat ---
    const [isOpen, setIsOpen] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // This effect runs only once to set up the socket connection and listeners
    useEffect(() => {
        socket.emit('joinWishlist', wishlistId);

        socket.on('receiveMessage', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [wishlistId]);

    // This effect scrolls to the bottom whenever new messages arrive
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
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/api/wishlist/${wishlistId}/chat`, { text: newMessage }, config);
        } catch (error) {
            console.error("Failed to save message", error);
        }

        setNewMessage('');
    };

    // --- STEP 2: The UI now depends on the 'isOpen' state ---
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