# Firebase Cloud Messaging (FCM) Kurulum Rehberi

Bu rehber, "her zaman bildirim" özelliğini aktif etmek için Firebase kurulumunu açıklar.

---

## 🎯 Firebase Neden Gerekli?

**Sorun:** Service Worker ve local bildirimler sadece tarayıcı açıkken çalışır.

**Çözüm:** Firebase Cloud Messaging (FCM), telefonunuzun işletim sistemine (Android/iOS) direkt ulaşarak **tarayıcı kapalıyken bile** bildirim gönderir.

---

## 📋 Adım 1: Firebase Projesi Oluştur

1. **Firebase Console'a git:** https://console.firebase.google.com/
2. **"Add project"** (Proje Ekle) tıkla
3. Proje adı: `studyplan-app` (veya istediğin ad)
4. Google Analytics: İsteğe bağlı (Disable yapabilirsin)
5. **"Create project"** tıkla

---

## 📋 Adım 2: Web App Ekle

1. Firebase projesinde **Project Overview** > **Add app** > **Web** (</>) ikonuna tıkla
2. App nickname: `StudyPlan Web`
3. **"Register app"** tıkla
4. Firebase SDK config'i kopyala:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "studyplan-app.firebaseapp.com",
  projectId: "studyplan-app",
  storageBucket: "studyplan-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 📋 Adım 3: Cloud Messaging Aktif Et

1. Sol menüden **Build** > **Cloud Messaging** tıkla
2. Eğer uyarı çıkarsa: **"Get started"** veya **"Enable"** tıkla
3. **Cloud Messaging API (V1)** aktif olmalı

---

## 📋 Adım 4: VAPID Key Oluştur

1. **Cloud Messaging** sayfasında **"Web configuration"** sekmesine git
2. **"Web Push certificates"** bölümünde **"Generate key pair"** tıkla
3. VAPID public key'i kopyala (örnek: `BHT5q...`)

---

## 📋 Adım 5: Firebase SDK'yı Projeye Ekle

### 5.1. `firebase-config.js` Oluştur

```javascript
// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "BURAYA_API_KEY_GİR",
  authDomain: "studyplan-app.firebaseapp.com",
  projectId: "studyplan-app",
  storageBucket: "studyplan-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// VAPID public key (Web Push certificates'tan aldığın)
const vapidKey = "BURAYA_VAPID_KEY_GİR";

export { messaging, vapidKey };
```

### 5.2. `index.html`'e ekle

```html
<script type="module">
  import { messaging, vapidKey } from './firebase-config.js';
  import { getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

  // Token al
  async function requestFirebaseToken() {
    try {
      const token = await getToken(messaging, { vapidKey });
      console.log('📡 Firebase token:', token);

      // Token'ı backend'e gönder veya localStorage'a kaydet
      localStorage.setItem('fcmToken', token);
    } catch (error) {
      console.error('Token alınamadı:', error);
    }
  }

  // Sayfa yüklendiğinde
  window.addEventListener('load', () => {
    if (Notification.permission === 'granted') {
      requestFirebaseToken();
    }
  });
</script>
```

---

## 📋 Adım 6: Service Worker'ı Güncelle

`sw.js` dosyasına Firebase messaging ekle:

```javascript
// sw.js en üste ekle
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "BURAYA_API_KEY_GİR",
  authDomain: "studyplan-app.firebaseapp.com",
  projectId: "studyplan-app",
  storageBucket: "studyplan-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

---

## 📋 Adım 7: Backend (Bildirim Gönderme)

### Seçenek A: Firebase Console (Manuel)

1. **Cloud Messaging** > **"Send your first message"** tıkla
2. Notification title ve text gir
3. **"Send test message"** veya **"Next"** tıkla
4. Token'ı yapıştır (localStorage'dan aldığın)
5. **"Test"** tıkla

### Seçenek B: Firebase Functions (Otomatik Zamanlama)

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Her gün saat 14:00'te çalışma hatırlatıcısı gönder
exports.dailyStudyReminder = functions.pubsub
  .schedule('0 14 * * *') // Cron: Her gün 14:00
  .timeZone('Europe/Istanbul')
  .onRun(async (context) => {
    const message = {
      notification: {
        title: '⏰ Çalışma Zamanı!',
        body: 'Programına göre şimdi çalışma vaktı. Hadi başla!'
      },
      // Topic'e gönder (tüm kullanıcılar)
      topic: 'study-reminders'
    };

    await admin.messaging().send(message);
    console.log('✅ Bildirim gönderildi');
  });
```

Deploy:
```bash
firebase deploy --only functions
```

### Seçenek C: Node.js Backend

```javascript
// server.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert('path/to/serviceAccountKey.json')
});

async function sendNotification(token, title, body) {
  const message = {
    notification: { title, body },
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Bildirim gönderildi:', response);
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// Kullanım
sendNotification(
  'USER_FCM_TOKEN',
  '⏰ Çalışma Zamanı!',
  'Matematik çalışma saati geldi!'
);
```

---

## 📋 Adım 8: Test Et

1. **index.html**'i tarayıcıda aç
2. **Bildirim izni** ver
3. Console'da **Firebase token**'ı kopyala
4. **Firebase Console** > **Cloud Messaging** > **Send test message**
5. Token'ı yapıştır, **Test** tıkla
6. Tarayıcıyı **tamamen kapat**
7. Bildirim geldi mi? ✅

---

## 🔐 Güvenlik Notları

1. **API Key'i gizleme:** `firebase-config.js` production'da environment variable ile yükle
2. **Service Account Key:** Asla public repo'ya commit etme
3. **Token güvenliği:** Token'ları veritabanında şifrele

---

## 🎯 Sonuç

Artık **her zaman bildirim** sistemi aktif! Tarayıcı kapalıyken bile:

✅ Çalışma zamanı hatırlatıcıları
✅ Mola zamanı bildirimleri
✅ Streak ve motivasyon mesajları
✅ Günlük özet bildirimleri

---

## 📚 Ek Kaynaklar

- Firebase Documentation: https://firebase.google.com/docs/cloud-messaging/js/client
- VAPID Keys: https://firebase.google.com/docs/cloud-messaging/js/client#configure_web_credentials_with_fcm
- Cloud Functions: https://firebase.google.com/docs/functions

---

**Not:** Firebase **ücretsiz planı** (Spark) günde 10,000 bildirim gönderebilir. Bu miktar kişisel kullanım için yeterli!
