// ==================== POMODORO TIMER ====================
// Tam ekran Pomodoro timer UI ve yönetimi

class PomodoroTimer {
  constructor() {
    this.isOpen = false;
    this.isPaused = false;
    this.remainingSeconds = 0;
    this.workDuration = 25 * 60; // saniye
    this.breakDuration = 5 * 60; // saniye
    this.currentPhase = 'work'; // 'work' veya 'break'
    this.interval = null;
  }

  /**
   * Tam ekran timer'ı aç
   */
  openFullscreen() {
    if (this.isOpen) return;

    // Session manager'dan bilgi al
    const sessionInfo = window.sessionManager?.getActiveSessionInfo();
    if (!sessionInfo) {
      this.showToast('Aktif seans bulunamadı', 'warning');
      return;
    }

    // Geçen süreyi hesapla
    const elapsed = sessionInfo.elapsed * 60; // saniye
    this.remainingSeconds = this.workDuration - elapsed;

    // Eğer süre dolmuşsa mola fazına geç
    if (this.remainingSeconds <= 0) {
      this.currentPhase = 'break';
      this.remainingSeconds = this.breakDuration;
    }

    this.isOpen = true;
    this.render();
    this.startCountdown();
  }

  /**
   * Tam ekran timer'ı kapat
   */
  close() {
    this.stopCountdown();
    const container = document.getElementById('pomodoroFullscreen');
    if (container) {
      container.remove();
    }
    this.isOpen = false;
  }

  /**
   * Timer'ı render et
   */
  render() {
    // Mevcut varsa kaldır
    const existing = document.getElementById('pomodoroFullscreen');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'pomodoroFullscreen';
    container.className = 'pomodoro-fullscreen';

    const phaseColor = this.currentPhase === 'work' ? '#667eea' : '#ff9800';
    const phaseIcon = this.currentPhase === 'work' ? '🎯' : '☕';
    const phaseText = this.currentPhase === 'work' ? 'Çalışma Zamanı' : 'Mola Zamanı';

    container.innerHTML = `
      <div class="pomodoro-container">
        <button class="pomodoro-close" onclick="pomodoroTimer.close()">✕</button>

        <div class="pomodoro-header">
          <div class="phase-icon">${phaseIcon}</div>
          <h2 class="phase-title">${phaseText}</h2>
        </div>

        <div class="timer-circle" style="--progress-color: ${phaseColor}">
          <svg class="timer-ring" width="300" height="300">
            <circle class="timer-ring-bg" cx="150" cy="150" r="140" />
            <circle class="timer-ring-progress" id="timerProgress" cx="150" cy="150" r="140" />
          </svg>
          <div class="timer-text">
            <div class="timer-main" id="timerMain">--:--</div>
            <div class="timer-label">${this.currentPhase === 'work' ? 'Odaklanma' : 'Dinlenme'}</div>
          </div>
        </div>

        <div class="pomodoro-controls">
          <button class="pomodoro-btn btn-secondary" onclick="pomodoroTimer.togglePause()">
            <span id="pauseIcon">${this.isPaused ? '▶️' : '⏸️'}</span>
            <span id="pauseText">${this.isPaused ? 'Devam Et' : 'Duraklat'}</span>
          </button>
          <button class="pomodoro-btn btn-danger" onclick="pomodoroTimer.skipPhase()">
            ⏭️ Atla
          </button>
        </div>

        <div class="pomodoro-info">
          <div class="info-item">
            <div class="info-label">Pomodoro</div>
            <div class="info-value">#1</div>
          </div>
          <div class="info-item">
            <div class="info-label">Toplam</div>
            <div class="info-value" id="totalTime">0 dk</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.updateDisplay();
  }

  /**
   * Countdown başlat
   */
  startCountdown() {
    this.stopCountdown();

    this.interval = setInterval(() => {
      if (!this.isPaused && this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateDisplay();

        // Süre doldu
        if (this.remainingSeconds <= 0) {
          this.handlePhaseComplete();
        }
      }
    }, 1000);
  }

  /**
   * Countdown durdur
   */
  stopCountdown() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Ekranı güncelle
   */
  updateDisplay() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;

    // Ana timer text
    const mainDisplay = document.getElementById('timerMain');
    if (mainDisplay) {
      mainDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Progress ring
    this.updateProgressRing();

    // Toplam süre
    const sessionInfo = window.sessionManager?.getActiveSessionInfo();
    if (sessionInfo) {
      const totalEl = document.getElementById('totalTime');
      if (totalEl) {
        totalEl.textContent = `${sessionInfo.elapsed} dk`;
      }
    }
  }

  /**
   * Progress ring güncelle
   */
  updateProgressRing() {
    const progressCircle = document.getElementById('timerProgress');
    if (!progressCircle) return;

    const totalDuration = this.currentPhase === 'work' ? this.workDuration : this.breakDuration;
    const percentage = ((totalDuration - this.remainingSeconds) / totalDuration) * 100;

    const circumference = 2 * Math.PI * 140; // r=140
    const offset = circumference - (percentage / 100) * circumference;

    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;
  }

  /**
   * Pause/Resume toggle
   */
  togglePause() {
    this.isPaused = !this.isPaused;

    const pauseIcon = document.getElementById('pauseIcon');
    const pauseText = document.getElementById('pauseText');

    if (pauseIcon) {
      pauseIcon.textContent = this.isPaused ? '▶️' : '⏸️';
    }

    if (pauseText) {
      pauseText.textContent = this.isPaused ? 'Devam Et' : 'Duraklat';
    }

    this.showToast(this.isPaused ? 'Timer duraklatıldı' : 'Timer devam ediyor', 'info');
  }

  /**
   * Faz atlama
   */
  skipPhase() {
    if (!confirm('Bu fazı atlamak istediğinize emin misiniz?')) {
      return;
    }

    this.remainingSeconds = 0;
    this.handlePhaseComplete();
  }

  /**
   * Faz tamamlandı
   */
  handlePhaseComplete() {
    this.stopCountdown();

    // Ses çal
    this.playCompletionSound();

    // Bildirim gönder
    if (this.currentPhase === 'work') {
      this.showNotification('Pomodoro Tamamlandı! 🍅', 'Harika iş çıkardınız! Mola zamanı.');

      // Mola fazına geç
      this.currentPhase = 'break';
      this.remainingSeconds = this.breakDuration;
      this.render();
      this.startCountdown();
    } else {
      this.showNotification('Mola Bitti! ⏰', 'Enerjinizi topladınız. Çalışmaya devam!');

      // Çalışma fazına geç
      this.currentPhase = 'work';
      this.remainingSeconds = this.workDuration;
      this.render();
      this.startCountdown();
    }
  }

  /**
   * Tamamlanma sesi
   */
  playCompletionSound() {
    try {
      // Kullanıcı ses tercihini kontrol et
      if (window.userManager && !window.userManager.profile.preferences.sound) {
        return;
      }

      // Basit beep sesi (data URL)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZSA0OVqzn77BdGAdCmNz0xnMpBSh+zPLaizsIGGS57OihUQ0NTqXh8bllHAU+ltv0yXUqBSZ7yfDajTkHHWu+7umgTQ0NUavo8bdlHAU9k9jzx3YrBSl7x+/bkDkIHGi87uejUAwPVKrk8LdnHAY+ktf0yXUpBCh+y/Lajz4HHW+++ueoTAwOWK3j8bZnHAc9lNj0yHQpBCh9yPDckTwHHW+/7+ahUw0PVKvk8bVkGgU/ldny0H0sBS6DzvHekDsIH27A7+mjTw4PTqri8bdmHAc+ktjyx3UqBSh+yPDakzgIHWy87OakUQ0OUKfj8LZlGwU+lNjzxnQqBCl9yPLakz4HHW+/7+mjTw4PTqri8bdmGwc9k9jyyHQpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+k9f0yHUpBSh+yPPajz4IHWy+7OikTwwOUajh8LVkGwU+');
      audio.play().catch(e => console.log('Ses çalınamadı:', e));
    } catch (error) {
      console.error('Ses çalma hatası:', error);
    }
  }

  /**
   * Bildirim göster
   */
  showNotification(title, body) {
    if (window.notificationManager) {
      window.notificationManager.showNotification(title, {
        body: body,
        icon: 'icons/icon-192x192.png',
        badge: 'icons/icon-72x72.png'
      });
    }
  }

  /**
   * Toast göster
   */
  showToast(message, type = 'info') {
    if (window.programDashboard && window.programDashboard.showToast) {
      window.programDashboard.showToast(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Ayarları güncelle
   */
  updateSettings(workMinutes, breakMinutes) {
    this.workDuration = workMinutes * 60;
    this.breakDuration = breakMinutes * 60;
  }
}

// Global instance
const pomodoroTimer = new PomodoroTimer();
window.pomodoroTimer = pomodoroTimer;

console.log('✅ Pomodoro Timer yüklendi');
