/**
 * Feedback Form Module
 * Kullanıcı geri bildirimlerini toplar ve gönderir
 * Google Forms + EmailJS entegrasyonu
 */

class FeedbackForm {
  constructor() {
    this.modal = null;
    this.config = this.loadConfig();
    this.init();
  }

  loadConfig() {
    const saved = localStorage.getItem('feedbackConfig');
    return saved ? JSON.parse(saved) : {
      googleFormsUrl: '',
      useEmailJS: true
    };
  }

  saveConfig(config) {
    this.config = { ...this.config, ...config };
    localStorage.setItem('feedbackConfig', JSON.stringify(this.config));
  }

  init() {
    this.createModal();
    this.addFeedbackButton();
    console.log('Feedback Form initialized');
  }

  createModal() {
    const modal = document.createElement('div');
    modal.id = 'feedbackModal';
    modal.className = 'feedback-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="feedback-overlay" onclick="feedbackForm.close()"></div>
      <div class="feedback-container">
        <div class="feedback-header">
          <h2>Geri Bildirim</h2>
          <button class="feedback-close" onclick="feedbackForm.close()">&times;</button>
        </div>
        <div class="feedback-body">
          <p class="feedback-intro">Uygulamayi nasil buldunuz? Geri bildiriminiz bizim icin cok degerli!</p>

          <form id="feedbackForm" onsubmit="feedbackForm.submit(event)">
            <div class="form-group">
              <label for="feedbackName">Isim (opsiyonel)</label>
              <input type="text" id="feedbackName" placeholder="Adiniz">
            </div>

            <div class="form-group">
              <label for="feedbackEmail">Email (opsiyonel)</label>
              <input type="email" id="feedbackEmail" placeholder="email@ornek.com">
            </div>

            <div class="form-group">
              <label>Degerlendirme</label>
              <div class="rating-container">
                <button type="button" class="rating-btn" data-rating="1" onclick="feedbackForm.setRating(1)">1</button>
                <button type="button" class="rating-btn" data-rating="2" onclick="feedbackForm.setRating(2)">2</button>
                <button type="button" class="rating-btn" data-rating="3" onclick="feedbackForm.setRating(3)">3</button>
                <button type="button" class="rating-btn" data-rating="4" onclick="feedbackForm.setRating(4)">4</button>
                <button type="button" class="rating-btn" data-rating="5" onclick="feedbackForm.setRating(5)">5</button>
              </div>
              <input type="hidden" id="feedbackRating" value="">
            </div>

            <div class="form-group">
              <label for="feedbackType">Geri Bildirim Turu</label>
              <select id="feedbackType">
                <option value="genel">Genel Yorum</option>
                <option value="oneri">Ozellik Onerisi</option>
                <option value="hata">Hata Bildirimi</option>
                <option value="sikayet">Sikayet</option>
                <option value="tesekkur">Tesekkur</option>
              </select>
            </div>

            <div class="form-group">
              <label for="feedbackMessage">Mesajiniz *</label>
              <textarea id="feedbackMessage" rows="5" placeholder="Dusuncelerinizi paylasin..." required></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" onclick="feedbackForm.close()">Iptal</button>
              <button type="submit" class="btn-primary">Gonder</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;
  }

  addFeedbackButton() {
    // Footer'a veya sidebar'a feedback butonu ekle
    const style = document.createElement('style');
    style.textContent = `
      .feedback-trigger {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--primary-gradient, linear-gradient(135deg, #667eea, #764ba2));
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
        z-index: 9998;
      }

      .feedback-trigger:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
      }

      /* Modal Styles */
      .feedback-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .feedback-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-overlay, rgba(0, 0, 0, 0.5));
      }

      .feedback-container {
        position: relative;
        background: var(--bg-card, white);
        border-radius: 20px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      }

      .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--border-color, #e0e0e0);
      }

      .feedback-header h2 {
        margin: 0;
        font-size: 20px;
        color: var(--text-primary, #1a1a1a);
      }

      .feedback-close {
        background: none;
        border: none;
        font-size: 28px;
        color: var(--text-secondary, #666);
        cursor: pointer;
        line-height: 1;
      }

      .feedback-body {
        padding: 24px;
        overflow-y: auto;
        max-height: calc(90vh - 80px);
      }

      .feedback-intro {
        color: var(--text-secondary, #666);
        margin-bottom: 20px;
        font-size: 14px;
      }

      .feedback-body .form-group {
        margin-bottom: 20px;
      }

      .feedback-body label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: var(--text-primary, #333);
        font-size: 14px;
      }

      .feedback-body input,
      .feedback-body select,
      .feedback-body textarea {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid var(--border-color, #e0e0e0);
        border-radius: 10px;
        font-size: 15px;
        transition: all 0.3s ease;
        background: var(--bg-card, white);
        color: var(--text-primary, #333);
        box-sizing: border-box;
      }

      .feedback-body input:focus,
      .feedback-body select:focus,
      .feedback-body textarea:focus {
        outline: none;
        border-color: var(--primary-color, #667eea);
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }

      .rating-container {
        display: flex;
        gap: 8px;
      }

      .rating-btn {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        border: 2px solid var(--border-color, #e0e0e0);
        background: var(--bg-tertiary, #f5f5f5);
        color: var(--text-primary, #333);
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .rating-btn:hover {
        border-color: var(--primary-color, #667eea);
        background: rgba(102, 126, 234, 0.1);
      }

      .rating-btn.active {
        background: var(--primary-gradient, linear-gradient(135deg, #667eea, #764ba2));
        border-color: transparent;
        color: white;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }

      .form-actions .btn-secondary,
      .form-actions .btn-primary {
        flex: 1;
        padding: 14px 24px;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .form-actions .btn-secondary {
        background: var(--bg-tertiary, #f5f5f5);
        border: 2px solid var(--border-color, #e0e0e0);
        color: var(--text-primary, #333);
      }

      .form-actions .btn-primary {
        background: var(--primary-gradient, linear-gradient(135deg, #667eea, #764ba2));
        border: none;
        color: white;
      }

      .form-actions .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Feedback butonu
    const btn = document.createElement('button');
    btn.className = 'feedback-trigger';
    btn.innerHTML = '💬';
    btn.title = 'Geri Bildirim Gonder';
    btn.onclick = () => this.open();
    document.body.appendChild(btn);
  }

  setRating(rating) {
    document.getElementById('feedbackRating').value = rating;

    // Button'ları güncelle
    document.querySelectorAll('.rating-btn').forEach(btn => {
      const btnRating = parseInt(btn.dataset.rating);
      btn.classList.toggle('active', btnRating <= rating);
    });
  }

  open() {
    if (this.modal) {
      this.modal.style.display = 'flex';
      this.resetForm();
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  resetForm() {
    document.getElementById('feedbackForm').reset();
    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  async submit(event) {
    event.preventDefault();

    const formData = {
      name: document.getElementById('feedbackName').value || 'Anonim',
      email: document.getElementById('feedbackEmail').value || 'Belirtilmemis',
      rating: document.getElementById('feedbackRating').value || 'Belirtilmemis',
      type: document.getElementById('feedbackType').value,
      message: document.getElementById('feedbackMessage').value,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Mesaj boş mu kontrol et
    if (!formData.message.trim()) {
      this.showToast('Lutfen mesajinizi yazin', 'error');
      return;
    }

    try {
      // EmailJS ile gönder
      if (this.config.useEmailJS && window.emailNotifier) {
        await this.sendViaEmailJS(formData);
      }

      // Google Forms'a gönder (eğer URL varsa)
      if (this.config.googleFormsUrl) {
        await this.sendViaGoogleForms(formData);
      }

      // Local'e de kaydet
      this.saveLocally(formData);

      this.showToast('Geri bildiriminiz gonderildi! Tesekkurler!', 'success');
      this.close();
    } catch (error) {
      console.error('Feedback gönderme hatası:', error);
      // Yine de local'e kaydet
      this.saveLocally(formData);
      this.showToast('Geri bildiriminiz kaydedildi (cevrimdisi mod)', 'info');
      this.close();
    }
  }

  async sendViaEmailJS(formData) {
    if (!window.emailNotifier || !window.emailNotifier.config.enabled) {
      console.log('EmailJS yapılandırılmamış, atlanıyor');
      return;
    }

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: `Feedback: ${formData.type} (${formData.rating}/5)`,
      message: `
Tur: ${formData.type}
Degerlendirme: ${formData.rating}/5
Tarih: ${new Date(formData.timestamp).toLocaleString('tr-TR')}

Mesaj:
${formData.message}

---
Browser: ${formData.userAgent}
URL: ${formData.url}
      `
    };

    try {
      await emailjs.send(
        window.emailNotifier.config.serviceId,
        window.emailNotifier.config.templateId,
        templateParams,
        window.emailNotifier.config.publicKey
      );
      console.log('Feedback EmailJS ile gönderildi');
    } catch (error) {
      console.error('EmailJS hatası:', error);
      throw error;
    }
  }

  async sendViaGoogleForms(formData) {
    // Google Forms URL'si varsa form submit et
    if (!this.config.googleFormsUrl) return;

    // Google Forms için özel entegrasyon gerekebilir
    console.log('Google Forms entegrasyonu yapılandırılmamış');
  }

  saveLocally(formData) {
    const feedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
    feedbacks.push(formData);
    localStorage.setItem('userFeedbacks', JSON.stringify(feedbacks));
    console.log('Feedback local olarak kaydedildi');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 12px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Global instance
const feedbackForm = new FeedbackForm();
window.feedbackForm = feedbackForm;

console.log('Feedback Form ready');
