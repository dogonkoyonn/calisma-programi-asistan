// ==================== HAFTALIK TAKVİM GÖRÜNÜMÜ ====================
// Program konularını haftalık takvime dağıtan sistem

class WeeklyCalendarView {
  constructor(program) {
    this.program = program;
    this.daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    this.weeklySchedule = this.generateWeeklySchedule();
  }

  /**
   * Haftalık program takvimi oluştur
   */
  generateWeeklySchedule() {
    const { daysPerWeek, hoursPerDay, topics } = this.program;
    const schedule = {};

    // Kullanılacak günleri belirle
    const activeDays = this.daysOfWeek.slice(0, daysPerWeek);

    // Konuları günlere dağıt
    let topicIndex = 0;
    const topicsPerDay = Math.ceil(topics.length / daysPerWeek);

    activeDays.forEach((dayName, dayIndex) => {
      const dayTopics = [];

      // Bu güne düşen konuları al
      for (let i = 0; i < topicsPerDay && topicIndex < topics.length; i++) {
        dayTopics.push(topics[topicIndex]);
        topicIndex++;
      }

      // Zaman dilimlerini oluştur
      schedule[dayName] = {
        active: true,
        slots: this.createTimeSlots(hoursPerDay, dayTopics)
      };
    });

    // Boş günler
    const inactiveDays = this.daysOfWeek.slice(daysPerWeek);
    inactiveDays.forEach(dayName => {
      schedule[dayName] = {
        active: false,
        slots: []
      };
    });

    return schedule;
  }

  /**
   * Günlük zaman dilimlerini oluştur
   */
  createTimeSlots(totalHours, topics) {
    const slots = [];

    if (topics.length === 0) return slots;

    // Her konuya eşit süre dağıt
    const hoursPerTopic = totalHours / topics.length;
    let currentTime = 9; // 09:00'dan başla

    topics.forEach(topic => {
      const duration = Math.round(hoursPerTopic * 60); // dakikaya çevir
      const endTime = currentTime + hoursPerTopic;

      slots.push({
        startTime: this.formatTime(currentTime),
        endTime: this.formatTime(endTime),
        topic: topic.name,
        duration: `${Math.round(hoursPerTopic * 60)} dk`,
        completed: topic.completed || false,
        resource: topic.resource || null
      });

      // Sonraki slot için zaman güncelle (araya 15dk mola ekle)
      currentTime = endTime + 0.25;
    });

    return slots;
  }

  /**
   * Saat formatla (9.5 → "09:30")
   */
  formatTime(decimal) {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Bugünün görevlerini getir
   */
  getTodayTasks() {
    const today = new Date().getDay(); // 0 = Pazar, 1 = Pazartesi, ...
    const dayIndex = today === 0 ? 6 : today - 1; // Pazartesi = 0
    const dayName = this.daysOfWeek[dayIndex];

    if (!this.weeklySchedule[dayName] || !this.weeklySchedule[dayName].active) {
      return [];
    }

    return this.weeklySchedule[dayName].slots;
  }

  /**
   * Takvimi HTML olarak render et
   */
  render() {
    let html = `
      <div class="weekly-calendar">
        <div class="calendar-header">
          <h2>📅 ${this.program.name} - Haftalık Program</h2>
          <div class="calendar-info">
            <span>📌 ${this.program.daysPerWeek} gün/hafta</span>
            <span>⏱️ ${this.program.hoursPerDay} saat/gün</span>
          </div>
        </div>
        <div class="calendar-grid">
    `;

    this.daysOfWeek.forEach(dayName => {
      const dayData = this.weeklySchedule[dayName];
      const isToday = this.isTodayDay(dayName);
      const activeClass = dayData.active ? 'active' : 'inactive';
      const todayClass = isToday ? 'today' : '';

      html += `
        <div class="calendar-day ${activeClass} ${todayClass}">
          <div class="day-header">
            <h3>${dayName}</h3>
            ${isToday ? '<span class="today-badge">Bugün</span>' : ''}
          </div>
      `;

      if (dayData.active && dayData.slots.length > 0) {
        dayData.slots.forEach(slot => {
          const completedClass = slot.completed ? 'completed' : '';
          html += `
            <div class="time-slot ${completedClass}" data-topic="${slot.topic}">
              <div class="slot-time">
                <span class="start-time">${slot.startTime}</span>
                <span class="separator">-</span>
                <span class="end-time">${slot.endTime}</span>
              </div>
              <div class="slot-topic">${slot.topic}</div>
              <div class="slot-duration">${slot.duration}</div>
              ${slot.resource ? `
                <a href="${slot.resource}" target="_blank" class="slot-resource">
                  📺 Kaynağa Git
                </a>
              ` : ''}
              <label class="slot-checkbox">
                <input type="checkbox" ${slot.completed ? 'checked' : ''}
                       onchange="app.toggleTopicCompletion('${this.program.id}', '${slot.topic}')">
                <span>Tamamlandı</span>
              </label>
            </div>
          `;
        });
      } else {
        html += '<div class="rest-day">💤 Dinlenme Günü</div>';
      }

      html += `</div>`;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Bugün mü kontrol et
   */
  isTodayDay(dayName) {
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;
    return this.daysOfWeek[dayIndex] === dayName;
  }

  /**
   * İlerleme yüzdesini hesapla
   */
  getProgressPercentage() {
    const allSlots = Object.values(this.weeklySchedule)
      .flatMap(day => day.slots);

    if (allSlots.length === 0) return 0;

    const completed = allSlots.filter(slot => slot.completed).length;
    return Math.round((completed / allSlots.length) * 100);
  }

  /**
   * Haftalık özet istatistikleri
   */
  getWeeklyStats() {
    const allSlots = Object.values(this.weeklySchedule)
      .flatMap(day => day.slots);

    const totalTopics = allSlots.length;
    const completedTopics = allSlots.filter(slot => slot.completed).length;
    const remainingTopics = totalTopics - completedTopics;

    // Toplam süre (dakika)
    const totalMinutes = allSlots.reduce((sum, slot) => {
      const duration = parseInt(slot.duration);
      return sum + duration;
    }, 0);

    return {
      totalTopics,
      completedTopics,
      remainingTopics,
      totalHours: Math.round(totalMinutes / 60),
      progressPercentage: this.getProgressPercentage()
    };
  }
}

// ==================== TAKVİM YÖNETİCİSİ ====================

class CalendarManager {
  constructor() {
    this.currentProgramId = null;
    this.currentCalendar = null;
  }

  /**
   * Program takvimini göster
   */
  showProgramCalendar(programId) {
    const program = app.programManager.getProgram(programId);

    if (!program) {
      console.error('Program bulunamadı:', programId);
      return;
    }

    this.currentProgramId = programId;
    this.currentCalendar = new WeeklyCalendarView(program);

    // Panel'de göster
    app.detailPanel.style.display = 'block';
    app.panelContent.innerHTML = this.currentCalendar.render();

    // İstatistikleri göster
    this.renderStats();
  }

  /**
   * Haftalık istatistikleri render et
   */
  renderStats() {
    const stats = this.currentCalendar.getWeeklyStats();

    const statsHTML = `
      <div class="calendar-stats">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-value">${stats.totalTopics}</div>
            <div class="stat-label">Toplam Konu</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">${stats.completedTopics}</div>
            <div class="stat-label">Tamamlanan</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-value">${stats.totalHours}h</div>
            <div class="stat-label">Toplam Süre</div>
          </div>
        </div>
        <div class="stat-card progress-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">${stats.progressPercentage}%</div>
            <div class="stat-label">İlerleme</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${stats.progressPercentage}%"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // İstatistikleri takvimin üstüne ekle
    const calendarHeader = app.panelContent.querySelector('.calendar-header');
    if (calendarHeader) {
      calendarHeader.insertAdjacentHTML('afterend', statsHTML);
    }
  }

  /**
   * Bugünün görevlerini göster
   */
  showTodayTasks() {
    const programs = app.programManager.getPrograms();
    let allTasks = [];

    programs.forEach(program => {
      const calendar = new WeeklyCalendarView(program);
      const todayTasks = calendar.getTodayTasks();

      if (todayTasks.length > 0) {
        allTasks.push({
          programName: program.name,
          tasks: todayTasks
        });
      }
    });

    return allTasks;
  }
}

// Global instance
window.calendarManager = new CalendarManager();
