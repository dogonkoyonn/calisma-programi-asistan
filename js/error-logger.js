// ==================== ERROR LOGGER ====================
// Global error tracking, logging ve notification sistemi

class ErrorLogger {
    constructor() {
        this.errors = this.loadErrors();
        this.maxErrors = 100; // LocalStorage'da max 100 hata sakla
        this.emailNotifier = null; // EmailNotifier yüklendiğinde set edilecek
        this.telegramNotifier = null; // TelegramNotifier yüklendiğinde set edilecek

        // Notification kuralları (seviyeye göre)
        this.notificationRules = {
            critical: { email: true, telegram: true },
            error: { email: false, telegram: true },
            warning: { email: false, telegram: false },
            info: { email: false, telegram: false }
        };

        this.init();
    }

    init() {
        // Global error handlers ekle
        this.setupGlobalHandlers();
        console.log('🔍 Error Logger hazır - ' + this.errors.length + ' hata yüklendi');
    }

    // ==================== GLOBAL ERROR HANDLERS ====================

    setupGlobalHandlers() {
        // JavaScript runtime errors
        window.addEventListener('error', (event) => {
            this.logError(event.error || new Error(event.message), 'error', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError(
                new Error(`Unhandled Promise Rejection: ${event.reason}`),
                'error',
                {
                    promise: String(event.promise),
                    reason: String(event.reason)
                }
            );
        });

        // Service Worker errors
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('error', (event) => {
                this.logError(
                    new Error('Service Worker Error'),
                    'critical',
                    { swError: String(event) }
                );
            });
        }
    }

    // ==================== ERROR LOGGING ====================

    async logError(error, level = 'error', context = {}) {
        // Error objesi oluştur
        const errorLog = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            level, // critical, error, warning, info
            message: error.message || String(error),
            stack: error.stack || '',
            context: {
                url: window.location.href,
                pathname: window.location.pathname,
                user: {
                    id: window.userManager ? window.userManager.profile.id : 'unknown',
                    name: window.userManager ? window.userManager.profile.name : 'unknown'
                },
                browser: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                version: APP_VERSION.toString(),
                timestamp: Date.now(),
                ...context
            },
            notified: {
                email: false,
                telegram: false
            }
        };

        // Konsola yazdır
        this.logToConsole(errorLog);

        // Errors listesine ekle
        this.errors.push(errorLog);

        // Max limit kontrolü
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // LocalStorage'a kaydet
        this.saveErrors();

        // Notification gönder
        await this.notifyError(errorLog);

        return errorLog;
    }

    logToConsole(errorLog) {
        const emoji = {
            critical: '🚨',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        console.group(`${emoji[errorLog.level]} [${errorLog.level.toUpperCase()}] ${errorLog.message}`);
        console.log('Timestamp:', new Date(errorLog.timestamp).toLocaleString('tr-TR'));
        console.log('Context:', errorLog.context);
        if (errorLog.stack) {
            console.log('Stack:', errorLog.stack);
        }
        console.groupEnd();
    }

    // ==================== NOTIFICATIONS ====================

    async notifyError(errorLog) {
        const rules = this.notificationRules[errorLog.level];
        if (!rules) return;

        try {
            // Email bildirimi
            if (rules.email && this.emailNotifier) {
                const emailSent = await this.emailNotifier.sendErrorEmail(errorLog);
                errorLog.notified.email = emailSent;
            }

            // Telegram bildirimi
            if (rules.telegram && this.telegramNotifier) {
                const telegramSent = await this.telegramNotifier.sendErrorMessage(errorLog);
                errorLog.notified.telegram = telegramSent;
            }

            // Notification durumunu kaydet
            if (errorLog.notified.email || errorLog.notified.telegram) {
                this.saveErrors();
            }
        } catch (notifyError) {
            console.error('❌ Notification gönderirken hata:', notifyError);
        }
    }

    // ==================== MANUAL LOGGING ====================

    // Kullanıcı tarafından manuel log
    critical(message, context = {}) {
        return this.logError(new Error(message), 'critical', context);
    }

    error(message, context = {}) {
        return this.logError(new Error(message), 'error', context);
    }

    warning(message, context = {}) {
        return this.logError(new Error(message), 'warning', context);
    }

    info(message, context = {}) {
        return this.logError(new Error(message), 'info', context);
    }

    // ==================== ERROR RETRIEVAL ====================

    getErrors(filters = {}) {
        let filtered = [...this.errors];

        // Level filtresi
        if (filters.level) {
            filtered = filtered.filter(e => e.level === filters.level);
        }

        // Tarih aralığı filtresi
        if (filters.startDate) {
            filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(filters.endDate));
        }

        // Limit
        if (filters.limit) {
            filtered = filtered.slice(-filters.limit);
        }

        return filtered.reverse(); // En yeni önce
    }

    getErrorStats() {
        const total = this.errors.length;
        const bySeverity = {
            critical: this.errors.filter(e => e.level === 'critical').length,
            error: this.errors.filter(e => e.level === 'error').length,
            warning: this.errors.filter(e => e.level === 'warning').length,
            info: this.errors.filter(e => e.level === 'info').length
        };

        // Son 24 saat
        const last24h = new Date();
        last24h.setHours(last24h.getHours() - 24);
        const recentErrors = this.errors.filter(e => new Date(e.timestamp) >= last24h);

        // Son hata
        const lastError = this.errors.length > 0 ? this.errors[this.errors.length - 1] : null;

        return {
            total,
            bySeverity,
            last24h: recentErrors.length,
            lastError: lastError ? {
                level: lastError.level,
                message: lastError.message,
                timestamp: lastError.timestamp
            } : null
        };
    }

    // ==================== DATA MANAGEMENT ====================

    loadErrors() {
        try {
            const saved = localStorage.getItem('errorLogs');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('❌ Error logs yüklenemedi:', error);
            return [];
        }
    }

    saveErrors() {
        try {
            localStorage.setItem('errorLogs', JSON.stringify(this.errors));
        } catch (error) {
            console.error('❌ Error logs kaydedilemedi:', error);
        }
    }

    clearErrors() {
        if (confirm('Tüm hata loglarını silmek istediğinize emin misiniz?')) {
            this.errors = [];
            this.saveErrors();
            console.log('🗑️ Tüm hata logları silindi');
            return true;
        }
        return false;
    }

    exportErrors() {
        const data = {
            version: APP_VERSION.toString(),
            exportedAt: new Date().toISOString(),
            totalErrors: this.errors.length,
            stats: this.getErrorStats(),
            errors: this.errors
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('📥 Error logs export edildi:', data.totalErrors + ' hata');
        return data;
    }

    // ==================== NOTIFIER INTEGRATION ====================

    setEmailNotifier(notifier) {
        this.emailNotifier = notifier;
        console.log('📧 Email Notifier bağlandı');
    }

    setTelegramNotifier(notifier) {
        this.telegramNotifier = notifier;
        console.log('💬 Telegram Notifier bağlandı');
    }

    updateNotificationRules(rules) {
        this.notificationRules = { ...this.notificationRules, ...rules };
        console.log('📝 Notification kuralları güncellendi:', this.notificationRules);
    }

    // ==================== UTILITY ====================

    generateId() {
        return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Test error fırlatma (debugging için)
    throwTestError(level = 'error') {
        const messages = {
            critical: 'TEST: Critical error - Database connection failed',
            error: 'TEST: Runtime error - Cannot read property',
            warning: 'TEST: Warning - Deprecated function usage',
            info: 'TEST: Info - User action logged'
        };

        this.logError(new Error(messages[level] || messages.error), level, {
            testError: true,
            generatedAt: new Date().toISOString()
        });
    }
}

// ==================== GLOBAL INSTANCE ====================
window.errorLogger = new ErrorLogger();

// ==================== CONSOLE HELPER ====================
// Console'a helper fonksiyonlar ekle
window.testError = (level) => window.errorLogger.throwTestError(level);
window.showErrors = () => console.table(window.errorLogger.getErrors({ limit: 10 }));
window.errorStats = () => console.log(window.errorLogger.getErrorStats());

console.log(`
╔═══════════════════════════════════════╗
║  🔍 Error Logger aktif               ║
║  Komutlar:                            ║
║  • testError('critical')              ║
║  • showErrors()                       ║
║  • errorStats()                       ║
╚═══════════════════════════════════════╝
`);
