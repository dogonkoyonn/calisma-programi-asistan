// ==================== TELEGRAM BOT ====================
// Bot komutları ve doğal dil işleme (Long Polling)

class TelegramBot {
    constructor() {
        this.config = window.telegramNotifier ? window.telegramNotifier.config : null;
        this.running = false;
        this.pollingInterval = 2000; // 2 saniye
        this.lastUpdateId = 0;
        this.pollingTimeout = null;

        // Komut tanımları
        this.commands = {
            '/start': this.handleStart.bind(this),
            '/help': this.handleHelp.bind(this),
            '/status': this.handleStatus.bind(this),
            '/errors': this.handleErrors.bind(this),
            '/health': this.handleHealth.bind(this),
            '/clear': this.handleClear.bind(this),
            '/stats': this.handleStats.bind(this),
            '/version': this.handleVersion.bind(this),
            '/stop': this.handleStop.bind(this)
        };

        // Natural language keywords
        this.nlpKeywords = {
            'durum': () => this.handleStatus(),
            'hata': () => this.handleErrors(),
            'sağlık': () => this.handleHealth(),
            'istatistik': () => this.handleStats(),
            'versiyon': () => this.handleVersion(),
            'temizle': () => this.handleClear(),
            'yardım': () => this.handleHelp()
        };

        console.log('🤖 Telegram Bot hazır');
    }

    // ==================== POLLING ====================

    async startPolling() {
        if (!this.config || !this.config.botToken || !this.config.chatId) {
            console.error('❌ Telegram Bot yapılandırılmamış - polling başlatılamıyor');
            return false;
        }

        if (this.running) {
            console.log('⚠️ Bot zaten çalışıyor');
            return false;
        }

        this.running = true;
        console.log('🚀 Telegram Bot polling başlatıldı');

        // İlk update'i al
        await this.poll();

        return true;
    }

    async poll() {
        if (!this.running) return;

        try {
            const url = `https://api.telegram.org/bot${this.config.botToken}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=30`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.ok && data.result.length > 0) {
                for (const update of data.result) {
                    await this.handleUpdate(update);
                    this.lastUpdateId = update.update_id;
                }
            }
        } catch (error) {
            console.error('❌ Polling hatası:', error);
        }

        // Sonraki polling
        if (this.running) {
            this.pollingTimeout = setTimeout(() => this.poll(), this.pollingInterval);
        }
    }

    stopPolling() {
        this.running = false;
        if (this.pollingTimeout) {
            clearTimeout(this.pollingTimeout);
            this.pollingTimeout = null;
        }
        console.log('⏹️ Telegram Bot polling durduruldu');
    }

    // ==================== UPDATE HANDLER ====================

    async handleUpdate(update) {
        // Sadece mesajları işle
        if (!update.message || !update.message.text) return;

        const message = update.message;
        const text = message.text.trim();
        const chatId = message.chat.id;

        // Sadece yapılandırılan chat_id'den gelen mesajları işle
        if (chatId.toString() !== this.config.chatId) {
            console.log('⚠️ Bilinmeyen chat_id:', chatId);
            return;
        }

        console.log('📨 Mesaj alındı:', text);

        // Komut mu kontrol et
        if (text.startsWith('/')) {
            await this.handleCommand(text);
        } else {
            // Natural language processing
            await this.handleNaturalLanguage(text);
        }
    }

    // ==================== COMMAND HANDLER ====================

    async handleCommand(text) {
        const command = text.split(' ')[0].toLowerCase();

        if (this.commands[command]) {
            await this.commands[command](text);
        } else {
            await this.sendResponse(`❌ Bilinmeyen komut: ${command}\n\n/help yazarak komutları görebilirsiniz.`);
        }
    }

    // ==================== NATURAL LANGUAGE HANDLER ====================

    async handleNaturalLanguage(text) {
        const lowerText = text.toLowerCase();

        // Keyword matching
        for (const [keyword, handler] of Object.entries(this.nlpKeywords)) {
            if (lowerText.includes(keyword)) {
                await handler();
                return;
            }
        }

        // Hiçbir keyword eşleşmedi
        await this.sendResponse('🤔 Anlamadım. /help yazarak komutları görebilirsiniz.');
    }

    // ==================== COMMAND IMPLEMENTATIONS ====================

    async handleStart() {
        const message = `
👋 <b>Hoş geldiniz!</b>

📚 Çalışma Programı Asistanı Telegram Bot'u

Bu bot ile sistemin durumunu takip edebilir, hataları görüntüleyebilir ve sistem sağlığını kontrol edebilirsiniz.

/help yazarak tüm komutları görebilirsiniz.
        `.trim();

        await this.sendResponse(message);
    }

    async handleHelp() {
        const message = `
📖 <b>KOMUTLAR</b>

<b>/start</b> - Bot'u başlat
<b>/help</b> - Yardım menüsü
<b>/status</b> - Sistem durumu
<b>/errors</b> - Son hataları göster
<b>/health</b> - Sistem sağlığı
<b>/stats</b> - Kullanıcı istatistikleri
<b>/version</b> - Versiyon bilgisi
<b>/clear</b> - Hata loglarını temizle
<b>/stop</b> - Bot'u durdur

<b>🗣️ DOĞAL DİL</b>

Aşağıdaki kelimeleri kullanabilirsiniz:
• "durum" - Sistem durumu
• "hata" - Hataları göster
• "sağlık" - Sistem sağlığı
• "istatistik" - İstatistikler
• "versiyon" - Versiyon bilgisi
• "temizle" - Logları temizle

Örnek: "sistem durumu nasıl?"
        `.trim();

        await this.sendResponse(message);
    }

    async handleStatus() {
        const stats = window.errorLogger ? window.errorLogger.getErrorStats() : null;
        const userProfile = window.userManager ? window.userManager.profile : null;

        const message = `
📊 <b>SİSTEM DURUMU</b>

<b>⏰ Zaman:</b> ${new Date().toLocaleString('tr-TR')}
<b>🔢 Versiyon:</b> ${APP_VERSION.toString()}

<b>📈 Hata İstatistikleri:</b>
• Toplam: ${stats ? stats.total : 0}
• Kritik: ${stats ? stats.bySeverity.critical : 0}
• Hata: ${stats ? stats.bySeverity.error : 0}
• Uyarı: ${stats ? stats.bySeverity.warning : 0}
• Son 24 saat: ${stats ? stats.last24h : 0}

<b>👤 Kullanıcı:</b>
• İsim: ${userProfile ? userProfile.name || 'Belirtilmemiş' : 'Bilinmiyor'}
• Programlar: ${userProfile ? userProfile.stats.totalPrograms : 0}
• Çalışma Süresi: ${userProfile ? userProfile.stats.totalStudyMinutes : 0} dk
• Streak: ${userProfile ? userProfile.stats.currentStreak : 0} gün

<b>🔧 Sistem Sağlığı:</b> ${stats && stats.bySeverity.critical === 0 ? '✅ İyi' : '⚠️ Sorun tespit edildi'}
        `.trim();

        await this.sendResponse(message);
    }

    async handleErrors() {
        if (!window.errorLogger) {
            await this.sendResponse('❌ Error Logger bulunamadı');
            return;
        }

        const errors = window.errorLogger.getErrors({ limit: 5 });

        if (errors.length === 0) {
            await this.sendResponse('✅ Hiç hata yok!');
            return;
        }

        let message = `❌ <b>SON ${errors.length} HATA</b>\n\n`;

        errors.forEach((error, index) => {
            const emoji = {
                critical: '🚨',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };

            message += `${emoji[error.level]} <b>${error.level.toUpperCase()}</b>\n`;
            message += `• ${this.escapeHtml(error.message)}\n`;
            message += `• ${new Date(error.timestamp).toLocaleString('tr-TR')}\n`;
            if (index < errors.length - 1) message += '\n';
        });

        await this.sendResponse(message);
    }

    async handleHealth() {
        const stats = window.errorLogger ? window.errorLogger.getErrorStats() : null;

        let health = 'good';
        let emoji = '✅';
        let status = 'Sistem sağlıklı';

        if (stats) {
            if (stats.bySeverity.critical > 0) {
                health = 'critical';
                emoji = '🚨';
                status = 'Kritik hatalar var!';
            } else if (stats.last24h > 10) {
                health = 'warning';
                emoji = '⚠️';
                status = 'Çok fazla hata oluşuyor';
            } else if (stats.bySeverity.error > 5) {
                health = 'fair';
                emoji = '⚠️';
                status = 'Bazı hatalar mevcut';
            }
        }

        const message = `
${emoji} <b>SİSTEM SAĞLIĞI</b>

<b>Durum:</b> ${status}
<b>Sağlık Seviyesi:</b> ${health.toUpperCase()}

<b>Detaylar:</b>
• Kritik hatalar: ${stats ? stats.bySeverity.critical : 0}
• Son 24 saat: ${stats ? stats.last24h : 0} hata
• Toplam: ${stats ? stats.total : 0} hata

<b>Tavsiye:</b> ${health === 'critical' ? '⚠️ Acil müdahale gerekli!' : health === 'warning' ? 'Lütfen hataları kontrol edin' : '✅ Her şey yolunda'}
        `.trim();

        await this.sendResponse(message);
    }

    async handleClear() {
        if (!window.errorLogger) {
            await this.sendResponse('❌ Error Logger bulunamadı');
            return;
        }

        const count = window.errorLogger.errors.length;
        window.errorLogger.clearErrors();

        await this.sendResponse(`🗑️ ${count} adet hata logu temizlendi!`);
    }

    async handleStats() {
        if (!window.userManager) {
            await this.sendResponse('❌ User Manager bulunamadı');
            return;
        }

        const profile = window.userManager.profile;

        const message = `
📊 <b>KULLANICI İSTATİSTİKLERİ</b>

<b>👤 Profil:</b>
• İsim: ${profile.name || 'Belirtilmemiş'}
• Kayıt: ${new Date(profile.createdAt).toLocaleDateString('tr-TR')}
• Avatar: ${profile.avatar}

<b>📚 Çalışma:</b>
• Toplam Program: ${profile.stats.totalPrograms}
• Toplam Süre: ${profile.stats.totalStudyMinutes} dakika
• Toplam Oturum: ${profile.stats.totalSessions}

<b>🔥 Streak:</b>
• Güncel: ${profile.stats.currentStreak} gün
• En Uzun: ${profile.stats.longestStreak} gün
• Son Çalışma: ${profile.stats.lastStudyDate || 'Hiç'}

<b>⚙️ Tercihler:</b>
• Günlük Hedef: ${profile.preferences.dailyGoalMinutes} dk
• Pomodoro: ${profile.preferences.pomodoroWork}/${profile.preferences.pomodoroBreak} dk
        `.trim();

        await this.sendResponse(message);
    }

    async handleVersion() {
        const versionInfo = getVersionInfo();

        let message = `
📦 <b>VERSİYON BİLGİSİ</b>

<b>Versiyon:</b> ${versionInfo.version}
<b>Tarih:</b> ${versionInfo.date}
        `;

        if (versionInfo.features.length > 0) {
            message += `\n<b>✨ Yeni Özellikler:</b>\n`;
            versionInfo.features.forEach(f => {
                message += `• ${f}\n`;
            });
        }

        if (versionInfo.fixes.length > 0) {
            message += `\n<b>🔧 Düzeltmeler:</b>\n`;
            versionInfo.fixes.slice(0, 3).forEach(f => {
                message += `• ${f}\n`;
            });
        }

        await this.sendResponse(message.trim());
    }

    async handleStop() {
        await this.sendResponse('⏹️ Bot durduruldu. Tekrar başlatmak için /start yazın.');
        this.stopPolling();
    }

    // ==================== UTILITY ====================

    async sendResponse(text) {
        if (!window.telegramNotifier) {
            console.error('❌ Telegram Notifier bulunamadı');
            return;
        }

        await window.telegramNotifier.sendMessage(text);
    }

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

    getStatus() {
        return {
            running: this.running,
            lastUpdateId: this.lastUpdateId,
            pollingInterval: this.pollingInterval,
            hasConfig: !!(this.config && this.config.botToken && this.config.chatId)
        };
    }
}

// ==================== GLOBAL INSTANCE ====================
window.telegramBot = new TelegramBot();

console.log('🤖 Telegram Bot komutları hazır');
