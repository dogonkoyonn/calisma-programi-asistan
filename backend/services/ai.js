import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Groq API Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile'; // En güçlü Llama modeli, mükemmel Türkçe

// API key'i dinamik olarak al
function getApiKey() {
  return process.env.GROQ_API_KEY;
}

// System prompt'u yükle
const systemPromptPath = path.join(__dirname, '../prompts/system.txt');
const SYSTEM_PROMPT = fs.readFileSync(systemPromptPath, 'utf-8');

/**
 * AI ile sohbet fonksiyonu
 * @param {string} userMessage - Kullanıcının mesajı
 * @param {Array} conversationHistory - Geçmiş konuşma [{role, content}]
 * @param {Object} userProfile - Kullanıcı profili bilgileri
 * @returns {Promise<string>} AI'ın yanıtı
 */
export async function chat(userMessage, conversationHistory = [], userProfile = null) {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return 'API key tanımlı değil. Lütfen GROQ_API_KEY environment variable ekleyin.';
    }

    // Kullanıcı profilini system prompt'a ekle
    let enhancedSystemPrompt = SYSTEM_PROMPT;

    if (userProfile) {
      const profileInfo = `\n\n## Kullanıcı Profili
İsim: ${userProfile.name || 'Bilinmiyor'}
Seviye: ${userProfile.skillLevel || 'Bilinmiyor'}
Hedefler: ${userProfile.goals || 'Belirtilmemiş'}
Öğrenme Stili: ${userProfile.learningStyle || 'Bilinmiyor'}`;

      enhancedSystemPrompt += profileInfo;
    }

    // Konuşma geçmişini hazırla (son 6 mesaj)
    const recentHistory = conversationHistory.slice(-6);

    // Mesajları Groq formatında hazırla
    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...recentHistory,
      { role: 'user', content: userMessage }
    ];

    // Groq API'ye istek gönder
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.6,      // Daha tutarlı Türkçe
        max_tokens: 400,       // Yanıt kesilmesin ama çok uzun da olmasın
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API Error:', errorData);
      throw new Error(`Groq API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    // Yanıtı temizle ve döndür
    return cleanResponse(aiResponse);

  } catch (error) {
    console.error('AI Error:', error);

    // Rate limit hatası
    if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      return 'Üzgünüm, şu anda çok fazla istek var. Lütfen birkaç saniye bekleyip tekrar deneyin. 😊';
    }

    // Genel hata
    return 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin. 🙏';
  }
}

/**
 * AI yanıtını temizle
 */
function cleanResponse(response) {
  // Gereksiz boşlukları temizle
  let cleaned = response.trim();

  // Eğer yanıt çok uzunsa kes
  if (cleaned.length > 1000) {
    cleaned = cleaned.substring(0, 1000) + '...';
  }

  // HTML/XML etiketlerini temizle
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  return cleaned;
}

/**
 * Sağlık kontrolü
 */
export async function healthCheck() {
  try {
    // API key var mı kontrol et
    const apiKey = getApiKey();
    if (!apiKey) {
      return { status: 'error', message: 'GROQ_API_KEY tanımlı değil' };
    }

    return {
      status: 'ok',
      model: MODEL,
      provider: 'Groq',
      apiKeySet: true
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
