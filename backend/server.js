import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chat, healthCheck } from './services/ai.js';

// Environment variables yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    ai: health
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory, userProfile } = req.body;

    // Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Mesaj gerekli ve string tipinde olmalı'
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        error: 'Mesaj boş olamaz'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: 'Mesaj çok uzun (max 2000 karakter)'
      });
    }

    // API key kontrolü (Groq)
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'GROQ_API_KEY environment variable tanımlanmamış'
      });
    }

    // AI'dan yanıt al
    const response = await chat(
      message,
      conversationHistory || [],
      userProfile || null
    );

    // Yanıtı gönder
    res.json({
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);

    res.status(500).json({
      error: 'Bir hata oluştu, lütfen tekrar deneyin',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı',
    availableEndpoints: [
      'GET /health',
      'POST /api/chat'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Sunucu hatası',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server başlat
app.listen(PORT, () => {
  console.log(`\n🚀 Server çalışıyor!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
  console.log(`\n✨ Groq API Key: ${process.env.GROQ_API_KEY ? '✅ Tanımlı' : '❌ Eksik'}`);
  console.log(`\n👉 Ctrl+C ile durdurun\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM alındı, server kapatılıyor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nServer kapatılıyor...');
  process.exit(0);
});
