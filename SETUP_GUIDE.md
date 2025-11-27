# 📚 Çalışma Programı Asistanı - Kurulum Rehberi

## 🎉 v2.1.0 Özellikleri

### ✨ Yeni Eklenenler:
- **User Manager** - Kullanıcı profili ve veri yönetimi
- **Version Manager** - Semantic versioning ve changelog
- **Update Manager** - Otomatik güncelleme sistemi
- **Error Logger** - Global hata yakalama ve loglama
- **Email Notifier** - EmailJS ile email bildirimleri
- **Telegram Notifier** - Telegram Bot ile real-time bildirimler
- **Telegram Bot** - Komut tabanlı sistem yönetimi
- **Settings Panel** - Kapsamlı ayarlar paneli

---

## 📧 Email Bildirimleri Kurulumu (EmailJS)

### Adım 1: EmailJS Hesabı Oluşturma
1. [https://www.emailjs.com/](https://www.emailjs.com/) adresine gidin
2. "Sign Up" ile ücretsiz hesap oluşturun (200 email/ay)
3. Email adresinizi doğrulayın

### Adım 2: Email Service Ekleme
1. Dashboard'da "Email Services" bölümüne gidin
2. "Add New Service" butonuna tıklayın
3. Gmail, Outlook veya diğer servislerden birini seçin
4. Service'i bağlayın ve **Service ID**'yi not edin

### Adım 3: Email Template Oluşturma
1. "Email Templates" bölümüne gidin
2. "Create New Template" butonuna tıklayın
3. Aşağıdaki template'i kullanın:

```html
Subject: 🚨 {{error_level}} Error - {{app_name}}

Hello {{to_name}},

An error has occurred in {{app_name}}:

--------------------------------------------------
ERROR DETAILS
--------------------------------------------------
Level: {{error_level}}
Message: {{error_message}}
Time: {{error_timestamp}}

--------------------------------------------------
CONTEXT
--------------------------------------------------
User: {{error_user}}
URL: {{error_url}}
Browser: {{error_browser}}
Version: {{error_version}}

--------------------------------------------------
STACK TRACE
--------------------------------------------------
{{error_stack}}

--------------------------------------------------
You can access the app here: {{app_url}}

This is an automated message from {{app_name}}.
```

4. Template'i kaydedin ve **Template ID**'yi not edin

### Adım 4: Public Key Alma
1. "Account" → "General" bölümüne gidin
2. **Public Key**'i kopyalayın

### Adım 5: Uygulamada Yapılandırma
1. Uygulamayı açın
2. Sidebar'da **⚙️ Ayarlar** butonuna tıklayın
3. **📧 Bildirimler** sekmesine gidin
4. Email Bildirimleri bölümünde:
   - Public Key: `{EmailJS Public Key}`
   - Service ID: `service_xxxxx`
   - Template ID: `template_xxxxx`
   - Alıcı Email: `your-email@example.com`
   - Alıcı İsim: `Your Name`
   - Email Bildirimleri Aktif: ✅
5. **💾 Kaydet** butonuna tıklayın
6. **🧪 Test Et** ile test email gönderin

---

## 💬 Telegram Bot Kurulumu

### Adım 1: Bot Oluşturma (@BotFather)
1. Telegram'da **@BotFather** botunu açın
2. `/newbot` komutunu gönderin
3. Bot için bir isim girin (örn: "StudyPlan Monitor")
4. Bot için username girin (örn: "studyplan_monitor_bot")
5. BotFather size **Bot Token** verecek - bunu not edin
   - Örnek: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### Adım 2: Botunuzu Başlatma
1. BotFather'ın verdiği linke tıklayın
2. Botunuzla sohbeti açın
3. `/start` mesajı gönderin

### Adım 3: Uygulamada Yapılandırma
1. Uygulamayı açın
2. **⚙️ Ayarlar** → **💬 Bildirimler** sekmesine gidin
3. Telegram Bot Bildirimleri bölümünde:
   - Bot Token: `{BotFather'dan aldığınız token}`
   - **💾 Kaydet** butonuna tıklayın
4. **🔍 Tespit Et** butonuna tıklayın
   - Chat ID otomatik olarak tespit edilecek
5. Telegram Bildirimleri Aktif: ✅
6. **💾 Kaydet** ve **🧪 Test Et**

### Adım 4: Bot Polling (Mesaj Dinleme)
1. Ayarlar panelinde "Bot Polling" switch'ini aktif edin ✅
2. Artık botunuza komut gönderebilirsiniz!

---

## 🤖 Telegram Bot Komutları

### Slash Komutlar
- `/start` - Bot'u başlat
- `/help` - Yardım menüsü
- `/status` - Sistem durumu
- `/errors` - Son hataları göster
- `/health` - Sistem sağlığı
- `/stats` - Kullanıcı istatistikleri
- `/version` - Versiyon bilgisi
- `/clear` - Hata loglarını temizle
- `/stop` - Bot'u durdur

### Doğal Dil Komutları
Aşağıdaki kelimeleri mesaj içinde kullanabilirsiniz:
- "durum" → Sistem durumunu gösterir
- "hata" → Son hataları listeler
- "sağlık" → Sistem sağlığını kontrol eder
- "istatistik" → Kullanıcı istatistiklerini gösterir
- "versiyon" → Versiyon bilgisini gösterir
- "temizle" → Hata loglarını temizler

**Örnek:** "sistem durumu nasıl?" → Bot sistem durumu raporunu gönderir

---

## 🔍 Error Logger Kullanımı

### Otomatik Hata Yakalama
Sistem otomatik olarak şu hataları yakalar:
- JavaScript runtime errors
- Unhandled promise rejections
- Service Worker errors

### Manuel Hata Loglama
Konsol'dan veya koddan manuel log ekleyebilirsiniz:

```javascript
// Konsol'dan
window.errorLogger.critical('Kritik hata mesajı');
window.errorLogger.error('Normal hata mesajı');
window.errorLogger.warning('Uyarı mesajı');
window.errorLogger.info('Bilgi mesajı');

// Kod içinden
try {
    // Risky operation
} catch (error) {
    window.errorLogger.logError(error, 'error', {
        operation: 'data-sync',
        userId: userManager.profile.id
    });
}
```

### Konsol Helper Komutları
```javascript
testError('critical')  // Test error oluştur
showErrors()           // Son 10 hatayı göster
errorStats()           // Hata istatistiklerini göster
```

### Bildirim Kuralları
| Severity | Email | Telegram |
|----------|-------|----------|
| critical | ✅    | ✅       |
| error    | ❌    | ✅       |
| warning  | ❌    | ❌       |
| info     | ❌    | ❌       |

Bu kuralları değiştirmek için:
```javascript
window.errorLogger.updateNotificationRules({
    error: { email: true, telegram: true }  // Error'larda email de gönder
});
```

---

## 💾 Veri Yönetimi

### Export (Dışa Aktarma)
1. **⚙️ Ayarlar** → **💾 Veri Yönetimi**
2. **📥 Tüm Verileri Dışa Aktar** → JSON dosyası indirilir
3. İçerik:
   - Kullanıcı profili
   - Tüm çalışma programları
   - Çalışma logları
   - Bildirim ayarları
   - Zamanlanmış bildirimler

### Import (İçe Aktarma)
1. **⚙️ Ayarlar** → **💾 Veri Yönetimi**
2. **📤 Veri İçe Aktar**
3. Daha önce export ettiğiniz JSON dosyasını seçin
4. ⚠️ Mevcut veriler üzerine yazılacak!
5. Sayfa otomatik yenilenecek

### Hata Loglarını Export
1. **⚙️ Ayarlar** → **💾 Veri Yönetimi**
2. **📥 Hata Loglarını Dışa Aktar**
3. Hata analizi için JSON dosyası indirilir

---

## ⚙️ Tercihler

### Çalışma Tercihleri
- **Günlük Hedef**: Dakika cinsinden (30-720)
- **Pomodoro Çalışma**: 5-60 dakika
- **Pomodoro Mola**: 1-30 dakika
- **Bildirimler**: Açık/Kapalı
- **Ses**: Açık/Kapalı
- **Titreşim**: Açık/Kapalı

### Profil Ayarları
- **Avatar**: Emoji seçici ile değiştir
- **İsim**: Görünen adınız
- **Email**: İletişim email'i

---

## 🔄 Otomatik Güncelleme

### Nasıl Çalışır?
1. Service Worker yeni versiyon tespit eder
2. Kullanıcıya güncelleme dialog'u gösterilir
3. Changelog gösterilir
4. Kullanıcı "Şimdi Güncelle" veya "Daha Sonra" seçer
5. Güncelleme uygulanır ve sayfa yenilenir

### Manuel Güncelleme Kontrolü
```javascript
window.updateManager.checkForUpdates();
```

### Zorla Güncelleme
```javascript
window.updateManager.forceUpdate();
```

---

## 🧪 Test ve Debug

### Email Test
1. Ayarlar → Bildirimler → Email bölümü
2. Yapılandırmayı tamamla
3. "🧪 Test Et" butonuna tıkla
4. Email kutunuzu kontrol et

### Telegram Test
1. Ayarlar → Bildirimler → Telegram bölümü
2. Bot Token ve Chat ID'yi gir
3. "🧪 Test Et" butonuna tıkla
4. Telegram'ı kontrol et

### Error Logger Test
```javascript
// Konsol'dan
testError('critical');  // Kritik test hatası
testError('error');     // Normal test hatası
testError('warning');   // Test uyarısı
testError('info');      // Test bilgisi

// Hataları göster
showErrors();

// İstatistikleri göster
errorStats();
```

### Service Worker Test
```javascript
// Konsol'dan
navigator.serviceWorker.getRegistration().then(reg => {
    console.log('SW State:', reg.active.state);
    console.log('SW Scope:', reg.scope);
});
```

---

## 🚨 Sorun Giderme

### Email Gönderilmiyor
1. EmailJS Public Key doğru mu?
2. Service ID ve Template ID doğru mu?
3. Alıcı email geçerli mi?
4. EmailJS kota doldu mu? (200 email/ay limit)
5. Konsol'da hata var mı kontrol edin

### Telegram Mesajları Gelmiyor
1. Bot Token doğru mu?
2. Chat ID doğru tespit edildi mi?
3. Bot'a /start mesajı gönderildi mi?
4. Telegram bildirimleri aktif mi?
5. Network hatası var mı kontrol edin

### Chat ID Tespit Edilemiyor
1. Bot'a /start mesajı gönderin
2. Birkaç saniye bekleyin
3. "🔍 Tespit Et" butonuna tekrar tıklayın
4. Hala olmazsa manuel girin:
   ```
   1. @userinfobot botuna /start gönderin
   2. Size verdiği ID'yi Chat ID alanına girin
   ```

### Telegram Bot Komutları Çalışmıyor
1. Bot Polling aktif mi kontrol edin (Ayarlar → Bildirimler)
2. Konsol'da "🚀 Telegram Bot polling başlatıldı" mesajını görüyor musunuz?
3. Bot'a /help gönderin
4. Cevap gelmiyorsa Bot Token ve Chat ID'yi kontrol edin

### Update Notification Görünmüyor
1. Service Worker kayıtlı mı?
   ```javascript
   navigator.serviceWorker.getRegistration()
   ```
2. Versiyon numarası değişti mi?
3. Konsol'da "🔄 Yeni versiyon bulundu" mesajı var mı?

---

## 📊 Sistem Gereksinimleri

### Tarayıcı Desteği
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Gerekli Özellikler
- Service Worker (PWA için)
- LocalStorage (veri saklama)
- Fetch API (network istekleri)
- ES6+ (modern JavaScript)

### İsteğe Bağlı
- Notification API (tarayıcı bildirimleri)
- Vibration API (mobil titreşim)

---

## 🔐 Güvenlik Notları

### API Key Yönetimi
⚠️ **ÖNEMLİ:**
- Bot Token ve EmailJS Public Key LocalStorage'da saklanır
- Bu bilgiler tarayıcıda görülebilir
- Hassas production uygulamaları için backend kullanın
- API key'leri GitHub'a commit etmeyin

### Tavsiyeler
1. EmailJS ve Telegram için ayrı hesaplar kullanın
2. Bot Token'ı kimseyle paylaşmayın
3. Düzenli olarak veri yedekleyin (Export)
4. Chat ID'yi gizli tutun

---

## 📝 Changelog Güncelleme

Yeni versiyon çıkardığınızda `version.js` dosyasını güncelleyin:

```javascript
const APP_VERSION = {
    major: 2,
    minor: 2,  // Yeni özellik için artır
    patch: 0
};

const CHANGELOG = {
    '2.2.0': {
        date: '2025-11-17',
        features: [
            'Yeni özellik 1',
            'Yeni özellik 2'
        ],
        fixes: [
            'Düzeltme 1',
            'Düzeltme 2'
        ]
    },
    // Önceki versiyonlar...
};
```

Service Worker'da da versiyonu güncelleyin:
```javascript
// sw.js
const VERSION = '2.2.0';
```

---

## 🎯 Sonraki Adımlar

Sistem başarıyla kuruldu! Şimdi:

1. ✅ Email bildirimlerini test edin
2. ✅ Telegram bot'u test edin
3. ✅ Bir test error oluşturun
4. ✅ Veri export/import yapın
5. ✅ Profil bilgilerinizi doldurun

Keyifli çalışmalar! 📚

---

## 📞 Destek

Sorunlarınız için:
1. Konsol loglarını kontrol edin (F12 → Console)
2. Error loglarını export edin
3. GitHub'da issue açın

**Built with ❤️ by Claude Code**
