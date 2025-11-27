// ==================== USER MANAGER ====================
// Kullanıcı profili, ayarlar ve veri yönetimi

class UserManager {
    constructor() {
        this.profile = this.loadProfile();
        this.init();
    }

    init() {
        // Profil yoksa default oluştur
        if (!this.profile.id) {
            this.profile = this.getDefaultProfile();
            this.saveProfile();
        }

        console.log('👤 User Manager hazır:', this.profile.name || 'Kullanıcı');
    }

    // ==================== PROFILE MANAGEMENT ====================

    loadProfile() {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : this.getDefaultProfile();
    }

    getDefaultProfile() {
        return {
            id: this.generateId(),
            name: '',
            avatar: '🎓',
            email: '',
            createdAt: new Date().toISOString(),
            preferences: {
                theme: 'light',
                language: 'tr',
                notifications: true,
                dailyGoalMinutes: 180,
                pomodoroWork: 25,
                pomodoroBreak: 5,
                sound: true,
                vibrate: true
            },
            stats: {
                totalPrograms: 0,
                totalStudyMinutes: 0,
                totalSessions: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null
            }
        };
    }

    saveProfile() {
        localStorage.setItem('userProfile', JSON.stringify(this.profile));
        console.log('💾 Profil kaydedildi');
    }

    updateProfile(updates) {
        this.profile = { ...this.profile, ...updates };
        this.saveProfile();
    }

    updatePreferences(preferences) {
        this.profile.preferences = { ...this.profile.preferences, ...preferences };
        this.saveProfile();
    }

    updateStats(stats) {
        this.profile.stats = { ...this.profile.stats, ...stats };
        this.saveProfile();
    }

    // ==================== DATA EXPORT/IMPORT ====================

    exportAllData() {
        const data = {
            version: '2.1.0',
            exportedAt: new Date().toISOString(),
            profile: this.profile,
            programs: JSON.parse(localStorage.getItem('studyPrograms') || '[]'),
            logs: JSON.parse(localStorage.getItem('studyLogs') || '{}'),
            notifications: JSON.parse(localStorage.getItem('notificationSettings') || '{}'),
            scheduled: JSON.parse(localStorage.getItem('scheduledNotifications') || '[]')
        };

        // JSON dosyası oluştur ve indir
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studyplan-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('📥 Veri export edildi:', data);
        return data;
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Versiyon kontrolü
                    if (data.version) {
                        console.log('📦 Import edilen versiyon:', data.version);
                    }

                    // Verileri kaydet
                    if (data.profile) {
                        localStorage.setItem('userProfile', JSON.stringify(data.profile));
                    }
                    if (data.programs) {
                        localStorage.setItem('studyPrograms', JSON.stringify(data.programs));
                    }
                    if (data.logs) {
                        localStorage.setItem('studyLogs', JSON.stringify(data.logs));
                    }
                    if (data.notifications) {
                        localStorage.setItem('notificationSettings', JSON.stringify(data.notifications));
                    }
                    if (data.scheduled) {
                        localStorage.setItem('scheduledNotifications', JSON.stringify(data.scheduled));
                    }

                    console.log('✅ Veri başarıyla import edildi');

                    // Başarı mesajı göster
                    this.showImportSuccess();

                    // Sayfayı yenile
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);

                    resolve(data);
                } catch (error) {
                    console.error('❌ Import hatası:', error);
                    this.showImportError(error);
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Dosya okunamadı'));
            };

            reader.readAsText(file);
        });
    }

    showImportSuccess() {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <span>✅</span>
            <span>Veri başarıyla içe aktarıldı! Sayfa yenileniyor...</span>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, #4CAF50, #66BB6A);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10001;
            animation: slideInUp 0.3s ease;
        `;
        document.body.appendChild(toast);
    }

    showImportError(error) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <span>❌</span>
            <span>Import hatası: ${error.message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, #f44336, #e53935);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10001;
            animation: slideInUp 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 5000);
    }

    // ==================== DATA RESET ====================

    resetAllData() {
        if (confirm('⚠️ TÜM VERİLERİ SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?\n\nBu işlem geri alınamaz! Devam etmeden önce verilerinizi export edin.')) {
            // Son bir uyarı
            if (confirm('SON UYARI: Tüm programlar, loglar ve ayarlar silinecek. Emin misiniz?')) {
                localStorage.clear();
                console.log('🗑️ Tüm veriler silindi');

                // Başarı mesajı
                alert('✅ Tüm veriler silindi. Sayfa yenileniyor...');
                window.location.reload();
            }
        }
    }

    // ==================== UTILITY ====================

    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Profil doluluk oranı (istatistik için)
    getProfileCompleteness() {
        let score = 0;
        let total = 4;

        if (this.profile.name) score++;
        if (this.profile.email) score++;
        if (this.profile.avatar && this.profile.avatar !== '🎓') score++;
        if (this.profile.stats.totalPrograms > 0) score++;

        return Math.round((score / total) * 100);
    }

    // Kullanıcı streak güncellemesi
    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = this.profile.stats.lastStudyDate;

        if (lastDate === today) {
            // Bugün zaten çalışılmış
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
            // Streak devam ediyor
            this.profile.stats.currentStreak++;
            if (this.profile.stats.currentStreak > this.profile.stats.longestStreak) {
                this.profile.stats.longestStreak = this.profile.stats.currentStreak;
            }
        } else if (!lastDate) {
            // İlk gün
            this.profile.stats.currentStreak = 1;
            this.profile.stats.longestStreak = 1;
        } else {
            // Streak koptu
            this.profile.stats.currentStreak = 1;
        }

        this.profile.stats.lastStudyDate = today;
        this.saveProfile();
    }
}

// Global instance oluştur
window.userManager = new UserManager();
