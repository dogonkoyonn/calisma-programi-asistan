// ==================== NOTIFICATION MANAGER ====================
// Bildirim izni, zamanlama ve gönderme sistemi

class NotificationManager {
  constructor() {
    this.permission = Notification.permission;
    this.subscription = null;
    this.scheduledNotifications = this.loadScheduled();
    this.init();
  }

  async init() {
    // Permission durumunu kontrol et
    this.updatePermissionStatus();

    // Service Worker hazır mı?
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log('📱 NotificationManager hazır, SW aktif:', registration.scope);
    }
  }

  // ==================== PERMISSION YÖNETİMİ ====================

  async requestPermission() {
    if (!('Notification' in window)) {
      console.error('Bu tarayıcı bildirimleri desteklemiyor');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      alert('Bildirimler engellendi. Lütfen tarayıcı ayarlarından izin verin.');
      return false;
    }

    // İzin iste
    const permission = await Notification.requestPermission();
    this.permission = permission;
    this.updatePermissionStatus();

    if (permission === 'granted') {
      console.log('✅ Bildirim izni verildi');
      this.showWelcomeNotification();
      return true;
    } else {
      console.log('❌ Bildirim izni reddedildi');
      return false;
    }
  }

  updatePermissionStatus() {
    const statusElement = document.getElementById('notificationStatus');
    if (statusElement) {
      if (this.permission === 'granted') {
        statusElement.textContent = 'Bildirimler Aktif ✅';
        statusElement.className = 'notification-status granted';
      } else if (this.permission === 'denied') {
        statusElement.textContent = 'Bildirimler Engellenmiş ❌';
        statusElement.className = 'notification-status denied';
      } else {
        statusElement.textContent = 'Bildirim İzni Bekliyor ⏳';
        statusElement.className = 'notification-status default';
      }
    }
  }

  // ==================== BASIC NOTIFICATIONS ====================

  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Bildirim izni yok, gösterilemiyor');
      return;
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'studyplan-notification',
      renotify: true,
      ...options
    };

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, defaultOptions);
      console.log('📬 Bildirim gönderildi:', title);
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
    }
  }

  showWelcomeNotification() {
    this.showNotification('🎉 Hoş Geldin!', {
      body: 'Bildirimler aktif. Artık çalışma hatırlatıcıları alacaksın!',
      icon: '/icons/icon-192x192.png'
    });
  }

  // ==================== STUDY NOTIFICATIONS ====================

  showStudyReminder(programName, topicName, startTime) {
    this.showNotification('⏰ Çalışma Zamanı!', {
      body: `${programName} - ${topicName}\nBaşlama saati: ${startTime}`,
      data: { type: 'study-reminder', programName, topicName },
      actions: [
        { action: 'start', title: 'Başla', icon: '/icons/icon-72x72.png' },
        { action: 'snooze', title: '10 dk ertele', icon: '/icons/icon-72x72.png' }
      ]
    });
  }

  showBreakReminder(duration) {
    this.showNotification('☕ Mola Zamanı!', {
      body: `${duration} dakika dinlen, sonra kaldığın yerden devam et!`,
      data: { type: 'break-reminder', duration },
      vibrate: [300, 100, 300]
    });
  }

  showMotivationalNotification(message) {
    const motivationalMessages = [
      { title: '🔥 Harika Gidiyorsun!', body: message },
      { title: '🎯 Hedefine Yaklaşıyorsun!', body: message },
      { title: '💪 Süper Performans!', body: message },
      { title: '⭐ İnanılmaz İlerleme!', body: message }
    ];

    const random = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    this.showNotification(random.title, {
      body: random.body || message,
      data: { type: 'motivational' }
    });
  }

  showStreakNotification(days) {
    let emoji = '🔥';
    let title = 'Harika Streak!';

    if (days >= 30) {
      emoji = '🏆';
      title = 'İnanılmaz Disiplin!';
    } else if (days >= 7) {
      emoji = '💎';
      title = 'Muhteşem Streak!';
    }

    this.showNotification(`${emoji} ${title}`, {
      body: `${days} gün üst üste çalışıyorsun! Devam et!`,
      data: { type: 'streak', days }
    });
  }

  showDailySummary(totalMinutes, completedTopics) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeText = hours > 0 ? `${hours} saat ${minutes} dakika` : `${minutes} dakika`;

    this.showNotification('📊 Günlük Özet', {
      body: `Bugün ${timeText} çalıştın ve ${completedTopics} konu tamamladın!`,
      data: { type: 'daily-summary', totalMinutes, completedTopics }
    });
  }

  // ==================== ZAMANLANMIŞ BİLDİRİMLER ====================

  scheduleNotification(id, scheduledTime, title, options) {
    const now = Date.now();
    const delay = scheduledTime - now;

    if (delay <= 0) {
      console.warn('Geçmiş zamana bildirim zamanlanamaz');
      return;
    }

    // Local storage'a kaydet
    const notification = {
      id,
      scheduledTime,
      title,
      options,
      created: now
    };

    this.scheduledNotifications.push(notification);
    this.saveScheduled();

    // Timer ayarla
    const timerId = setTimeout(() => {
      this.showNotification(title, options);
      this.removeScheduledNotification(id);
    }, delay);

    console.log(`⏰ Bildirim zamanlandı: ${new Date(scheduledTime).toLocaleString()}`);
    return timerId;
  }

  removeScheduledNotification(id) {
    this.scheduledNotifications = this.scheduledNotifications.filter(n => n.id !== id);
    this.saveScheduled();
  }

  loadScheduled() {
    const saved = localStorage.getItem('scheduledNotifications');
    return saved ? JSON.parse(saved) : [];
  }

  saveScheduled() {
    localStorage.setItem('scheduledNotifications', JSON.stringify(this.scheduledNotifications));
  }

  // Uygulama açıldığında geçmiş zamanlamaları kontrol et
  checkPendingNotifications() {
    const now = Date.now();
    const pending = this.scheduledNotifications.filter(n => n.scheduledTime > now);
    const missed = this.scheduledNotifications.filter(n => n.scheduledTime <= now);

    // Kaçırılan bildirimleri temizle
    if (missed.length > 0) {
      console.log(`🔔 ${missed.length} kaçırılmış bildirim temizlendi`);
      this.scheduledNotifications = pending;
      this.saveScheduled();
    }

    // Bekleyen bildirimleri yeniden zamanla
    pending.forEach(n => {
      const delay = n.scheduledTime - now;
      setTimeout(() => {
        this.showNotification(n.title, n.options);
        this.removeScheduledNotification(n.id);
      }, delay);
    });

    console.log(`⏰ ${pending.length} bildirim yeniden zamanlandı`);
  }

  // ==================== PUSH SUBSCRIPTION (Firebase için hazırlık) ====================

  async subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;

      // VAPID public key (Firebase'den alınacak)
      // const publicKey = 'YOUR_VAPID_PUBLIC_KEY';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      this.subscription = subscription;
      console.log('📡 Push subscription:', subscription);

      // Backend'e gönder (Firebase'e kaydet)
      // await this.sendSubscriptionToBackend(subscription);

      return subscription;
    } catch (error) {
      console.error('Push subscription başarısız:', error);
      return null;
    }
  }

  async sendSubscriptionToBackend(subscription) {
    // Firebase veya kendi backend'inize gönder
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    return response.json();
  }

  // ==================== AYARLAR ====================

  getSettings() {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      studyReminders: true,
      breakReminders: true,
      motivational: true,
      dailySummary: true,
      sound: true,
      vibrate: true
    };
  }

  saveSettings(settings) {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    console.log('⚙️ Bildirim ayarları kaydedildi:', settings);
  }
}

// Global instance oluştur
window.notificationManager = new NotificationManager();

// Sayfa yüklendiğinde bekleyen bildirimleri kontrol et
window.addEventListener('load', () => {
  setTimeout(() => {
    window.notificationManager.checkPendingNotifications();
  }, 1000);
});
