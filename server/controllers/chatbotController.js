import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

// @desc    Get a response from the AI chatbot
// @route   POST /api/chatbot
// @access  Public
const getChatbotResponse = asyncHandler(async (req, res) => {
    const { query, chatHistory } = req.body;

    try {
        let productSample = [];
        
        // ✅ THE FIX IS HERE: We now sanitize the words to remove special characters.
        const searchKeywords = query
            .split(' ')
            .map(word => word.replace(/[^a-zA-Z0-9]/g, '')) // Remove all non-alphanumeric characters
            .filter(word => word.length > 2); // A slightly lower threshold can be better

        if (searchKeywords.length > 0) {
            const regex = new RegExp(searchKeywords.join('|'), 'i');
            productSample = await Product.find({ name: { $regex: regex } }).limit(10);
        }
        
        if (productSample.length === 0) {
            const allProducts = await Product.find({});
            const shuffledProducts = allProducts.sort(() => 0.5 - Math.random());
            productSample = shuffledProducts.slice(0, 15);
        }

        const productContext = productSample
            .map(p => {
                const name = p.name || 'Unnamed Product';
                const price = typeof p.price === 'number' ? `₹${p.price.toFixed(2)}` : 'Price not available';
                const description = p.description ? `${p.description.substring(0, 100)}...` : 'No description.';
                return `Name: ${name}, Price: ${price}, Description: ${description}`;
            })
            .join('\n');

        const systemPrompt = `You are 'Luxora Assistant', a friendly and helpful AI chatbot for the Luxora e-commerce store. 
        Your goal is to assist users by answering questions and recommending products ONLY from the provided list.
        - If the user's query matches products in the list, present them.
        - If the user asks for something not in the list, you can say you don't have it and suggest alternatives from the list.
        - NEVER make up products.
        - If a user asks about something unrelated to shopping, politely decline.
        - When recommending a product, always state its name and price.
        
        Here are the most relevant products based on the user's query:
        ${productContext}
        `;

        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [
                ...(Array.isArray(chatHistory) ? chatHistory : []),
                { role: "user", parts: [{ text: query }] }
            ],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error("Gemini API Error Body:", errorBody);
            throw new Error(`API call failed with status: ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiResponse) {
            res.json({ response: aiResponse });
        } else {
            console.error("Gemini API response was empty or invalid:", result);
            res.status(500).json({ message: "AI response was empty or invalid." });
        }

    } catch (error) {
        console.error("Error in getChatbotResponse controller:", error);
        res.status(500).json({ message: "Failed to get a response from the AI assistant." });
    }
});

export { getChatbotResponse };

