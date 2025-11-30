/**
 * Loading Spinner Manager
 * Sayfa yüklenirken spinner gösterir
 */

class LoadingSpinner {
  constructor() {
    this.overlay = null;
    this.init();
  }

  init() {
    // Loading overlay oluştur
    this.createOverlay();

    // Sayfa yüklendiğinde gizle
    if (document.readyState === 'complete') {
      this.hide();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.hide(), 300);
      });
    }
  }

  createOverlay() {
    // Zaten varsa tekrar oluşturma
    if (document.getElementById('loadingOverlay')) {
      this.overlay = document.getElementById('loadingOverlay');
      return;
    }

    this.overlay = document.createElement('div');
    this.overlay.id = 'loadingOverlay';
    this.overlay.className = 'loading-overlay';
    this.overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">Yükleniyor...</div>
      </div>
    `;

    document.body.insertBefore(this.overlay, document.body.firstChild);
  }

  show(text = 'Yükleniyor...') {
    if (!this.overlay) {
      this.createOverlay();
    }

    const textEl = this.overlay.querySelector('.loading-text');
    if (textEl) {
      textEl.textContent = text;
    }

    this.overlay.classList.remove('hidden');
  }

  hide() {
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
  }

  // Belirli bir işlem için spinner göster
  async withSpinner(asyncFn, loadingText = 'Yükleniyor...') {
    this.show(loadingText);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setTimeout(() => this.hide(), 200);
    }
  }
}

// Hemen başlat
const loadingSpinner = new LoadingSpinner();
window.loadingSpinner = loadingSpinner;

console.log('Loading Spinner initialized');
