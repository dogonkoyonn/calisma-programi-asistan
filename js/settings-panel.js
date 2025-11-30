// ==================== SETTINGS PANEL ====================
// Kullanıcı ayarları, profil yönetimi, bildirim yapılandırması

class SettingsPanel {
    constructor() {
        this.panel = null;
        this.activeTab = 'profile';
        this.init();
    }

    init() {
        this.createPanel();
        console.log('⚙️ Settings Panel hazır');
    }

    // ==================== PANEL CREATION ====================

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'settingsPanel';
        panel.className = 'settings-panel';
        panel.style.display = 'none';

        panel.innerHTML = `
            <div class="settings-overlay"></div>
            <div class="settings-container">
                <div class="settings-header">
                    <h2>⚙️ Ayarlar</h2>
                    <button class="settings-close" onclick="settingsPanel.close()">✕</button>
                </div>

                <div class="settings-body">
                    <div class="settings-tabs">
                        <button class="tab-btn active" data-tab="profile">👤 Profil</button>
                        <button class="tab-btn" data-tab="preferences">🎨 Tercihler</button>
                        <button class="tab-btn" data-tab="notifications">📧 Bildirimler</button>
                        <button class="tab-btn" data-tab="data">💾 Veri Yönetimi</button>
                        <button class="tab-btn" data-tab="about">ℹ️ Hakkında</button>
                    </div>

                    <div class="settings-content">
                        <div class="tab-content active" data-tab="profile">
                            ${this.renderProfileTab()}
                        </div>

                        <div class="tab-content" data-tab="preferences">
                            ${this.renderPreferencesTab()}
                        </div>

                        <div class="tab-content" data-tab="notifications">
                            ${this.renderNotificationsTab()}
                        </div>

                        <div class="tab-content" data-tab="data">
                            ${this.renderDataTab()}
                        </div>

                        <div class="tab-content" data-tab="about">
                            ${this.renderAboutTab()}
                        </div>
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

    renderProfileTab() {
        const profile = window.userManager ? window.userManager.profile : {};

        return `
            <div class="tab-section">
                <h3>👤 Profil Bilgileri</h3>

                <div class="form-group">
                    <label>Avatar</label>
                    <div class="avatar-selector">
                        <div class="current-avatar" id="currentAvatar">${profile.avatar || '🎓'}</div>
                        <button class="btn-secondary" onclick="settingsPanel.selectAvatar()">Değiştir</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>İsim</label>
                    <input type="text" id="profileName" value="${profile.name || ''}" placeholder="Adınız">
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="profileEmail" value="${profile.email || ''}" placeholder="email@example.com">
                </div>

                <div class="form-group">
                    <label>Üyelik Tarihi</label>
                    <input type="text" value="${new Date(profile.createdAt).toLocaleDateString('tr-TR')}" disabled>
                </div>

                <button class="btn-primary" onclick="settingsPanel.saveProfile()">💾 Profili Kaydet</button>
            </div>

            <div class="tab-section">
                <h3>📊 İstatistikler</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${profile.stats?.totalPrograms || 0}</div>
                        <div class="stat-label">Program</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${profile.stats?.totalStudyMinutes || 0}</div>
                        <div class="stat-label">Dakika</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${profile.stats?.currentStreak || 0}</div>
                        <div class="stat-label">Gün Streak</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${profile.stats?.longestStreak || 0}</div>
                        <div class="stat-label">En Uzun Streak</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPreferencesTab() {
        const prefs = window.userManager ? window.userManager.profile.preferences : {};
        const notifSettings = window.notificationManager ? window.notificationManager.getSettings() : {};

        return `
            <div class="tab-section">
                <h3>🎯 Çalışma Tercihleri</h3>

                <div class="form-group">
                    <label>Günlük Hedef (dakika)</label>
                    <input type="number" id="dailyGoal" value="${prefs.dailyGoalMinutes || 180}" min="30" max="720">
                </div>

                <div class="form-group">
                    <label>Pomodoro - Çalışma Süresi (dakika)</label>
                    <input type="number" id="pomodoroWork" value="${prefs.pomodoroWork || 25}" min="5" max="60">
                </div>

                <div class="form-group">
                    <label>Pomodoro - Mola Süresi (dakika)</label>
                    <input type="number" id="pomodoroBreak" value="${prefs.pomodoroBreak || 5}" min="1" max="30">
                </div>

                <div class="form-group">
                    <label>Bildirimler</label>
                    <label class="switch">
                        <input type="checkbox" id="notificationsEnabled" ${prefs.notifications ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="form-group">
                    <label>Ses</label>
                    <label class="switch">
                        <input type="checkbox" id="soundEnabled" ${prefs.sound ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="form-group">
                    <label>Titreşim</label>
                    <label class="switch">
                        <input type="checkbox" id="vibrateEnabled" ${prefs.vibrate ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <button class="btn-primary" onclick="settingsPanel.savePreferences()">💾 Tercihleri Kaydet</button>
            </div>

            <div class="tab-section">
                <h3>⏰ Günlük Hatırlatma</h3>

                <div class="info-box">
                    <p>Her gün belirlediğin saatte çalışma hatırlatması al.</p>
                </div>

                <div class="form-group">
                    <label>Günlük Hatırlatma Aktif</label>
                    <label class="switch">
                        <input type="checkbox" id="dailyReminderEnabled" ${notifSettings.dailyReminderEnabled ? 'checked' : ''} onchange="settingsPanel.toggleDailyReminder(this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="form-group">
                    <label>Hatırlatma Saati</label>
                    <input type="time" id="dailyReminderTime" value="${notifSettings.dailyReminderTime || '20:00'}">
                </div>

                <button class="btn-secondary" onclick="settingsPanel.saveDailyReminder()">💾 Hatırlatmayı Kaydet</button>
            </div>
        `;
    }

    renderNotificationsTab() {
        const emailConfig = window.emailNotifier ? window.emailNotifier.config : {};
        const telegramConfig = window.telegramNotifier ? window.telegramNotifier.config : {};
        const botRunning = window.telegramBot ? window.telegramBot.running : false;

        return `
            <div class="tab-section">
                <h3>📧 Email Bildirimleri (EmailJS)</h3>

                <div class="form-group">
                    <label>Public Key</label>
                    <input type="text" id="emailPublicKey" value="${emailConfig.publicKey || ''}" placeholder="EmailJS Public Key">
                </div>

                <div class="form-group">
                    <label>Service ID</label>
                    <input type="text" id="emailServiceId" value="${emailConfig.serviceId || ''}" placeholder="service_xxxxx">
                </div>

                <div class="form-group">
                    <label>Template ID</label>
                    <input type="text" id="emailTemplateId" value="${emailConfig.templateId || ''}" placeholder="template_xxxxx">
                </div>

                <div class="form-group">
                    <label>Alıcı Email</label>
                    <input type="email" id="recipientEmail" value="${emailConfig.recipientEmail || ''}" placeholder="admin@example.com">
                </div>

                <div class="form-group">
                    <label>Alıcı İsim</label>
                    <input type="text" id="recipientName" value="${emailConfig.recipientName || ''}" placeholder="Admin">
                </div>

                <div class="form-group">
                    <label>Email Bildirimleri Aktif</label>
                    <label class="switch">
                        <input type="checkbox" id="emailEnabled" ${emailConfig.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="button-group">
                    <button class="btn-primary" onclick="settingsPanel.saveEmailConfig()">💾 Kaydet</button>
                    <button class="btn-secondary" onclick="settingsPanel.testEmail()">🧪 Test Et</button>
                </div>

                <div class="help-text">
                    ℹ️ EmailJS kurulumu için: <a href="https://www.emailjs.com/" target="_blank">emailjs.com</a>
                </div>
            </div>

            <div class="tab-section">
                <h3>💬 Telegram Bot Bildirimleri</h3>

                <div class="form-group">
                    <label>Bot Token</label>
                    <input type="text" id="telegramBotToken" value="${telegramConfig.botToken || ''}" placeholder="123456:ABC-DEF...">
                </div>

                <div class="form-group">
                    <label>Chat ID</label>
                    <div class="input-with-button">
                        <input type="text" id="telegramChatId" value="${telegramConfig.chatId || ''}" placeholder="Otomatik tespit edilecek">
                        <button class="btn-secondary" onclick="settingsPanel.detectChatId()">🔍 Tespit Et</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Telegram Bildirimleri Aktif</label>
                    <label class="switch">
                        <input type="checkbox" id="telegramEnabled" ${telegramConfig.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="button-group">
                    <button class="btn-primary" onclick="settingsPanel.saveTelegramConfig()">💾 Kaydet</button>
                    <button class="btn-secondary" onclick="settingsPanel.testTelegram()">🧪 Test Et</button>
                </div>

                <div class="form-group">
                    <label>Bot Polling (Mesaj Dinleme)</label>
                    <label class="switch">
                        <input type="checkbox" id="botPolling" ${botRunning ? 'checked' : ''} onchange="settingsPanel.toggleBotPolling(this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="help-text">
                    ℹ️ Telegram Bot kurulumu:<br>
                    1. @BotFather ile bot oluştur<br>
                    2. Bot Token'ı buraya gir<br>
                    3. Botunuza /start mesajı gönder<br>
                    4. "Tespit Et" butonuna bas
                </div>
            </div>
        `;
    }

    renderDataTab() {
        return `
            <div class="tab-section">
                <h3>💾 Veri Dışa Aktarma</h3>

                <div class="info-box">
                    <p>Tüm verilerinizi (profil, programlar, loglar) JSON formatında dışa aktarabilirsiniz.</p>
                </div>

                <button class="btn-primary" onclick="settingsPanel.exportAllData()">📥 Tüm Verileri Dışa Aktar</button>
                <button class="btn-secondary" onclick="settingsPanel.exportErrors()">📥 Hata Loglarını Dışa Aktar</button>
            </div>

            <div class="tab-section">
                <h3>📤 Veri İçe Aktarma</h3>

                <div class="info-box warning">
                    <p>⚠️ İçe aktarma mevcut verilerin üzerine yazacaktır!</p>
                </div>

                <input type="file" id="importFile" accept=".json" style="display: none;" onchange="settingsPanel.importData(this.files[0])">
                <button class="btn-secondary" onclick="document.getElementById('importFile').click()">📤 Veri İçe Aktar</button>
            </div>

            <div class="tab-section">
                <h3>🗑️ Veri Silme</h3>

                <div class="info-box danger">
                    <p>⚠️ DİKKAT: Bu işlemler geri alınamaz!</p>
                </div>

                <button class="btn-danger" onclick="settingsPanel.clearErrors()">🗑️ Hata Loglarını Temizle</button>
                <button class="btn-danger" onclick="settingsPanel.resetAllData()">🗑️ TÜM VERİLERİ SİL</button>
            </div>
        `;
    }

    renderAboutTab() {
        const versionInfo = getVersionInfo();

        return `
            <div class="tab-section">
                <div class="about-header">
                    <div class="about-icon">📚</div>
                    <h3>Çalışma Programı Asistanı</h3>
                    <div class="version-badge">v${versionInfo.version}</div>
                </div>

                <div class="info-box">
                    <p><strong>Build:</strong> ${versionInfo.date}</p>
                    <p><strong>Platform:</strong> Progressive Web App (PWA)</p>
                </div>
            </div>

            <div class="tab-section">
                <h3>✨ Son Güncellemeler</h3>

                ${versionInfo.features.length > 0 ? `
                    <div class="changelog-section">
                        <h4>Yeni Özellikler:</h4>
                        <ul>
                            ${versionInfo.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${versionInfo.fixes.length > 0 ? `
                    <div class="changelog-section">
                        <h4>Düzeltmeler:</h4>
                        <ul>
                            ${versionInfo.fixes.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>

            <div class="tab-section">
                <h3>🔧 Sistem Bilgisi</h3>
                <div class="system-info">
                    <div class="info-row">
                        <span>Tarayıcı:</span>
                        <span>${this.getBrowserInfo()}</span>
                    </div>
                    <div class="info-row">
                        <span>Platform:</span>
                        <span>${navigator.platform}</span>
                    </div>
                    <div class="info-row">
                        <span>Dil:</span>
                        <span>${navigator.language}</span>
                    </div>
                    <div class="info-row">
                        <span>Service Worker:</span>
                        <span>${'serviceWorker' in navigator ? '✅ Aktif' : '❌ Desteklenmiyor'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== EVENT HANDLERS ====================

    attachEventListeners() {
        // Tab switching
        this.panel.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Close on overlay click
        this.panel.querySelector('.settings-overlay').addEventListener('click', () => {
            this.close();
        });
    }

    switchTab(tabName) {
        // Update buttons
        this.panel.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update content
        this.panel.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });

        this.activeTab = tabName;
    }

    // ==================== PROFILE ACTIONS ====================

    saveProfile() {
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;

        if (window.userManager) {
            window.userManager.updateProfile({ name, email });
            this.showToast('✅ Profil kaydedildi!', 'success');
        }
    }

    selectAvatar() {
        const avatars = ['🎓', '📚', '✏️', '🎯', '🏆', '⭐', '💡', '🚀', '🔥', '💪', '🧠', '👨‍🎓', '👩‍🎓', '🦊', '🐼', '🐨', '🦁', '🐯'];

        const selected = prompt('Avatar seçin (emoji kopyala-yapıştır):\n\n' + avatars.join(' '), avatars[0]);

        if (selected && window.userManager) {
            window.userManager.updateProfile({ avatar: selected });
            document.getElementById('currentAvatar').textContent = selected;
            this.showToast('✅ Avatar güncellendi!', 'success');
        }
    }

    // ==================== PREFERENCES ACTIONS ====================

    savePreferences() {
        const preferences = {
            dailyGoalMinutes: parseInt(document.getElementById('dailyGoal').value),
            pomodoroWork: parseInt(document.getElementById('pomodoroWork').value),
            pomodoroBreak: parseInt(document.getElementById('pomodoroBreak').value),
            notifications: document.getElementById('notificationsEnabled').checked,
            sound: document.getElementById('soundEnabled').checked,
            vibrate: document.getElementById('vibrateEnabled').checked
        };

        if (window.userManager) {
            window.userManager.updatePreferences(preferences);
            this.showToast('✅ Tercihler kaydedildi!', 'success');
        }
    }

    // ==================== NOTIFICATION ACTIONS ====================

    saveEmailConfig() {
        const config = {
            publicKey: document.getElementById('emailPublicKey').value,
            serviceId: document.getElementById('emailServiceId').value,
            templateId: document.getElementById('emailTemplateId').value,
            recipientEmail: document.getElementById('recipientEmail').value,
            recipientName: document.getElementById('recipientName').value,
            enabled: document.getElementById('emailEnabled').checked
        };

        if (window.emailNotifier) {
            window.emailNotifier.saveConfig(config);
            this.showToast('✅ Email ayarları kaydedildi!', 'success');
        }
    }

    async testEmail() {
        if (window.emailNotifier) {
            await window.emailNotifier.sendTestEmail();
        }
    }

    saveTelegramConfig() {
        const config = {
            botToken: document.getElementById('telegramBotToken').value,
            chatId: document.getElementById('telegramChatId').value,
            enabled: document.getElementById('telegramEnabled').checked
        };

        if (window.telegramNotifier) {
            window.telegramNotifier.saveConfig(config);
            this.showToast('✅ Telegram ayarları kaydedildi!', 'success');
        }
    }

    async testTelegram() {
        if (window.telegramNotifier) {
            await window.telegramNotifier.sendTestMessage();
        }
    }

    async detectChatId() {
        if (window.telegramNotifier) {
            const chatId = await window.telegramNotifier.getChatId();
            if (chatId) {
                document.getElementById('telegramChatId').value = chatId;
            }
        }
    }

    toggleBotPolling(enabled) {
        if (window.telegramBot) {
            if (enabled) {
                window.telegramBot.startPolling();
                this.showToast('✅ Bot polling başlatıldı!', 'success');
            } else {
                window.telegramBot.stopPolling();
                this.showToast('⏹️ Bot polling durduruldu', 'info');
            }
        }
    }

    // ==================== DAILY REMINDER ACTIONS ====================

    toggleDailyReminder(enabled) {
        if (window.notificationManager) {
            if (enabled) {
                const time = document.getElementById('dailyReminderTime').value || '20:00';
                window.notificationManager.setDailyReminder(time);
                this.showToast(`✅ Günlük hatırlatma ${time} için ayarlandı!`, 'success');
            } else {
                window.notificationManager.disableDailyReminder();
                this.showToast('⏹️ Günlük hatırlatma kapatıldı', 'info');
            }
        }
    }

    saveDailyReminder() {
        const enabled = document.getElementById('dailyReminderEnabled').checked;
        const time = document.getElementById('dailyReminderTime').value;

        if (window.notificationManager) {
            if (enabled) {
                window.notificationManager.setDailyReminder(time);
                this.showToast(`✅ Hatırlatma ${time} için kaydedildi!`, 'success');
            } else {
                window.notificationManager.disableDailyReminder();
                this.showToast('⏹️ Hatırlatma kapatıldı', 'info');
            }
        }
    }

    // ==================== DATA ACTIONS ====================

    exportAllData() {
        if (window.userManager) {
            window.userManager.exportAllData();
            this.showToast('✅ Veriler dışa aktarıldı!', 'success');
        }
    }

    exportErrors() {
        if (window.errorLogger) {
            window.errorLogger.exportErrors();
            this.showToast('✅ Hata logları dışa aktarıldı!', 'success');
        }
    }

    async importData(file) {
        if (!file) return;

        if (window.userManager) {
            await window.userManager.importData(file);
        }
    }

    clearErrors() {
        if (window.errorLogger) {
            if (window.errorLogger.clearErrors()) {
                this.showToast('✅ Hata logları temizlendi!', 'success');
            }
        }
    }

    resetAllData() {
        if (window.userManager) {
            window.userManager.resetAllData();
        }
    }

    // ==================== PANEL CONTROLS ====================

    open() {
        if (this.panel) {
            this.panel.style.display = 'flex';
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
            z-index: 10001;
            animation: slideInUp 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }
}

// ==================== GLOBAL INSTANCE ====================
window.settingsPanel = new SettingsPanel();

console.log('⚙️ Settings Panel hazır');
