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
                    'Hello! Welcome to BrewHeaven Cafe! ☕ We\'re your favorite online destination for premium coffee, pastries, and delicious food. How can I help you today?',
                    'Hi there! 👋 Welcome to BrewHeaven Cafe! Browse our menu, ask about our specialties, or need help with ordering? I\'m here for you!',
                    'Hey! Welcome to BrewHeaven Cafe! ☕ We serve premium coffee drinks, fresh pastries, teas, and food. What would you like to know?',
                    'Greetings! Welcome to BrewHeaven Cafe - your online coffee shop with quality beverages and pastries. How can I assist you today?'
                ]
            },
            about: {
                patterns: ['about', 'who are you', 'tell me about', 'information', 'what is', 'cafe', 'website', 'business'],
                responses: [
                    'BrewHeaven Cafe is a premium online cafe serving freshly brewed coffee drinks, pastries, desserts, sandwiches, and teas. We pride ourselves on quality ingredients, excellent customer service, and convenient online ordering!',
                    'We\'re BrewHeaven Cafe - an online coffee shop specializing in premium coffee drinks like espresso, cappuccino, latte, and specialty beverages. We also serve fresh pastries, cakes, cookies, sandwiches, and teas. Order online anytime!',
                    'BrewHeaven Cafe is your go-to online destination for delicious coffee and cafe food. Quality is our priority - from selecting the finest coffee beans to preparing fresh pastries daily. Visit us online now!'
                ]
            },
            menu: {
                patterns: ['menu', 'what do you have', 'what\'s available', 'show me', 'see menu', 'items', 'products', 'coffee options', 'what can i order'],
                responses: [
                    'Our complete menu includes: ☕ COFFEES (Espresso ₱100, Americano ₱120, Cappuccino ₱180, Latte ₱200, Mocha ₱220, Iced Coffee ₱180) | 🍵 TEAS (Green Tea ₱140, Chamomile Tea ₱140) | 🥐 PASTRIES (Croissant ₱160, Chocolate Chip Cookie ₱120) | 🍰 DESSERTS (Chocolate Cake ₱250) | 🥪 FOOD (Turkey Sandwich ₱350). Browse the Menu section above to see all items with details!',
                    'We have a great selection: Premium coffees (₱100-₱220), specialty teas (₱140 each), fresh pastries (₱120-₱160), chocolate cake (₱250), and turkey sandwich (₱350). Click "Menu" above to see everything!',
                    'Check out our full menu above! We offer quality coffee drinks, teas, pastries, desserts, and sandwiches - all with detailed descriptions, prices, and photos. Something for every taste and budget!'
                ]
            },
            coffee_recommendation: {
                patterns: ['recommend', 'suggest', 'best coffee', 'what should i order', 'favorite', 'popular', 'most ordered'],
                responses: [
                    'Our bestselling coffees are: 🌟 Cappuccino (₱180) - espresso with velvety steamed milk, perfect balance! 🌟 Latte (₱200) - smooth and creamy, coffee with lots of milk. 🌟 Mocha (₱220) - espresso with chocolate, best for chocolate lovers! 🌟 Iced Coffee (₱180) - refreshing on warm days. All amazing choices!',
                    'Try our Cappuccino - it\'s our #1 bestseller! Espresso blended perfectly with steamed milk for that ideal taste. If you like something sweeter, our Mocha (with chocolate) is divine! Can\'t decide? Start with Cappuccino!',
                    'For coffee lovers: Strong coffee? Try Espresso (₱100) or Americano (₱120). Balanced flavor? Cappuccino (₱180) is perfect! Smooth and creamy? Latte (₱200)! Sweet treat? Mocha (₱220)! All our coffees use quality beans!',
                    'Check our Best Sellers section for our most loved items! Cappuccino and Latte are customer favorites. Pair any coffee with a Croissant (₱160) or Chocolate Chip Cookie (₱120) - a perfect cafe experience!'
                ]
            },
            pricing: {
                patterns: ['price', 'cost', 'how much', 'expensive', 'afford', 'payment', 'charge'],
                responses: [
                    '💰 AFFORDABLE PRICING AT BREWHAVEN: ☕ COFFEES: Espresso ₱100, Americano ₱120, Cappuccino ₱180, Latte ₱200, Mocha ₱220, Iced Coffee ₱180. 🍵 TEAS: Green/Chamomile ₱140 each. 🥐 PASTRIES: Cookie ₱120, Croissant ₱160. 🍰 DESSERTS: Chocolate Cake ₱250. 🥪 FOOD: Turkey Sandwich ₱350. Great value for quality!',
                    'Very budget-friendly! Get a premium espresso for ₱100, cappuccino for ₱180, or a pastry for ₱120. Combine a coffee + pastry combo for a complete cafe experience under ₱350!',
                    'Our menu is affordable: Most coffees under ₱200, pastries under ₱200, desserts at ₱250, and sandwich at ₱350. Everything priced fairly for the quality you get! Check the menu for exact prices on all items!'
                ]
            },
            order_process: {
                patterns: ['how to order', 'order', 'place order', 'buy', 'purchase', 'checkout', 'how do i', 'steps'],
                responses: [
                    '🛒 EASY ORDERING PROCESS: Step 1️⃣ Browse the MENU section and click "Add to Cart" on items you love. Step 2️⃣ Use +/- buttons to set quantities. Step 3️⃣ Click the shopping cart icon (🛒) at the top. Step 4️⃣ Enter your customer name. Step 5️⃣ Review your order and prices. Step 6️⃣ Click CHECKOUT to confirm! Your order is placed! ✅',
                    'Simple ordering in 6 steps: 1) Browse our menu 2) Click "Add to Cart" on items 3) Adjust quantities 4) Open your shopping cart 5) Enter your name 6) Checkout! That\'s it - order confirmed!',
                    'Ordering is quick and easy! Select items from the menu → click "Add to Cart" → adjust quantity → view your cart → enter your name → click Checkout. You can review your order summary before confirming. Our system is simple and user-friendly!'
                ]
            },
            specialties: {
                patterns: ['specialty', 'special', 'unique', 'signature', 'famous', 'what\'s special'],
                responses: [
                    '✨ OUR SPECIALTIES: 🍫☕ MOCHA (₱220) - Our signature drink! Espresso + velvety steamed milk + rich chocolate. Absolutely divine! ☕ CAPPUCCINO (₱180) - Crafted with precision - espresso and perfect milk foam balance. 🥐 CROISSANT (₱160) - Buttery, flaky, fresh-baked. Perfect pairing with any coffee! These are what we\'re famous for!',
                    'We\'re known for our signature Mocha - a delicious blend of espresso, steamed milk, and rich chocolate that\'s absolutely unforgettable! 🍫 We\'re also famous for our perfectly crafted Cappuccino and fresh, buttery Croissants made daily!',
                    'Our specialty is crafting premium coffee drinks with precision and passion. The Mocha stands out as a customer favorite (espresso + chocolate + milk = perfection)! Plus our fresh pastries - Croissants and Chocolate Chip Cookies - are made with love daily!'
                ]
            },
            pastry: {
                patterns: ['pastry', 'bread', 'cake', 'cookie', 'dessert', 'croissant', 'sweet'],
                responses: [
                    '🥐 DELICIOUS PASTRIES & DESSERTS: CROISSANT (₱160) - Buttery, flaky, fresh-baked French pastry. Perfect with coffee! 🍪 CHOCOLATE CHIP COOKIE (₱120) - Homemade with love and premium chocolate chips. 🍰 CHOCOLATE CAKE (₱250) - Rich, moist, indulgent dessert. All made fresh with quality ingredients daily!',
                    'Perfect pairing with coffee! We have: Fresh Croissants (₱160) - buttery and flaky, Homemade Cookies (₱120) - with premium chocolate chips, Chocolate Cake (₱250) - rich and delicious. All made fresh daily with finest ingredients!',
                    'Our pastry selection is amazing! 🥐 Croissants (₱160) - light and buttery, 🍪 Chocolate Chip Cookies (₱120) - homemade fresh, 🍰 Chocolate Cake (₱250) - the perfect dessert. Each item is baked with care using quality ingredients. Must-try items!'
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
                    'BrewHeaven Cafe is located at 123 Coffee Street, Downtown District, Cebu City! 📍 We\'re an online cafe, so you can order anytime from anywhere. Delivery and pickup available. For more details, check our website!',
                    'Visit us at BrewHeaven Cafe, 123 Coffee Street, Downtown, Cebu City! 📍 We operate online for your convenience - order anytime from home and enjoy our quality coffee and pastries!',
                    'Our location: 123 Coffee Street, Downtown District, Cebu City. 📍 We\'re an online cafe offering convenient delivery and pickup options. Browse our menu and order online anytime!'
                ]
            },
            tea: {
                patterns: ['tea', 'herbal', 'chamomile', 'green tea'],
                responses: [
                    '🍵 TEA SELECTION: Green Tea (₱140) - Fresh brewed, antioxidant-rich, refreshing green tea. Perfect for health-conscious customers! Chamomile Tea (₱140) - Soothing herbal blend, relaxing and caffeine-free, perfect for winding down. Both made fresh to order with quality tea leaves!',
                    'We offer premium teas! 🍵 Green Tea (₱140) - refreshing, healthy, packed with antioxidants. ☕ Chamomile Tea (₱140) - soothing, calming, perfect for evenings. Both brewed fresh to order!',
                    'Our tea selection: Green Tea (₱140) for a refreshing, healthy boost. Chamomile Tea (₱140) for a calming, soothing experience. Both high quality, brewed fresh, and perfect complements to our pastries!'
                ]
            },
            sandwich: {
                patterns: ['sandwich', 'food', 'meal', 'lunch', 'turkey'],
                responses: [
                    '🥪 TURKEY SANDWICH (₱350): Fresh turkey, crisp lettuce, juicy tomato, and quality condiments on soft bread. A hearty, satisfying meal perfect for lunch! Made fresh with premium ingredients. Great on its own or paired with a coffee!',
                    'Try our Turkey Sandwich (₱350) - made fresh with quality turkey, crisp lettuce, ripe tomato, and our special blend. A satisfying meal that pairs perfectly with any of our coffee drinks!',
                    'Our food offering: Turkey Sandwich (₱350) - fresh, hearty, and delicious! Made with premium turkey and fresh vegetables. Perfect for lunch or a light meal. Pairs great with our Cappuccino or Latte!'
                ]
            },
            faq: {
                patterns: ['faq', 'question', 'frequently asked', 'common question', 'problem', 'issue', 'doubt'],
                responses: [
                    'Got questions? Here are common ones: ❓ Can I customize my order? (Ask in notes!) ❓ How long does delivery take? (Order confirmed → prepared → shipped) ❓ Do you have gift cards? (Ask staff!) ❓ What payment methods? (Online checkout) ❓ Can I cancel orders? (Contact staff ASAP!) ❓ Dietary restrictions? (Tell us your needs!) Need more help? Ask away!',
                    'Common questions: Q: Can I modify items? A: Yes! Leave notes when ordering. Q: Is it fresh? A: Everything made fresh daily! Q: Allergies? A: Contact us for details! Q: Payment options? A: Online checkout system! Q: Delivery areas? A: Check our service areas! Ask if you have more questions!',
                    'Frequently asked questions: ❓ Menu items are made fresh - yes! ❓ Can customize orders - yes, use notes! ❓ Allergic to something - contact us with details! ❓ Payment secure - yes, encrypted! ❓ Delivery time - depends on order volume! ❓ Other questions - I\'m here to help!'
                ]
            },
            website_features: {
                patterns: ['website', 'website features', 'what can i do', 'how does website work', 'browse', 'app', 'platform'],
                responses: [
                    '🌐 WEBSITE FEATURES: ☕ Browse Menu - View all items with photos, descriptions, and prices. ⭐ Best Sellers - See our most popular items. 💬 Chat with Bot - I\'m here to answer questions anytime! 🛒 Shopping Cart - Add items, adjust quantities, review totals. 📝 Checkout - Easy order placement with customer details. 📱 Mobile-friendly - Works on all devices! Simple, intuitive, convenient!',
                    'Our website is designed for easy shopping! Browse our menu with photos and descriptions, check bestsellers, add items to cart, chat with me anytime for questions, and checkout securely. Everything you need in one place!',
                    'Here\'s what our website offers: Menu browsing with all details, Best Sellers highlighted, shopping cart, easy checkout, 24/7 chatbot support, mobile-friendly design, and secure ordering. Everything made simple for your convenience!'
                ]
            },
            payment_methods: {
                patterns: ['payment', 'pay', 'credit card', 'cash', 'gcash', 'method', 'online', 'bank'],
                responses: [
                    '💳 PAYMENT OPTIONS: We accept secure online checkout payments through our website. Your information is encrypted and safe. For specific payment method details (credit cards, e-wallets, bank transfers), please contact our staff. We want to make payment easy and convenient for you!',
                    'We support online checkout payments on our website - secure and convenient! For information about specific payment methods like credit cards, e-wallets, or bank transfers, feel free to contact our team. We make payment easy!',
                    'Payment is simple - use our secure online checkout system. For details on accepted payment methods and payment plans, contact our staff. We prioritize your security and offer convenient payment options!'
                ]
            },
            contact: {
                patterns: ['contact', 'call', 'phone', 'email', 'reach', 'support', 'help', 'customer service'],
                responses: [
                    '📞 CONTACT US: For support, questions, or special requests, reach out to our team! You can chat with me anytime here in the chatbot for instant answers. For other inquiries, contact our customer service through the website or visit us at 123 Coffee Street, Downtown, Cebu City. We\'re here to help!',
                    'Need help? Chat with me anytime! 💬 I\'m available 24/7 to answer questions about our menu, ordering, pricing, and more. For other inquiries, contact our staff directly through the website or visit us in person. We\'re always here for you!',
                    'Questions or need support? 🤝 Chat with me for instant answers about our products and services! For other matters, contact our customer service team through the website or visit us at our location. We value your satisfaction!'
                ]
            },
            loyalty: {
                patterns: ['loyalty', 'reward', 'points', 'discount', 'promotion', 'special offer', 'deal'],
                responses: [
                    '⭐ SPECIAL OFFERS & LOYALTY: Check our Best Sellers section for featured items! We may have special promotions or bundle deals. For loyalty programs, rewards, and exclusive discounts, contact our staff or check the website regularly. We love rewarding our regular customers!',
                    'We appreciate loyal customers! 🎁 Look for special promotions, bundle deals, and featured items. For information about loyalty rewards programs and exclusive discounts for regular customers, ask our team! Stay updated for seasonal offers!',
                    'We offer special promotions regularly! Check our Best Sellers section for deals. For loyalty rewards programs, exclusive discounts, and seasonal offers, contact us or check the website. We love taking care of our valued customers!'
                ]
            },
            delivery: {
                patterns: ['delivery', 'pickup', 'shipping', 'how deliver', 'where deliver', 'delivery time'],
                responses: [
                    '🚗 DELIVERY & PICKUP: We offer convenient online ordering! For specific information about delivery areas, pickup options, delivery times, and shipping policies, please contact our team. We want to get your delicious coffee and pastries to you fresh and fast!',
                    'Delivery options available! Order online and we\'ll prepare your items fresh. For details about service areas, delivery times, pickup options, and shipping procedures, contact our customer service team. We ensure everything arrives fresh!',
                    'We provide convenient delivery and pickup! Order online and we\'ll get your items to you. For specific delivery areas, estimated times, and pickup locations, reach out to our team. Fresh food delivered safely!'
                ]
            },
            hours: {
                patterns: ['hour', 'open', 'close', 'when', 'timing', 'available', 'operating'],
                responses: [
                    '⏰ OPERATING HOURS: For specific business hours, please check our website or contact us directly. Our online ordering system is available 24/7, so you can browse our menu and place orders anytime! We\'ll prepare your order during business hours!',
                    'For exact operating hours and business days, check our website or contact the team. You can place orders online 24/7 through our website - we\'ll prepare them during operating hours! Convenient for you!',
                    'Operating hours can be found on our website homepage or by contacting us. Our online platform is available anytime, so browse and order whenever you like! We prepare orders during regular business hours!'
                ]
            },
            ingredients: {
                patterns: ['ingredient', 'allergen', 'gluten', 'dairy', 'vegan', 'sugar', 'contain', 'made with'],
                responses: [
                    '🥜 INGREDIENTS & ALLERGEN INFO: For detailed ingredient lists, allergen information, or dietary concerns, please contact our team directly. We use quality ingredients and take allergies seriously! We\'re happy to provide comprehensive information about all our items to help with dietary restrictions!',
                    'For complete ingredient details, allergen warnings, and dietary information, contact us directly! We use quality ingredients and can help with food allergies and dietary restrictions. Your health and safety are important to us!',
                    'Ingredient and allergen information available upon request! Contact our team for detailed ingredient lists, potential allergens, nutritional info, and help with dietary needs. We prioritize your safety and can accommodate most requests!'
                ]
            },
            quality: {
                patterns: ['quality', 'fresh', 'good', 'excellent', 'taste', 'premium'],
                responses: [
                    '✨ QUALITY GUARANTEE: At BrewHeaven Cafe, we\'re committed to excellence! ☕ Premium coffee beans - carefully selected for superior taste. 🥐 Fresh pastries - made daily with finest ingredients. 🍵 Quality ingredients - in every drink and food item. 💪 Expert preparation - crafted with care and skill. You\'ll definitely taste the quality difference!',
                    'Quality is our #1 priority! We use premium coffee beans, fresh ingredients, bake pastries daily, and prepare everything with skill and care. Every item is crafted to exceed expectations. You\'ll love the taste and quality!',
                    'Absolutely! BrewHeaven Cafe only uses premium ingredients and finest coffee beans. Every drink and food item is prepared with attention to detail and passion. Quality shows in every sip and bite! Customer satisfaction is guaranteed!'
                ]
            },
            bestseller: {
                patterns: ['bestseller', 'best seller', 'popular', 'most ordered', 'most sold', 'what\'s popular', 'trending'],
                responses: [
                    '⭐ OUR BESTSELLERS: Check the "Best Sellers" section at the top of the website to see our most loved items! ☕ CAPPUCCINO (₱180) - Customer favorite! 🍵 LATTE (₱200) - Smooth and creamy! 🍫☕ MOCHA (₱220) - Chocolate lovers adore it! ☕❄️ ICED COFFEE (₱180) - Perfect for warm days! 🥐 CROISSANT (₱160) - Buttery and flaky! 🍰 CHOCOLATE CAKE (₱250) - Indulgent dessert! All bestsellers for a reason!',
                    'Our most popular items are shown in the "Best Sellers" section! Top picks: Cappuccino (₱180), Latte (₱200), Mocha (₱220), Iced Coffee (₱180), Croissant (₱160), and Chocolate Cake (₱250). All customer favorites you must try!',
                    'Best sellers at BrewHeaven: Cappuccino, Latte, Mocha, Iced Coffee (all premium coffees), Croissant (pastry), and Chocolate Cake (dessert)! These are loved by our customers for quality and taste. Check the Best Sellers section to see all favorites with detailed descriptions!'
                ]
            },
            help: {
                patterns: ['help', 'assist', 'support', 'can you help', 'i need help', 'confused', 'stuck'],
                responses: [
                    'Of course! I\'m here 24/7 to help with everything about BrewHeaven Cafe! 💬 I can tell you about our menu items, prices, ordering process, specialties, payment, delivery, hours, ingredients, FAQs, and more. What would you like to know? Just ask!',
                    'Happy to assist! 🎉 Ask me anything about BrewHeaven Cafe - menu details, pricing, how to order, bestsellers, website features, contact info, delivery, or any questions. I\'m here to help make your experience amazing!',
                    'Sure! I\'m your BrewHeaven Cafe assistant! 🤖 I can help with: Menu information, pricing, ordering steps, recommendations, specialties, pastries, teas, food, payments, delivery, hours, ingredients, and general questions. What do you need help with?'
                ]
            },
            thanks: {
                patterns: ['thank', 'thanks', 'thank you', 'appreciate', 'grateful'],
                responses: [
                    'You\'re very welcome! Thanks for visiting BrewHeaven Cafe! 😊 Enjoy your delicious order and come back soon! ☕',
                    'Happy to help! Thanks for choosing BrewHeaven Cafe. We truly appreciate your business and support!',
                    'Thanks so much! We appreciate you choosing BrewHeaven Cafe. Enjoy your coffee and pastries! See you next time! 🎉'
                ]
            },
            goodbye: {
                patterns: ['bye', 'goodbye', 'see you', 'take care', 'farewell', 'exit', 'quit'],
                responses: [
                    'Goodbye! Thanks for visiting BrewHeaven Cafe! ☕ Enjoy your order and come back soon! 👋',
                    'See you soon! Thanks for ordering from BrewHeaven Cafe. We hope you enjoy every sip! Come back anytime!',
                    'Have a wonderful day! Come back to BrewHeaven Cafe soon. We appreciate your business! 😊☕'
                ]
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
            
            // Enhanced system prompt with comprehensive cafe context and personality
            const systemPrompt = `You are BrewHeaven Cafe's friendly and knowledgeable AI assistant.

🏢 ABOUT BREWHAVEN CAFE:
- Premium online cafe serving fresh coffee, pastries, desserts, sandwiches, and teas
- Location: 123 Coffee Street, Downtown District, Cebu City
- Website: Full menu browsing, Best Sellers section, secure checkout, 24/7 ordering
- Mission: Quality ingredients, exceptional customer service, convenient online shopping

☕ MENU HIGHLIGHTS:
COFFEES (₱100-₱220): Espresso (₱100), Americano (₱120), Cappuccino (₱180), Latte (₱200), Mocha (₱220), Iced Coffee (₱180)
TEAS (₱140): Green Tea, Chamomile Tea - fresh brewed daily
PASTRIES & DESSERTS (₱120-₱250): Croissant (₱160), Chocolate Chip Cookie (₱120), Chocolate Cake (₱250)
FOOD (₱350): Turkey Sandwich - fresh & hearty
SPECIALTIES: Mocha (espresso + chocolate + milk), Cappuccino (perfectly balanced), Croissant (buttery & flaky)

🛒 WEBSITE FEATURES:
- Menu Browse: All items with photos, descriptions, detailed pricing
- Best Sellers: Top customer favorites highlighted
- Shopping Cart: Add items, adjust quantities, review totals easily
- Checkout: Secure, user-friendly, fast ordering
- Chat with Bot: Me! Available 24/7 to answer questions
- Mobile-Friendly: Works on all devices

💳 ORDERING & PAYMENT:
- Step 1: Browse menu, click "Add to Cart"
- Step 2: Adjust quantities
- Step 3: Open shopping cart, enter customer name
- Step 4: Review order and prices
- Step 5: Checkout securely online
- Payment: Secure online checkout system
- Delivery/Pickup: Available with custom options

📞 CUSTOMER SUPPORT:
- Chat anytime with me for instant answers
- Questions? Contact our team through website
- In-person: Visit 123 Coffee Street, Downtown, Cebu City
- Allergies/Dietary needs: Contact staff directly for details
- Special requests: Include notes when ordering

⭐ QUALITY & FRESHNESS:
- Premium coffee beans - carefully selected
- Fresh pastries - made daily with finest ingredients
- Quality ingredients - in every drink and food
- Expert preparation - crafted with care and skill
- Bestsellers: Cappuccino, Latte, Mocha, Iced Coffee, Croissant, Chocolate Cake

🎁 CUSTOMER CARE:
- All items made with quality ingredients
- Dietary restrictions: Happy to help (ask staff)
- Ingredient/Allergen info: Available upon request
- Loyalty & promotions: Check website for special offers
- Hours: Check website (24/7 online ordering available)

YOUR ROLE:
- Help with menu recommendations and descriptions
- Guide customers through ordering process
- Answer questions about pricing, ingredients, delivery
- Provide website information and features
- Be warm, helpful, and professional
- Suggest menu items or staff contact for detailed questions
- Keep responses friendly, concise (2-3 sentences), with emojis when appropriate
- Focus on customer satisfaction and positive experience
- For questions outside cafe scope, gently redirect to our services`;

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
