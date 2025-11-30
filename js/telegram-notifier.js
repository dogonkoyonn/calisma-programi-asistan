// ==================== TELEGRAM NOTIFIER ====================
// Telegram Bot API entegrasyonu - Real-time bildirimler

class TelegramNotifier {
    constructor() {
        // Telegram Bot yapılandırması
        this.config = this.loadConfig();
        this.enabled = false;

        // Rate limiting
        this.lastMessageTime = 0;
        this.minMessageInterval = 1000; // 1 saniye minimum (Telegram limit: 30 msg/sec)

        // Message queue (rate limit aşımlarında)
        this.messageQueue = [];
        this.processingQueue = false;

        this.init();
    }

    init() {
        if (this.config.botToken && this.config.chatId) {
            this.enabled = this.config.enabled;
            console.log('✅ Telegram Notifier hazır');
        } else {
            console.log('⚠️ Telegram Bot yapılandırılmamış - telegram bildirimleri devre dışı');
        }
    }

    // ==================== CONFIGURATION ====================

    loadConfig() {
        try {
            const saved = localStorage.getItem('telegramNotifierConfig');
            return saved ? JSON.parse(saved) : this.getDefaultConfig();
        } catch (error) {
            console.error('❌ Telegram config yüklenemedi:', error);
            return this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            botToken: '', // Bot Token (@BotFather'dan alınır)
            chatId: '', // Chat ID (kullanıcının Telegram ID'si)
            enabled: false,
            parseMode: 'HTML' // HTML veya Markdown
        };
    }

    saveConfig(config) {
        this.config = { ...this.config, ...config };
        localStorage.setItem('telegramNotifierConfig', JSON.stringify(this.config));

        // Config güncellendiğinde enable/disable
        if (this.config.botToken && this.config.chatId) {
            this.enabled = this.config.enabled;
        } else {
            this.enabled = false;
        }

        console.log('💾 Telegram config kaydedildi');
    }

    // ==================== ERROR MESSAGE ====================

    async sendErrorMessage(errorLog) {
        if (!this.enabled) {
            return false;
        }

        // Emoji mapping
        const emoji = {
            critical: '🚨',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        // HTML formatında mesaj oluştur
        const message = `
${emoji[errorLog.level]} <b>${errorLog.level.toUpperCase()} ERROR</b>

<b>Message:</b> ${this.escapeHtml(errorLog.message)}

<b>Time:</b> ${new Date(errorLog.timestamp).toLocaleString('tr-TR')}
<b>URL:</b> ${errorLog.context.pathname || '/'}
<b>User:</b> ${errorLog.context.user.name || errorLog.context.user.id}
<b>Version:</b> ${errorLog.context.version}

<b>Browser:</b> ${this.shortenBrowser(errorLog.context.browser)}

<i>📚 Çalışma Programı Asistanı</i>
        `.trim();

        return await this.sendMessage(message);
    }

    // ==================== SYSTEM STATUS MESSAGE ====================

    async sendStatusMessage() {
        if (!this.enabled) {
            return false;
        }

        const stats = window.errorLogger ? window.errorLogger.getErrorStats() : null;
        const userProfile = window.userManager ? window.userManager.profile : null;

        const message = `
📊 <b>SYSTEM STATUS</b>

<b>⏰ Time:</b> ${new Date().toLocaleString('tr-TR')}
<b>🔢 Version:</b> ${APP_VERSION.toString()}

<b>📈 Error Stats:</b>
• Total: ${stats ? stats.total : 0}
• Critical: ${stats ? stats.bySeverity.critical : 0}
• Errors: ${stats ? stats.bySeverity.error : 0}
• Warnings: ${stats ? stats.bySeverity.warning : 0}
• Last 24h: ${stats ? stats.last24h : 0}

<b>👤 User:</b>
• Name: ${userProfile ? userProfile.name || 'Not set' : 'Unknown'}
• Programs: ${userProfile ? userProfile.stats.totalPrograms : 0}
• Study Minutes: ${userProfile ? userProfile.stats.totalStudyMinutes : 0}
• Streak: ${userProfile ? userProfile.stats.currentStreak : 0} days

<b>🔧 System Health:</b> ${stats && stats.bySeverity.critical === 0 ? '✅ Good' : '⚠️ Issues detected'}

<i>📚 Çalışma Programı Asistanı</i>
        `.trim();

        return await this.sendMessage(message);
    }

    // ==================== GENERAL MESSAGE SENDING ====================

    async sendMessage(text, options = {}) {
        if (!this.enabled || !this.config.botToken || !this.config.chatId) {
            console.log('⚠️ Telegram bildirimleri devre dışı veya yapılandırılmamış');
            return false;
        }

        // Rate limiting kontrolü
        const now = Date.now();
        if (now - this.lastMessageTime < this.minMessageInterval) {
            // Queue'ya ekle
            this.messageQueue.push({ text, options });
            this.processQueue();
            return 'queued';
        }

        try {
            const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;

            const body = {
                chat_id: this.config.chatId,
                text: text,
                parse_mode: options.parseMode || this.config.parseMode,
                disable_web_page_preview: options.disablePreview || true,
                disable_notification: options.silent || false
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.ok) {
                console.log('💬 Telegram mesajı gönderildi');
                this.lastMessageTime = now;
                return true;
            } else {
                console.error('❌ Telegram mesajı gönderilemedi:', data);
                return false;
            }
        } catch (error) {
            console.error('❌ Telegram API hatası:', error);
            return false;
        }
    }

    // ==================== QUEUE PROCESSING ====================

    async processQueue() {
        if (this.processingQueue || this.messageQueue.length === 0) {
            return;
        }

        this.processingQueue = true;

        while (this.messageQueue.length > 0) {
            const { text, options } = this.messageQueue.shift();
            await this.sendMessage(text, options);

            // Rate limit için bekle
            await new Promise(resolve => setTimeout(resolve, this.minMessageInterval));
        }

        this.processingQueue = false;
    }

    // ==================== TEST MESSAGE ====================

    async sendTestMessage() {
        if (!this.config.botToken || !this.config.chatId) {
            alert('⚠️ Lütfen önce Telegram Bot yapılandırmasını tamamlayın!');
            return false;
        }

        const message = `
🧪 <b>TEST MESSAGE</b>

Bu bir test mesajıdır!

Telegram Bot yapılandırması başarılı ✅

<b>Time:</b> ${new Date().toLocaleString('tr-TR')}
<b>Version:</b> ${APP_VERSION.toString()}

<i>📚 Çalışma Programı Asistanı</i>
        `.trim();

        const result = await this.sendMessage(message);

        if (result === true) {
            alert('✅ Test mesajı başarıyla gönderildi!\n\nLütfen Telegram\'ı kontrol edin.');
        } else if (result === 'queued') {
            alert('⏰ Mesaj kuyruğa eklendi - rate limit nedeniyle bekliyor.');
        } else {
            alert('❌ Test mesajı gönderilemedi!\n\nLütfen Bot Token ve Chat ID kontrolü yapın.');
        }

        return result;
    }

    // ==================== UTILITY ====================

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    shortenBrowser(userAgent) {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    enable() {
        if (!this.config.botToken || !this.config.chatId) {
            console.log('⚠️ Telegram Bot yapılandırması eksik');
            return;
        }

        this.enabled = true;
        this.config.enabled = true;
        this.saveConfig(this.config);
        console.log('✅ Telegram bildirimleri aktif');
    }

    disable() {
        this.enabled = false;
        this.config.enabled = false;
        this.saveConfig(this.config);
        console.log('⏸️ Telegram bildirimleri devre dışı');
    }

    getStatus() {
        return {
            enabled: this.enabled,
            hasConfig: !!(this.config.botToken && this.config.chatId),
            chatId: this.config.chatId || 'Not set',
            queueLength: this.messageQueue.length,
            lastMessageTime: this.lastMessageTime ? new Date(this.lastMessageTime).toLocaleString('tr-TR') : 'Never'
        };
    }

    // ==================== CHAT ID DETECTION ====================

    async getChatId() {
        if (!this.config.botToken) {
            alert('⚠️ Lütfen önce Bot Token\'ı girin!');
            return null;
        }

        try {
            const url = `https://api.telegram.org/bot${this.config.botToken}/getUpdates`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.ok && data.result.length > 0) {
                // En son mesajı gönderen kullanıcının chat_id'sini al
                const lastUpdate = data.result[data.result.length - 1];
                const chatId = lastUpdate.message?.chat?.id || lastUpdate.my_chat_member?.chat?.id;

                if (chatId) {
                    alert(`✅ Chat ID bulundu: ${chatId}\n\nBu ID otomatik olarak kaydedilecek.`);
                    this.saveConfig({ chatId: chatId.toString() });
                    return chatId;
                }
            }

            alert('❌ Chat ID bulunamadı!\n\nLütfen önce botunuza bir mesaj gönderin ve tekrar deneyin.');
            return null;
        } catch (error) {
            console.error('❌ Chat ID detection hatası:', error);
            alert('❌ Chat ID alınamadı: ' + error.message);
            return null;
        }
    }
}

// ==================== GLOBAL INSTANCE ====================
window.telegramNotifier = new TelegramNotifier();

// Error Logger ile entegre et
if (window.errorLogger) {
    window.errorLogger.setTelegramNotifier(window.telegramNotifier);
}

console.log('💬 Telegram Notifier hazır');
