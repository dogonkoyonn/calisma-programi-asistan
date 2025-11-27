// ==================== ÇALIŞMA TAKİP SİSTEMİ ====================
// Günlük, haftalık, aylık çalışma logu ve istatistikler

class StudyTracker {
  constructor() {
    this.logs = this.loadLogs();
    this.activeSessions = new Map(); // Aktif seanslar
  }

  // ==================== LOG YÖNETİMİ ====================

  loadLogs() {
    const saved = localStorage.getItem('studyLogs');
    return saved ? JSON.parse(saved) : {};
  }

  saveLogs() {
    localStorage.setItem('studyLogs', JSON.stringify(this.logs));
  }

  // ==================== SEANS YÖNETİMİ ====================

  /**
   * Çalışma seansı başlat
   */
  startSession(programId, topicName) {
    const session = {
      id: Date.now().toString(),
      programId,
      topicName,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      completed: false,
      notes: ''
    };

    this.activeSessions.set(session.id, session);
    return session;
  }

  /**
   * Seansı bitir
   */
  endSession(sessionId, notes = '') {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    session.endTime = new Date();
    session.duration = Math.round((session.endTime - session.startTime) / 1000 / 60); // dakika
    session.completed = true;
    session.notes = notes;

    // Log'a kaydet
    const dateKey = this.getDateKey(session.startTime);
    if (!this.logs[dateKey]) {
      this.logs[dateKey] = {
        date: dateKey,
        sessions: [],
        totalMinutes: 0,
        programs: []
      };
    }

    this.logs[dateKey].sessions.push({
      programId: session.programId,
      topicName: session.topicName,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
      duration: session.duration,
      notes: session.notes
    });

    this.logs[dateKey].totalMinutes += session.duration;

    // Program listesine ekle (unique)
    if (!this.logs[dateKey].programs.find(p => p.programId === session.programId)) {
      this.logs[dateKey].programs.push({
        programId: session.programId,
        topicName: session.topicName,
        duration: session.duration
      });
    } else {
      // Mevcut program için duration'ı güncelle
      const prog = this.logs[dateKey].programs.find(p => p.programId === session.programId);
      prog.duration += session.duration;
    }

    this.activeSessions.delete(sessionId);
    this.saveLogs();

    // Program istatistiklerini güncelle
    this.updateProgramStats(session.programId, session.duration, dateKey);

    // User stats güncellemesi
    this.updateUserStats(session.duration, dateKey);

    return session;
  }

  /**
   * Program istatistiklerini güncelle (Faz 1)
   */
  updateProgramStats(programId, duration, dateKey) {
    try {
      const programs = JSON.parse(localStorage.getItem('studyPrograms') || '[]');
      const program = programs.find(p => p.id === programId);

      if (program) {
        // stats objesi yoksa oluştur
        if (!program.stats) {
          program.stats = {
            totalMinutes: 0,
            completedCount: 0,
            streakDays: 0,
            lastStudyDate: null
          };
        }

        // İstatistikleri güncelle
        program.stats.totalMinutes += duration;
        program.stats.lastStudyDate = dateKey;
        program.lastActivity = new Date().toISOString();

        // Sessions dizisi yoksa oluştur
        if (!program.sessions) {
          program.sessions = [];
        }

        // Son 10 seansı tut
        if (program.sessions.length >= 10) {
          program.sessions.shift();
        }

        program.sessions.push({
          date: dateKey,
          duration: duration,
          timestamp: new Date().toISOString()
        });

        // Kaydet
        localStorage.setItem('studyPrograms', JSON.stringify(programs));
      }
    } catch (error) {
      console.error('Program stats güncellenirken hata:', error);
    }
  }

  /**
   * Kullanıcı istatistiklerini güncelle (Faz 1)
   */
  updateUserStats(duration, dateKey) {
    try {
      if (window.userManager) {
        window.userManager.updateStats({
          totalStudyMinutes: duration,
          totalSessions: 1,
          lastStudyDate: dateKey
        });
      }
    } catch (error) {
      console.error('User stats güncellenirken hata:', error);
    }
  }

  /**
   * Aktif seans var mı?
   */
  hasActiveSession() {
    return this.activeSessions.size > 0;
  }

  /**
   * Aktif seansı getir
   */
  getActiveSession() {
    return this.activeSessions.size > 0
      ? Array.from(this.activeSessions.values())[0]
      : null;
  }

  // ==================== İSTATİSTİKLER ====================

  /**
   * Günlük özet
   */
  getDailySummary(date = new Date()) {
    const dateKey = this.getDateKey(date);
    const log = this.logs[dateKey];

    if (!log) {
      return {
        date: dateKey,
        totalMinutes: 0,
        sessionCount: 0,
        topicCount: 0,
        percentage: 0,
        sessions: []
      };
    }

    const uniqueTopics = new Set(log.sessions.map(s => s.topicName));

    return {
      date: dateKey,
      totalMinutes: log.totalMinutes,
      sessionCount: log.sessions.length,
      topicCount: uniqueTopics.size,
      percentage: this.calculateDailyPercentage(log.totalMinutes),
      sessions: log.sessions
    };
  }

  /**
   * Haftalık özet (son 7 gün)
   */
  getWeeklySummary() {
    const today = new Date();
    const days = [];
    let totalMinutes = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const summary = this.getDailySummary(date);

      days.push({
        date: summary.date,
        dayName: this.getDayName(date),
        minutes: summary.totalMinutes,
        hours: (summary.totalMinutes / 60).toFixed(1)
      });

      totalMinutes += summary.totalMinutes;
    }

    return {
      days,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      avgDaily: (totalMinutes / 7).toFixed(0),
      studyDays: days.filter(d => d.minutes > 0).length
    };
  }

  /**
   * Aylık özet (son 30 gün)
   */
  getMonthlySummary() {
    const today = new Date();
    let totalMinutes = 0;
    let studyDays = 0;
    const topicStats = {};

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const summary = this.getDailySummary(date);

      totalMinutes += summary.totalMinutes;
      if (summary.totalMinutes > 0) studyDays++;

      // Konu istatistikleri
      summary.sessions.forEach(session => {
        if (!topicStats[session.topicName]) {
          topicStats[session.topicName] = 0;
        }
        topicStats[session.topicName] += session.duration;
      });
    }

    // En çok çalışılan konular (top 5)
    const topTopics = Object.entries(topicStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, minutes]) => ({
        topic,
        minutes,
        hours: (minutes / 60).toFixed(1)
      }));

    return {
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      studyDays,
      avgDaily: (totalMinutes / 30).toFixed(0),
      topTopics
    };
  }

  /**
   * Streak hesapla (kaç gün üst üste çalışıldı)
   */
  getStreak() {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const summary = this.getDailySummary(date);

      if (summary.totalMinutes > 0) {
        streak++;
      } else if (i > 0) {
        // İlk gün boş olabilir (bugün henüz çalışmadıysa)
        break;
      }
    }

    return streak;
  }

  /**
   * Haftalık grafik verisi (Chart.js için)
   */
  getWeeklyChartData() {
    const weekly = this.getWeeklySummary();

    return {
      labels: weekly.days.map(d => d.dayName),
      datasets: [{
        label: 'Çalışma Saati',
        data: weekly.days.map(d => d.hours),
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        tension: 0.4
      }]
    };
  }

  // ==================== YARDIMCI FONKSİYONLAR ====================

  getDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  getDayName(date) {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'];
    return days[date.getDay()];
  }

  calculateDailyPercentage(minutes) {
    const target = 180; // Hedef: 3 saat (180 dakika)
    return Math.min(100, Math.round((minutes / target) * 100));
  }

  /**
   * Tüm verileri temizle (test için)
   */
  clearAllData() {
    this.logs = {};
    this.activeSessions.clear();
    localStorage.removeItem('studyLogs');
  }
}

// ==================== TEST VERİSİ OLUŞTUR ====================

/**
 * Demo amaçlı test verisi oluştur
 */
function generateTestData() {
  const tracker = new StudyTracker();
  tracker.clearAllData();

  const today = new Date();
  const topics = ['React Hooks', 'JavaScript ES6', 'CSS Grid', 'Node.js', 'TypeScript'];

  // Son 14 gün için rastgele veri
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = tracker.getDateKey(date);

    // Günde 2-4 seans
    const sessionCount = Math.floor(Math.random() * 3) + 2;
    let dailyTotal = 0;

    tracker.logs[dateKey] = {
      date: dateKey,
      sessions: [],
      totalMinutes: 0
    };

    for (let j = 0; j < sessionCount; j++) {
      const duration = Math.floor(Math.random() * 60) + 30; // 30-90 dakika
      const topic = topics[Math.floor(Math.random() * topics.length)];

      tracker.logs[dateKey].sessions.push({
        programId: 'test-program',
        topicName: topic,
        startTime: new Date(date.setHours(10 + j * 2)).toISOString(),
        endTime: new Date(date.setHours(10 + j * 2, duration)).toISOString(),
        duration,
        notes: 'Test verisi'
      });

      dailyTotal += duration;
    }

    tracker.logs[dateKey].totalMinutes = dailyTotal;
  }

  tracker.saveLogs();
  console.log('✅ Test verisi oluşturuldu!');
  console.log('📊 Haftalık özet:', tracker.getWeeklySummary());
  console.log('🔥 Streak:', tracker.getStreak(), 'gün');

  return tracker;
}
