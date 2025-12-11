class ChatbotService {
    constructor(db) {
        this.db = db;
        this.geminiApiKey = process.env.GEMINI_API_KEY || null;
        this.initializeKnowledgeBase();
    }

    initializeKnowledgeBase() {
        // Knowledge base with patterns and responses
        this.knowledgeBase = {
            greeting: {
                patterns: ['hello', 'hi', 'hey', 'greetings', 'howdy', 'good morning', 'good afternoon', 'good evening'],
                responses: [
                    'Hello! Welcome to BrewHeaven Cafe! ☕ How can I help you today?',
                    'Hi there! 👋 What can I get you at BrewHeaven Cafe?',
                    'Hey! Welcome to BrewHeaven Cafe! Looking for some delicious coffee?',
                    'Greetings! What brings you to BrewHeaven Cafe today?'
                ]
            },
            menu: {
                patterns: ['menu', 'what do you have', 'what\'s available', 'show me', 'see menu', 'items', 'products', 'coffee options'],
                responses: [
                    'We have a great variety! Check our menu above for: ☕ Coffees, 🍵 Teas, 🥐 Pastries, 🥪 Sandwiches, and 🍰 Desserts.',
                    'Our menu includes all your favorites: espresso, cappuccino, latte, and much more! Browse the menu to see all options.',
                    'We offer everything from simple espresso to delicious pastries. See our full menu above!'
                ]
            },
            coffee_recommendation: {
                patterns: ['recommend', 'suggest', 'best coffee', 'what should i order', 'favorite', 'popular', 'most ordered'],
                responses: [
                    'Our cappuccino is a customer favorite! It\'s a perfect blend of espresso and steamed milk. ☕',
                    'If you like strong coffee, try our espresso or americano. For something smoother, cappuccino or latte are great choices!',
                    'The mocha is amazing if you like chocolate! For classic coffee lovers, our latte is perfect.',
                    'Can\'t go wrong with a cappuccino - it\'s our most popular drink!'
                ]
            },
            pricing: {
                patterns: ['price', 'cost', 'how much', 'expensive', 'afford', 'payment', 'charge'],
                responses: [
                    'Our prices are very reasonable! Espresso starts at ₱100, most coffees are ₱120-220, and sandwiches are ₱350. Check the menu for exact prices!',
                    'We offer great value! Coffee drinks range from ₱100-₱220, and pastries are ₱120-₱160.',
                    'Our menu is budget-friendly. You can get a coffee for as low as ₱100 and combine it with a pastry for under ₱300!'
                ]
            },
            order_process: {
                patterns: ['how to order', 'order', 'place order', 'buy', 'purchase', 'checkout'],
                responses: [
                    'Easy! 🛒 Browse the menu above, select items and quantities, add them to your cart, and click the checkout button to complete your order.',
                    'Simply: 1) Choose items from the menu 2) Add to cart 3) Click the shopping cart button 4) Enter your name and checkout!',
                    'It\'s simple: Pick your favorite items from the menu, add them to cart, and checkout whenever you\'re ready!'
                ]
            },
            specialties: {
                patterns: ['specialty', 'special', 'unique', 'signature', 'famous', 'what\'s special'],
                responses: [
                    'Our specialty is the Mocha - espresso with steamed milk and rich chocolate! Absolutely delicious! 🍫☕',
                    'We\'re known for our perfectly crafted cappuccinos and fresh pastries made daily!',
                    'Our signature drink is the cappuccino - made with precision and passion every time!'
                ]
            },
            pastry: {
                patterns: ['pastry', 'bread', 'cake', 'cookie', 'dessert', 'croissant', 'sweet'],
                responses: [
                    'We have delicious pastries! 🥐 Try our buttery croissants (₱160) or chocolate chip cookies (₱120). Don\'t miss our chocolate cake!',
                    'Our pastry selection includes fresh croissants, homemade cookies, and rich chocolate cake. All baked fresh!',
                    'Perfect pairing with coffee! We have croissants, cookies, and desserts available.'
                ]
            },
            ingredients: {
                patterns: ['ingredient', 'allergen', 'gluten', 'dairy', 'vegan', 'sugar', 'contain', 'made with'],
                responses: [
                    'For detailed ingredient information, please ask our staff in person. We can help with dietary restrictions and allergies! 👥',
                    'I recommend asking our staff about specific ingredients or dietary needs - they can provide detailed information.',
                    'For allergen and ingredient details, our team is happy to help! Just let us know your concerns.'
                ]
            },
            hours: {
                patterns: ['hour', 'open', 'close', 'when', 'timing', 'available', 'operating'],
                responses: [
                    'We\'re open during regular business hours! For specific timing, please check with our staff or visit us directly. ⏰',
                    'Please ask our team for current operating hours. We\'re here to serve you! ☕',
                    'For exact hours, feel free to ask our staff - we\'re happy to help!'
                ]
            },
            thanks: {
                patterns: ['thank', 'thanks', 'thank you', 'appreciate', 'grateful'],
                responses: [
                    'You\'re very welcome! Enjoy your coffee! ☕',
                    'Happy to help! Come back soon!',
                    'Thanks for choosing us! 😊'
                ]
            },
            goodbye: {
                patterns: ['bye', 'goodbye', 'see you', 'take care', 'farewell', 'exit', 'quit'],
                responses: [
                    'Goodbye! Enjoy your coffee! ☕',
                    'See you soon! Thanks for visiting!',
                    'Have a great day! Come back to see us! 👋'
                ]
            },
            help: {
                patterns: ['help', 'assist', 'support', 'can you help', 'i need help'],
                responses: [
                    'Of course! I\'m here to help. I can answer questions about our menu, pricing, ordering process, and more at BrewHeaven Cafe. What would you like to know?',
                    'Happy to assist! Ask me about BrewHeaven Cafe\'s menu, prices, how to order, or anything else! 😊',
                    'Sure! I can help with menu info, ordering, pricing, and general questions about BrewHeaven Cafe. What do you need?'
                ]
            },
            quality: {
                patterns: ['quality', 'fresh', 'good', 'excellent', 'taste'],
                responses: [
                    'We pride ourselves at BrewHeaven Cafe on using high-quality beans and fresh ingredients! Every drink is made with care. ☕✨',
                    'Quality is our priority at BrewHeaven Cafe! We use premium coffee beans and prepare everything fresh.',
                    'Absolutely! BrewHeaven Cafe only uses the finest ingredients and prepares everything with attention to detail.'
                ]
            },
            bestseller: {
                patterns: ['bestseller', 'best seller', 'popular', 'most ordered', 'most sold', 'what\'s popular', 'trending'],
                responses: [
                    'Our bestsellers are amazing! ⭐ Check out the "Best Sellers" section at the top - it shows our most loved items like Cappuccino, Latte, and Mocha!',
                    'Great question! Our bestsellers include Cappuccino (₱180), Latte (₱200), Mocha (₱220), and Iced Coffee (₱180). All customer favorites! 🌟',
                    'Our most popular drinks are the Cappuccino and Latte - customers love them! We also have bestseller pastries like Croissants and Chocolate Cake.'
                ]
            },
            location: {
                patterns: ['location', 'address', 'where', 'find us', 'direction'],
                responses: [
                    'BrewHeaven Cafe is located at 123 Coffee Street, Downtown District, Cebu City! Ask our staff for directions. 📍',
                    'Visit us at BrewHeaven Cafe, 123 Coffee Street, Cebu! 📍',
                    'We\'re at BrewHeaven Cafe on Coffee Street in downtown Cebu. Our team can help you find us! 👥'
                ]
            }
        };
    }

    async generateResponse(userMessage, menuItems = []) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Check for intent matches in knowledge base
        for (const [intent, data] of Object.entries(this.knowledgeBase)) {
            for (const pattern of data.patterns) {
                if (lowerMessage.includes(pattern) || lowerMessage.includes(pattern + 's')) {
                    return this.selectRandomResponse(data.responses);
                }
            }
        }

        // If no pattern matched, try Gemini with menu context
        return await this.getSmartResponse(userMessage, menuItems);
    }

    async getSmartResponse(userMessage, menuItems = []) {
        // If Gemini API is available, use it with context
        if (this.geminiApiKey && menuItems.length > 0) {
            const context = this.buildMenuContext(menuItems);
            const enhancedPrompt = `${userMessage}\n\nCurrent menu context:\n${context}`;
            const geminiReply = await this.callGemini(enhancedPrompt);
            if (geminiReply) return geminiReply;
        } else if (this.geminiApiKey) {
            const geminiReply = await this.callGemini(userMessage);
            if (geminiReply) return geminiReply;
        }

        // Fallback to default response
        return await this.getDefaultResponse(userMessage);
    }

    buildMenuContext(menuItems) {
        if (!menuItems || menuItems.length === 0) return '';
        
        const categories = {};
        menuItems.forEach(item => {
            if (!categories[item.category]) categories[item.category] = [];
            categories[item.category].push(`${item.name} (₱${parseFloat(item.price).toFixed(2)}) - ${item.description}${item.isBestseller ? ' ⭐' : ''}`);
        });

        let context = 'Available items by category:\n';
        Object.entries(categories).forEach(([cat, items]) => {
            context += `${cat}: ${items.join(', ')}\n`;
        });
        return context;
    }

    selectRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async getDefaultResponse(userMessage) {
        const defaultResponses = [
            'That\'s a great question! 🤔 For more specific information, our staff is always ready to help.',
            'I\'m not sure about that specifically, but our team can definitely help! Just ask them. 👥',
            'Interesting! Our staff would be happy to discuss that with you in more detail.',
            'Great question! Feel free to ask our staff for more detailed information. They\'re very knowledgeable!',
            'I\'m still learning! 😊 But our team can answer that for you. Is there anything else I can help with?'
        ];

        // If a Gemini (Generative Language) API key is provided, try to get a smarter answer
        if (this.geminiApiKey) {
            const geminiReply = await this.callGemini(userMessage);
            if (geminiReply && typeof geminiReply === 'string' && geminiReply.trim().length > 0) {
                return geminiReply;
            }
        }

        return this.selectRandomResponse(defaultResponses);
    }

    async callGemini(userMessage) {
        if (!this.geminiApiKey) return null;

        try {
            // Use the latest Gemini API (v1/models/gemini-2.0-flash)
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`;
            
            // Enhanced system prompt with cafe context and personality
            const systemPrompt = `You are BrewHeaven Cafe's friendly and knowledgeable AI assistant. 
Your role is to help customers with:
- Menu recommendations based on their preferences
- Information about our coffee drinks, pastries, and desserts
- Ordering process and pricing
- Customer service inquiries

Key cafe info:
- Name: BrewHeaven Cafe
- Location: 123 Coffee Street, Downtown District, Cebu City
- Specialty: Premium coffee drinks and fresh pastries
- Popular items: Cappuccino, Latte, Mocha, Iced Coffee, Croissant, Chocolate Cake

Guidelines:
- Be concise but friendly (2-3 sentences max)
- Use appropriate emojis to add warmth
- Always suggest looking at the menu or checking with staff for details you're unsure about
- Focus on customer satisfaction and experience
- If they ask something unrelated to the cafe, gently redirect them back to our services`;

            const body = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: `${systemPrompt}\n\nCustomer: ${userMessage}` }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 256,
                    topP: 0.95,
                    topK: 40
                }
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const text = await res.text();
                console.warn('Gemini API error', res.status, text);
                return null;
            }

            const data = await res.json();

            // Extract text from Gemini 2.0 response format
            if (data && data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    const text = candidate.content.parts.map(part => part.text || '').join('').trim();
                    if (text) return text;
                }
            }

            return null;
        } catch (err) {
            console.error('Error calling Gemini:', err && err.message ? err.message : err);
            return null;
        }
    }

    async getContextualResponse(userMessage, menuItems = []) {
        // First try pattern-based responses and Gemini via generateResponse
        const response = await this.generateResponse(userMessage, menuItems);

        // Add menu-related context if the user asked about specific coffee items
        const lowerMessage = userMessage.toLowerCase();
        if ((lowerMessage.includes('cappuccino') || lowerMessage.includes('latte') || 
             lowerMessage.includes('espresso') || lowerMessage.includes('coffee')) && menuItems.length > 0) {
            const coffeeItems = menuItems.filter(item => item.category === 'Coffee');
            if (coffeeItems.length > 0) {
                const itemNames = coffeeItems.map(item => `${item.name} (₱${parseFloat(item.price).toFixed(2)})`).join(', ');
                return `${response} We have: ${itemNames}`;
            }
        }

        return response;
    }
}

module.exports = ChatbotService;
