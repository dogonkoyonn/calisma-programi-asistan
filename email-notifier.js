// ==================== EMAIL NOTIFIER ====================
// EmailJS entegrasyonu ile hata bildirimleri

class EmailNotifier {
    constructor() {
        // EmailJS yapılandırması
        this.config = this.loadConfig();
        this.enabled = false;
        this.initialized = false;

        // Rate limiting (spam önleme)
        this.lastEmailTime = 0;
        this.minEmailInterval = 5 * 60 * 1000; // 5 dakika minimum interval

        this.init();
    }

    init() {
        // Config varsa EmailJS'i initialize et
        if (this.config.publicKey && this.config.serviceId && this.config.templateId) {
            this.initializeEmailJS();
        } else {
            console.log('⚠️ EmailJS yapılandırılmamış - email bildirimleri devre dışı');
        }
    }

    // ==================== CONFIGURATION ====================

    loadConfig() {
        try {
            const saved = localStorage.getItem('emailNotifierConfig');
            return saved ? JSON.parse(saved) : this.getDefaultConfig();
        } catch (error) {
            console.error('❌ Email config yüklenemedi:', error);
            return this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            publicKey: '', // EmailJS Public Key
            serviceId: '', // EmailJS Service ID
            templateId: '', // EmailJS Template ID
            recipientEmail: '', // Alıcı email
            recipientName: '', // Alıcı adı
            enabled: false
        };
    }

    saveConfig(config) {
        this.config = { ...this.config, ...config };
        localStorage.setItem('emailNotifierConfig', JSON.stringify(this.config));

        // Config güncellendiğinde EmailJS'i tekrar initialize et
        if (this.config.publicKey && this.config.serviceId && this.config.templateId) {
            this.initializeEmailJS();
        }

        console.log('💾 Email config kaydedildi');
    }

    // ==================== EMAILJS INITIALIZATION ====================

    initializeEmailJS() {
        try {
            // EmailJS kütüphanesi yüklü mü kontrol et
            if (typeof emailjs === 'undefined') {
                console.error('❌ EmailJS kütüphanesi yüklenmemiş!');
                console.log('📦 Lütfen index.html içine şunu ekleyin:');
                console.log('<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>');
                return;
            }

            // Public key ile initialize
            emailjs.init(this.config.publicKey);
            this.initialized = true;
            this.enabled = this.config.enabled;

            console.log('✅ EmailJS initialized - Email bildirimleri aktif');
        } catch (error) {
            console.error('❌ EmailJS initialization hatası:', error);
            this.initialized = false;
            this.enabled = false;
        }
    }

    // ==================== ERROR EMAIL ====================

    async sendErrorEmail(errorLog) {
        // Kontroller
        if (!this.enabled || !this.initialized) {
            return false;
        }

        // Rate limiting kontrolü
        const now = Date.now();
        if (now - this.lastEmailTime < this.minEmailInterval) {
            console.log('⏰ Email spam koruması - minimum interval bekleniyor');
            return false;
        }

        try {
            // Email template parametreleri
            const templateParams = {
                to_name: this.config.recipientName || 'Admin',
                to_email: this.config.recipientEmail,
                error_level: errorLog.level.toUpperCase(),
                error_message: errorLog.message,
                error_timestamp: new Date(errorLog.timestamp).toLocaleString('tr-TR'),
                error_url: errorLog.context.url,
                error_user: errorLog.context.user.name || errorLog.context.user.id,
                error_browser: errorLog.context.browser,
                error_version: errorLog.context.version,
                error_stack: this.formatStack(errorLog.stack),
                app_name: '📚 Çalışma Programı Asistanı',
                app_url: window.location.origin
            };

            // Email gönder
            const response = await emailjs.send(
                this.config.serviceId,
                this.config.templateId,
                templateParams
            );

            if (response.status === 200) {
                console.log('📧 Error email gönderildi:', errorLog.level, errorLog.message);
                this.lastEmailTime = now;
                return true;
            } else {
                console.error('❌ Email gönderilemedi:', response);
                return false;
            }
        } catch (error) {
            console.error('❌ Email gönderme hatası:', error);
            return false;
        }
    }

    // ==================== SYSTEM STATUS EMAIL ====================

    async sendStatusEmail() {
        if (!this.enabled || !this.initialized) {
            console.log('⚠️ Email bildirimleri devre dışı');
            return false;
        }

        try {
            const stats = window.errorLogger ? window.errorLogger.getErrorStats() : null;

            const templateParams = {
                to_name: this.config.recipientName || 'Admin',
                to_email: this.config.recipientEmail,
                status_type: 'System Health Check',
                timestamp: new Date().toLocaleString('tr-TR'),
                total_errors: stats ? stats.total : 0,
                critical_errors: stats ? stats.bySeverity.critical : 0,
                last_24h_errors: stats ? stats.last24h : 0,
                app_version: APP_VERSION.toString(),
                app_name: '📚 Çalışma Programı Asistanı',
                app_url: window.location.origin
            };

            const response = await emailjs.send(
                this.config.serviceId,
                this.config.templateId,
                templateParams
            );

            if (response.status === 200) {
                console.log('📧 Status email gönderildi');
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Status email hatası:', error);
            return false;
        }
    }

    // ==================== TEST EMAIL ====================

    async sendTestEmail() {
        if (!this.config.publicKey || !this.config.serviceId || !this.config.templateId) {
            alert('⚠️ Lütfen önce EmailJS yapılandırmasını tamamlayın!');
            return false;
        }

        if (!this.config.recipientEmail) {
            alert('⚠️ Lütfen alıcı email adresini girin!');
            return false;
        }

        try {
            const templateParams = {
                to_name: this.config.recipientName || 'Test User',
                to_email: this.config.recipientEmail,
                error_level: 'TEST',
                error_message: 'Bu bir test mesajıdır - EmailJS yapılandırması başarılı!',
                error_timestamp: new Date().toLocaleString('tr-TR'),
                error_url: window.location.href,
                error_user: 'Test User',
                error_browser: navigator.userAgent,
                error_version: APP_VERSION.toString(),
                error_stack: 'Test stack trace',
                app_name: '📚 Çalışma Programı Asistanı',
                app_url: window.location.origin
            };

            const response = await emailjs.send(
                this.config.serviceId,
                this.config.templateId,
                templateParams
            );

            if (response.status === 200) {
                alert('✅ Test email başarıyla gönderildi!\n\nLütfen ' + this.config.recipientEmail + ' adresini kontrol edin.');
                return true;
            } else {
                alert('❌ Test email gönderilemedi!\n\nHata: ' + response.text);
                return false;
            }
        } catch (error) {
            alert('❌ Test email hatası!\n\n' + error.message);
            console.error('Test email error:', error);
            return false;
        }
    }

    // ==================== UTILITY ====================

    formatStack(stack) {
        if (!stack) return 'No stack trace available';

        // İlk 5 satırı al
        const lines = stack.split('\n').slice(0, 5);
        return lines.join('\n');
    }

    enable() {
        if (!this.initialized) {
            console.log('⚠️ EmailJS henüz initialize edilmemiş');
            return;
        }

        this.enabled = true;
        this.config.enabled = true;
        this.saveConfig(this.config);
        console.log('✅ Email bildirimleri aktif');
    }

    disable() {
        this.enabled = false;
        this.config.enabled = false;
        this.saveConfig(this.config);
        console.log('⏸️ Email bildirimleri devre dışı');
    }

    getStatus() {
        return {
            initialized: this.initialized,
            enabled: this.enabled,
            hasConfig: !!(this.config.publicKey && this.config.serviceId && this.config.templateId),
            recipientEmail: this.config.recipientEmail || 'Not set',
            lastEmailTime: this.lastEmailTime ? new Date(this.lastEmailTime).toLocaleString('tr-TR') : 'Never'
        };
    }
}

// ==================== GLOBAL INSTANCE ====================
window.emailNotifier = new EmailNotifier();

// Error Logger ile entegre et
if (window.errorLogger) {
    window.errorLogger.setEmailNotifier(window.emailNotifier);
}

console.log('📧 Email Notifier hazır');
