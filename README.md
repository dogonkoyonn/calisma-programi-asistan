# 📚 Çalışma Programı Asistanı v2.1.0

Kişiselleştirilmiş çalışma programları oluştur, kaynak keşfet, ilerlemeni takip et!

## ✨ Özellikler

### 📊 Gelişmiş Program Yönetimi
- **Dashboard Sistemi** - 4 sekmeli kontrol paneli
- **Grid/Liste Görünümü** - İki farklı görüntüleme modu
- **Arama & Filtreleme** - Program ve konu ara, duruma göre filtrele
- **Toplu İşlemler** - Çoklu program yönetimi
- **Export/Import** - JSON formatında veri yedekleme

### 📅 3 Takvim Görünümü
- **Günlük Takvim** - 24 saat timeline, saat bazlı planlama
- **Haftalık Takvim** - 7 günlük görünüm
- **Aylık Takvim** - Ay bazında görev takibi

### 📈 Detaylı İstatistikler
- **İlerleme Takibi** - Program bazlı yüzde gösterimi
- **Streak Sistemi** - Ardışık çalışma günü sayacı
- **Haftalık Grafik** - Görsel çalışma analizi
- **Özet Kartlar** - Toplam program, konu, saat

### 🎯 Adım Adım Sihirbaz
- **5 Adımlı Süreç** - Kolay program oluşturma
- **Hazır Şablonlar** - Bootcamp programları
- **Otomatik Kaynak Önerileri** - 40+ YouTube kanalı
- **Akıllı Planlama** - Hedef tarihe göre otomatik dağılım

### 🔔 Bildirim Sistemi
- **PWA Bildirimleri** - Tarayıcı bildirimleri
- **Email Bildirimleri** - EmailJS entegrasyonu
- **Telegram Bot** - Real-time hata bildirimleri
- **Bot Komutları** - Chat-style sistem yönetimi

### 🛡️ Hata Yönetimi
- **Error Logger** - Otomatik hata yakalama
- **Email Notifier** - Kritik hatalar için email
- **Telegram Notifier** - Anlık bildirimler
- **Export Logs** - Hata analizi için JSON export

## 🚀 Canlı Demo

**GitHub Pages:** `https://KULLANICI_ADINIZ.github.io/calisma-programi-asistan/`

## 💻 Yerel Kullanım

### HTTP Server ile
```bash
# Node.js (npx)
npx http-server -p 8080

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Sonra tarayıcıda: `http://localhost:8080`

### PWA Olarak Yükleme
1. Tarayıcıda açın
2. Adres çubuğunda **"Yükle"** simgesine tıklayın
3. Masaüstü uygulaması gibi kullanın! 📱💻

## 📖 Kullanım Rehberi

### 1. Program Oluşturma
1. **➕ Yeni Program** veya **📚 Programlarım** → **Dashboard** → **➕ Yeni**
2. Konuyu seçin (Matematik, İngilizce, Fizik, vb.)
3. Seviye belirleyin (Temel, Orta, İleri)
4. Çalışma takvimini oluşturun
5. Hazır şablonlardan seçin veya özelleştirin

### 2. Dashboard Kullanımı
- **📊 Dashboard Tab:** Tüm programlarınızı görün, ara, filtrele
- **📅 Takvim Tab:** Günlük/Haftalık/Aylık görünümler arası geçiş
- **📈 İstatistikler Tab:** İlerleme grafikleri ve streak takibi
- **⚙️ Ayarlar Tab:** Çalışma saatleri, export/import, bildirimler

### 3. Email & Telegram Kurulumu
Detaylı kurulum için: [`SETUP_GUIDE.md`](SETUP_GUIDE.md)

## 🛠️ Teknolojiler

- **Frontend:** Vanilla JavaScript (ES6+)
- **UI:** CSS3, Flexbox, Grid, Animations
- **Storage:** LocalStorage
- **PWA:** Service Worker, Manifest, Cache API
- **Bildirimler:** EmailJS, Telegram Bot API
- **Error Tracking:** Custom Error Logger

## 📊 Proje İstatistikleri

- **Toplam Satır:** ~8,000+ satır
- **JavaScript Dosyaları:** 15+
- **CSS Dosyaları:** 8+
- **Özellik Sayısı:** 30+
- **Bootcamp Şablonları:** 10+
- **YouTube Kanalı:** 40+

## 📂 Dosya Yapısı

```
calisma-programi-asistan-v2/
├── index.html                 # Ana sayfa
├── manifest.json             # PWA manifest
├── sw.js                     # Service Worker
│
├── app.js                    # Ana uygulama
├── program-wizard.js         # Program oluşturma sihirbazı
├── program-dashboard.js      # Dashboard sistemi
├── calendar-view.js          # Haftalık takvim
├── resources-db.js           # Kaynak veritabanı
├── study-tracker.js          # Çalışma takibi
├── notification-manager.js   # Bildirim sistemi
│
├── user-manager.js           # Kullanıcı profili
├── version.js                # Versiyon yönetimi
├── update-manager.js         # Otomatik güncelleme
├── error-logger.js           # Hata loglama
├── email-notifier.js         # Email bildirimleri
├── telegram-notifier.js      # Telegram bildirimleri
├── telegram-bot.js           # Bot komutları
├── settings-panel.js         # Ayarlar paneli
│
├── styles.css                # Ana stiller
├── program-dashboard.css     # Dashboard stilleri
├── program-panel-styles.css  # Panel stilleri
├── wizard-styles.css         # Sihirbaz stilleri
├── calendar-view.css         # Takvim stilleri
├── settings-panel.css        # Ayarlar stilleri
├── magnetic-tilt.css         # Animasyon stilleri
│
├── SETUP_GUIDE.md            # Kurulum rehberi
└── README.md                 # Bu dosya
```

## 🌐 Web'de Yayınlama

### GitHub Pages (ÜCRETSİZ)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/calisma-programi-asistan.git
git push -u origin main

# GitHub: Settings → Pages → Deploy from main branch
```

### Netlify (ÜCRETSİZ)
[app.netlify.com/drop](https://app.netlify.com/drop) → Klasörü sürükle-bırak

### Vercel (ÜCRETSİZ)
```bash
npm install -g vercel
vercel
```

## 📝 Versiyon Geçmişi

### v2.1.0 (18 Kasım 2025)
- ✨ Gelişmiş Dashboard sistemi
- 📅 Günlük ve aylık takvim görünümleri
- 📧 Email & Telegram entegrasyonu
- 🔍 Error tracking ve loglama
- 💾 Gelişmiş export/import
- 🎨 Modern UI iyileştirmeleri

### v2.0.0 (Önceki)
- 🎯 5 adımlı program sihirbazı
- 📚 40+ YouTube kaynağı
- 📊 Temel program yönetimi
- 🔔 PWA bildirimleri

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 Destek

- **GitHub Issues:** Sorun bildirimi için
- **Discussions:** Soru ve öneriler için

## 📄 Lisans

MIT License - Eğitim amaçlı kullanım için serbesttir.

## 🙏 Teşekkürler

- **EmailJS:** Backend-less email servisi
- **Telegram:** Bot API
- **YouTube Educators:** Kaliteli içerikler

---

**Built with ❤️ by Claude Code**

⭐ Beğendiyseniz yıldız vermeyi unutmayın!
