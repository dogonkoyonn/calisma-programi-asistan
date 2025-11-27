# 📱 MOBİL & İLERİ ÖZELLİKLER ROADMAP

## 🎯 HEDEFLER

1. **Proje Takip Sistemi** - Haftalık/günlük çalışma logu
2. **PWA Dönüşümü** - Web uygulamasını mobil gibi kullan
3. **Push Notification** - Hatırlatıcılar ve bildirimler
4. **Native Mobile App** - iOS ve Android uygulaması (React Native)

---

## 📊 1. PROJE TAKİP SİSTEMİ

### Özellikler:

#### Günlük Çalışma Logu
```javascript
{
  date: '2024-01-15',
  sessions: [
    {
      programId: 'abc123',
      topicName: 'React Hooks',
      startTime: '14:00',
      endTime: '15:30',
      duration: 90, // dakika
      completed: true,
      notes: 'useState ve useEffect öğrendim'
    }
  ],
  totalMinutes: 180, // Günlük toplam
  targetMinutes: 240, // Hedef
  percentage: 75
}
```

#### Haftalık Rapor
- Toplam çalışma saati
- Tamamlanan konu sayısı
- Günlük ortalama
- Grafik (bar chart)

#### Aylık Özet
- En çok çalışılan günler
- En verimli saat dilimleri
- Başarı oranı

### UI Tasarımı:

**Dashboard Kartları:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Bugün           │ Bu Hafta        │ Bu Ay           │
│ 3.5 saat       │ 18.2 saat      │ 72.5 saat      │
│ %87 başarı     │ %91 başarı     │ %88 başarı     │
└─────────────────┴─────────────────┴─────────────────┘
```

**Aktivite Grafiği** (DopingHafıza tarzı):
```
Saat
8 ┤     ╭─╮
6 ┤   ╭─╯ ╰─╮
4 ┤ ╭─╯     ╰─╮
2 ┤─╯         ╰─
  └──────────────────
   Pzt Sal Çar Per Cum Cts Paz
```

### Implementasyon (Faz 2):

**Yeni Dosya:** `study-tracker.js`
```javascript
class StudyTracker {
  constructor() {
    this.logs = this.loadLogs();
  }

  // Çalışma seansı başlat
  startSession(programId, topicName) {
    return {
      id: Date.now().toString(),
      programId,
      topicName,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      active: true
    };
  }

  // Seansı bitir
  endSession(sessionId) {
    // localStorage'a kaydet
  }

  // Günlük özet
  getDailySummary(date) {
    // O günün verilerini getir
  }

  // Haftalık grafik data
  getWeeklyChart() {
    // Son 7 günün verisi
  }
}
```

---

## 📱 2. PWA DÖNÜŞÜMÜ (Progressive Web App)

### Avantajlar:
- ✅ Telefona/tablet'e kurulabilir
- ✅ Offline çalışabilir
- ✅ Push notification desteği
- ✅ Anında yüklenir
- ✅ App store gerekmez

### Implementasyon:

#### 2.1. Manifest Dosyası
**Yeni Dosya:** `manifest.json`
```json
{
  "name": "StudyPlan - Akıllı Çalışma Asistanı",
  "short_name": "StudyPlan",
  "description": "Kişiselleştirilmiş çalışma programları ve takip",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 2.2. Service Worker
**Yeni Dosya:** `sw.js`
```javascript
// Cache stratejisi
const CACHE_NAME = 'studyplan-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/resources-db.js'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event (offline support)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

#### 2.3. index.html'e ekle
```html
<head>
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#667eea">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
</head>

<script>
  // Service Worker register
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ PWA aktif!'));
  }
</script>
```

---

## 🔔 3. PUSH NOTIFICATION SİSTEMİ

### Özellikler:

#### Bildirim Tipleri:
1. **Çalışma Hatırlatıcısı**
   - "⏰ Matematik çalışma zamanın! 14:00-16:00"
   - Program saatinden 10dk önce

2. **Motivasyon Bildirimi**
   - "🔥 5 gün üst üste çalıştın! Streak'ini boşa çıkarma!"
   - "🎉 Bu haftaki hedefinin %80'ini tamamladın!"

3. **Ara Hatırlatıcısı**
   - "☕ Mola zamanı! 5 dakika dinlen"
   - Pomodoro timer bitince

4. **Günlük Özet**
   - "📊 Bugün 3.5 saat çalıştın. Harika gidiyor!"
   - Gün sonunda

### Implementasyon:

#### 3.1. Permission İsteme
```javascript
// Notification permission
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Bildirim izni verildi');
    }
  }
}
```

#### 3.2. Zamanlanmış Bildirimler
```javascript
class NotificationManager {
  // Program saatinde bildir
  scheduleStudyReminder(program, topic, time) {
    const notificationTime = new Date(time);
    notificationTime.setMinutes(notificationTime.getMinutes() - 10);

    // 10dk önce hatırlat
    setTimeout(() => {
      this.showNotification(
        '⏰ Çalışma Zamanı!',
        `${topic.name} - ${program.name}`
      );
    }, notificationTime - Date.now());
  }

  // Bildirim göster
  showNotification(title, body, options = {}) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          vibrate: [200, 100, 200],
          ...options
        });
      });
    }
  }

  // Streak bildirimi
  checkStreakNotification() {
    const streak = this.getStreak();
    if (streak >= 3) {
      this.showNotification(
        `🔥 ${streak} Gün Streak!`,
        'Harika gidiyorsun! Devam et!'
      );
    }
  }
}
```

---

## 📲 4. NATIVE MOBILE APP (React Native)

### Neden React Native?
- ✅ Tek kod → iOS + Android
- ✅ JavaScript bilgisiyle yapılır
- ✅ Native performans
- ✅ App Store + Google Play

### Mimari:

```
studyplan-mobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js        # Ana ekran
│   │   ├── WizardScreen.js      # Program sihirbazı
│   │   ├── ProgramsScreen.js    # Programlar listesi
│   │   ├── TrackerScreen.js     # Çalışma takibi
│   │   └── StatsScreen.js       # İstatistikler
│   ├── components/
│   │   ├── ProgramCard.js
│   │   ├── TopicItem.js
│   │   ├── ChartWeekly.js
│   │   └── NotificationBar.js
│   ├── services/
│   │   ├── storage.js           # AsyncStorage
│   │   ├── notifications.js     # Push notifications
│   │   └── resources-db.js      # Kaynak veritabanı
│   └── navigation/
│       └── AppNavigator.js      # React Navigation
├── android/
├── ios/
└── package.json
```

### Özellikler (Mobile-First):

#### 1. **Native Bildirimler**
```javascript
import PushNotification from 'react-native-push-notification';

PushNotification.localNotificationSchedule({
  message: "⏰ Matematik çalışma zamanı!",
  date: new Date(Date.now() + 60 * 1000), // 1 dakika sonra
  playSound: true,
  vibrate: true
});
```

#### 2. **Arka Plan Çalışma**
```javascript
// Pomodoro timer arka planda çalışır
BackgroundTimer.runBackgroundTimer(() => {
  // Timer'ı güncelle
}, 1000);
```

#### 3. **Offline Mode**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tüm veriler local'de
await AsyncStorage.setItem('programs', JSON.stringify(programs));
```

#### 4. **Widget (iOS/Android)**
- Ana ekrana widget ekle
- "Bugün 3/5 konu tamamlandı"
- Direkt uygulamaya giriş

---

## 🗓️ IMPLEMENTASYON PLANI

### Faz 2a: Proje Takip (1 Hafta)
- [ ] StudyTracker sınıfı
- [ ] Günlük/haftalık log UI
- [ ] Dashboard grafikleri (Chart.js)
- [ ] Çalışma seansı başlat/bitir butonları

### Faz 2b: PWA (3 Gün)
- [ ] manifest.json oluştur
- [ ] Service Worker (sw.js)
- [ ] Offline cache stratejisi
- [ ] "Ana ekrana ekle" banner
- [ ] Icon'lar (72x72, 192x192, 512x512)

### Faz 2c: Push Notification (2 Gün)
- [ ] Permission request UI
- [ ] NotificationManager sınıfı
- [ ] Zamanlanmış bildirimler
- [ ] Streak/motivasyon bildirimleri
- [ ] Ayarlar sayfası (bildirim açık/kapat)

### Faz 3: React Native App (2-3 Hafta)
- [ ] React Native proje kurulumu
- [ ] Screen'leri oluştur
- [ ] Navigation yapısı
- [ ] AsyncStorage entegrasyonu
- [ ] Push notification setup (Firebase)
- [ ] iOS build & test
- [ ] Android build & test
- [ ] App Store submission
- [ ] Google Play submission

---

## 📈 BAŞARI KRİTERLERİ

### PWA:
- ✅ Lighthouse PWA skoru: 90+
- ✅ Ana ekrana eklenebilir
- ✅ Offline çalışır
- ✅ Bildirimler gelir

### Mobile App:
- ✅ App Store'da yayında
- ✅ Google Play'de yayında
- ✅ 4.5+ rating
- ✅ Push notification çalışıyor

---

## 💡 EK ÖZELLIKLER

### Widget'lar:
```
┌─────────────────────┐
│ StudyPlan Widget    │
│                     │
│ Bugün:              │
│ ████████░░ %80      │
│                     │
│ Sonraki:            │
│ ⏰ 14:00 Matematik  │
└─────────────────────┘
```

### Apple Watch / Wear OS:
- Pomodoro timer
- Günlük özet
- Motivasyon bildirimleri

### Siri / Google Assistant:
- "Hey Siri, çalışma seansı başlat"
- "OK Google, bugün kaç saat çalıştım?"

---

**Mevcut Durum:** Faz 1 ✅ → Faz 2a'ya başlamaya hazırız!
