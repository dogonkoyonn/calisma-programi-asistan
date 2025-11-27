// ==================== PROGRAM DASHBOARD ====================
// Gelişmiş program yönetim kontrol paneli

class ProgramDashboard {
    constructor() {
        this.activeTab = 'dashboard';
        this.viewMode = 'grid'; // grid or list
        this.filters = {
            status: 'all', // all, active, completed, paused
            level: 'all',  // all, temel, orta, ileri
            subject: 'all',
            search: ''
        };
        this.sortBy = 'date'; // date, progress, name
        this.selectedPrograms = new Set();
        this.panel = null;

        this.init();
    }

    init() {
        this.createPanel();
        console.log('📊 Program Dashboard hazır');
    }

    // ==================== PANEL CREATION ====================

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'programDashboard';
        panel.className = 'program-dashboard';
        panel.style.display = 'none';

        panel.innerHTML = `
            <div class="dashboard-overlay"></div>
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>📚 Programlarım Kontrol Paneli</h2>
                    <button class="dashboard-close" onclick="programDashboard.close()">✕</button>
                </div>

                <div class="dashboard-tabs">
                    <button class="tab-button active" data-tab="dashboard" onclick="programDashboard.switchTab('dashboard')">
                        📊 Dashboard
                    </button>
                    <button class="tab-button" data-tab="calendar" onclick="programDashboard.switchTab('calendar')">
                        📅 Takvim
                    </button>
                    <button class="tab-button" data-tab="stats" onclick="programDashboard.switchTab('stats')">
                        📈 İstatistikler
                    </button>
                    <button class="tab-button" data-tab="settings" onclick="programDashboard.switchTab('settings')">
                        ⚙️ Ayarlar
                    </button>
                </div>

                <div class="dashboard-body">
                    <!-- Dashboard Tab -->
                    <div class="tab-content active" data-tab="dashboard">
                        ${this.renderDashboardTab()}
                    </div>

                    <!-- Calendar Tab -->
                    <div class="tab-content" data-tab="calendar">
                        ${this.renderCalendarTab()}
                    </div>

                    <!-- Stats Tab -->
                    <div class="tab-content" data-tab="stats">
                        ${this.renderStatsTab()}
                    </div>

                    <!-- Settings Tab -->
                    <div class="tab-content" data-tab="settings">
                        ${this.renderSettingsTab()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        // Event listeners
        this.attachEventListeners();
    }

    // ==================== TAB RENDERING ====================

    renderDashboardTab() {
        return `
            <div class="dashboard-content">
                <!-- Quick Actions Bar -->
                <div class="quick-actions-bar">
                    <button class="btn-action primary" onclick="app.showCreateProgramForm()">
                        ➕ Yeni Program
                    </button>
                    <button class="btn-action success" onclick="sessionManager.openStartModal()">
                        🎯 Seans Başlat
                    </button>
                    <div class="search-box">
                        <input type="text"
                               id="programSearch"
                               placeholder="🔍 Program veya konu ara..."
                               oninput="programDashboard.handleSearch(this.value)">
                    </div>
                    <div class="filter-dropdown">
                        <button class="btn-action" onclick="programDashboard.toggleFilters()">
                            🗂️ Filtrele
                        </button>
                        <div class="filter-menu" id="filterMenu" style="display: none;">
                            ${this.renderFilterMenu()}
                        </div>
                    </div>
                    <div class="view-toggle">
                        <button class="btn-view ${this.viewMode === 'grid' ? 'active' : ''}"
                                onclick="programDashboard.setViewMode('grid')"
                                title="Grid Görünümü">
                            ▦
                        </button>
                        <button class="btn-view ${this.viewMode === 'list' ? 'active' : ''}"
                                onclick="programDashboard.setViewMode('list')"
                                title="Liste Görünümü">
                            ☰
                        </button>
                    </div>
                    <button class="btn-action" onclick="programDashboard.toggleBulkActions()">
                        ⚙️ Toplu İşlem
                    </button>
                </div>

                <!-- Programs Grid/List -->
                <div id="programsContainer" class="programs-container ${this.viewMode}-view">
                    ${this.renderPrograms()}
                </div>

                <!-- Today's Tasks Widget -->
                <div class="todays-tasks-widget">
                    <h3>📋 Bugünün Görevleri</h3>
                    <div id="todaysTasks">
                        ${this.renderTodaysTasks()}
                    </div>
                </div>

                <!-- Daily Log Widget -->
                <div class="daily-log-widget">
                    <div id="dailyLogWidget">
                        ${window.dailyLogViewer ? window.dailyLogViewer.renderForDashboard() : '<p>Yükleniyor...</p>'}
                    </div>
                </div>

                <!-- Latest Badge Widget -->
                <div class="badge-widget">
                    <h3>🏆 Son Rozet</h3>
                    <div id="latestBadge">
                        ${window.badgesSystem ? window.badgesSystem.renderLatestBadge() : '<p>Yükleniyor...</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    renderCalendarTab() {
        return `
            <div class="calendar-tab-content">
                <div class="calendar-controls">
                    <button class="btn-secondary" onclick="programDashboard.showWeeklyCalendar()">
                        📅 Haftalık
                    </button>
                    <button class="btn-secondary" onclick="programDashboard.showDailyCalendar()">
                        📆 Günlük
                    </button>
                    <button class="btn-secondary" onclick="programDashboard.showMonthlyCalendar()">
                        📊 Aylık
                    </button>
                </div>
                <div id="calendarViewContainer">
                    <p class="info-text">Takvim görünümünü seçin...</p>
                </div>
            </div>
        `;
    }

    renderStatsTab() {
        return `
            <div class="stats-content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📚</div>
                        <div class="stat-value">${this.getTotalPrograms()}</div>
                        <div class="stat-label">Toplam Program</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${this.getCompletedTopics()}</div>
                        <div class="stat-label">Tamamlanan Konu</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-value">${this.getCurrentStreak()}</div>
                        <div class="stat-label">Gün Streak</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-value">${this.getTotalStudyHours()}</div>
                        <div class="stat-label">Toplam Saat</div>
                    </div>
                </div>

                <div class="progress-overview">
                    <h3>📊 Program Bazlı İlerleme</h3>
                    ${this.renderProgressBars()}
                </div>

                <div class="charts-grid">
                    <div class="chart-box">
                        <h3>📈 Haftalık Çalışma Grafiği</h3>
                        <canvas id="weeklyChart" width="400" height="200"></canvas>
                    </div>
                    <div class="chart-box">
                        <h3>📊 Program Dağılımı</h3>
                        <canvas id="subjectChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    renderSettingsTab() {
        return `
            <div class="settings-content">
                <div class="setting-section">
                    <h3>⏰ Varsayılan Çalışma Saatleri</h3>
                    <div class="form-group">
                        <label>Sabah Çalışma Başlangıcı</label>
                        <input type="time" id="morningStart" value="09:00">
                    </div>
                    <div class="form-group">
                        <label>Öğleden Sonra Başlangıç</label>
                        <input type="time" id="afternoonStart" value="14:00">
                    </div>
                    <div class="form-group">
                        <label>Akşam Çalışma Başlangıcı</label>
                        <input type="time" id="eveningStart" value="19:00">
                    </div>
                </div>

                <div class="setting-section">
                    <h3>🎨 Görünüm Tercihleri</h3>
                    <div class="form-group">
                        <label>Varsayılan Görünüm</label>
                        <select id="defaultView">
                            <option value="grid">Grid Görünümü</option>
                            <option value="list">Liste Görünümü</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Takvim Başlangıç Günü</label>
                        <select id="weekStart">
                            <option value="monday">Pazartesi</option>
                            <option value="sunday">Pazar</option>
                        </select>
                    </div>
                </div>

                <div class="setting-section">
                    <h3>💾 Veri Yönetimi</h3>
                    <button class="btn-primary" onclick="programDashboard.exportAllPrograms()">
                        📥 Tüm Programları Dışa Aktar
                    </button>
                    <button class="btn-secondary" onclick="programDashboard.importPrograms()">
                        📤 Program İçe Aktar
                    </button>
                    <button class="btn-danger" onclick="programDashboard.clearCompletedPrograms()">
                        🗑️ Tamamlanan Programları Temizle
                    </button>
                </div>

                <button class="btn-primary btn-large" onclick="programDashboard.saveSettings()">
                    💾 Ayarları Kaydet
                </button>
            </div>
        `;
    }

    // ==================== FILTER MENU ====================

    renderFilterMenu() {
        return `
            <div class="filter-section">
                <label>Durum:</label>
                <select id="filterStatus" onchange="programDashboard.applyFilters()">
                    <option value="all">Tümü</option>
                    <option value="active">Aktif</option>
                    <option value="completed">Tamamlanan</option>
                    <option value="paused">Duraklatılan</option>
                </select>
            </div>
            <div class="filter-section">
                <label>Seviye:</label>
                <select id="filterLevel" onchange="programDashboard.applyFilters()">
                    <option value="all">Tümü</option>
                    <option value="temel">Temel</option>
                    <option value="orta">Orta</option>
                    <option value="ileri">İleri</option>
                </select>
            </div>
            <div class="filter-section">
                <label>Sıralama:</label>
                <select id="sortBy" onchange="programDashboard.applySort()">
                    <option value="date">Tarihe Göre</option>
                    <option value="progress">İlerlemeye Göre</option>
                    <option value="name">İsme Göre</option>
                </select>
            </div>
            <button class="btn-secondary btn-small" onclick="programDashboard.resetFilters()">
                ↺ Filtreleri Sıfırla
            </button>
        `;
    }

    // ==================== PROGRAMS RENDERING ====================

    renderPrograms() {
        const programs = this.getFilteredPrograms();

        if (programs.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <h3>Henüz program yok</h3>
                    <p>Yeni bir çalışma programı oluşturarak başlayın!</p>
                    <button class="btn-primary" onclick="app.showCreateProgramForm()">
                        ➕ İlk Programı Oluştur
                    </button>
                </div>
            `;
        }

        return programs.map(program => this.renderProgramCard(program)).join('');
    }

    renderProgramCard(program) {
        const progress = this.calculateProgress(program);
        const completedTopics = program.topics.filter(t => t.completed).length;
        const totalTopics = program.topics.length;

        return `
            <div class="program-card ${this.viewMode}" data-program-id="${program.id}">
                <div class="card-header">
                    <h3>${program.name}</h3>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="programDashboard.showCalendarForProgram('${program.id}')" title="Takvim">
                            📅
                        </button>
                        <button class="btn-icon" onclick="programDashboard.showProgramDetails('${program.id}')" title="Detaylar">
                            📊
                        </button>
                        <button class="btn-icon" onclick="programDashboard.editProgram('${program.id}')" title="Düzenle">
                            ✏️
                        </button>
                        <button class="btn-icon" onclick="programDashboard.deleteProgram('${program.id}')" title="Sil">
                            🗑️
                        </button>
                    </div>
                </div>

                <div class="card-body">
                    <div class="card-info">
                        <span class="info-item">📊 ${progress}% Tamamlandı</span>
                        <span class="info-item">⏰ ${program.daysPerWeek} gün/hafta</span>
                        <span class="info-item">🕐 ${program.hoursPerDay} saat/gün</span>
                    </div>

                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${completedTopics}/${totalTopics} konu</span>
                    </div>

                    ${this.viewMode === 'list' ? `
                        <div class="card-details">
                            <p><strong>Konu:</strong> ${program.subject}</p>
                            <p><strong>Seviye:</strong> ${program.level || 'Temel'}</p>
                            <p><strong>Başlangıç:</strong> ${program.startDate ? new Date(program.startDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ==================== TODAY'S TASKS ====================

    renderTodaysTasks() {
        const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long' }).toLowerCase();
        const dayMap = {
            'pazartesi': 0, 'salı': 1, 'çarşamba': 2, 'perşembe': 3,
            'cuma': 4, 'cumartesi': 5, 'pazar': 6
        };
        const todayIndex = dayMap[today];

        const programs = this.getAllPrograms();
        const tasks = [];

        programs.forEach(program => {
            if (program.schedule && program.schedule[todayIndex]) {
                const daySchedule = program.schedule[todayIndex];
                daySchedule.topics.forEach(topic => {
                    const topicDetails = program.topics.find(t => t.name === topic);
                    tasks.push({
                        time: daySchedule.time || '09:00',
                        program: program.name,
                        topic: topic,
                        completed: topicDetails ? topicDetails.completed : false,
                        programId: program.id
                    });
                });
            }
        });

        if (tasks.length === 0) {
            return '<p class="no-tasks">Bugün için planlanmış görev yok</p>';
        }

        tasks.sort((a, b) => a.time.localeCompare(b.time));

        return tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox"
                       ${task.completed ? 'checked' : ''}
                       onchange="programDashboard.toggleTaskCompletion('${task.programId}', '${task.topic}', this.checked)">
                <span class="task-time">${task.time}</span>
                <span class="task-content">${task.program} - ${task.topic}</span>
            </div>
        `).join('');
    }

    // ==================== STATS RENDERING ====================

    renderProgressBars() {
        const programs = this.getAllPrograms();

        return programs.map(program => {
            const progress = this.calculateProgress(program);
            return `
                <div class="progress-item">
                    <div class="progress-label">
                        <span>${program.name}</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderWeeklyChart() {
        const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        const hours = [3, 5, 4, 6, 5, 2, 0]; // Mock data - gerçek veriyle değiştirilecek

        const maxHours = Math.max(...hours);

        return `
            <div class="chart-container">
                ${days.map((day, i) => `
                    <div class="chart-bar">
                        <div class="bar" style="height: ${(hours[i] / maxHours) * 100}%">
                            <span class="bar-value">${hours[i]}h</span>
                        </div>
                        <span class="bar-label">${day}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ==================== EVENT HANDLERS ====================

    attachEventListeners() {
        // Close on overlay click
        this.panel.querySelector('.dashboard-overlay').addEventListener('click', () => {
            this.close();
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.panel.style.display === 'flex') {
                this.close();
            }
        });
    }

    switchTab(tabName) {
        this.activeTab = tabName;

        // Update tab buttons
        this.panel.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        this.panel.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });

        // Stats tab'a geçildiğinde grafikleri render et
        if (tabName === 'stats') {
            setTimeout(() => {
                this.renderCharts();
            }, 100);
        }
    }

    setViewMode(mode) {
        this.viewMode = mode;
        const container = document.getElementById('programsContainer');
        if (container) {
            container.className = `programs-container ${mode}-view`;
            container.innerHTML = this.renderPrograms();
        }

        // Update toggle buttons
        this.panel.querySelectorAll('.btn-view').forEach(btn => {
            btn.classList.remove('active');
        });
        this.panel.querySelector(`.btn-view:${mode === 'grid' ? 'first' : 'last'}-child`).classList.add('active');
    }

    // ==================== FILTER & SEARCH ====================

    toggleFilters() {
        const menu = document.getElementById('filterMenu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }

    handleSearch(query) {
        this.filters.search = query.toLowerCase();
        this.refreshPrograms();
    }

    applyFilters() {
        this.filters.status = document.getElementById('filterStatus').value;
        this.filters.level = document.getElementById('filterLevel').value;
        this.refreshPrograms();
    }

    applySort() {
        this.sortBy = document.getElementById('sortBy').value;
        this.refreshPrograms();
    }

    resetFilters() {
        this.filters = { status: 'all', level: 'all', subject: 'all', search: '' };
        this.sortBy = 'date';

        document.getElementById('filterStatus').value = 'all';
        document.getElementById('filterLevel').value = 'all';
        document.getElementById('sortBy').value = 'date';
        document.getElementById('programSearch').value = '';

        this.refreshPrograms();
    }

    refreshPrograms() {
        const container = document.getElementById('programsContainer');
        if (container) {
            container.innerHTML = this.renderPrograms();
        }
    }

    // ==================== DATA OPERATIONS ====================

    getAllPrograms() {
        try {
            return JSON.parse(localStorage.getItem('studyPrograms') || '[]');
        } catch (error) {
            console.error('Error loading programs:', error);
            return [];
        }
    }

    getFilteredPrograms() {
        let programs = this.getAllPrograms();

        // Apply search filter
        if (this.filters.search) {
            programs = programs.filter(p =>
                p.name.toLowerCase().includes(this.filters.search) ||
                p.subject.toLowerCase().includes(this.filters.search) ||
                p.topics.some(t => t.name.toLowerCase().includes(this.filters.search))
            );
        }

        // Apply status filter
        if (this.filters.status !== 'all') {
            programs = programs.filter(p => {
                const progress = this.calculateProgress(p);
                if (this.filters.status === 'completed') return progress === 100;
                if (this.filters.status === 'active') return progress > 0 && progress < 100;
                if (this.filters.status === 'paused') return p.paused === true;
                return true;
            });
        }

        // Apply level filter
        if (this.filters.level !== 'all') {
            programs = programs.filter(p => (p.level || 'temel') === this.filters.level);
        }

        // Apply sorting
        programs.sort((a, b) => {
            if (this.sortBy === 'progress') {
                return this.calculateProgress(b) - this.calculateProgress(a);
            }
            if (this.sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            // Default: date
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        return programs;
    }

    calculateProgress(program) {
        if (!program.topics || program.topics.length === 0) return 0;
        const completed = program.topics.filter(t => t.completed).length;
        return Math.round((completed / program.topics.length) * 100);
    }

    // ==================== STATS HELPERS ====================

    getTotalPrograms() {
        return this.getAllPrograms().length;
    }

    getCompletedTopics() {
        const programs = this.getAllPrograms();
        return programs.reduce((total, p) => {
            return total + (p.topics?.filter(t => t.completed).length || 0);
        }, 0);
    }

    getCurrentStreak() {
        // TODO: Implement streak calculation
        return window.userManager ? window.userManager.profile.stats.currentStreak : 0;
    }

    getTotalStudyHours() {
        const programs = this.getAllPrograms();
        return programs.reduce((total, p) => total + (p.totalHours || 0), 0);
    }

    // ==================== ACTIONS ====================

    showCalendarForProgram(programId) {
        // TODO: Implement calendar view for specific program
        this.switchTab('calendar');
    }

    showProgramDetails(programId) {
        // Use existing detail panel
        if (window.app) {
            window.app.showDetailPanel(programId);
        }
    }

    editProgram(programId) {
        // TODO: Open program editor
        if (window.programEditor) {
            window.programEditor.open(programId);
        }
    }

    deleteProgram(programId) {
        if (confirm('Bu programı silmek istediğinize emin misiniz?')) {
            let programs = this.getAllPrograms();
            programs = programs.filter(p => p.id !== programId);
            localStorage.setItem('studyPrograms', JSON.stringify(programs));
            this.refreshPrograms();
            this.showToast('Program silindi', 'success');
        }
    }

    toggleTaskCompletion(programId, topicName, completed) {
        const programs = this.getAllPrograms();
        const program = programs.find(p => p.id === programId);

        if (program) {
            const topic = program.topics.find(t => t.name === topicName);
            if (topic) {
                topic.completed = completed;
                localStorage.setItem('studyPrograms', JSON.stringify(programs));
                this.refreshPrograms();
            }
        }
    }

    // ==================== CALENDAR VIEWS ====================

    showWeeklyCalendar() {
        // Mevcut haftalık takvimi kullan
        if (window.calendarView) {
            const container = document.getElementById('calendarViewContainer');
            if (container) {
                // Mevcut calendar-view.js'i buraya render et
                container.innerHTML = '<div id="weeklyCalendar"></div>';
                window.calendarView.render('weeklyCalendar');
                this.showToast('Haftalık takvim yüklendi', 'info');
            }
        } else {
            this.showToast('Takvim modülü yükleniyor...', 'info');
            setTimeout(() => {
                const container = document.getElementById('calendarViewContainer');
                if (container) {
                    container.innerHTML = `
                        <div class="calendar-placeholder">
                            <p>Haftalık takvim görünümü hazırlanıyor...</p>
                            <p class="info-text">Programlarınızı hafta bazında görebileceksiniz.</p>
                        </div>
                    `;
                }
            }, 100);
        }
    }

    showDailyCalendar() {
        const container = document.getElementById('calendarViewContainer');
        if (container) {
            const today = new Date();
            const dayName = today.toLocaleDateString('tr-TR', { weekday: 'long' });
            const dateStr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

            container.innerHTML = `
                <div class="daily-calendar">
                    <div class="daily-header">
                        <button class="btn-nav" onclick="programDashboard.navigateDay(-1)">◀ Dün</button>
                        <h3>${dayName} - ${dateStr}</h3>
                        <button class="btn-nav" onclick="programDashboard.navigateDay(1)">Yarın ▶</button>
                    </div>
                    <div class="daily-timeline">
                        ${this.renderDailyTimeline()}
                    </div>
                </div>
            `;
            this.showToast('Günlük takvim yüklendi', 'info');
        }
    }

    showMonthlyCalendar() {
        const container = document.getElementById('calendarViewContainer');
        if (container) {
            const today = new Date();
            const monthName = today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

            container.innerHTML = `
                <div class="monthly-calendar">
                    <div class="monthly-header">
                        <button class="btn-nav" onclick="programDashboard.navigateMonth(-1)">◀ Önceki Ay</button>
                        <h3>${monthName}</h3>
                        <button class="btn-nav" onclick="programDashboard.navigateMonth(1)">Sonraki Ay ▶</button>
                    </div>
                    <div class="monthly-grid">
                        ${this.renderMonthlyGrid()}
                    </div>
                </div>
            `;
            this.showToast('Aylık takvim yüklendi', 'info');
        }
    }

    renderDailyTimeline() {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long' }).toLowerCase();
        const dayMap = {
            'pazartesi': 0, 'salı': 1, 'çarşamba': 2, 'perşembe': 3,
            'cuma': 4, 'cumartesi': 5, 'pazar': 6
        };
        const todayIndex = dayMap[today];

        // Bugünün görevlerini al
        const programs = this.getAllPrograms();
        const tasks = [];

        programs.forEach(program => {
            if (program.schedule && program.schedule[todayIndex]) {
                const daySchedule = program.schedule[todayIndex];
                const startHour = parseInt(daySchedule.time.split(':')[0]);
                tasks.push({
                    hour: startHour,
                    duration: 2, // Varsayılan 2 saat
                    program: program.name,
                    topics: daySchedule.topics
                });
            }
        });

        return hours.map(hour => {
            const task = tasks.find(t => t.hour === hour);
            const hourStr = hour.toString().padStart(2, '0') + ':00';

            if (task) {
                return `
                    <div class="timeline-slot filled">
                        <span class="slot-time">${hourStr}</span>
                        <div class="slot-content">
                            <strong>${task.program}</strong>
                            <p>${task.topics.join(', ')}</p>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="timeline-slot">
                    <span class="slot-time">${hourStr}</span>
                    <div class="slot-content empty">-</div>
                </div>
            `;
        }).join('');
    }

    renderMonthlyGrid() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

        let html = '<div class="month-header">';
        dayNames.forEach(day => {
            html += `<div class="day-name">${day}</div>`;
        });
        html += '</div>';

        html += '<div class="month-days">';

        // Boş günler (ayın başlangıcından önceki)
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="month-day empty"></div>';
        }

        // Günler
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate();
            html += `
                <div class="month-day ${isToday ? 'today' : ''}">
                    <span class="day-number">${day}</span>
                    <div class="day-tasks">
                        ${this.getTasksForDay(day) > 0 ? `<span class="task-dot">${this.getTasksForDay(day)}</span>` : ''}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    getTasksForDay(day) {
        // Mock data - gerçek veriyle değiştirilecek
        return day % 3 === 0 ? Math.floor(Math.random() * 3) + 1 : 0;
    }

    navigateDay(offset) {
        this.showToast('Gün navigasyonu geliştirme aşamasında', 'info');
    }

    navigateMonth(offset) {
        this.showToast('Ay navigasyonu geliştirme aşamasında', 'info');
    }

    // ==================== SETTINGS ACTIONS ====================

    saveSettings() {
        const settings = {
            morningStart: document.getElementById('morningStart')?.value,
            afternoonStart: document.getElementById('afternoonStart')?.value,
            eveningStart: document.getElementById('eveningStart')?.value,
            defaultView: document.getElementById('defaultView')?.value,
            weekStart: document.getElementById('weekStart')?.value
        };

        localStorage.setItem('dashboardSettings', JSON.stringify(settings));
        this.showToast('Ayarlar kaydedildi!', 'success');
    }

    exportAllPrograms() {
        const programs = this.getAllPrograms();
        const data = {
            version: '2.1.0',
            exportedAt: new Date().toISOString(),
            programs: programs
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `programs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Programlar dışa aktarıldı!', 'success');
    }

    importPrograms() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (data.programs) {
                            localStorage.setItem('studyPrograms', JSON.stringify(data.programs));
                            this.refreshPrograms();
                            this.showToast('Programlar içe aktarıldı!', 'success');
                        }
                    } catch (error) {
                        this.showToast('Dosya okunamadı!', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearCompletedPrograms() {
        if (confirm('Tamamlanan tüm programları silmek istediğinize emin misiniz?')) {
            let programs = this.getAllPrograms();
            programs = programs.filter(p => this.calculateProgress(p) < 100);
            localStorage.setItem('studyPrograms', JSON.stringify(programs));
            this.refreshPrograms();
            this.showToast('Tamamlanan programlar temizlendi!', 'success');
        }
    }

    // ==================== PANEL CONTROLS ====================

    open() {
        if (this.panel) {
            this.panel.style.display = 'flex';
            this.refreshPrograms();
        }
    }

    close() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
    }

    // ==================== UTILITY ====================

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
            z-index: 10002;
            animation: slideInUp 0.3s ease;
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ==================== CHART.JS RENDERING ====================

    renderCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js yüklenmedi');
            return;
        }

        this.renderWeeklyChartJS();
        this.renderSubjectChartJS();
    }

    renderWeeklyChartJS() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;

        // Haftalık veriyi al
        const weeklyData = window.dailyLogViewer ? window.dailyLogViewer.getWeeklySummary(7) : null;

        const labels = weeklyData ? weeklyData.dailyData.map(d => d.dayName) : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        const data = weeklyData ? weeklyData.dailyData.map(d => Math.round(d.minutes / 60 * 10) / 10) : [0, 0, 0, 0, 0, 0, 0];

        // Mevcut chart varsa destroy et
        if (this.weeklyChart) {
            this.weeklyChart.destroy();
        }

        this.weeklyChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Çalışma Saati',
                    data: data,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y} saat`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value + 'h'
                        }
                    }
                }
            }
        });
    }

    renderSubjectChartJS() {
        const canvas = document.getElementById('subjectChart');
        if (!canvas) return;

        // Program dağılımını hesapla
        const programs = this.getPrograms();
        const subjectMap = {};

        programs.forEach(prog => {
            const subject = prog.subject || 'Diğer';
            const minutes = prog.stats?.totalMinutes || 0;
            subjectMap[subject] = (subjectMap[subject] || 0) + minutes;
        });

        const labels = Object.keys(subjectMap);
        const data = Object.values(subjectMap).map(mins => Math.round(mins / 60 * 10) / 10);

        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(244, 67, 54, 0.8)',
            'rgba(33, 150, 243, 0.8)'
        ];

        // Mevcut chart varsa destroy et
        if (this.subjectChart) {
            this.subjectChart.destroy();
        }

        this.subjectChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed} saat`
                        }
                    }
                }
            }
        });
    }
}

// ==================== GLOBAL INSTANCE ====================
window.programDashboard = new ProgramDashboard();

console.log('📊 Program Dashboard hazır');
