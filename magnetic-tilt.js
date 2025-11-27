// ==================== 3D MAGNETIC TILT EFFECT ====================
// Fareyi takip eden, kartın eğildiği interaktif animasyon

class MagneticTilt {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      max: options.max || 15, // Maksimum eğim açısı (derece)
      perspective: options.perspective || 1000, // Perspektif derinliği
      scale: options.scale || 1.05, // Hover'da büyütme
      speed: options.speed || 400, // Animasyon hızı (ms)
      easing: options.easing || 'cubic-bezier(0.03, 0.98, 0.52, 0.99)',
      glare: options.glare || false, // Işık yansıması efekti
      maxGlare: options.maxGlare || 0.3, // Maksimum parlaklık
      gyroscope: options.gyroscope || false, // Mobil gyroscope desteği
      reset: options.reset !== false, // Mouse çıkınca reset
    };

    this.width = null;
    this.height = null;
    this.left = null;
    this.top = null;

    this.transitionTimeout = null;
    this.updateBind = this.update.bind(this);
    this.resetBind = this.reset.bind(this);

    this.init();
  }

  init() {
    // Perspective ayarla
    this.element.style.transformStyle = 'preserve-3d';
    this.element.style.willChange = 'transform';

    // Event listeners ekle
    this.addEventListeners();

    // İlk pozisyonu kaydet
    this.updateElementPosition();
  }

  addEventListeners() {
    // Mouse events
    this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this));

    // Touch events (mobil)
    this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.onTouchEnd.bind(this));

    // Window resize
    window.addEventListener('resize', this.updateElementPosition.bind(this));
  }

  updateElementPosition() {
    const rect = this.element.getBoundingClientRect();
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
    this.left = rect.left;
    this.top = rect.top;
  }

  onMouseEnter() {
    this.updateElementPosition();
    this.element.style.willChange = 'transform';
  }

  onMouseMove(event) {
    requestAnimationFrame(() => {
      this.updateElementPosition();
      const values = this.getValues(event);
      this.update(values);
    });
  }

  onMouseLeave() {
    if (this.options.reset) {
      requestAnimationFrame(() => {
        this.reset();
      });
    }
  }

  onTouchStart(event) {
    this.updateElementPosition();
    this.element.style.willChange = 'transform';
  }

  onTouchMove(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      requestAnimationFrame(() => {
        const values = this.getValues(touch);
        this.update(values);
      });
    }
  }

  onTouchEnd() {
    if (this.options.reset) {
      requestAnimationFrame(() => {
        this.reset();
      });
    }
  }

  getValues(event) {
    // Fare/parmak pozisyonunu kartın merkezine göre hesapla
    const x = (event.clientX - this.left) / this.width;
    const y = (event.clientY - this.top) / this.height;

    // -1 ile 1 arasında normalize et
    const _x = Math.min(Math.max(x, 0), 1);
    const _y = Math.min(Math.max(y, 0), 1);

    // Eğim açılarını hesapla
    // X ekseni: sağ-sol (rotateY)
    // Y ekseni: yukarı-aşağı (rotateX)
    const tiltX = (this.options.max / 2 - _x * this.options.max).toFixed(2);
    const tiltY = (_y * this.options.max - this.options.max / 2).toFixed(2);

    // Yüzde olarak pozisyon (light efekti için)
    const percentageX = _x * 100;
    const percentageY = _y * 100;

    return {
      tiltX,
      tiltY,
      percentageX,
      percentageY,
      angle: Math.atan2(_x - 0.5, _y - 0.5) * (180 / Math.PI),
    };
  }

  update(values) {
    // Transform uygula
    this.element.style.transform = `
      perspective(${this.options.perspective}px)
      rotateX(${values.tiltY}deg)
      rotateY(${values.tiltX}deg)
      scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
    `;

    // Işık efekti için CSS değişkenleri güncelle
    this.element.style.setProperty('--mouse-x', `${values.percentageX}%`);
    this.element.style.setProperty('--mouse-y', `${values.percentageY}%`);

    // Glare efekti varsa
    if (this.options.glare) {
      const glareElement = this.element.querySelector('.tilt-glare-inner');
      if (glareElement) {
        const glareOpacity = values.percentageX * this.options.maxGlare / 100;
        glareElement.style.opacity = glareOpacity;
      }
    }
  }

  reset() {
    this.element.style.transform = `
      perspective(${this.options.perspective}px)
      rotateX(0deg)
      rotateY(0deg)
      scale3d(1, 1, 1)
    `;

    // Işık efektini sıfırla
    this.element.style.setProperty('--mouse-x', '50%');
    this.element.style.setProperty('--mouse-y', '50%');

    // willChange'i temizle (performans)
    setTimeout(() => {
      this.element.style.willChange = 'auto';
    }, this.options.speed);
  }

  destroy() {
    // Event listeners'ı temizle
    this.element.removeEventListener('mouseenter', this.onMouseEnter);
    this.element.removeEventListener('mousemove', this.onMouseMove);
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('touchstart', this.onTouchStart);
    this.element.removeEventListener('touchmove', this.onTouchMove);
    this.element.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('resize', this.updateElementPosition);

    // Stilleri sıfırla
    this.reset();
    this.element.style.transformStyle = '';
    this.element.style.willChange = '';
  }
}

// ==================== AUTO-INIT UTILITY ====================
// Sayfa yüklendiğinde belirli class'lara otomatik uygula

function initMagneticTilt() {
  // Feature kartları (güçlü efekt)
  document.querySelectorAll('.feature-item').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-strong');
      el.tiltInstance = new MagneticTilt(el, {
        max: 15,
        scale: 1.05,
        glare: true,
      });
    }
  });

  // Wizard kartları (orta efekt)
  document.querySelectorAll('.subject-card, .level-card, .mode-card').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-medium');
      el.tiltInstance = new MagneticTilt(el, {
        max: 10,
        scale: 1.03,
      });
    }
  });

  // Şablon kartları (orta efekt)
  document.querySelectorAll('.template-card').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-medium');
      el.tiltInstance = new MagneticTilt(el, {
        max: 10,
        scale: 1.03,
      });
    }
  });

  // Program kartları (orta efekt)
  document.querySelectorAll('.program-card').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-medium');
      el.tiltInstance = new MagneticTilt(el, {
        max: 10,
        scale: 1.03,
      });
    }
  });

  // Subject badges (hafif efekt)
  document.querySelectorAll('.subject-badge').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-light');
      el.tiltInstance = new MagneticTilt(el, {
        max: 5,
        scale: 1.02,
      });
    }
  });

  // Welcome butonları (güçlü efekt)
  document.querySelectorAll('.welcome-btn').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-strong');
      el.tiltInstance = new MagneticTilt(el, {
        max: 8,
        scale: 1.03,
        glare: true,
      });
    }
  });

  // Sidebar butonları (hafif efekt)
  document.querySelectorAll('.sidebar-btn').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-light');
      el.tiltInstance = new MagneticTilt(el, {
        max: 6,
        scale: 1.02,
      });
    }
  });

  // Action butonları (orta-güçlü efekt)
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-danger-small').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-medium');
      el.tiltInstance = new MagneticTilt(el, {
        max: 10,
        scale: 1.05,
      });
    }
  });

  // Wizard navigation butonları (orta efekt)
  document.querySelectorAll('.btn-next, .btn-prev, .btn-finish, .btn-back').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-medium');
      el.tiltInstance = new MagneticTilt(el, {
        max: 8,
        scale: 1.03,
      });
    }
  });

  // Bootcamp kartları (güçlü efekt - yeni eklendi)
  document.querySelectorAll('.bootcamp-card').forEach(el => {
    if (!el.tiltInstance) {
      el.classList.add('tilt-card', 'tilt-strong');
      el.tiltInstance = new MagneticTilt(el, {
        max: 12,
        scale: 1.04,
        glare: true,
      });
    }
  });
}

// Sayfa yüklendiğinde ve wizard render edildiğinde çalıştır
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMagneticTilt);
} else {
  initMagneticTilt();
}

// Wizard render edildiğinde yeniden init
const originalRenderStep = window.wizard?.renderStep;
if (originalRenderStep) {
  window.wizard.renderStep = function(...args) {
    const result = originalRenderStep.apply(this, args);
    setTimeout(initMagneticTilt, 100); // Render tamamlandıktan sonra
    return result;
  };
}

// Export (modül olarak kullanılırsa)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MagneticTilt;
}
