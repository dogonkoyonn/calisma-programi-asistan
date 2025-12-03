// ==================== CATEGORY MANAGER ====================
// Kategori sistemi yönetimi

class CategoryManager {
  constructor() {
    this.categories = this.loadCategories();
    this.activeCategory = 'home';
    this.listeners = [];
  }

  /**
   * Kategorileri yükle
   */
  loadCategories() {
    const lifeManagerData = DataManager.load(DataManager.KEYS.LIFE_MANAGER);
    return lifeManagerData?.categories || this.getDefaultCategories();
  }

  /**
   * Varsayılan kategoriler
   */
  getDefaultCategories() {
    return {
      study: { enabled: true, color: '#667eea', name: 'Çalışma', icon: '📚' },
      personal: { enabled: true, color: '#4ECDC4', name: 'Kişisel', icon: '✅' },
      health: { enabled: true, color: '#FF6B6B', name: 'Sağlık', icon: '💊' },
      expenses: { enabled: true, color: '#95E1D3', name: 'Harcamalar', icon: '💰' }
    };
  }

  /**
   * Tüm kategorileri al
   */
  getAll() {
    return this.categories;
  }

  /**
   * Aktif kategorileri al
   */
  getEnabled() {
    return Object.entries(this.categories)
      .filter(([_, cat]) => cat.enabled)
      .reduce((acc, [key, cat]) => {
        acc[key] = cat;
        return acc;
      }, {});
  }

  /**
   * Belirli bir kategori al
   */
  get(categoryId) {
    return this.categories[categoryId] || null;
  }

  /**
   * Kategori rengini al
   */
  getColor(categoryId) {
    return this.categories[categoryId]?.color || '#667eea';
  }

  /**
   * Kategori ikonunu al
   */
  getIcon(categoryId) {
    return this.categories[categoryId]?.icon || '📁';
  }

  /**
   * Kategori adını al
   */
  getName(categoryId) {
    return this.categories[categoryId]?.name || categoryId;
  }

  /**
   * Aktif kategoriyi değiştir
   */
  setActive(categoryId) {
    this.activeCategory = categoryId;
    this.notifyListeners('categoryChange', categoryId);
    this.updateUI();
  }

  /**
   * Aktif kategoriyi al
   */
  getActive() {
    return this.activeCategory;
  }

  /**
   * Kategori güncelle
   */
  update(categoryId, updates) {
    if (this.categories[categoryId]) {
      this.categories[categoryId] = {
        ...this.categories[categoryId],
        ...updates
      };
      this.save();
      this.notifyListeners('categoryUpdate', { id: categoryId, ...updates });
    }
  }

  /**
   * Kategori etkinliğini değiştir
   */
  toggleEnabled(categoryId) {
    if (this.categories[categoryId]) {
      this.categories[categoryId].enabled = !this.categories[categoryId].enabled;
      this.save();
      this.notifyListeners('categoryToggle', categoryId);
    }
  }

  /**
   * Kaydet
   */
  save() {
    const lifeManagerData = DataManager.load(DataManager.KEYS.LIFE_MANAGER) || {};
    lifeManagerData.categories = this.categories;
    DataManager.save(DataManager.KEYS.LIFE_MANAGER, lifeManagerData);
  }

  /**
   * Listener ekle
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Listener kaldır
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * Listener'ları bilgilendir
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('CategoryManager listener hatası:', error);
      }
    });
  }

  /**
   * UI'ı güncelle (navigasyon butonları)
   */
  updateUI() {
    // Navigasyon butonlarını güncelle
    document.querySelectorAll('.nav-item').forEach(btn => {
      const category = btn.dataset.category;
      if (category === this.activeCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // İçerik alanını güncelle
    this.updateContent();
  }

  /**
   * İçerik alanını kategori'ye göre güncelle
   */
  updateContent() {
    const mainContent = document.querySelector('.content-area');
    if (!mainContent) return;

    // Tüm kategoriye özel içerikleri gizle
    document.querySelectorAll('.category-content').forEach(el => {
      el.style.display = 'none';
    });

    // Aktif kategori içeriğini göster
    const activeContent = document.getElementById(`content-${this.activeCategory}`);
    if (activeContent) {
      activeContent.style.display = 'block';
    }

    // Kategori değişikliği olayını tetikle
    document.dispatchEvent(new CustomEvent('categoryChanged', {
      detail: { category: this.activeCategory }
    }));
  }

  /**
   * Kategori için badge sayısını al (bekleyen görev sayısı)
   */
  getBadgeCount(categoryId) {
    switch (categoryId) {
      case 'study':
        return this.getStudyBadgeCount();
      case 'personal':
        return this.getTodoBadgeCount();
      case 'health':
        return this.getHealthBadgeCount();
      case 'expenses':
        return 0; // Harcamalar için badge yok
      default:
        return 0;
    }
  }

  /**
   * Çalışma kategorisi badge sayısı
   */
  getStudyBadgeCount() {
    const programs = DataManager.load(DataManager.KEYS.STUDY_PROGRAMS) || [];
    // Bugün yapılması gereken tamamlanmamış konular
    let count = 0;
    programs.forEach(program => {
      if (program.topics) {
        count += program.topics.filter(t => !t.completed).length;
      }
    });
    return Math.min(count, 99);
  }

  /**
   * TODO badge sayısı
   */
  getTodoBadgeCount() {
    const todoData = DataManager.load(DataManager.KEYS.TODO_ITEMS);
    if (!todoData || !todoData.items) return 0;

    const today = new Date().toISOString().split('T')[0];
    return todoData.items.filter(item =>
      !item.completed &&
      (!item.dueDate || item.dueDate <= today)
    ).length;
  }

  /**
   * Sağlık badge sayısı
   */
  getHealthBadgeCount() {
    const healthData = DataManager.load(DataManager.KEYS.HEALTH_TRACKING);
    if (!healthData || !healthData.medications) return 0;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = now.toISOString().split('T')[0];
    const dayNames = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'];
    const todayName = dayNames[now.getDay()];

    let count = 0;
    healthData.medications.forEach(med => {
      if (!med.active) return;
      if (med.days && !med.days.includes(todayName)) return;

      med.times.forEach(time => {
        // Bu saatte alınmamışsa say
        const taken = med.history?.some(h =>
          h.date === today && h.time === time && h.taken
        );
        if (!taken && time <= currentTime) {
          count++;
        }
      });
    });

    return Math.min(count, 99);
  }

  /**
   * Badge'leri güncelle
   */
  updateBadges() {
    Object.keys(this.categories).forEach(categoryId => {
      const badge = document.querySelector(`.nav-item[data-category="${categoryId}"] .badge`);
      if (badge) {
        const count = this.getBadgeCount(categoryId);
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
    });
  }

  /**
   * Navigasyon HTML'i oluştur
   */
  renderNavigation() {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    let html = `
      <button class="nav-item ${this.activeCategory === 'home' ? 'active' : ''}" data-category="home">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">Ana Sayfa</span>
      </button>
    `;

    Object.entries(this.getEnabled()).forEach(([id, cat]) => {
      const badgeCount = this.getBadgeCount(id);
      html += `
        <button class="nav-item ${this.activeCategory === id ? 'active' : ''}" data-category="${id}">
          <span class="nav-icon">${cat.icon}</span>
          <span class="nav-text">${cat.name}</span>
          <span class="badge" style="display: ${badgeCount > 0 ? 'flex' : 'none'}; background: ${cat.color}">${badgeCount}</span>
        </button>
      `;
    });

    nav.innerHTML = html;

    // Event listener'ları ekle
    nav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActive(btn.dataset.category);
      });
    });
  }
}

// Global instance
const categoryManager = new CategoryManager();
window.categoryManager = categoryManager;

// Periyodik badge güncelleme (her 30 saniye)
setInterval(() => {
  categoryManager.updateBadges();
}, 30000);
