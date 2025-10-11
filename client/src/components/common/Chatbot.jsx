import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMessage = { role: 'user', parts: [{ text: newMessage }] };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setNewMessage('');
        setIsLoading(true);

        try {
            // ✅ THE FIX IS HERE:
            // We now format the history to ensure every message has the correct structure
            // that the Gemini API expects for conversation history.
            const chatHistoryForApi = currentMessages
                .slice(1) // Remove the initial greeting
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

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {isOpen ? (
                <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col animate-fade-in-up">
                    <div className="bg-primary text-white p-3 font-semibold rounded-t-lg flex justify-between items-center">
                        <span className="flex items-center gap-2"><Bot size={20} /> Luxora Assistant</span>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-primary-dark rounded-full p-1">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-grow p-3 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white shadow-sm'}`}>
                                    <p className="text-sm break-words">{msg.parts[0].text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="mb-3 flex justify-start">
                                <div className="p-2 rounded-lg bg-white shadow-sm">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Ask about products..."
                            className="flex-grow p-2 border rounded-md"
                        />
                        <button type="submit" className="bg-primary text-white p-2 rounded-md hover:bg-primary-dark" disabled={isLoading}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-transform hover:scale-110"
                    title="Open AI Assistant"
                >
                    <MessageSquare size={28} />
                </button>
            )}
        </div>
    );
};

export default Chatbot;
