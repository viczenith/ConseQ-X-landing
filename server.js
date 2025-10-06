// server.js - Express backend server
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Generate AI predictions endpoint
app.post('/api/generate-predictions', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{
        role: 'system',
        content: `You are a McKinsey-level senior organizational consultant. 
        Analyze assessment results using the following framework:
        1. For each system, identify impacts on 48 critical/subcritical components
        2. Provide specific recommendations with practical examples
        3. Use consulting frameworks (SWOT, Value Chain, etc.)
        4. Format in markdown with sections:
           - Executive Summary
           - System-by-System Analysis
           - Cross-System Implications
           - Strategic Recommendations
        5. Include real-world analogies and actionable insights`
      }, {
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 4000
    });

    res.json({ 
      analysis: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'AI analysis failed',
      message: error.message 
    });
  }
});

// Hugging Face chat endpoint
app.post('/api/huggingface-chat', async (req, res) => {
  try {
    const { message, model = 'microsoft/DialoGPT-medium' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: message,
        parameters: {
          max_length: 512,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ response: data });
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    res.status(500).json({ 
      error: 'Chat response failed',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});