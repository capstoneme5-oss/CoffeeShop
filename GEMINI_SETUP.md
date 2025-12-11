# Gemini API Setup for Netlify

Your chatbot has been enhanced with Google Gemini API 2.0 integration for smarter, context-aware responses!

## Setup Steps

### 1. Add Gemini API Key to Netlify

Go to your Netlify Site Settings and add the environment variable:

**Site Settings → Environment → Environment variables**

- **Key:** `GEMINI_API_KEY`
- **Secret:** Check "Contains secret values"
 - **Value:** `<REDACTED - set this as a Netlify environment variable>`
- **Scope:** All scopes

### 2. Trigger a New Deploy

After adding the environment variable:
- Go to **Deploys → Trigger deploy → Deploy site**
- Wait for the build to complete (usually 1-2 minutes)

### 3. Test the Chatbot

Once deployed, go to your site and:
1. Click the chat icon (bottom right)
2. Send a message like:
   - "What coffee do you recommend?"
   - "What's a good drink for beginners?"
   - "Tell me about your best sellers"
   - "What's special about your mocha?"

The chatbot will now use Gemini AI to:
- Understand questions better (not just pattern matching)
- Provide natural, context-aware responses
- Recommend items based on customer preferences
- Answer questions about the menu dynamically

## Features

✨ **Smart Responses** - Uses Gemini 2.0 Flash for intelligent replies
📋 **Menu Context** - AI has access to current menu items and prices
🎯 **Consistent Personality** - Maintains BrewHeaven Cafe brand voice
⚡ **Fast** - Fallback to pattern-based responses if Gemini unavailable
🔒 **Secure** - API key stored as secret in Netlify

## How It Works

1. User sends a message → Controller fetches current menu items
2. Message + menu context → Chatbot service
3. Pattern matching first (for known intents like "hello", "menu", etc.)
4. If no pattern match → Call Gemini API with menu context
5. Gemini generates smart, context-aware response
6. Response shown to user and optionally saved to database

## Fallback Behavior

If Gemini API is unavailable or returns an error:
- Falls back to pattern-based knowledge base
- Or returns a helpful default message
- User experience continues seamlessly

Enjoy your enhanced chatbot! 🤖☕
