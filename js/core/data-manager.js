// ==================== DATA MANAGER ====================
// Merkezi veri yönetimi ve migration sistemi

class DataManager {
  static CURRENT_VERSION = '3.0.0';

  // localStorage anahtarları
  static KEYS = {
    VERSION: 'appVersion',
    LIFE_MANAGER: 'lifeManagerData',
    TODO_ITEMS: 'todoItems',
    HEALTH_TRACKING: 'healthTracking',
    EXPENSES: 'expenses',
    PROJECTS: 'projects',
    // Mevcut (korunacak)
    STUDY_PROGRAMS: 'studyPrograms',
    STUDY_LOGS: 'studyLogs'
  };

  /**
   * Uygulama başlatıldığında çağrılır
   */
  static async initialize() {
    console.log('📦 DataManager başlatılıyor...');

    const existingVersion = localStorage.getItem(this.KEYS.VERSION);

    if (!existingVersion) {
      // Yeni kurulum veya eski versiyon
      const hasOldData = localStorage.getItem(this.KEYS.STUDY_PROGRAMS);
      if (hasOldData) {
        console.log('📦 Eski veri bulundu, migration yapılıyor...');
        await this.migrate('2.0.0', this.CURRENT_VERSION);
      } else {
        console.log('📦 Yeni kullanıcı, varsayılan veriler oluşturuluyor...');
        this.initializeNewUser();
      }
    } else if (existingVersion !== this.CURRENT_VERSION) {
      console.log(`📦 Migration: ${existingVersion} → ${this.CURRENT_VERSION}`);
      await this.migrate(existingVersion, this.CURRENT_VERSION);
    } else {
      console.log('📦 Veri versiyonu güncel');
    }

    localStorage.setItem(this.KEYS.VERSION, this.CURRENT_VERSION);
    console.log('📦 DataManager hazır');
  }

  /**
   * Yeni kullanıcı için varsayılan veriler
   */
  static initializeNewUser() {
    // Ana ayarlar
    this.save(this.KEYS.LIFE_MANAGER, {
      version: this.CURRENT_VERSION,
      categories: {
        study: { enabled: true, color: '#667eea', name: 'Çalışma', icon: '📚' },
        personal: { enabled: true, color: '#4ECDC4', name: 'Kişisel', icon: '✅' },
        health: { enabled: true, color: '#FF6B6B', name: 'Sağlık', icon: '💊' },
        expenses: { enabled: true, color: '#95E1D3', name: 'Harcamalar', icon: '💰' }
      },
      settings: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: 'tr',
        notificationSchedule: {
          morning: '08:00',
          afternoon: '14:00',
          evening: '20:00'
        },
        theme: 'light'
      }
    });

    // Boş TODO listesi
    this.save(this.KEYS.TODO_ITEMS, { items: [] });

    // Boş sağlık takibi
    this.save(this.KEYS.HEALTH_TRACKING, {
      medications: [],
      waterIntake: {
        dailyGoal: 8,
        history: {}
      }
    });

    // Boş harcama takibi
    this.save(this.KEYS.EXPENSES, {
      accounts: [
        { id: 'acc_default', name: 'Nakit', balance: 0, type: 'cash', isDefault: true }
      ],
      categories: [
        { id: 'food', name: 'Yemek', icon: '🍔', color: '#FF6B6B' },
        { id: 'transport', name: 'Ulaşım', icon: '🚗', color: '#4ECDC4' },
        { id: 'entertainment', name: 'Eğlence', icon: '🎬', color: '#95E1D3' },
        { id: 'bills', name: 'Fatura', icon: '📄', color: '#FFE66D' },
        { id: 'shopping', name: 'Alışveriş', icon: '🛍️', color: '#FF8B94' },
        { id: 'health', name: 'Sağlık', icon: '💊', color: '#A8E6CF' },
        { id: 'education', name: 'Eğitim', icon: '📚', color: '#667eea' },
        { id: 'other', name: 'Diğer', icon: '📦', color: '#DCEDC1' }
      ],
      transactions: []
    });

    // Boş projeler
    this.save(this.KEYS.PROJECTS, { projects: [] });

    // Boş çalışma programları (eğer yoksa)
    if (!localStorage.getItem(this.KEYS.STUDY_PROGRAMS)) {
      this.save(this.KEYS.STUDY_PROGRAMS, []);
    }
  }

  /**
   * Eski versiyondan yeni versiyona migration
   */
  static async migrate(fromVersion, toVersion) {
    console.log(`📦 Migration başlıyor: ${fromVersion} → ${toVersion}`);

    // Mevcut studyPrograms'ı koru ve category ekle
    const existingPrograms = this.load(this.KEYS.STUDY_PROGRAMS);
    if (existingPrograms && Array.isArray(existingPrograms)) {
      existingPrograms.forEach(program => {
        if (!program.category) {
          program.category = 'study';
        }
      });
      this.save(this.KEYS.STUDY_PROGRAMS, existingPrograms);
    }

    // Yeni veri yapılarını oluştur (yoksa)
    if (!this.load(this.KEYS.LIFE_MANAGER)) {
      this.save(this.KEYS.LIFE_MANAGER, {
        version: toVersion,
        categories: {
          study: { enabled: true, color: '#667eea', name: 'Çalışma', icon: '📚' },
          personal: { enabled: true, color: '#4ECDC4', name: 'Kişisel', icon: '✅' },
          health: { enabled: true, color: '#FF6B6B', name: 'Sağlık', icon: '💊' },
          expenses: { enabled: true, color: '#95E1D3', name: 'Harcamalar', icon: '💰' }
        },
        settings: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'tr',
          notificationSchedule: {
            morning: '08:00',
            afternoon: '14:00',
            evening: '20:00'
          },
          theme: localStorage.getItem('theme') || 'light'
        }
      });
    }

    if (!this.load(this.KEYS.TODO_ITEMS)) {
      this.save(this.KEYS.TODO_ITEMS, { items: [] });
    }

    if (!this.load(this.KEYS.HEALTH_TRACKING)) {
      this.save(this.KEYS.HEALTH_TRACKING, {
        medications: [],
        waterIntake: { dailyGoal: 8, history: {} }
      });
    }

    if (!this.load(this.KEYS.EXPENSES)) {
      this.save(this.KEYS.EXPENSES, {
        accounts: [{ id: 'acc_default', name: 'Nakit', balance: 0, type: 'cash', isDefault: true }],
        categories: [
          { id: 'food', name: 'Yemek', icon: '🍔', color: '#FF6B6B' },
          { id: 'transport', name: 'Ulaşım', icon: '🚗', color: '#4ECDC4' },
          { id: 'entertainment', name: 'Eğlence', icon: '🎬', color: '#95E1D3' },
          { id: 'bills', name: 'Fatura', icon: '📄', color: '#FFE66D' },
          { id: 'shopping', name: 'Alışveriş', icon: '🛍️', color: '#FF8B94' },
          { id: 'health', name: 'Sağlık', icon: '💊', color: '#A8E6CF' },
          { id: 'education', name: 'Eğitim', icon: '📚', color: '#667eea' },
          { id: 'other', name: 'Diğer', icon: '📦', color: '#DCEDC1' }
        ],
        transactions: []
      });
    }

    if (!this.load(this.KEYS.PROJECTS)) {
      this.save(this.KEYS.PROJECTS, { projects: [] });
    }

    console.log('📦 Migration tamamlandı');
  }

  /**
   * Veri kaydet
   */
  static save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`📦 Kaydetme hatası (${key}):`, error);

      // QuotaExceededError kontrolü
      if (error.name === 'QuotaExceededError' ||
          error.code === 22 || // Eski tarayıcılar
          error.code === 1014 || // Firefox
          error.message?.includes('quota')) {

        console.warn('📦 localStorage dolu! Temizleme deneniyor...');

        // Kullanıcıya uyarı göster
        this.showStorageWarning();

        // Eski/gereksiz verileri temizlemeyi dene
        if (this.cleanupOldData()) {
          // Tekrar dene
          try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
          } catch (retryError) {
            console.error('📦 Temizlik sonrası da kayıt başarısız:', retryError);
          }
        }
      }

      return false;
    }
  }

  /**
   * Depolama uyarısı göster
   */
  static showStorageWarning() {
    // Notification manager varsa kullan
    if (window.notificationManager) {
      notificationManager.show(
        'Depolama Uyarısı',
        'Cihaz depolama alanı dolmak üzere. Eski verileri silmeyi düşünün.',
        'warning'
      );
    } else {
      // Fallback: console ve basit alert
      alert('Depolama alanı dolmak üzere! Lütfen eski verileri temizleyin.');
    }
  }

  /**
   * Eski verileri temizle (depolama dolduğunda)
   */
  static cleanupOldData() {
    try {
      // Çalışma loglarının eski olanlarını temizle (30 günden eski)
      const logs = this.load(this.KEYS.STUDY_LOGS);
      if (logs && Array.isArray(logs)) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentLogs = logs.filter(log => {
          const logDate = new Date(log.date || log.timestamp).getTime();
          return logDate > thirtyDaysAgo;
        });

        if (recentLogs.length < logs.length) {
          localStorage.setItem(this.KEYS.STUDY_LOGS, JSON.stringify(recentLogs));
          console.log(`📦 ${logs.length - recentLogs.length} eski log temizlendi`);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('📦 Temizlik hatası:', error);
      return false;
    }
  }

  /**
   * Veri yükle
   */
  static load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`📦 Yükleme hatası (${key}):`, error);
      return null;
    }
  }

  /**
   * Tüm verileri dışa aktar
   */
  static exportAll() {
    const exportData = {
      version: this.CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      data: {}
    };

    Object.entries(this.KEYS).forEach(([name, key]) => {
      if (name !== 'VERSION') {
        exportData.data[key] = this.load(key);
      }
    });

    return exportData;
  }

  /**
   * Verileri içe aktar
   */
  static importAll(importData) {
    if (!importData || !importData.data) {
      throw new Error('Geçersiz içe aktarma verisi');
    }

    // Yedek al
    const backup = this.exportAll();

    try {
      Object.entries(importData.data).forEach(([key, value]) => {
        if (value !== null) {
          this.save(key, value);
        }
      });

      // Versiyon güncelle
      localStorage.setItem(this.KEYS.VERSION, this.CURRENT_VERSION);

      return true;
    } catch (error) {
      // Hata durumunda yedeği geri yükle
      console.error('📦 İçe aktarma hatası, yedek geri yükleniyor:', error);
      Object.entries(backup.data).forEach(([key, value]) => {
        if (value !== null) {
          this.save(key, value);
        }
      });
      throw error;
    }
  }

  /**
   * Belirli bir kategori verisini al
   */
  static getLifeManagerSettings() {
    return this.load(this.KEYS.LIFE_MANAGER);
  }

  /**
   * Ayarları güncelle
   */
  static updateSettings(newSettings) {
    const current = this.load(this.KEYS.LIFE_MANAGER) || {};
    current.settings = { ...current.settings, ...newSettings };
    return this.save(this.KEYS.LIFE_MANAGER, current);
  }

  /**
   * Kategori ayarlarını güncelle
   */
  static updateCategory(categoryId, updates) {
    const current = this.load(this.KEYS.LIFE_MANAGER) || {};
    if (current.categories && current.categories[categoryId]) {
      current.categories[categoryId] = {
        ...current.categories[categoryId],
        ...updates
      };
      return this.save(this.KEYS.LIFE_MANAGER, current);
    }
    return false;
  }
}

// Global erişim
window.DataManager = DataManager;

// Sayfa yüklendiğinde otomatik başlat
document.addEventListener('DOMContentLoaded', () => {
  DataManager.initialize();
});
