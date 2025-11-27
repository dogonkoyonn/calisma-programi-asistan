# ✅ Kurulum Kontrol Listesi

Bu listeyi kullanarak kurulumunuzun doğru olup olmadığını kontrol edin.

## 📋 Dosya Yapısı Kontrolü

Aşağıdaki dosyalar mevcut olmalı:

```
✅ index.html
✅ app.ts
✅ app.js (npm run build sonrası)
✅ styles.css
✅ package.json
✅ README.md
✅ BASLANGIC.md

✅ backend/
   ✅ server.js
   ✅ package.json
   ✅ .env (SİZ OLUŞTURDUNUZ)
   ✅ .env.example
   ✅ .gitignore

   ✅ services/
      ✅ ai.js

   ✅ prompts/
      ✅ system.txt

   ✅ node_modules/ (npm install sonrası)
```

## 🔑 API Key Kontrolü

### 1. Hugging Face Hesabı Var mı?
- [ ] Hesap oluşturuldu: https://huggingface.co/join
- [ ] Token oluşturuldu: https://huggingface.co/settings/tokens
- [ ] Token kopyalandı (hf_xxx formatında)

### 2. .env Dosyası Doğru mu?

`backend/.env` dosyasını açın ve kontrol edin:

```env
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxx  ← Burası DOLU olmalı
PORT=3000
NODE_ENV=development
```

**Önemli:** `your_key_here` yazmıyor olmalı! Gerçek token olmalı.

## 🧪 Test Adımları

### Test 1: Backend Başlatma

```bash
cd backend
npm start
```

**Beklenen Çıktı:**
```
🚀 Server çalışıyor!
📍 Port: 3000
🔗 Health: http://localhost:3000/health
💬 Chat: http://localhost:3000/api/chat

✨ Hugging Face API Key: ✅ Tanımlı

👉 Ctrl+C ile durdurun
```

**Hata Görürseniz:**
- ❌ "HF_API_KEY tanımlanmamış" → `.env` dosyası yok veya yanlış konumda
- ❌ "Port 3000 in use" → Başka bir program port 3000'i kullanıyor
- ❌ "Cannot find module" → `npm install` yapmayı unutmuşsunuz

### Test 2: Health Check

Backend çalışırken, tarayıcıda açın:
```
http://localhost:3000/health
```

**Beklenen Sonuç:**
```json
{
  "status": "running",
  "timestamp": "2025-11-04T...",
  "ai": {
    "status": "ok",
    "model": "meta-llama/Llama-3.2-3B-Instruct"
  }
}
```

### Test 3: Frontend Açma

Yeni terminal/komut satırı açın:

```bash
# Ana klasöre gidin
cd c:\Users\dogan\projecalisma\calisma-programi-asistan-v2

# index.html'i açın
start index.html
```

**Beklenen Görüntü:**
- Yeşil/mor gradyan arkaplan
- Sol üstte "StudyAI 🎓"
- Orta kısımda chat alanı
- Alt kısımda input kutusu

### Test 4: AI ile Konuşma

Chat kutusuna şunu yazın:
```
Merhaba
```

**Beklenen Davranış:**
1. Mesajınız sağ tarafta (mavi) görünür
2. "AI düşünüyor..." yazısı çıkar
3. 2-5 saniye sonra AI yanıt verir (sol tarafta, mor)
4. Yanıt Türkçe ve samimi olmalı

**Örnek AI Yanıtı:**
```
Merhaba! 👋 Sana nasıl yardımcı olabilirim?

Çalışma programı oluşturma, kaynak önerme veya motivasyon
konularında yardımcı olabilirim 😊
```

## ❌ Sorun Giderme

### Backend Hataları

#### Hata: "Cannot find module '@huggingface/inference'"
```bash
cd backend
npm install
```

#### Hata: "HF_API_KEY environment variable tanımlanmamış"
1. `backend/.env` dosyası var mı kontrol edin
2. API key doğru yazıldı mı kontrol edin
3. Backend'i yeniden başlatın

#### Hata: "EADDRINUSE: address already in use"
Port 3000 kullanımda. İki seçenek:
1. Diğer uygulamayı kapatın
2. Veya `.env` dosyasında port değiştirin: `PORT=3001`

### Frontend Hataları

#### Hata: "Failed to fetch" (Console)
Backend çalışmıyor. `npm start` ile başlatın.

#### Hata: "CORS policy"
1. Backend'in çalıştığından emin olun
2. `file://` yerine HTTP server kullanın:
```bash
npx http-server -p 8080
# Sonra http://localhost:8080 açın
```

#### AI yanıt vermiyor
1. F12 ile Console açın
2. Kırmızı hata var mı kontrol edin
3. Network tab'ına bakın
4. Backend'de log var mı kontrol edin

### API Hataları

#### Hata: "Rate limit exceeded"
Günlük 1000 istek limitini aştınız. Yarın tekrar deneyin veya Pro plan alın.

#### Hata: "Invalid API key"
1. API key'i kontrol edin: https://huggingface.co/settings/tokens
2. Yeni token oluşturun
3. `.env` dosyasını güncelleyin
4. Backend'i yeniden başlatın

## ✅ Başarılı Kurulum Kontrolü

Tüm testleri geçtiyseniz:
- ✅ Backend çalışıyor
- ✅ Health endpoint OK
- ✅ Frontend açılıyor
- ✅ AI ile konuşma çalışıyor

**Tebrikler! Kurulum başarılı! 🎉**

## 🚀 Sonraki Adımlar

1. **Kişiselleştirme**: System prompt'u düzenleyin (`backend/prompts/system.txt`)
2. **Deployment**: Vercel/Railway'e deploy edin
3. **Test**: Farklı sorular sorun ve AI'ı test edin

## 📞 Hala Sorun mu Var?

1. Backend loglarını kontrol edin (terminal çıktısı)
2. Browser console'u kontrol edin (F12)
3. README.md dosyasını okuyun
4. GitHub Issues açın

**İyi Çalışmalar! 📚✨**
