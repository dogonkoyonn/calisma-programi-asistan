// ==================== SEANS YÖNETİMİ ====================
// Çalışma seansı başlatma, bitirme ve takip sistemi

class SessionManager {
  constructor() {
    this.activeSessionId = null;
    this.timerInterval = null;
    this.startTime = null;
    this.pomodoroMode = false;
    this.workDuration = 25; // dakika
    this.breakDuration = 5; // dakika
  }

  // ==================== MODAL YÖNETİMİ ====================

  /**
   * Seans başlatma modalını aç
   */
  openStartModal() {
    const programs = this.getPrograms();

    if (programs.length === 0) {
      this.showToast('Henüz program oluşturmadınız!', 'warning');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'sessionStartModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="session-modal">
        <div class="modal-header">
          <h2>🎯 Çalışma Seansı Başlat</h2>
          <button class="modal-close" onclick="sessionManager.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>📚 Program Seç:</label>
            <select id="sessionProgram" onchange="sessionManager.updateTopics()">
              <option value="">-- Program Seçin --</option>
              ${programs.map(p => `
                <option value="${p.id}">${p.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>📝 Konu Seç:</label>
            <select id="sessionTopic">
              <option value="">-- Önce program seçin --</option>
            </select>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" id="pomodoroCheck" onchange="sessionManager.togglePomodoro(this.checked)">
              🍅 Pomodoro modu kullan
            </label>
          </div>

          <div id="pomodoroSettings" style="display: none;">
            <div class="form-row">
              <div class="form-group">
                <label>⏰ Çalışma süresi (dk):</label>
                <input type="number" id="workDuration" value="25" min="5" max="60">
              </div>
              <div class="form-group">
                <label>☕ Mola süresi (dk):</label>
                <input type="number" id="breakDuration" value="5" min="1" max="30">
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="sessionManager.closeModal()">İptal</button>
          <button class="btn-primary" onclick="sessionManager.startSession()">▶️ Başlat</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Modalı kapat
   */
  closeModal() {
    const modal = document.getElementById('sessionStartModal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Konuları güncelle (program seçimine göre)
   */
  updateTopics() {
    const programSelect = document.getElementById('sessionProgram');
    const topicSelect = document.getElementById('sessionTopic');

    if (!programSelect || !topicSelect) return;

    const programId = programSelect.value;
    if (!programId) {
      topicSelect.innerHTML = '<option value="">-- Önce program seçin --</option>';
      return;
    }

    const program = this.getPrograms().find(p => p.id === programId);
    if (!program || !program.topics) {
      topicSelect.innerHTML = '<option value="">-- Konu bulunamadı --</option>';
      return;
    }

    topicSelect.innerHTML = '<option value="">-- Konu Seçin --</option>';
    program.topics.forEach((topic, index) => {
      const completed = topic.completed ? '✅' : '⬜';
      topicSelect.innerHTML += `<option value="${index}">${completed} ${topic.name}</option>`;
    });
  }

  /**
   * Pomodoro modu toggle
   */
  togglePomodoro(enabled) {
    const settings = document.getElementById('pomodoroSettings');
    if (settings) {
      settings.style.display = enabled ? 'block' : 'none';
    }
    this.pomodoroMode = enabled;
  }

  // ==================== SEANS YÖNETİMİ ====================

  /**
   * Seansı başlat
   */
  startSession() {
    const programSelect = document.getElementById('sessionProgram');
    const topicSelect = document.getElementById('sessionTopic');
    const pomodoroCheck = document.getElementById('pomodoroCheck');

    if (!programSelect || !topicSelect) {
      this.showToast('Form elementleri bulunamadı', 'error');
      return;
    }

    const programId = programSelect.value;
    const topicIndex = topicSelect.value;

    if (!programId || !topicIndex) {
      this.showToast('Lütfen program ve konu seçin!', 'warning');
      return;
    }

    const program = this.getPrograms().find(p => p.id === programId);
    const topic = program.topics[parseInt(topicIndex)];

    if (!topic) {
      this.showToast('Konu bulunamadı!', 'error');
      return;
    }

    // Pomodoro ayarları
    if (pomodoroCheck && pomodoroCheck.checked) {
      const workInput = document.getElementById('workDuration');
      const breakInput = document.getElementById('breakDuration');
      this.workDuration = parseInt(workInput.value) || 25;
      this.breakDuration = parseInt(breakInput.value) || 5;
      this.pomodoroMode = true;
    } else {
      this.pomodoroMode = false;
    }

    // Seansı başlat
    this.activeSessionId = window.studyTracker.startSession(programId, topic.name).id;
    this.startTime = new Date();

    // Modalı kapat
    this.closeModal();

    // Timer UI'yi göster
    this.showTimerUI(program.name, topic.name);

    // Bildirim gönder
    if (window.notificationManager) {
      window.notificationManager.showNotification('Seans Başladı! 🎯', {
        body: `${program.name} - ${topic.name}`,
        icon: 'icons/icon-192x192.png'
      });
    }

    // Dashboard'ı güncelle
    if (window.programDashboard) {
      window.programDashboard.refreshPrograms();
    }
  }

  /**
   * Seansı bitir
   */
  endSession(notes = '') {
    if (!this.activeSessionId) {
      this.showToast('Aktif seans bulunamadı!', 'error');
      return;
    }

    // Seansı bitir
    const session = window.studyTracker.endSession(this.activeSessionId, notes);

    if (session) {
      // Timer'ı temizle
      this.clearTimer();

      // Timer UI'yi kapat
      this.closeTimerUI();

      // Başarı mesajı
      const duration = Math.round(session.duration);
      this.showToast(`Harika! ${duration} dakika çalıştınız! 🎉`, 'success');

      // Bildirim gönder
      if (window.notificationManager) {
        window.notificationManager.showNotification('Seans Tamamlandı! 🎉', {
          body: `${duration} dakika çalışma tamamlandı`,
          icon: 'icons/icon-192x192.png'
        });
      }

      // Rozet kontrolü
      if (window.badgesSystem) {
        window.badgesSystem.checkAchievements();
      }

      // Dashboard'ı güncelle
      if (window.programDashboard) {
        window.programDashboard.refreshPrograms();
      }

      // Sidebar stats güncelle
      if (window.app) {
        window.app.updateSidebarStats();
      }

      // Sıfırla
      this.activeSessionId = null;
      this.startTime = null;
    }
  }

  // ==================== TIMER UI ====================

  /**
   * Timer UI'yi göster
   */
  showTimerUI(programName, topicName) {
    // Mevcut timer UI varsa kaldır
    this.closeTimerUI();

    const timerUI = document.createElement('div');
    timerUI.id = 'activeSessionTimer';
    timerUI.className = 'active-session-timer';
    timerUI.innerHTML = `
      <div class="timer-content">
        <div class="timer-info">
          <div class="timer-icon">🎯</div>
          <div class="timer-details">
            <div class="timer-program">${programName}</div>
            <div class="timer-topic">${topicName}</div>
          </div>
        </div>
        <div class="timer-display">
          <div class="timer-time" id="timerDisplay">00:00</div>
          ${this.pomodoroMode ? `<div class="timer-mode">🍅 Pomodoro: ${this.workDuration} dk</div>` : ''}
        </div>
        <div class="timer-actions">
          <button class="btn-timer-expand" onclick="sessionManager.expandTimer()" title="Büyüt">
            ⛶
          </button>
          <button class="btn-timer-pause" onclick="sessionManager.pauseTimer()" title="Duraklat">
            ⏸️
          </button>
          <button class="btn-timer-end" onclick="sessionManager.showEndModal()" title="Bitir">
            ⏹️
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(timerUI);

    // Timer'ı başlat
    this.startTimer();
  }

  /**
   * Timer UI'yi kapat
   */
  closeTimerUI() {
    const timerUI = document.getElementById('activeSessionTimer');
    if (timerUI) {
      timerUI.remove();
    }
  }

  /**
   * Timer'ı başlat
   */
  startTimer() {
    this.clearTimer();

    this.timerInterval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - this.startTime) / 1000); // saniye
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;

      const display = document.getElementById('timerDisplay');
      if (display) {
        display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

      // Pomodoro kontrolü
      if (this.pomodoroMode && minutes >= this.workDuration) {
        this.handlePomodoroComplete();
      }
    }, 1000);
  }

  /**
   * Timer'ı temizle
   */
  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Timer'ı duraklat
   */
  pauseTimer() {
    const btn = document.querySelector('.btn-timer-pause');
    if (!btn) return;

    if (this.timerInterval) {
      // Duraklat
      this.clearTimer();
      btn.textContent = '▶️';
      btn.title = 'Devam Et';
      this.showToast('Timer duraklatıldı', 'info');
    } else {
      // Devam ettir
      this.startTimer();
      btn.textContent = '⏸️';
      btn.title = 'Duraklat';
      this.showToast('Timer devam ediyor', 'info');
    }
  }

  /**
   * Timer'ı büyüt (tam ekran modal)
   */
  expandTimer() {
    if (window.pomodoroTimer) {
      window.pomodoroTimer.openFullscreen();
    } else {
      this.showToast('Pomodoro timer modülü yükleniyor...', 'info');
    }
  }

  /**
   * Pomodoro tamamlandı
   */
  handlePomodoroComplete() {
    this.clearTimer();

    // Ses bildirimi (opsiyonel)
    if (window.userManager && window.userManager.profile.preferences.sound) {
      this.playSound();
    }

    // Bildirim
    if (window.notificationManager) {
      window.notificationManager.showNotification('Pomodoro Tamamlandı! 🍅', {
        body: `${this.workDuration} dakika çalışma tamamlandı. ${this.breakDuration} dakika mola zamanı!`,
        icon: 'icons/icon-192x192.png'
      });
    }

    // Mola modalı göster
    this.showBreakModal();
  }

  /**
   * Mola modalı
   */
  showBreakModal() {
    const modal = document.createElement('div');
    modal.id = 'breakModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="break-modal">
        <div class="break-icon">☕</div>
        <h2>Mola Zamanı!</h2>
        <p>${this.workDuration} dakikalık çalışmayı tamamladınız.</p>
        <p class="break-time">${this.breakDuration} dakika dinlenin 🌟</p>
        <div class="break-actions">
          <button class="btn-secondary" onclick="sessionManager.skipBreak()">Mola İstemiyorum</button>
          <button class="btn-primary" onclick="sessionManager.startBreak()">Mola Başlat</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Molayı atla
   */
  skipBreak() {
    const modal = document.getElementById('breakModal');
    if (modal) modal.remove();

    // Seansı bitir
    this.showEndModal();
  }

  /**
   * Molayı başlat
   */
  startBreak() {
    const modal = document.getElementById('breakModal');
    if (modal) modal.remove();

    // Mola timer'ı (basit countdown)
    this.showBreakTimer();
  }

  /**
   * Mola timer'ı göster
   */
  showBreakTimer() {
    const timerUI = document.getElementById('activeSessionTimer');
    if (timerUI) {
      timerUI.innerHTML = `
        <div class="timer-content break-mode">
          <div class="timer-info">
            <div class="timer-icon">☕</div>
            <div class="timer-details">
              <div class="timer-program">Mola Zamanı</div>
              <div class="timer-topic">Dinlenin ve enerjinizi toplayın</div>
            </div>
          </div>
          <div class="timer-display">
            <div class="timer-time" id="breakTimerDisplay">${String(this.breakDuration).padStart(2, '0')}:00</div>
          </div>
          <div class="timer-actions">
            <button class="btn-timer-end" onclick="sessionManager.endBreak()">Bitir</button>
          </div>
        </div>
      `;

      // Countdown başlat
      let remaining = this.breakDuration * 60; // saniye
      const countdown = setInterval(() => {
        remaining--;
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;

        const display = document.getElementById('breakTimerDisplay');
        if (display) {
          display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        if (remaining <= 0) {
          clearInterval(countdown);
          this.endBreak();
        }
      }, 1000);
    }
  }

  /**
   * Molayı bitir
   */
  endBreak() {
    this.showToast('Mola bitti! Devam edebilirsiniz', 'success');

    // Seansı bitir
    this.showEndModal();
  }

  /**
   * Seans bitirme modalı
   */
  showEndModal() {
    const modal = document.createElement('div');
    modal.id = 'sessionEndModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="session-modal">
        <div class="modal-header">
          <h2>✅ Seansı Bitir</h2>
          <button class="modal-close" onclick="sessionManager.closeEndModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>📝 Notlarınız (opsiyonel):</label>
            <textarea id="sessionNotes" rows="4" placeholder="Bugün neler öğrendiniz? Zorlandığınız konular var mı?"></textarea>
          </div>
          <div class="session-summary">
            <p>Toplam süre: <strong id="totalDuration">--</strong></p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="sessionManager.closeEndModal()">İptal</button>
          <button class="btn-primary" onclick="sessionManager.confirmEndSession()">✅ Bitir</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Toplam süreyi hesapla
    if (this.startTime) {
      const elapsed = Math.floor((new Date() - this.startTime) / 1000 / 60); // dakika
      const durationEl = document.getElementById('totalDuration');
      if (durationEl) {
        durationEl.textContent = `${elapsed} dakika`;
      }
    }
  }

  /**
   * End modalı kapat
   */
  closeEndModal() {
    const modal = document.getElementById('sessionEndModal');
    if (modal) modal.remove();
  }

  /**
   * Seansı onayla ve bitir
   */
  confirmEndSession() {
    const notesTextarea = document.getElementById('sessionNotes');
    const notes = notesTextarea ? notesTextarea.value : '';

    this.endSession(notes);
    this.closeEndModal();
  }

  // ==================== YARDIMCI FONKSİYONLAR ====================

  /**
   * Programları getir
   */
  getPrograms() {
    try {
      return JSON.parse(localStorage.getItem('studyPrograms') || '[]');
    } catch (error) {
      console.error('Programlar yüklenemedi:', error);
      return [];
    }
  }

  /**
   * Toast bildirimi göster
   */
  showToast(message, type = 'info') {
    if (window.programDashboard && window.programDashboard.showToast) {
      window.programDashboard.showToast(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Ses çal (Pomodoro tamamlandığında)
   */
  playSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZSA0OVqzn77BdGAdCmNz0xnMpBSh+zPLaizsIGGS57OihUQ0NTqXh8bllHAU+ltv0yXUqBSZ7yfDajTkHHWu+7umgTQ0NUavo8bdlHAU9k9jzx3YrBSl7x+/bkDkIHGi87uejUAwPVKrk8LdnHAY+ktf0yXUpBCh+y/Lajz4HHW+++ueoTAwOWK3j8bZnHAc9lNj0yHQpBCh9yPDckTwHHW+/7+ahUw0PVKvk8bVkGgU/ldny0H0sBS6DzvHekDsIH27A7+mjTw4PTqri8bdmHAc+ktjyx3UqBSh+yPDakzgIHWy87OakUQ0OUKfj8LZlGwU+lNjzxnQqBCl9yPLakz4HHW+/7+mjTw4PTqri8bdmGwc9k9jyyHQpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+');
      audio.play().catch(e => console.log('Ses çalınamadı:', e));
    } catch (error) {
      console.log('Ses çalma hatası:', error);
    }
  }

  /**
   * Aktif seans var mı?
   */
  hasActiveSession() {
    return this.activeSessionId !== null;
  }

  /**
   * Aktif seans bilgisi
   */
  getActiveSessionInfo() {
    if (!this.activeSessionId || !this.startTime) return null;

    const elapsed = Math.floor((new Date() - this.startTime) / 1000 / 60); // dakika
    return {
      sessionId: this.activeSessionId,
      elapsed: elapsed,
      startTime: this.startTime
    };
  }
}

// Global instance oluştur
const sessionManager = new SessionManager();

// Konsol helper
window.sessionManager = sessionManager;

console.log('✅ Session Manager yüklendi');
