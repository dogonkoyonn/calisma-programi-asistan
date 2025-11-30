// ==================== ÇALIŞMA PROGRAMI ASİSTANI ====================
// Basit, çalışan, frontend-only sistem
// Backend/AI yok, sadece wizard ve program yönetimi

// ==================== PROGRAM YÖNETİCİSİ ====================

class StudyProgramManager {
    constructor() {
        this.programs = this.loadPrograms();
    }

    loadPrograms() {
        const saved = localStorage.getItem('studyPrograms');
        return saved ? JSON.parse(saved) : [];
    }

    savePrograms() {
        localStorage.setItem('studyPrograms', JSON.stringify(this.programs));
    }

    getPrograms() {
        return this.programs;
    }

    getProgram(id) {
        return this.programs.find(p => p.id === id);
    }

    createProgram(name, subject, daysPerWeek, hoursPerDay, resources, schedule) {
        const program = {
            id: Date.now().toString(),
            name,
            subject,
            daysPerWeek,
            hoursPerDay,
            resources,
            schedule,
            topics: [],
            createdAt: new Date().toISOString()
        };

        this.programs.push(program);
        this.savePrograms();
        return program;
    }

    updateProgram(id, updates) {
        const program = this.programs.find(p => p.id === id);
        if (program) {
            Object.assign(program, updates);
            this.savePrograms();
        }
    }

    deleteProgram(id) {
        this.programs = this.programs.filter(p => p.id !== id);
        this.savePrograms();
    }

    addTopic(programId, topic) {
        const program = this.getProgram(programId);
        if (program) {
            program.topics.push({
                name: topic,
                duration: 60,
                completed: false
            });
            this.savePrograms();
        }
    }

    toggleTopic(programId, topicIndex) {
        const program = this.getProgram(programId);
        if (program && program.topics[topicIndex]) {
            program.topics[topicIndex].completed = !program.topics[topicIndex].completed;
            this.savePrograms();
        }
    }

    getStats(programId) {
        const program = this.getProgram(programId);
        if (!program) return {total: 0, completed: 0, percentage: 0};

        const total = program.topics.length;
        const completed = program.topics.filter(t => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {total, completed, percentage};
    }
}

// ==================== UYGULAMA ====================

class App {
    constructor() {
        this.programManager = new StudyProgramManager();
        this.studyTracker = new StudyTracker();
        this.detailPanel = document.getElementById('detailPanel');
        this.panelContent = document.getElementById('panelContent');

        this.init();
    }

    init() {
        // Event listeners
        document.getElementById('programPanelBtn')?.addEventListener('click', () => this.openDashboard());
        document.getElementById('closeDetailBtn')?.addEventListener('click', () => this.closeDetailPanel());
        document.getElementById('newProgramBtn')?.addEventListener('click', () => this.showCreateProgramForm());

        // Feature tooltips - özellik kartlarına tıklanınca bilgi göster
        this.initFeatureTooltips();

        // Subject badge tooltips - Kimler İçin bölümü için
        this.initSubjectBadgeTooltips();

        // Sidebar interactions
        this.initSidebarInteractions();

        // İlk yüklemede istatistikleri güncelle
        this.updateSidebarStats();

        // Bildirim izni kontrolü
        this.checkNotificationPermission();

        console.log('✅ Uygulama hazır!');
        console.log('📚 Kayıtlı programlar:', this.programManager.getPrograms().length);
    }

    // ==================== BİLDİRİM SİSTEMİ ====================

    async checkNotificationPermission() {
        // 3 saniye sonra bildirim izni iste (kullanıcı uygulamayı tanısın)
        setTimeout(() => {
            if (Notification.permission === 'default') {
                this.showNotificationPermissionDialog();
            }
        }, 3000);

        // Streak kontrolü yap
        const streak = this.studyTracker.getStreak();
        if (streak >= 5 && Notification.permission === 'granted') {
            window.notificationManager.showStreakNotification(streak);
        }
    }

    showNotificationPermissionDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'notification-permission-dialog';
        dialog.innerHTML = `
            <div class="permission-dialog-content">
                <button class="permission-dialog-close" onclick="this.parentElement.parentElement.remove()">✕</button>
                <div class="permission-icon">🔔</div>
                <h3>Çalışma Hatırlatıcıları</h3>
                <p>Programına göre çalışma saatlerinde hatırlatıcı almak ister misin?</p>
                <div class="permission-benefits">
                    <div class="benefit-item">⏰ Çalışma zamanı hatırlatıcıları</div>
                    <div class="benefit-item">☕ Mola zamanı bildirimleri</div>
                    <div class="benefit-item">🔥 Streak ve motivasyon mesajları</div>
                    <div class="benefit-item">📊 Günlük çalışma özeti</div>
                </div>
                <button class="permission-btn-allow" onclick="app.requestNotificationPermission(this)">
                    Bildirimleri Aç
                </button>
                <button class="permission-btn-deny" onclick="this.parentElement.parentElement.remove()">
                    Şimdi Değil
                </button>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    async requestNotificationPermission(button) {
        button.disabled = true;
        button.textContent = 'İzin İsteniyor...';

        const granted = await window.notificationManager.requestPermission();

        if (granted) {
            button.textContent = 'Bildirimler Aktif! ✅';
            setTimeout(() => {
                document.querySelector('.notification-permission-dialog')?.remove();
            }, 1500);
        } else {
            button.textContent = 'İzin Verilmedi';
            button.disabled = false;
        }
    }

    // ==================== ÖZELLİK TOOLTIP SİSTEMİ ====================

    initSubjectBadgeTooltips() {
        const badgeData = {
            '🎓 Üniversite': {
                icon: '🎓',
                title: 'Üniversite Öğrencileri İçin',
                description: 'Sınavlara hazırlık, dönem projeleri ve akademik başarı için sistematik çalışma programları',
                details: [
                    'Final ve vize sınavı hazırlığı',
                    'Dönem projesi planlama ve takibi',
                    'Konu bazlı çalışma takvimleri',
                    'Akademik başarı ve not ortalaması yükseltme',
                    'Mezuniyet projesi organizasyonu'
                ]
            },
            '🏫 Lise': {
                icon: '🏫',
                title: 'Lise Öğrencileri İçin',
                description: 'YKS, AYT, TYT hazırlık ve okul derslerine düzenli çalışma programları',
                details: [
                    'Üniversite sınavı hazırlığı (YKS/TYT/AYT)',
                    'Okul dersleri ve yazılı sınavları',
                    'Konu bitirme ve pekiştirme stratejileri',
                    'Soru çözme ve deneme sınavı programları',
                    'Son 100 gün sprint programları'
                ]
            },
            '📜 Sertifika': {
                icon: '📜',
                title: 'Sertifika Programları İçin',
                description: 'Profesyonel sertifikalar ve bootcamp programları için yapılandırılmış eğitim planı',
                details: [
                    'Bootcamp programları (Full Stack, Data Science, UI/UX)',
                    'Profesyonel sertifika hazırlığı (AWS, Google, Microsoft)',
                    'Proje bazlı öğrenme ve portfolio oluşturma',
                    'Kariyer geliştirme rotası',
                    'Sistematik ve adım adım ilerleme'
                ]
            },
            '🌍 Dil Öğrenme': {
                icon: '🌍',
                title: 'Dil Öğrenenlere Özel',
                description: 'İngilizce ve diğer yabancı dillerde akıcılık kazanmak için günlük pratik programları',
                details: [
                    'Günlük konuşma ve listening pratiği',
                    'Grammar ve vocabulary çalışma planı',
                    'Speaking ve pronunciation geliştirme',
                    '90 günlük dil akıcılık programları',
                    'TOEFL, IELTS, YDS hazırlık programları'
                ]
            }
        };

        const subjectBadges = document.querySelectorAll('.subject-badge');
        subjectBadges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                const text = badge.textContent.trim();
                const data = badgeData[text];
                if (data) {
                    this.showFeatureTooltip(data, e.currentTarget);
                }
            });
        });
    }

    initFeatureTooltips() {
        const featureData = {
            '🎯': {
                icon: '🎯',
                title: 'Adım Adım Sihirbaz',
                description: '5 adımlık rehberle kişiselleştirilmiş çalışma programınızı kolayca oluşturun.',
                details: [
                    'Konu ve seviye seçimi',
                    'Çalışma modu belirleme (Sprint, Marathon, Balanced, Casual)',
                    'Haftalık saat ayarı',
                    'Otomatik program oluşturma',
                    'Detaylı takvim görünümü'
                ]
            },
            '📺': {
                icon: '📺',
                title: '40+ YouTube Kanalı',
                description: 'Seviyenize ve konunuza uygun, özenle seçilmiş YouTube kanalları ve içerikleri.',
                details: [
                    '8 farklı kategoride kaynaklar',
                    'Başlangıç, Orta, İleri seviyeler',
                    'YKS, Programlama, İngilizce, Veri Bilimi',
                    'Grafik Tasarım, Müzik, Kişisel Gelişim',
                    'Her kaynak için seviye ve süre bilgisi'
                ]
            },
            '📊': {
                icon: '📊',
                title: 'İlerleme Takibi',
                description: 'Çalışma seanslarınızı kaydedin, ilerleyişinizi grafiklerle görüntüleyin.',
                details: [
                    'Günlük çalışma logu',
                    'Haftalık ve aylık grafikler',
                    'Konu bazında ilerleme yüzdesi',
                    'Tamamlanan/kalan konu sayısı',
                    'Streak (ardışık gün) sistemi'
                ]
            },
            '⚡': {
                icon: '⚡',
                title: '4 Çalışma Modu',
                description: 'Hedeflerinize uygun çalışma temposunu seçin.',
                details: [
                    'Sprint: 45dk çalış, 10dk ara (5-7 saat/gün)',
                    'Marathon: 50dk çalış, 10dk ara (4-6 saat/gün)',
                    'Balanced: 25dk çalış, 5dk ara (2-4 saat/gün)',
                    'Casual: 30dk çalış, 10dk ara (1-2 saat/gün)',
                    'Pomodoro timer entegrasyonu (yakında)'
                ]
            },
            '🎨': {
                icon: '🎨',
                title: 'Hazır Şablonlar',
                description: 'Popüler hedeflere özel hazırlanmış program şablonları.',
                details: [
                    'YKS Hazırlık (TYT + AYT)',
                    'Final Haftası',
                    'Dil Sertifikası (TOEFL, IELTS)',
                    'Bootcamp Programı',
                    'Hobi ve Kişisel Gelişim',
                    'Özelleştirilebilir şablonlar'
                ]
            },
            '💾': {
                icon: '💾',
                title: 'Otomatik Kayıt',
                description: 'Tüm verileriniz otomatik olarak tarayıcınıza kaydedilir.',
                details: [
                    'LocalStorage ile güvenli kayıt',
                    'İnternet bağlantısı gerektirmez',
                    'Programlar ve ilerlemeler saklanır',
                    'Çalışma logları korunur',
                    'Veri kaybı riski yok'
                ]
            }
        };

        const featureItems = document.querySelectorAll('.feature-item');
        featureItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const icon = item.querySelector('.feature-icon').textContent.trim();
                const data = featureData[icon];
                if (data) {
                    this.showFeatureTooltip(data, e.currentTarget);
                }
            });
        });
    }

    showFeatureTooltip(data, clickedElement) {
        // Varsa önceki tooltip'i kaldır
        const existing = document.querySelector('.feature-tooltip');
        if (existing) {
            existing.remove();
        }

        // Tooltip HTML'i oluştur
        const tooltip = document.createElement('div');
        tooltip.className = 'feature-tooltip';

        let detailsHTML = '';
        data.details.forEach(detail => {
            detailsHTML += `<div class="tooltip-detail-item">${detail}</div>`;
        });

        tooltip.innerHTML = `
            <button class="tooltip-close">✕</button>
            <div class="tooltip-header">
                <span class="tooltip-icon">${data.icon}</span>
                <h3 class="tooltip-title">${data.title}</h3>
            </div>
            <p class="tooltip-description">${data.description}</p>
            <div class="tooltip-details">
                ${detailsHTML}
            </div>
        `;

        document.body.appendChild(tooltip);

        // Tooltip pozisyonunu ayarla (tıklanan elemanın yanında)
        const rect = clickedElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.bottom + 10;

        // Ekran sınırlarını kontrol et
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = rect.top - tooltipRect.height - 10;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';

        // Kapat butonu
        tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
            tooltip.remove();
        });

        // Dışarı tıklanınca kapat
        setTimeout(() => {
            document.addEventListener('click', function closeTooltip(e) {
                if (!tooltip.contains(e.target) && !clickedElement.contains(e.target)) {
                    tooltip.remove();
                    document.removeEventListener('click', closeTooltip);
                }
            });
        }, 100);
    }

    // Sidebar interactions - İstatistik widget'ına tıklanabilirlik ekle
    initSidebarInteractions() {
        const statsWidget = document.querySelector('.stats-widget');
        if (statsWidget) {
            statsWidget.style.cursor = 'pointer';
            statsWidget.style.transition = 'transform 0.2s ease';

            statsWidget.addEventListener('click', () => {
                this.showProgramPanel();
            });

            statsWidget.addEventListener('mouseenter', () => {
                statsWidget.style.transform = 'scale(1.02)';
            });

            statsWidget.addEventListener('mouseleave', () => {
                statsWidget.style.transform = 'scale(1)';
            });
        }
    }

    // Sidebar istatistiklerini güncelle
    updateSidebarStats() {
        const programs = this.programManager.getPrograms();
        let totalTopics = 0;
        let completedTopics = 0;

        programs.forEach(program => {
            totalTopics += program.topics.length;
            completedTopics += program.topics.filter(t => t.completed).length;
        });

        const ongoingTopics = totalTopics - completedTopics;

        document.getElementById('totalPrograms').textContent = programs.length;
        document.getElementById('completedTopics').textContent = completedTopics;
        document.getElementById('ongoingTopics').textContent = ongoingTopics;
    }

    // ==================== PROGRAM PANELİ ====================

    closeWizard() {
        const wizardContainer = document.getElementById('wizardContainer');
        if (wizardContainer) {
            wizardContainer.style.display = 'none';
        }
    }

    showProgramPanel() {
        this.closeWizard(); // Wizard'ı kapat
        this.detailPanel.style.display = 'block';
        this.renderProgramPanel();
    }

    closeDetailPanel() {
        this.detailPanel.style.display = 'none';
    }

    showCreateProgramForm() {
        this.closeDetailPanel(); // Panel'i kapat
        const wizardContainer = document.getElementById('wizardContainer');
        if (wizardContainer) {
            wizardContainer.style.display = 'block';
            wizard.start();
        }
    }

    renderProgramPanel() {
        const programs = this.programManager.getPrograms();

        let html = `
            <div class="program-panel">
                <div class="panel-header">
                    <h3>📚 Çalışma Programları</h3>
                    <button class="btn-primary" onclick="app.showCreateProgramForm()">
                        ➕ Yeni Program
                    </button>
                </div>

                <div class="programs-list">
        `;

        if (programs.length === 0) {
            html += `
                <div class="empty-state">
                    <p>Henüz program oluşturmadınız.</p>
                    <p>"Yeni Program" butonuna tıklayarak başlayın!</p>
                </div>
            `;
        } else {
            programs.forEach(program => {
                const stats = this.programManager.getStats(program.id);
                html += `
                    <div class="program-card">
                        <div class="program-header">
                            <h4>${program.name}</h4>
                            <button class="btn-danger-small" onclick="app.deleteProgram('${program.id}')">🗑️</button>
                        </div>
                        <div class="program-info">
                            <span>📖 ${program.subject}</span>
                            <span>📅 ${program.daysPerWeek} gün/hafta</span>
                            <span>⏰ ${program.hoursPerDay} saat/gün</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${stats.percentage}%"></div>
                        </div>
                        <p class="progress-text">${stats.completed}/${stats.total} konu tamamlandı (%${stats.percentage})</p>
                        <div class="program-card-actions">
                            <button class="btn-secondary" onclick="app.showProgramDetails('${program.id}')">
                                Detaylar
                            </button>
                            <button class="btn-primary" onclick="app.showProgramCalendar('${program.id}')">
                                📅 Takvim
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div></div>`;
        this.panelContent.innerHTML = html;
    }

    showProgramDetails(programId) {
        this.closeWizard(); // Wizard'ı kapat
        this.detailPanel.style.display = 'block'; // Panel'i aç

        const program = this.programManager.getProgram(programId);
        if (!program) return;

        const stats = this.programManager.getStats(programId);

        let html = `
            <div class="program-details">
                <button class="btn-back" onclick="app.showProgramPanel()">← Geri</button>

                <div class="program-detail-header">
                    <h3>${program.name}</h3>
                    <span class="program-subject">${program.subject}</span>
                </div>

                <div class="schedule-grid">
                    <div class="schedule-item">
                        <span class="label">Haftalık</span>
                        <span class="value">${program.daysPerWeek} gün</span>
                    </div>
                    <div class="schedule-item">
                        <span class="label">Günlük</span>
                        <span class="value">${program.hoursPerDay} saat</span>
                    </div>
                    <div class="schedule-item">
                        <span class="label">İlerleme</span>
                        <span class="value">%${stats.percentage}</span>
                    </div>
                </div>

                <div class="program-actions">
                    <button class="btn-primary" onclick="app.showProgramCalendar('${programId}')">
                        📅 Haftalık Takvimi Gör
                    </button>
                </div>

                ${this.renderProgramResources(program)}
                ${this.renderProgramTopics(program, programId)}
            </div>
        `;

        this.panelContent.innerHTML = html;
    }

    renderProgramResources(program) {
        if (!program.resources || (!program.resources.youtube?.length && !program.resources.books?.length)) {
            return '';
        }

        let html = '<div class="program-resources"><h4>📚 Kaynaklar</h4><div class="resources-list">';

        if (program.resources.youtube && program.resources.youtube.length > 0) {
            html += '<h5>🎥 YouTube Kanalları</h5>';
            program.resources.youtube.forEach(channel => {
                html += `<div class="resource-tag"><a href="${channel.url}" target="_blank">${channel.name}</a></div>`;
            });
        }

        if (program.resources.books && program.resources.books.length > 0) {
            html += '<h5>📖 Kitaplar</h5>';
            program.resources.books.forEach(book => {
                html += `<div class="resource-tag">${book.name}</div>`;
            });
        }

        html += '</div></div>';
        return html;
    }

    renderProgramTopics(program, programId) {
        let html = `
            <div class="program-topics">
                <div class="topics-header">
                    <h4>📝 Konular</h4>
                    <button class="btn-primary-small" onclick="app.showAddTopicForm('${programId}')">➕ Konu Ekle</button>
                </div>
                <div class="topics-list">
        `;

        if (program.topics.length === 0) {
            html += '<div class="empty-topics">Henüz konu eklenmedi</div>';
        } else {
            program.topics.forEach((topic, index) => {
                const completed = topic.completed ? 'completed' : '';
                html += `
                    <div class="topic-item ${completed}">
                        <input type="checkbox" ${topic.completed ? 'checked' : ''}
                               onchange="app.toggleTopic('${programId}', ${index})">
                        <span class="topic-name">${topic.name}</span>
                        <span class="topic-duration">${topic.duration}dk</span>
                    </div>
                `;
            });
        }

        html += '</div></div>';
        return html;
    }

    showAddTopicForm(programId) {
        const topicName = prompt('Konu adını girin:');
        if (topicName && topicName.trim()) {
            this.programManager.addTopic(programId, topicName.trim());
            this.showProgramDetails(programId);
        }
    }

    toggleTopic(programId, topicIndex) {
        this.programManager.toggleTopic(programId, topicIndex);
        this.showProgramDetails(programId);
        this.updateSidebarStats(); // İstatistikleri güncelle
    }

    deleteProgram(programId) {
        if (confirm('Bu programı silmek istediğinize emin misiniz?')) {
            this.programManager.deleteProgram(programId);
            this.showProgramPanel();
            this.updateSidebarStats(); // İstatistikleri güncelle
        }
    }

    // ==================== HAFTALIK TAKVİM ====================

    showProgramCalendar(programId) {
        this.closeWizard(); // Wizard'ı kapat
        window.calendarManager.showProgramCalendar(programId);
    }

    toggleTopicCompletion(programId, topicName) {
        const program = this.programManager.getProgram(programId);
        if (!program) return;

        // Konuyu bul ve toggle et - Case-insensitive match
        const topicIndex = program.topics.findIndex(t =>
            t.name.toLowerCase().trim() === topicName.toLowerCase().trim()
        );
        if (topicIndex !== -1) {
            this.programManager.toggleTopic(programId, topicIndex);

            // Takvimi yeniden render et
            window.calendarManager.showProgramCalendar(programId);

            // İstatistikleri güncelle
            this.updateSidebarStats();

            // Bildirim göster (opsiyonel)
            if (program.topics[topicIndex].completed && window.notificationManager) {
                window.notificationManager.showNotification('✅ Tamamlandı!', {
                    body: `${topicName} konusunu tamamladın!`,
                    icon: '/icons/icon-192x192.png'
                });
            }
        }
    }

    // Yeni dashboard'u aç
    openDashboard() {
        if (window.programDashboard) {
            window.programDashboard.open();
        }
    }
}

// ==================== BAŞLAT ====================

let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app; // Global erişim için
    console.log('🚀 Çalışma Programı Asistanı başlatıldı!');
});
