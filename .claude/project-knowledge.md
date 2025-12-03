# Life Manager - Proje Veritabanı

> Bu dosya Claude tarafından sürekli güncellenir. Proje hakkında tüm kritik bilgileri içerir.

**Son Güncelleme:** 2025-12-04 (Onboarding Wizard)

---

## 1. Proje Bilgileri

| Alan | Değer |
|------|-------|
| **Proje Adı** | Life Manager (Günlük Yaşam Yöneticisi) |
| **Eski Adı** | Çalışma Programı Asistanı |
| **Versiyon** | 3.0.0 |
| **Tip** | PWA (Progressive Web App) |
| **Dil** | Türkçe |
| **Lisans** | - |
| **Repository** | https://github.com/dogonkoyonn/calisma-programi-asistan.git |

---

## 2. Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | Vanilla JavaScript (ES6+) |
| **Styling** | CSS3 (CSS Variables, Flexbox, Grid) |
| **Storage (Mevcut)** | localStorage |
| **Storage (Aktif)** | Firebase Firestore |
| **Auth (Aktif)** | Firebase Authentication |
| **Firebase Project** | life-manager-app-9c1f7 |
| **PWA** | Service Worker, Web Manifest |
| **Build** | Yok (doğrudan serve) |
| **Framework** | Yok (pure vanilla) |

---

## 3. Dosya Yapısı

```
calisma-programi-asistan-v2/
├── index.html                 # Ana HTML dosyası
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker (v3.0.0)
│
├── css/
│   ├── styles.css             # Ana stiller
│   ├── theme-styles.css       # Tema (light/dark) stilleri
│   ├── hamburger-menu.css     # Sidebar ve floating menu
│   ├── todo-styles.css        # TODO bileşen stilleri
│   ├── wizard-styles.css      # Program oluşturma wizard
│   ├── calendar-view.css      # Takvim görünümü
│   ├── session-styles.css     # Çalışma seansları
│   ├── timer-styles.css       # Pomodoro timer
│   ├── daily-log-styles.css   # Günlük log görünümü
│   ├── badges-styles.css      # Rozet sistemi
│   ├── settings-panel.css     # Ayarlar paneli
│   ├── program-panel-styles.css
│   ├── program-dashboard.css
│   ├── notification-dialog.css
│   ├── magnetic-tilt.css      # Animasyon efektleri
│   ├── auth-styles.css        # Kimlik doğrulama stilleri
│   └── onboarding-styles.css  # Yeni kullanıcı wizard stilleri
│
├── js/
│   ├── app.js                 # Ana uygulama (StudyProgramManager, App class)
│   │
│   ├── core/                  # Çekirdek modüller
│   │   ├── data-manager.js    # Merkezi veri yönetimi, migration
│   │   ├── category-manager.js # Kategori navigasyonu
│   │   ├── firebase-config.js # Firebase yapılandırması
│   │   ├── auth-manager.js    # Kimlik doğrulama yönetimi
│   │   └── onboarding-manager.js # Yeni kullanıcı wizard
│   │
│   ├── features/              # Özellik modülleri
│   │   └── todo-manager.js    # TODO sistemi
│   │
│   ├── program-wizard.js      # Çalışma programı oluşturma
│   ├── calendar-view.js       # Takvim yönetimi
│   ├── study-tracker.js       # Çalışma takibi
│   ├── session-manager.js     # Seans yönetimi
│   ├── pomodoro-timer.js      # Pomodoro zamanlayıcı
│   ├── daily-log-viewer.js    # Günlük log görüntüleme
│   ├── badges-system.js       # Rozet/başarı sistemi
│   ├── user-manager.js        # Kullanıcı profil yönetimi
│   ├── settings-panel.js      # Ayarlar paneli
│   ├── theme-manager.js       # Tema yönetimi (light/dark)
│   ├── notification-manager.js # Bildirim yönetimi
│   ├── pdf-export.js          # PDF dışa aktarma
│   ├── feedback-form.js       # Geri bildirim formu
│   ├── update-manager.js      # Güncelleme kontrolü
│   ├── version.js             # Versiyon bilgisi
│   ├── error-logger.js        # Hata loglama
│   ├── loading-spinner.js     # Yükleme animasyonu
│   ├── resources-db.js        # Kaynak veritabanı
│   ├── program-dashboard.js   # Program dashboard
│   ├── motivational-quotes.js # Motivasyon sözleri (DEVRE DIŞI)
│   ├── telegram-notifier.js   # Telegram bildirimleri
│   ├── telegram-bot.js        # Telegram bot
│   ├── email-notifier.js      # Email bildirimleri
│   └── magnetic-tilt.js       # Tilt animasyonu
│
└── icons/                     # PWA ikonları
    └── icon.svg
```

---

## 4. localStorage Anahtarları

| Key | Modül | Açıklama |
|-----|-------|----------|
| `appVersion` | DataManager | Uygulama versiyonu (3.0.0) |
| `lifeManagerData` | DataManager | Ana ayarlar ve kategoriler |
| `todoItems` | TodoManager | Görev listesi |
| `healthTracking` | DataManager | İlaç/vitamin takibi |
| `expenses` | DataManager | Harcama takibi |
| `projects` | DataManager | Projeler |
| `studyPrograms` | App | Çalışma programları |
| `studyLogs` | StudyTracker | Çalışma günlükleri |
| `userProfile` | UserManager | Kullanıcı profili |
| `theme` | ThemeManager | Tema seçimi (light/dark) |
| `earnedBadges` | BadgesSystem | Kazanılan rozetler |
| `errorLogs` | ErrorLogger | Hata günlükleri |
| `scheduledNotifications` | NotificationManager | Planlanmış bildirimler |
| `notificationSettings` | NotificationManager | Bildirim ayarları |
| `telegramNotifierConfig` | TelegramNotifier | Telegram ayarları |
| `feedbackConfig` | FeedbackForm | Geri bildirim ayarları |
| `dashboardSettings` | ProgramDashboard | Dashboard ayarları |

---

## 5. Kategoriler

| ID | Ad | İkon | Renk | Durum |
|----|-----|------|------|-------|
| `home` | Ana Sayfa | 🏠 | - | Aktif |
| `study` | Çalışma | 📚 | #667eea | Aktif |
| `personal` | Kişisel | ✅ | #4ECDC4 | Aktif |
| `health` | Sağlık | 💊 | #FF6B6B | Planlanan |
| `expenses` | Harcamalar | 💰 | #95E1D3 | Planlanan |

---

## 6. Tamamlanan Özellikler

### v3.0.0 (2025-12-04)
| Özellik | Dosyalar | Commit |
|---------|----------|--------|
| Life Manager dönüşümü | Tüm dosyalar | c00e409 |
| Dark mode düzeltmeleri | theme-styles.css | 173a2e5 |
| Sol alt köşe floating menu | hamburger-menu.css, app.js | 173a2e5 |
| Motivasyon sözleri kaldırıldı | index.html | 173a2e5 |
| Sidebar kategori navigasyonu | category-manager.js | c00e409 |
| TODO sistemi | todo-manager.js, todo-styles.css | c00e409 |
| Data migration sistemi | data-manager.js | c00e409 |

### v2.x (Önceki)
- Çalışma programı oluşturma (wizard)
- Haftalık takvim görünümü
- Pomodoro zamanlayıcı
- Çalışma seansları takibi
- Rozet sistemi
- PDF dışa aktarma
- Bildirim sistemi
- Tema desteği (light/dark)
- PWA özellikleri (offline, install)

---

## 7. Devam Eden İşler

### Mevcut Faz: Firebase Entegrasyonu

| Görev | Durum | Öncelik |
|-------|-------|---------|
| Proje veritabanı oluştur | ✅ Tamamlandı | P0 |
| Firebase Console kurulum | ✅ Tamamlandı | P1 |
| firebase-config.js | ✅ Tamamlandı | P1 |
| auth-manager.js | ✅ Tamamlandı | P1 |
| Onboarding wizard | ✅ Tamamlandı | P2 |
| sync-manager.js | ⏳ Bekliyor | P2 |
| Security rules | ⏳ Bekliyor | P2 |
| Offline sync | ⏳ Bekliyor | P3 |

---

## 8. Alınan Kararlar

| Tarih | Karar | Gerekçe |
|-------|-------|---------|
| 2025-12-04 | Firebase kullanılacak | Offline-first, realtime sync, free tier |
| 2025-12-04 | Email + şifre auth | Daha esnek, herkese açık |
| 2025-12-04 | Onboarding wizard | Yeni kullanıcı boş sayfa görmemeli |
| 2025-12-04 | Paylaşım özelliği (fazlı) | Aile modu, link paylaşımı, gruplar |
| 2025-12-04 | Motivasyon sözleri kaldırıldı | Kullanıcı talebi |
| 2025-12-04 | Diğer butonu sol alt köşe | UX iyileştirmesi |

---

## 9. Planlanan Firestore Yapısı

```
users/{userId}
  ├── profile: { name, avatar, createdAt }
  ├── settings: { theme, categories, notifications }
  └── onboardingCompleted: boolean

todos/{todoId}
  ├── userId: string
  ├── title, description, priority
  ├── category, dueDate, dueTime
  ├── completed, completedAt
  ├── recurring, reminders, tags
  └── sharedWith: [] (paylaşım için)

studyPrograms/{programId}
  ├── userId: string
  ├── name, subject, schedule
  ├── topics: []
  └── stats: {}

healthTracking/{userId}
  ├── medications: []
  └── waterIntake: {}

expenses/{userId}
  ├── accounts: []
  ├── categories: []
  └── transactions: []
```

---

## 10. Bilinen Sorunlar

| Sorun | Öncelik | Durum |
|-------|---------|-------|
| Çoklu kullanıcı desteği yok | Yüksek | Firebase ile çözülecek |
| Cihazlar arası sync yok | Yüksek | Firebase ile çözülecek |
| Health tracking UI yok | Orta | FAZ 5'te yapılacak |
| Expense tracking UI yok | Orta | FAZ 6'da yapılacak |

---

## 11. Değişiklik Günlüğü

### 2025-12-04 (Gece - Onboarding)
- [x] onboarding-manager.js oluşturuldu
- [x] onboarding-styles.css oluşturuldu
- [x] Onboarding modal HTML eklendi
- [x] Service Worker v3.2.0'a güncellendi
- [x] 4 adımlı wizard: Hoşgeldin, Profil, Kategoriler, Örnek Veri

### 2025-12-04 (Akşam - Firebase)
- [x] Firebase projesi oluşturuldu (life-manager-app-9c1f7)
- [x] firebase-config.js oluşturuldu
- [x] auth-manager.js oluşturuldu
- [x] auth-styles.css oluşturuldu
- [x] Auth modal HTML eklendi
- [x] Firebase SDK entegre edildi
- [x] Service Worker v3.1.0'a güncellendi

### 2025-12-04 (Öğleden sonra)
- [x] Proje veritabanı dosyası oluşturuldu
- [x] Dark mode uyumsuzlukları düzeltildi
- [x] Floating menu sol alt köşeye taşındı
- [x] Motivasyon sözleri kaldırıldı
- [x] Life Manager v3.0 dönüşümü tamamlandı

### Önceki
- Sidebar kategori sistemi eklendi
- TODO manager oluşturuldu
- Data migration sistemi eklendi
- Service Worker v3.0.0'a güncellendi

---

## 12. Önemli Notlar

1. **PWA Özellikleri**: Uygulama offline çalışabilir, cihaza kurulabilir
2. **Tema**: CSS variables ile light/dark mode destekleniyor
3. **Migration**: Eski veriler (v2.x) otomatik olarak v3.0.0'a migrate ediliyor
4. **Modüler Yapı**: Her özellik kendi JS/CSS dosyasında
5. **No Build**: Doğrudan browser'da çalışıyor, build tool yok

---

## 13. Sonraki Adımlar

1. **Firebase Console'da proje oluştur**
   - Authentication → Email/Password etkinleştir
   - Firestore Database oluştur
   - Web app credentials al

2. **firebase-config.js oluştur**
   - SDK entegrasyonu
   - Config bilgileri

3. **auth-manager.js oluştur**
   - Login/Register UI
   - Auth state yönetimi

4. **Onboarding wizard**
   - Hoşgeldin ekranı
   - Profil kurulumu
   - Örnek veriler
