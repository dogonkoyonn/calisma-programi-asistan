# 🚀 Hızlı Başlangıç Rehberi

AI asistanınızı 5 dakikada çalıştırın!

## ✅ Adım 1: Backend Bağımlılıklarını Yükle

```bash
cd backend
npm install
```

## ✅ Adım 2: Hugging Face API Key Al

1. [https://huggingface.co/join](https://huggingface.co/join) - Ücretsiz hesap oluştur
2. [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) - Token oluştur
3. "New token" butonuna tıkla
4. İsim: `study-assistant`, Role: `Read`
5. Token'ı kopyala (hf_xxxxxx gibi)

## ✅ Adım 3: Environment Variables Ayarla

`backend` klasöründe `.env` dosyası oluştur:

```env
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxx
PORT=3000
NODE_ENV=development
```

**Önemli:** `hf_xxxxxx` yerine kendi token'ınızı yazın!

## ✅ Adım 4: Backend'i Başlat

```bash
# backend klasöründeyken
npm start
```

Şunu görmelisiniz:
```
🚀 Server çalışıyor!
📍 Port: 3000
✨ Hugging Face API Key: ✅ Tanımlı
```

## ✅ Adım 5: Frontend'i Aç

Yeni bir terminal/komut satırı açın:

```bash
# Ana klasöre dön
cd ..

# TypeScript'i derle (sadece ilk seferde)
npx tsc app.ts

# index.html'i tarayıcıda aç
start index.html
```

**Veya** `index.html` dosyasına çift tıklayın.

## 🎉 Hazır!

Artık AI asistanınız çalışıyor!

**Test edin:**
- "Merhaba" yazın
- AI size Türkçe yanıt verecek
- Doğal dilde soru sorabilirsiniz

## ❓ Sorun mu var?

### Backend başlamıyor

**Kontrol edin:**
```bash
# Node.js yüklü mü?
node --version

# Backend klasöründe misiniz?
pwd  # veya Windows'ta: cd

# .env dosyası var mı?
ls .env  # veya Windows'ta: dir .env
```

### AI yanıt vermiyor

1. Backend çalışıyor mu? → http://localhost:3000/health açın
2. Console'da hata var mı? → F12 tuşuna basın
3. API key doğru mu? → `.env` dosyasını kontrol edin

### CORS hatası

Frontend'i `file://` ile açtıysanız (çift tıklama), bir web server kullanın:

```bash
# Basit HTTP server
npx http-server

# Sonra http://localhost:8080 adresini açın
```

## 📞 Daha Fazla Yardım

`README.md` dosyasında detaylı dokümantasyon var!
