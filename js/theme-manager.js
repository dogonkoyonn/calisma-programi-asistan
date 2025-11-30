// ==================== THEME MANAGER ====================
// Dark/Light tema yönetimi

class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.init();
  }

  init() {
    // Sayfa yüklendiğinde temayı uygula
    this.applyTheme(this.currentTheme);

    // Toggle butonunu oluştur
    this.createToggleButton();

    console.log('🎨 Theme Manager yüklendi - Tema:', this.currentTheme);
  }

  /**
   * Kayıtlı temayı yükle
   */
  loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved;
    }
    // Varsayılan: light
    return 'light';
  }

  /**
   * Temayı kaydet
   */
  saveTheme(theme) {
    localStorage.setItem('theme', theme);
  }

  /**
   * Temayı uygula
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.saveTheme(theme);
    this.updateToggleButton();
  }

  /**
   * Tema değiştir
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);

    // Toast bildirimi
    if (window.programDashboard && window.programDashboard.showToast) {
      window.programDashboard.showToast(
        newTheme === 'dark' ? '🌙 Karanlık mod aktif' : '☀️ Aydınlık mod aktif',
        'info'
      );
    }
  }

  /**
   * Toggle butonunu oluştur
   */
  createToggleButton() {
    // Sidebar footer'a ekle (Ayarlar butonunun yanina)
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (!sidebarFooter) {
      // Sayfa yüklendikten sonra tekrar dene
      setTimeout(() => this.createToggleButton(), 500);
      return;
    }

    // Buton zaten varsa ekleme
    if (document.getElementById('themeToggleBtn')) return;

    const button = document.createElement('button');
    button.id = 'themeToggleBtn';
    button.className = 'sidebar-btn theme-toggle-btn';
    button.onclick = () => this.toggleTheme();
    button.innerHTML = `
      <span class="icon" id="themeIcon">${this.currentTheme === 'dark' ? '☀️' : '🌙'}</span>
      <span id="themeText">${this.currentTheme === 'dark' ? 'Aydinlik Mod' : 'Karanlik Mod'}</span>
    `;

    // Ayarlar butonunun yanina ekle
    const settingsBtn = sidebarFooter.querySelector('.sidebar-btn');
    if (settingsBtn) {
      settingsBtn.insertAdjacentElement('afterend', button);
    } else {
      sidebarFooter.insertBefore(button, sidebarFooter.firstChild);
    }
  }

  /**
   * Toggle butonunu güncelle
   */
  updateToggleButton() {
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');

    if (icon) {
      icon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
    }
    if (text) {
      text.textContent = this.currentTheme === 'dark' ? 'Aydinlik Mod' : 'Karanlik Mod';
    }
  }
}

// Global instance
const themeManager = new ThemeManager();
window.themeManager = themeManager;
