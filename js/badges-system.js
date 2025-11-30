// ==================== BADGES & ACHIEVEMENTS SYSTEM ====================
// Kullanıcı başarılarını takip eden rozet sistemi

class BadgesSystem {
  constructor() {
    this.badges = this.initializeBadges();
    this.earnedBadges = this.loadEarnedBadges();
    this.lastCheck = null;
  }

  /**
   * Rozet tanımları
   */
  initializeBadges() {
    return {
      // İlk adımlar
      first_program: {
        id: 'first_program',
        name: 'İlk Adım',
        icon: '🎯',
        description: 'İlk çalışma programını oluşturdun!',
        category: 'milestone',
        tier: 'bronze'
      },
      first_session: {
        id: 'first_session',
        name: 'Başlangıç',
        icon: '▶️',
        description: 'İlk çalışma seansını tamamladın!',
        category: 'milestone',
        tier: 'bronze'
      },
      first_complete: {
        id: 'first_complete',
        name: 'Şampiyon',
        icon: '🏆',
        description: 'İlk programı tamamladın!',
        category: 'milestone',
        tier: 'gold'
      },

      // Streak rozetleri
      streak_3: {
        id: 'streak_3',
        name: 'Tutarlı',
        icon: '🔥',
        description: '3 gün üst üste çalıştın!',
        category: 'streak',
        tier: 'bronze'
      },
      streak_7: {
        id: 'streak_7',
        name: 'Kararlı',
        icon: '🔥',
        description: '7 gün üst üste çalıştın!',
        category: 'streak',
        tier: 'silver'
      },
      streak_14: {
        id: 'streak_14',
        name: 'Azimli',
        icon: '🔥',
        description: '14 gün üst üste çalıştın!',
        category: 'streak',
        tier: 'gold'
      },
      streak_30: {
        id: 'streak_30',
        name: 'Efsane',
        icon: '🔥',
        description: '30 gün üst üste çalıştın!',
        category: 'streak',
        tier: 'platinum'
      },

      // Çalışma süreleri
      total_60: {
        id: 'total_60',
        name: 'Başlangıç',
        icon: '⏰',
        description: 'Toplam 60 dakika çalıştın!',
        category: 'time',
        tier: 'bronze'
      },
      total_300: {
        id: 'total_300',
        name: 'Çalışkan',
        icon: '⏰',
        description: 'Toplam 5 saat çalıştın!',
        category: 'time',
        tier: 'silver'
      },
      total_600: {
        id: 'total_600',
        name: 'Gayretli',
        icon: '⏰',
        description: 'Toplam 10 saat çalıştın!',
        category: 'time',
        tier: 'gold'
      },
      total_3000: {
        id: 'total_3000',
        name: 'Profesyonel',
        icon: '⏰',
        description: 'Toplam 50 saat çalıştın!',
        category: 'time',
        tier: 'platinum'
      },

      // Günlük çalışma
      daily_60: {
        id: 'daily_60',
        name: 'Sessiz Saat',
        icon: '🕐',
        description: 'Bir günde 60 dakika çalıştın!',
        category: 'daily',
        tier: 'bronze'
      },
      daily_120: {
        id: 'daily_120',
        name: 'Maratoncu',
        icon: '🏃',
        description: 'Bir günde 2 saat çalıştın!',
        category: 'daily',
        tier: 'silver'
      },
      daily_180: {
        id: 'daily_180',
        name: 'Süper Odak',
        icon: '🎯',
        description: 'Bir günde 3 saat çalıştın!',
        category: 'daily',
        tier: 'gold'
      },
      daily_240: {
        id: 'daily_240',
        name: 'Ultra Odak',
        icon: '⚡',
        description: 'Bir günde 4 saat çalıştın!',
        category: 'daily',
        tier: 'platinum'
      },

      // Zaman dilimleri
      early_bird: {
        id: 'early_bird',
        name: 'Erken Kuş',
        icon: '🌅',
        description: 'Sabah 8\'den önce çalıştın!',
        category: 'special',
        tier: 'gold'
      },
      night_owl: {
        id: 'night_owl',
        name: 'Gece Kuşu',
        icon: '🦉',
        description: 'Gece 22\'den sonra çalıştın!',
        category: 'special',
        tier: 'gold'
      },

      // Program sayıları
      programs_5: {
        id: 'programs_5',
        name: 'Koleksiyoncu',
        icon: '📚',
        description: '5 program oluşturdun!',
        category: 'collection',
        tier: 'silver'
      },
      programs_10: {
        id: 'programs_10',
        name: 'Kütüphane',
        icon: '📖',
        description: '10 program oluşturdun!',
        category: 'collection',
        tier: 'gold'
      },

      // Özel başarılar
      perfect_week: {
        id: 'perfect_week',
        name: 'Mükemmel Hafta',
        icon: '⭐',
        description: '7 gün boyunca her gün hedefini tutturdun!',
        category: 'special',
        tier: 'platinum'
      },
      speedrun: {
        id: 'speedrun',
        name: 'Hızlı ve Öfkeli',
        icon: '⚡',
        description: 'Bir programı 7 günden kısa sürede tamamladın!',
        category: 'special',
        tier: 'gold'
      },
      multitasker: {
        id: 'multitasker',
        name: 'Çok Yönlü',
        icon: '🎭',
        description: 'Bir günde 3 farklı programda çalıştın!',
        category: 'special',
        tier: 'gold'
      }
    };
  }

  /**
   * Kazanılan rozetleri yükle
   */
  loadEarnedBadges() {
    try {
      const saved = localStorage.getItem('earnedBadges');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Rozetler yüklenemedi:', error);
      return {};
    }
  }

  /**
   * Kazanılan rozetleri kaydet
   */
  saveEarnedBadges() {
    try {
      localStorage.setItem('earnedBadges', JSON.stringify(this.earnedBadges));
    } catch (error) {
      console.error('Rozetler kaydedilemedi:', error);
    }
  }

  /**
   * Tüm başarıları kontrol et
   */
  checkAchievements() {
    const newBadges = [];

    // İlk program
    if (!this.hasBadge('first_program') && this.checkFirstProgram()) {
      newBadges.push('first_program');
    }

    // İlk seans
    if (!this.hasBadge('first_session') && this.checkFirstSession()) {
      newBadges.push('first_session');
    }

    // İlk tamamlama
    if (!this.hasBadge('first_complete') && this.checkFirstComplete()) {
      newBadges.push('first_complete');
    }

    // Streak rozetleri
    const currentStreak = this.getCurrentStreak();
    if (currentStreak >= 30 && !this.hasBadge('streak_30')) {
      newBadges.push('streak_30');
    } else if (currentStreak >= 14 && !this.hasBadge('streak_14')) {
      newBadges.push('streak_14');
    } else if (currentStreak >= 7 && !this.hasBadge('streak_7')) {
      newBadges.push('streak_7');
    } else if (currentStreak >= 3 && !this.hasBadge('streak_3')) {
      newBadges.push('streak_3');
    }

    // Toplam süre rozetleri
    const totalMinutes = this.getTotalStudyMinutes();
    if (totalMinutes >= 3000 && !this.hasBadge('total_3000')) {
      newBadges.push('total_3000');
    } else if (totalMinutes >= 600 && !this.hasBadge('total_600')) {
      newBadges.push('total_600');
    } else if (totalMinutes >= 300 && !this.hasBadge('total_300')) {
      newBadges.push('total_300');
    } else if (totalMinutes >= 60 && !this.hasBadge('total_60')) {
      newBadges.push('total_60');
    }

    // Günlük süre rozetleri
    const todayMinutes = this.getTodayMinutes();
    if (todayMinutes >= 240 && !this.hasBadge('daily_240')) {
      newBadges.push('daily_240');
    } else if (todayMinutes >= 180 && !this.hasBadge('daily_180')) {
      newBadges.push('daily_180');
    } else if (todayMinutes >= 120 && !this.hasBadge('daily_120')) {
      newBadges.push('daily_120');
    } else if (todayMinutes >= 60 && !this.hasBadge('daily_60')) {
      newBadges.push('daily_60');
    }

    // Zaman dilimleri
    if (!this.hasBadge('early_bird') && this.checkEarlyBird()) {
      newBadges.push('early_bird');
    }
    if (!this.hasBadge('night_owl') && this.checkNightOwl()) {
      newBadges.push('night_owl');
    }

    // Program sayıları
    const programCount = this.getProgramCount();
    if (programCount >= 10 && !this.hasBadge('programs_10')) {
      newBadges.push('programs_10');
    } else if (programCount >= 5 && !this.hasBadge('programs_5')) {
      newBadges.push('programs_5');
    }

    // Özel başarılar
    if (!this.hasBadge('perfect_week') && this.checkPerfectWeek()) {
      newBadges.push('perfect_week');
    }
    if (!this.hasBadge('speedrun') && this.checkSpeedrun()) {
      newBadges.push('speedrun');
    }
    if (!this.hasBadge('multitasker') && this.checkMultitasker()) {
      newBadges.push('multitasker');
    }

    // Yeni rozetleri kaydet ve göster
    newBadges.forEach(badgeId => {
      this.awardBadge(badgeId);
    });
  }

  /**
   * Rozet kazan
   */
  awardBadge(badgeId) {
    const badge = this.badges[badgeId];
    if (!badge) return;

    // Kazanma zamanını kaydet
    this.earnedBadges[badgeId] = {
      earnedAt: new Date().toISOString(),
      badge: badge
    };

    this.saveEarnedBadges();

    // Confetti göster
    this.showConfetti();

    // Bildirim göster
    this.showBadgeNotification(badge);

    // Modal göster
    setTimeout(() => {
      this.showBadgeModal(badge);
    }, 500);
  }

  /**
   * Rozete sahip mi?
   */
  hasBadge(badgeId) {
    return !!this.earnedBadges[badgeId];
  }

  // ==================== KONTROL FONKSİYONLARI ====================

  checkFirstProgram() {
    return this.getProgramCount() >= 1;
  }

  checkFirstSession() {
    const logs = this.getLogs();
    let totalSessions = 0;
    Object.values(logs).forEach(day => {
      totalSessions += day.sessions?.length || 0;
    });
    return totalSessions >= 1;
  }

  checkFirstComplete() {
    const programs = this.getPrograms();
    return programs.some(p => p.status === 'completed');
  }

  checkEarlyBird() {
    const logs = this.getLogs();
    return Object.values(logs).some(day => {
      return day.sessions?.some(session => {
        const hour = new Date(session.startTime).getHours();
        return hour < 8;
      });
    });
  }

  checkNightOwl() {
    const logs = this.getLogs();
    return Object.values(logs).some(day => {
      return day.sessions?.some(session => {
        const hour = new Date(session.startTime).getHours();
        return hour >= 22;
      });
    });
  }

  checkPerfectWeek() {
    const logs = this.getLogs();
    const dailyGoal = window.userManager?.profile?.preferences?.dailyGoalMinutes || 180;

    // Son 7 günü kontrol et
    let consecutiveDays = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayLog = logs[dateKey];

      if (dayLog && dayLog.totalMinutes >= dailyGoal) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays >= 7;
  }

  checkSpeedrun() {
    const programs = this.getPrograms();
    return programs.some(p => {
      if (p.status !== 'completed') return false;
      const start = new Date(p.createdAt);
      const end = new Date(p.lastActivity);
      const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      return days < 7;
    });
  }

  checkMultitasker() {
    const logs = this.getLogs();
    const today = new Date().toISOString().split('T')[0];
    const todayLog = logs[today];

    if (!todayLog || !todayLog.programs) return false;

    return todayLog.programs.length >= 3;
  }

  // ==================== HELPER FUNCTIONS ====================

  getPrograms() {
    try {
      return JSON.parse(localStorage.getItem('studyPrograms') || '[]');
    } catch {
      return [];
    }
  }

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('studyLogs') || '{}');
    } catch {
      return {};
    }
  }

  getProgramCount() {
    return this.getPrograms().length;
  }

  getCurrentStreak() {
    if (window.userManager) {
      return window.userManager.profile.stats.currentStreak || 0;
    }
    return 0;
  }

  getTotalStudyMinutes() {
    if (window.userManager) {
      return window.userManager.profile.stats.totalStudyMinutes || 0;
    }
    return 0;
  }

  getTodayMinutes() {
    const logs = this.getLogs();
    const today = new Date().toISOString().split('T')[0];
    return logs[today]?.totalMinutes || 0;
  }

  // ==================== UI FONKSİYONLARI ====================

  /**
   * Rozet modalı göster
   */
  showBadgeModal(badge) {
    const modal = document.createElement('div');
    modal.id = 'badgeModal';
    modal.className = 'modal-overlay badge-modal-overlay';
    modal.innerHTML = `
      <div class="badge-modal">
        <div class="badge-celebration">
          <div class="badge-icon-lg">${badge.icon}</div>
          <h2>🎉 Yeni Rozet Kazandın!</h2>
          <div class="badge-info">
            <div class="badge-name">${badge.name}</div>
            <div class="badge-tier ${badge.tier}">${this.getTierLabel(badge.tier)}</div>
          </div>
          <p class="badge-description">${badge.description}</p>
          <button class="btn-primary" onclick="badgesSystem.closeBadgeModal()">
            Harika! 🎊
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 5 saniye sonra otomatik kapat
    setTimeout(() => {
      this.closeBadgeModal();
    }, 5000);
  }

  /**
   * Rozet modalını kapat
   */
  closeBadgeModal() {
    const modal = document.getElementById('badgeModal');
    if (modal) modal.remove();
  }

  /**
   * Confetti animasyonu
   */
  showConfetti() {
    // Basit confetti efekti (CSS animasyonu ile)
    const confetti = document.createElement('div');
    confetti.className = 'confetti-container';
    confetti.innerHTML = Array.from({ length: 50 }, (_, i) => {
      const colors = ['#667eea', '#764ba2', '#ff9800', '#4caf50', '#f44336'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 3;
      return `<div class="confetti" style="left: ${left}%; background: ${color}; animation-delay: ${delay}s"></div>`;
    }).join('');

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }

  /**
   * Rozet bildirimi
   */
  showBadgeNotification(badge) {
    if (window.notificationManager) {
      window.notificationManager.showNotification(`🏆 ${badge.name}`, {
        body: badge.description,
        icon: 'icons/icon-192x192.png'
      });
    }
  }

  /**
   * Tier label
   */
  getTierLabel(tier) {
    const labels = {
      bronze: '🥉 Bronz',
      silver: '🥈 Gümüş',
      gold: '🥇 Altın',
      platinum: '💎 Platin'
    };
    return labels[tier] || tier;
  }

  /**
   * Rozetleri listele (profil için)
   */
  renderBadgeGallery() {
    const earned = Object.keys(this.earnedBadges).length;
    const total = Object.keys(this.badges).length;

    let html = `
      <div class="badge-gallery">
        <div class="gallery-header">
          <h3>🏆 Rozetlerim</h3>
          <div class="badge-progress">
            <span>${earned} / ${total}</span>
            <div class="badge-progress-bar">
              <div class="badge-progress-fill" style="width: ${(earned/total)*100}%"></div>
            </div>
          </div>
        </div>
        <div class="badge-grid">
    `;

    // Kategori başına grupla
    const categories = {
      milestone: 'Kilometre Taşları',
      streak: 'Ardışıklık',
      time: 'Çalışma Süresi',
      daily: 'Günlük Başarılar',
      collection: 'Koleksiyon',
      special: 'Özel Başarılar'
    };

    Object.entries(categories).forEach(([catId, catName]) => {
      const catBadges = Object.values(this.badges).filter(b => b.category === catId);

      html += `<div class="badge-category">
        <h4>${catName}</h4>
        <div class="badge-list">`;

      catBadges.forEach(badge => {
        const earned = this.hasBadge(badge.id);
        html += `
          <div class="badge-item ${earned ? 'earned' : 'locked'}" title="${badge.description}">
            <div class="badge-icon">${earned ? badge.icon : '🔒'}</div>
            <div class="badge-name">${badge.name}</div>
            ${earned ? `<div class="badge-tier-mini ${badge.tier}"></div>` : ''}
          </div>
        `;
      });

      html += '</div></div>';
    });

    html += '</div></div>';
    return html;
  }

  /**
   * Son kazanılan rozeti göster (sidebar için)
   */
  renderLatestBadge() {
    const latest = this.getLatestBadge();
    if (!latest) {
      return '<p class="no-badges">Henüz rozet yok</p>';
    }

    return `
      <div class="latest-badge" onclick="badgesSystem.showAllBadges()">
        <div class="latest-badge-icon">${latest.badge.icon}</div>
        <div class="latest-badge-info">
          <div class="latest-badge-name">${latest.badge.name}</div>
          <div class="latest-badge-time">${this.formatDate(latest.earnedAt)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Son kazanılan rozet
   */
  getLatestBadge() {
    const badges = Object.values(this.earnedBadges);
    if (badges.length === 0) return null;

    return badges.sort((a, b) =>
      new Date(b.earnedAt) - new Date(a.earnedAt)
    )[0];
  }

  /**
   * Tarih formatlama
   */
  formatDate(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  }

  /**
   * Tüm rozetleri göster (modal)
   */
  showAllBadges() {
    const modal = document.createElement('div');
    modal.id = 'badgeGalleryModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="log-modal">
        <div class="modal-header">
          <h2>🏆 Rozet Koleksiyonu</h2>
          <button class="modal-close" onclick="badgesSystem.closeGalleryModal()">&times;</button>
        </div>
        <div class="modal-body">
          ${this.renderBadgeGallery()}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Galeri modalını kapat
   */
  closeGalleryModal() {
    const modal = document.getElementById('badgeGalleryModal');
    if (modal) modal.remove();
  }
}

// Global instance
const badgesSystem = new BadgesSystem();
window.badgesSystem = badgesSystem;

console.log('✅ Badges System yüklendi');
