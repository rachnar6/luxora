import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

// Accept isOpen and onClose as props
const Chatbot = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Welcome to Luxora! How can I help you find the perfect product today?" }] }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMessage = { role: 'user', parts: [{ text: newMessage }] };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setNewMessage('');
        setIsLoading(true);

        try {
            const chatHistoryForApi = currentMessages
                .slice(1)
                .map(msg => ({
                    role: msg.role,
                    parts: msg.parts.map(part => ({ text: part.text }))
                }));

            const { data } = await axios.post('/api/chatbot', {
                query: newMessage,
                chatHistory: chatHistoryForApi
            });

            const aiMessage = { role: 'model', parts: [{ text: data.response }] };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            const errorMessage = { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later." }] };
            setMessages(prev => [...prev, errorMessage]);
            console.error("Chatbot API error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ This function is needed if the icon button should open the chat
    const openChat = () => {
        // Since App.jsx controls the state, we need a way to tell it to open.
        // We'll modify App.jsx slightly to pass an 'onOpen' function as well.
        // For now, let's assume an 'onOpen' prop exists (we'll add it next).
        // If App.jsx only passes `openChatbot` to Header, we need a different approach.
        // Let's go back to the simplest way: let App.jsx handle opening via the sidebar.
        // The icon button itself won't open the chat in this setup, only the sidebar button will.
        // If you WANT the icon to open the chat too, let me know.
    };


    return (
        <div className="fixed bottom-8 right-8 z-50">
            {isOpen ? (
                // --- Chat Window ---
                <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col animate-fade-in-up dark:bg-gray-800">
                    <div className="bg-primary text-white p-3 font-semibold rounded-t-lg flex justify-between items-center">
                        <span className="flex items-center gap-2"><Bot size={20} /> Luxora Assistant</span>
                        <button onClick={onClose} className="hover:bg-primary-dark rounded-full p-1">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-grow p-3 overflow-y-auto bg-gray-50 dark:bg-gray-700">
                        {messages.map((msg, index) => (
                            <div key={index} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-600 dark:text-gray-100 shadow-sm'}`}>
                                    <p className="text-sm break-words">{msg.parts[0].text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="mb-3 flex justify-start">
                                <div className="p-2 rounded-lg max-w-[85%] bg-white dark:bg-gray-600 dark:text-gray-100 shadow-sm">
                                    <p className="text-sm text-gray-500 animate-pulse">Assistant is typing...</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t dark:border-gray-600 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Ask about products..."
                            className="flex-grow p-2 border rounded-md dark:bg-gray-900 dark:border-gray-500 dark:text-gray-100"
                        />
                        <button type="submit" className="bg-primary text-white p-2 rounded-md hover:bg-primary-dark" disabled={isLoading}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            ) : (
                // ✅ --- Icon Button ---
                // This part renders the floating icon when isOpen is false.
                // Note: This button currently doesn't open the chat. Opening is handled by the sidebar.
                 <button
                    // If you want this icon to ALSO open the chat, we need to adjust App.jsx
                    // For now, it's just a visual indicator.
                    // onClick={openChat} // <--- Add this back later if needed
                    className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-transform hover:scale-110"
                    title="AI Assistant"
                 >
                     <MessageSquare size={28} />
                 </button>
            )}
        </div>
    );
};

export default Chatbot;