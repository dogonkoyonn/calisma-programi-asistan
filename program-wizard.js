// Program Sihirbazı - Adım adım program oluşturma
// Kullanıcıyı yönlendiren, otomatik kaynak öneren sistem

class ProgramWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 5;
    this.wizardData = {
      subject: null,
      level: null,
      mode: null,
      schedule: {
        daysPerWeek: 5,
        hoursPerDay: 3,
        startDate: new Date().toISOString().split('T')[0],
        targetDate: null
      },
      resources: {
        youtube: [],
        books: []
      },
      topics: []
    };
  }

  /**
   * Sihirbazı başlat
   */
  start() {
    this.currentStep = 1;
    this.renderStep();
  }

  /**
   * İleri git
   */
  next() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.renderStep();
    }
  }

  /**
   * Geri git
   */
  back() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderStep();
    }
  }

  /**
   * Sihirbazı kapat
   */
  close() {
    const container = document.getElementById('wizardContainer');
    if (container) {
      container.style.display = 'none';
    }
  }

  /**
   * Mevcut adımı render et
   */
  renderStep() {
    const container = document.getElementById('wizardContainer');
    if (!container) return;

    let html = '<div class="wizard">';

    // Kapat butonu
    html += '<button class="wizard-close" onclick="wizard.close()">✕</button>';

    // Progress bar
    html += this.renderProgressBar();

    // Adıma göre içerik
    switch(this.currentStep) {
      case 1:
        html += this.renderStep1(); // Ders seçimi
        break;
      case 2:
        html += this.renderStep2(); // Seviye seçimi
        break;
      case 3:
        html += this.renderStep3(); // Çalışma modu
        break;
      case 4:
        html += this.renderStep4(); // Zaman planı
        break;
      case 5:
        html += this.renderStep5(); // Özet ve kaynak önerileri
        break;
    }

    // Navigation butonları
    html += this.renderNavigation();
    html += '</div>';

    container.innerHTML = html;
  }

  /**
   * Progress bar render
   */
  renderProgressBar() {
    const percentage = (this.currentStep / this.totalSteps) * 100;
    return `
      <div class="wizard-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <p class="progress-text">Adım ${this.currentStep}/${this.totalSteps}</p>
      </div>
    `;
  }

  /**
   * ADIM 1: Ders Seçimi
   */
  renderStep1() {
    const subjects = getAllSubjects();

    let html = `
      <div class="wizard-step">
        <h2>📚 Hangi ders için program hazırlayalım?</h2>
        <div class="subject-grid">
    `;

    subjects.forEach(subject => {
      const selected = this.wizardData.subject === subject.id ? 'selected' : '';
      html += `
        <div class="subject-card ${selected}" onclick="wizard.selectSubject('${subject.id}')">
          <span class="subject-icon">${subject.icon}</span>
          <span class="subject-name">${subject.name}</span>
        </div>
      `;
    });

    html += `
        </div>
        <div class="or-divider">
          <span>veya</span>
        </div>
        <div class="template-section">
          <h3>⚡ Hızlı Başlangıç - Hazır Şablonlar</h3>
          ${this.renderTemplates()}
        </div>
        <div class="or-divider">
          <span>veya</span>
        </div>
        <div class="bootcamp-section">
          <h3>🏕️ Sistematik Bootcamp Programları</h3>
          <p class="bootcamp-description">Profesyonel içerik üreticilerin hazırladığı, adım adım ilerleyen kapsamlı eğitim programları</p>
          ${this.renderBootcamps()}
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Hazır şablonları göster
   */
  renderTemplates() {
    const templates = RESOURCES_DB.templates;
    let html = '<div class="template-list">';

    for (const [key, template] of Object.entries(templates)) {
      html += `
        <div class="template-card" onclick="wizard.useTemplate('${key}')">
          <h4>${template.name}</h4>
          <p>${template.description}</p>
          <div class="template-info">
            <span>⏱️ ${template.duration} gün</span>
            <span>📅 ${template.daysPerWeek} gün/hafta</span>
            <span>🕐 ${template.hoursPerDay} saat/gün</span>
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  /**
   * Bootcamp programlarını göster
   */
  renderBootcamps() {
    const bootcamps = getAllBootcamps();
    let html = '<div class="bootcamp-list">';

    bootcamps.forEach(bootcamp => {
      html += `
        <div class="bootcamp-card" onclick="wizard.useBootcamp('${bootcamp.id}')">
          <div class="bootcamp-badge">🏕️ BOOTCAMP</div>
          <div class="bootcamp-header">
            <h4>${bootcamp.name}</h4>
            <span class="bootcamp-provider">👨‍🏫 ${bootcamp.provider}</span>
          </div>
          <p class="bootcamp-desc">${bootcamp.description}</p>
          <div class="bootcamp-info">
            <span>⏱️ ${bootcamp.totalHours} saat</span>
            <span>📅 ${bootcamp.weeks} hafta</span>
            <span>📚 ${bootcamp.topics.length} konu</span>
            ${bootcamp.systematic ? '<span class="systematic-badge">⭐ Sistematik</span>' : ''}
          </div>
          ${bootcamp.features ? `
            <div class="bootcamp-features">
              ${bootcamp.features.map(f => `<span class="feature-tag">✓ ${f}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  /**
   * ADIM 2: Seviye Seçimi
   */
  renderStep2() {
    const levels = [
      { id: 'temel', name: 'Temel', icon: '🌱', desc: 'Sıfırdan başlıyorum, temelden anlatılsın' },
      { id: 'orta', name: 'Orta', icon: '📚', desc: 'Temel bilgim var, pekiştirme istiyorum' },
      { id: 'ileri', name: 'İleri', icon: '🚀', desc: 'Zorlu sorular çözmek istiyorum' }
    ];

    let html = `
      <div class="wizard-step">
        <h2>📊 Seviyeni nasıl tanımlarsın?</h2>
        <div class="level-grid">
    `;

    levels.forEach(level => {
      const selected = this.wizardData.level === level.id ? 'selected' : '';
      html += `
        <div class="level-card ${selected}" onclick="wizard.selectLevel('${level.id}')">
          <span class="level-icon">${level.icon}</span>
          <h3>${level.name}</h3>
          <p>${level.desc}</p>
        </div>
      `;
    });

    html += '</div></div>';
    return html;
  }

  /**
   * ADIM 3: Çalışma Modu
   */
  renderStep3() {
    const modes = RESOURCES_DB.studyModes;

    let html = `
      <div class="wizard-step">
        <h2>⚡ Çalışma tempon nasıl olsun?</h2>
        <div class="mode-grid">
    `;

    for (const [key, mode] of Object.entries(modes)) {
      const selected = this.wizardData.mode === key ? 'selected' : '';
      html += `
        <div class="mode-card ${selected}" onclick="wizard.selectMode('${key}')">
          <span class="mode-icon">${mode.icon}</span>
          <h3>${mode.name}</h3>
          <p>${mode.description}</p>
          <div class="mode-details">
            <span>🍅 Pomodoro: ${mode.pomodoro.work}dk / ${mode.pomodoro.break}dk</span>
            <span>⏰ Günlük: ${mode.dailyHours[0]}-${mode.dailyHours[1]} saat</span>
            <span>📈 Yoğunluk: ${mode.intensity}</span>
          </div>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  /**
   * ADIM 4: Zaman Planı
   */
  renderStep4() {
    const schedule = this.wizardData.schedule;

    return `
      <div class="wizard-step">
        <h2>📅 Zaman planını ayarla</h2>
        <div class="schedule-form">

          <div class="form-group">
            <label>Haftada kaç gün çalışabilirsin?</label>
            <input type="range" min="1" max="7" value="${schedule.daysPerWeek}"
                   oninput="wizard.updateSchedule('daysPerWeek', this.value)">
            <span class="range-value">${schedule.daysPerWeek} gün</span>
          </div>

          <div class="form-group">
            <label>Günde kaç saat ayırabilirsin?</label>
            <input type="range" min="1" max="12" value="${schedule.hoursPerDay}"
                   oninput="wizard.updateSchedule('hoursPerDay', this.value)">
            <span class="range-value">${schedule.hoursPerDay} saat</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Başlangıç Tarihi</label>
              <input type="date" value="${schedule.startDate}"
                     onchange="wizard.updateSchedule('startDate', this.value)">
            </div>

            <div class="form-group">
              <label>Hedef Tarih (Opsiyonel)</label>
              <input type="date" value="${schedule.targetDate || ''}"
                     onchange="wizard.updateSchedule('targetDate', this.value)">
            </div>
          </div>

          ${this.renderTimeEstimate()}

        </div>
      </div>
    `;
  }

  /**
   * Zaman tahmini göster
   */
  renderTimeEstimate() {
    const { startDate, targetDate, daysPerWeek, hoursPerDay } = this.wizardData.schedule;

    if (!targetDate) {
      return '<div class="info-box">💡 Hedef tarih eklerseniz size özel tempo hesaplayalım!</div>';
    }

    const start = new Date(startDate);
    const end = new Date(targetDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return '<div class="warning-box">⚠️ Hedef tarih başlangıçtan sonra olmalı!</div>';
    }

    const totalWeeks = Math.floor(diffDays / 7);
    const totalStudyDays = totalWeeks * daysPerWeek;
    const totalHours = totalStudyDays * hoursPerDay;

    return `
      <div class="time-estimate">
        <h4>📊 Çalışma Tahmini</h4>
        <div class="estimate-grid">
          <div class="estimate-item">
            <span class="estimate-value">${diffDays}</span>
            <span class="estimate-label">Gün Kaldı</span>
          </div>
          <div class="estimate-item">
            <span class="estimate-value">${totalStudyDays}</span>
            <span class="estimate-label">Çalışma Günü</span>
          </div>
          <div class="estimate-item">
            <span class="estimate-value">${totalHours}</span>
            <span class="estimate-label">Toplam Saat</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * ADIM 5: Özet ve Kaynaklar
   */
  renderStep5() {
    // Otomatik kaynak önerileri al
    this.suggestResources();

    const subjectName = RESOURCES_DB.subjects[this.wizardData.subject]?.name || 'Seçili Ders';
    const levelName = this.wizardData.level === 'temel' ? 'Temel' : this.wizardData.level === 'orta' ? 'Orta' : 'İleri';
    const modeName = RESOURCES_DB.studyModes[this.wizardData.mode]?.name || '';

    let html = `
      <div class="wizard-step wizard-summary">
        <h2>✅ Program Hazır!</h2>

        <div class="summary-card">
          <h3>📋 Program Özeti</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Ders:</span>
              <span class="summary-value">${subjectName}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Seviye:</span>
              <span class="summary-value">${levelName}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Mod:</span>
              <span class="summary-value">${modeName}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Haftalık:</span>
              <span class="summary-value">${this.wizardData.schedule.daysPerWeek} gün</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Günlük:</span>
              <span class="summary-value">${this.wizardData.schedule.hoursPerDay} saat</span>
            </div>
          </div>
        </div>

        <div class="resources-card">
          <h3>🎥 Önerilen YouTube Kanalları</h3>
          <div class="resources-list">
    `;

    this.wizardData.resources.youtube.forEach(channel => {
      html += `
        <div class="resource-item">
          <div class="resource-info">
            <a href="${channel.url}" target="_blank" class="resource-name">${channel.name}</a>
            <p class="resource-desc">${channel.description}</p>
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>

        <div class="resources-card">
          <h3>📖 Önerilen Kitaplar</h3>
          <div class="resources-list">
    `;

    this.wizardData.resources.books.forEach(book => {
      html += `
        <div class="resource-item">
          <div class="resource-info">
            <span class="resource-name">${book.name}</span>
            <p class="resource-desc">${book.description}</p>
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>

        <button class="btn-finish btn-large" onclick="wizard.createProgram()">
          🚀 Programı Oluştur
        </button>
      </div>
    `;

    return html;
  }

  /**
   * Navigation butonları
   */
  renderNavigation() {
    const backDisabled = this.currentStep === 1 ? 'disabled' : '';
    const nextDisabled = this.currentStep === this.totalSteps || !this.canProceed() ? 'disabled' : '';

    if (this.currentStep === this.totalSteps) {
      return ''; // Son adımda navigation yok
    }

    return `
      <div class="wizard-nav">
        <button class="btn-prev" onclick="wizard.back()" ${backDisabled}>
          ← Geri
        </button>
        <button class="btn-next" onclick="wizard.next()" ${nextDisabled}>
          İleri →
        </button>
      </div>
    `;
  }

  /**
   * İlerleyebilir mi kontrol et
   */
  canProceed() {
    switch(this.currentStep) {
      case 1:
        return this.wizardData.subject !== null;
      case 2:
        return this.wizardData.level !== null;
      case 3:
        return this.wizardData.mode !== null;
      case 4:
        return true; // Zaman planı her zaman valid
      default:
        return true;
    }
  }

  // ===== USER ACTIONS =====

  selectSubject(subjectId) {
    this.wizardData.subject = subjectId;
    this.renderStep();
  }

  selectLevel(levelId) {
    this.wizardData.level = levelId;
    this.renderStep();
  }

  selectMode(modeId) {
    this.wizardData.mode = modeId;
    this.renderStep();
  }

  updateSchedule(field, value) {
    this.wizardData.schedule[field] = value;
    this.renderStep();
  }

  /**
   * Hazır şablon kullan
   */
  useTemplate(templateId) {
    const template = getTemplate(templateId);
    if (!template) return;

    // Şablon verilerini wizard'a aktar
    if (template.subject) this.wizardData.subject = template.subject;
    this.wizardData.level = template.level;
    this.wizardData.mode = template.mode;
    this.wizardData.schedule.daysPerWeek = template.daysPerWeek;
    this.wizardData.schedule.hoursPerDay = template.hoursPerDay;
    this.wizardData.topics = [...template.topics];

    // Direkt son adıma git
    this.currentStep = this.totalSteps;
    this.renderStep();
  }

  /**
   * Bootcamp kullan
   */
  useBootcamp(bootcampId) {
    const bootcamp = getBootcamp(bootcampId);
    if (!bootcamp) return;

    // Bootcamp verilerini wizard'a aktar
    this.wizardData.subject = bootcamp.subject;
    this.wizardData.level = bootcamp.difficulty || 'orta';
    this.wizardData.mode = 'yoğun'; // Bootcamp'ler genelde yoğun
    this.wizardData.schedule.daysPerWeek = bootcamp.daysPerWeek || 5;
    this.wizardData.schedule.hoursPerDay = bootcamp.hoursPerDay || 4;
    this.wizardData.bootcampId = bootcamp.id; // Bootcamp olduğunu işaretle

    // Konuları ekle
    this.wizardData.topics = bootcamp.topics.map(topic => ({
      name: topic,
      completed: false
    }));

    // Program adı
    this.wizardData.programName = bootcamp.name;

    // Direkt son adıma git
    this.currentStep = this.totalSteps;
    this.renderStep();
  }

  /**
   * Otomatik kaynak önerisi
   */
  suggestResources() {
    const { subject, level } = this.wizardData;
    if (!subject || !level) return;

    const resources = getResourcesByLevel(subject, level);
    this.wizardData.resources = resources;
  }

  /**
   * Programı oluştur ve kaydet
   */
  createProgram() {
    // Güvenlik kontrolü
    if (!this.wizardData.subject || !RESOURCES_DB.subjects[this.wizardData.subject]) {
      console.error('❌ Konu seçimi eksik veya geçersiz');
      alert('Lütfen bir konu seçin!');
      return;
    }

    const programData = {
      id: Date.now().toString(),
      name: `${RESOURCES_DB.subjects[this.wizardData.subject].name} Programı`,
      subject: RESOURCES_DB.subjects[this.wizardData.subject].name,
      level: this.wizardData.level,
      mode: this.wizardData.mode,
      daysPerWeek: this.wizardData.schedule.daysPerWeek,
      hoursPerDay: this.wizardData.schedule.hoursPerDay,
      startDate: this.wizardData.schedule.startDate,
      targetDate: this.wizardData.schedule.targetDate,
      resources: this.wizardData.resources,
      topics: this.wizardData.topics.map(topic => ({
        name: typeof topic === 'string' ? topic : topic.name,
        duration: 60, // default 60dk
        completed: false
      })),
      createdAt: new Date().toISOString(),
      // Faz 1: Yeni alanlar
      status: 'active', // 'active', 'completed', 'paused'
      completedTopics: [],
      lastActivity: new Date().toISOString(),
      sessions: [],
      stats: {
        totalMinutes: 0,
        completedCount: 0,
        streakDays: 0,
        lastStudyDate: null
      }
    };

    // StudyProgramManager'a kaydet (app.js'deki programManager)
    if (window.app && window.app.programManager) {
      window.app.programManager.createProgram(
        programData.name,
        programData.subject,
        programData.daysPerWeek,
        programData.hoursPerDay,
        programData.resources,
        { topic: 70, practice: 30 } // %70 konu, %30 pratik
      );

      // İstatistikleri güncelle
      window.app.updateSidebarStats();

      // Program panelini göster
      window.app.showProgramPanel();
    }

    // Wizard'ı kapat
    this.close();
  }

  /**
   * Sihirbazı kapat
   */
  close() {
    const container = document.getElementById('wizardContainer');
    if (container) {
      container.style.display = 'none';
    }
    // Reset wizard data
    this.currentStep = 1;
    this.wizardData = {
      subject: null,
      level: null,
      mode: null,
      schedule: {
        daysPerWeek: 5,
        hoursPerDay: 3,
        startDate: new Date().toISOString().split('T')[0],
        targetDate: null
      },
      resources: {
        youtube: [],
        books: []
      },
      topics: []
    };
  }
}

// Global wizard instance
const wizard = new ProgramWizard();

// Wizard container'a tıklanınca kapat (arka plana tıklama)
document.addEventListener('DOMContentLoaded', () => {
  const wizardContainer = document.getElementById('wizardContainer');
  if (wizardContainer) {
    wizardContainer.addEventListener('click', (e) => {
      // Sadece arka plana tıklanırsa kapat
      if (e.target === wizardContainer) {
        wizard.close();
      }
    });
  }
});
