// ==================== GÜNLÜK LOG VIEWER ====================
// Günlük çalışma geçmişini görüntüleme sistemi

class DailyLogViewer {
  constructor() {
    this.currentDate = new Date();
  }

  /**
   * Günlük log'u göster (Dashboard'a entegre için)
   */
  renderForDashboard() {
    const today = this.getDateKey(this.currentDate);
    const logs = this.getLogs();
    const todayLog = logs[today];

    if (!todayLog || todayLog.sessions.length === 0) {
      return `
        <div class="daily-log-empty">
          <div class="empty-icon">📅</div>
          <p>Bugün henüz çalışma kaydı yok</p>
          <button class="btn-primary btn-small" onclick="sessionManager.openStartModal()">
            🎯 İlk Seansı Başlat
          </button>
        </div>
      `;
    }

    return `
      <div class="daily-log-summary">
        <div class="log-header">
          <h3>📅 Bugünün Özeti</h3>
          <button class="btn-view-all" onclick="dailyLogViewer.openFullView()">
            Tüm Geçmiş →
          </button>
        </div>
        <div class="log-stats">
          <div class="stat-card">
            <div class="stat-icon">⏰</div>
            <div class="stat-value">${todayLog.totalMinutes} dk</div>
            <div class="stat-label">Toplam Çalışma</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">${todayLog.sessions.length}</div>
            <div class="stat-label">Seans Sayısı</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-value">${todayLog.programs?.length || 0}</div>
            <div class="stat-label">Program</div>
          </div>
        </div>
        <div class="recent-sessions">
          <h4>Son Seanslar</h4>
          ${this.renderSessions(todayLog.sessions.slice(-3))}
        </div>
      </div>
    `;
  }

  /**
   * Tam görünümü aç (Modal)
   */
  openFullView() {
    const modal = document.createElement('div');
    modal.id = 'dailyLogModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="log-modal">
        <div class="modal-header">
          <h2>📅 Çalışma Geçmişi</h2>
          <button class="modal-close" onclick="dailyLogViewer.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="log-navigation">
            <button class="btn-nav" onclick="dailyLogViewer.previousDay()">◀ Önceki</button>
            <input type="date" id="dateSelector" value="${this.getDateKey(this.currentDate)}"
                   onchange="dailyLogViewer.selectDate(this.value)" max="${this.getDateKey(new Date())}">
            <button class="btn-nav" onclick="dailyLogViewer.nextDay()" ${this.isToday() ? 'disabled' : ''}>Sonraki ▶</button>
          </div>
          <div id="logContent">
            ${this.renderDayLog()}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Modalı kapat
   */
  closeModal() {
    const modal = document.getElementById('dailyLogModal');
    if (modal) modal.remove();
  }

  /**
   * Günlük log'u render et
   */
  renderDayLog() {
    const dateKey = this.getDateKey(this.currentDate);
    const logs = this.getLogs();
    const dayLog = logs[dateKey];

    const dateStr = this.currentDate.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (!dayLog || dayLog.sessions.length === 0) {
      return `
        <div class="day-log-empty">
          <div class="empty-date">${dateStr}</div>
          <div class="empty-icon">📭</div>
          <p>Bu günde çalışma kaydı yok</p>
          ${this.isToday() ? `
            <button class="btn-primary" onclick="sessionManager.openStartModal(); dailyLogViewer.closeModal();">
              🎯 Bugün İçin Seans Başlat
            </button>
          ` : ''}
        </div>
      `;
    }

    return `
      <div class="day-log">
        <div class="day-header">
          <h3>${dateStr}</h3>
          ${this.isToday() ? '<span class="today-badge">Bugün</span>' : ''}
        </div>

        <div class="day-stats-grid">
          <div class="day-stat-card">
            <div class="stat-icon-lg">⏰</div>
            <div class="stat-content">
              <div class="stat-value-lg">${dayLog.totalMinutes} dk</div>
              <div class="stat-label">Toplam Süre</div>
              <div class="stat-sublabel">${this.formatHoursMinutes(dayLog.totalMinutes)}</div>
            </div>
          </div>
          <div class="day-stat-card">
            <div class="stat-icon-lg">🎯</div>
            <div class="stat-content">
              <div class="stat-value-lg">${dayLog.sessions.length}</div>
              <div class="stat-label">Seans</div>
              <div class="stat-sublabel">${Math.round(dayLog.totalMinutes / dayLog.sessions.length)} dk ortalama</div>
            </div>
          </div>
          <div class="day-stat-card">
            <div class="stat-icon-lg">📚</div>
            <div class="stat-content">
              <div class="stat-value-lg">${dayLog.programs?.length || 0}</div>
              <div class="stat-label">Program</div>
              <div class="stat-sublabel">${this.getUniqueTopicsCount(dayLog.sessions)} farklı konu</div>
            </div>
          </div>
        </div>

        <div class="sessions-timeline">
          <h4>⏱️ Seans Detayları</h4>
          ${this.renderSessions(dayLog.sessions)}
        </div>

        ${dayLog.programs && dayLog.programs.length > 0 ? `
          <div class="programs-breakdown">
            <h4>📊 Program Dağılımı</h4>
            ${this.renderProgramsBreakdown(dayLog.programs)}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Seansları render et
   */
  renderSessions(sessions) {
    if (!sessions || sessions.length === 0) {
      return '<p class="no-sessions">Seans bulunamadı</p>';
    }

    return sessions.map((session, index) => {
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      const program = this.getProgramById(session.programId);

      return `
        <div class="session-item">
          <div class="session-timeline-marker"></div>
          <div class="session-content">
            <div class="session-header">
              <div class="session-time">
                ${startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                -
                ${endTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div class="session-duration">⏱️ ${session.duration} dk</div>
            </div>
            <div class="session-details">
              <div class="session-program">📚 ${program?.name || 'Bilinmeyen Program'}</div>
              <div class="session-topic">📝 ${session.topicName}</div>
              ${session.notes ? `
                <div class="session-notes">
                  <span class="notes-icon">💭</span>
                  <span class="notes-text">${session.notes}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Program dağılımını render et
   */
  renderProgramsBreakdown(programs) {
    const totalMinutes = programs.reduce((sum, p) => sum + p.duration, 0);

    return programs.map(prog => {
      const program = this.getProgramById(prog.programId);
      const percentage = Math.round((prog.duration / totalMinutes) * 100);

      return `
        <div class="program-breakdown-item">
          <div class="program-info">
            <div class="program-name">${program?.name || 'Bilinmeyen'}</div>
            <div class="program-duration">${prog.duration} dk (${percentage}%)</div>
          </div>
          <div class="program-progress-bar">
            <div class="program-progress-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Önceki gün
   */
  previousDay() {
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    this.updateView();
  }

  /**
   * Sonraki gün
   */
  nextDay() {
    if (!this.isToday()) {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      this.updateView();
    }
  }

  /**
   * Tarih seç
   */
  selectDate(dateString) {
    this.currentDate = new Date(dateString + 'T00:00:00');
    this.updateView();
  }

  /**
   * Görünümü güncelle
   */
  updateView() {
    const content = document.getElementById('logContent');
    if (content) {
      content.innerHTML = this.renderDayLog();
    }

    // Date selector'ı güncelle
    const selector = document.getElementById('dateSelector');
    if (selector) {
      selector.value = this.getDateKey(this.currentDate);
    }

    // Sonraki butonunu güncelle
    const nextBtn = document.querySelector('.log-navigation .btn-nav:last-child');
    if (nextBtn) {
      nextBtn.disabled = this.isToday();
    }
  }

  // ==================== YARDIMCI FONKSİYONLAR ====================

  /**
   * Log'ları getir
   */
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('studyLogs') || '{}');
    } catch (error) {
      console.error('Log yüklenemedi:', error);
      return {};
    }
  }

  /**
   * Programı ID'ye göre getir
   */
  getProgramById(programId) {
    try {
      const programs = JSON.parse(localStorage.getItem('studyPrograms') || '[]');
      return programs.find(p => p.id === programId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Tarih key'i oluştur (YYYY-MM-DD)
   */
  getDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Bugün mü?
   */
  isToday() {
    const today = this.getDateKey(new Date());
    const current = this.getDateKey(this.currentDate);
    return today === current;
  }

  /**
   * Dakikayı saat:dakika formatına çevir
   */
  formatHoursMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} dakika`;
    } else if (mins === 0) {
      return `${hours} saat`;
    } else {
      return `${hours} saat ${mins} dakika`;
    }
  }

  /**
   * Benzersiz konu sayısı
   */
  getUniqueTopicsCount(sessions) {
    const topics = new Set(sessions.map(s => s.topicName));
    return topics.size;
  }

  /**
   * Son N günün özeti
   */
  getWeeklySummary(days = 7) {
    const logs = this.getLogs();
    const summary = {
      totalMinutes: 0,
      totalSessions: 0,
      daysStudied: 0,
      dailyData: []
    };

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = this.getDateKey(date);
      const dayLog = logs[dateKey];

      const dayData = {
        date: dateKey,
        dayName: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
        minutes: dayLog?.totalMinutes || 0,
        sessions: dayLog?.sessions.length || 0
      };

      summary.dailyData.push(dayData);

      if (dayLog) {
        summary.totalMinutes += dayLog.totalMinutes;
        summary.totalSessions += dayLog.sessions.length;
        if (dayLog.sessions.length > 0) {
          summary.daysStudied++;
        }
      }
    }

    return summary;
  }

  /**
   * Sidebar widget için render
   */
  renderSidebarWidget() {
    const logs = this.getLogs();
    const today = this.getDateKey(new Date());
    const todayLog = logs[today];

    if (!todayLog || todayLog.totalMinutes === 0) {
      return `
        <div class="sidebar-widget daily-widget">
          <h4>📅 Bugün</h4>
          <p class="widget-empty">Henüz çalışma yok</p>
          <button class="btn-widget" onclick="sessionManager.openStartModal()">
            🎯 Başla
          </button>
        </div>
      `;
    }

    return `
      <div class="sidebar-widget daily-widget">
        <h4>📅 Bugün</h4>
        <div class="widget-stat">
          <span class="widget-label">Toplam:</span>
          <span class="widget-value">${todayLog.totalMinutes} dk</span>
        </div>
        <div class="widget-stat">
          <span class="widget-label">Seans:</span>
          <span class="widget-value">${todayLog.sessions.length}</span>
        </div>
        <button class="btn-widget" onclick="dailyLogViewer.openFullView()">
          Detaylar →
        </button>
      </div>
    `;
  }
}

// Global instance
const dailyLogViewer = new DailyLogViewer();
window.dailyLogViewer = dailyLogViewer;

console.log('✅ Daily Log Viewer yüklendi');
