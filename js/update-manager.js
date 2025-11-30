// ==================== UPDATE MANAGER ====================
// Service Worker update detection ve kullanıcı bildirimi

class UpdateManager {
    constructor() {
        this.currentVersion = APP_VERSION.toString();
        this.registration = null;
        this.updateAvailable = false;
        this.newWorker = null;
    }

    async init() {
        if (!('serviceWorker' in navigator)) {
            console.log('⚠️ Service Worker desteklenmiyor');
            return;
        }

        // file:// protokolünde Service Worker çalışmaz
        if (location.protocol === 'file:') {
            console.log('ℹ️ Development mode (file://): Service Worker devre dışı');
            console.log('💡 Sunucu kullanmak için: npx http-server -p 8080');
            return;
        }

        try {
            // Service Worker kayıt (relative path for GitHub Pages)
            this.registration = await navigator.serviceWorker.register('./sw.js');
            console.log('✅ Service Worker registered:', this.registration.scope);

            // Update kontrolü başlat
            this.setupUpdateDetection();

            // Her saatte bir update kontrolü yap
            setInterval(() => this.checkForUpdates(), 60 * 60 * 1000);

        } catch (error) {
            console.error('❌ SW registration failed:', error);
        }
    }

    setupUpdateDetection() {
        // Yeni versiyon bulunduğunda
        this.registration.addEventListener('updatefound', () => {
            this.newWorker = this.registration.installing;
            console.log('🔄 Yeni versiyon bulundu, yükleniyor...');

            this.newWorker.addEventListener('statechange', () => {
                if (this.newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Yeni versiyon hazır
                    this.updateAvailable = true;
                    this.showUpdatePrompt();
                }
            });
        });

        // Service Worker kontrolörü değiştiğinde (update uygulandı)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker güncellendi, sayfa yenileniyor...');
            window.location.reload();
        });
    }

    async checkForUpdates() {
        if (!this.registration) return;

        console.log('🔍 Update kontrolü yapılıyor...');
        await this.registration.update();
    }

    showUpdatePrompt() {
        // Varsa eski prompt'u kaldır
        const existing = document.getElementById('updatePrompt');
        if (existing) existing.remove();

        const versionInfo = getVersionInfo();

        const dialog = document.createElement('div');
        dialog.id = 'updatePrompt';
        dialog.className = 'update-dialog';
        dialog.innerHTML = `
            <div class="update-content">
                <div class="update-icon">🎉</div>
                <h3>Yeni Versiyon Hazır!</h3>
                <p class="update-version">v${this.currentVersion} → v${versionInfo.version}</p>

                ${versionInfo.features.length > 0 ? `
                    <div class="update-features">
                        <h4>✨ Yeni Özellikler:</h4>
                        <ul>
                            ${versionInfo.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${versionInfo.fixes.length > 0 ? `
                    <div class="update-fixes">
                        <h4>🔧 Düzeltmeler:</h4>
                        <ul>
                            ${versionInfo.fixes.slice(0, 3).map(fix => `<li>${fix}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="update-actions">
                    <button class="btn-primary" onclick="updateManager.applyUpdate()">
                        🚀 Şimdi Güncelle
                    </button>
                    <button class="btn-secondary" onclick="updateManager.dismissUpdate()">
                        ⏰ Daha Sonra
                    </button>
                </div>
            </div>
        `;

        // CSS ekle
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
            animation: fadeIn 0.3s ease;
            padding: 20px;
        `;

        document.body.appendChild(dialog);

        console.log('💬 Update prompt gösterildi');
    }

    applyUpdate() {
        if (!this.registration || !this.registration.waiting) {
            console.log('⚠️ Bekleyen update yok');
            return;
        }

        console.log('✅ Update uygulanıyor...');

        // Loading göster
        const dialog = document.getElementById('updatePrompt');
        if (dialog) {
            dialog.innerHTML = `
                <div class="update-content" style="text-align: center;">
                    <div class="spinner"></div>
                    <h3>Güncelleniyor...</h3>
                    <p>Lütfen bekleyin, sayfa yenilenecek.</p>
                </div>
            `;
        }

        // Yeni SW'ye "skipWaiting" mesajı gönder
        this.registration.waiting.postMessage({ action: 'skipWaiting' });
    }

    dismissUpdate() {
        const dialog = document.getElementById('updatePrompt');
        if (dialog) {
            dialog.remove();
        }

        // 1 saat sonra tekrar sor
        setTimeout(() => {
            if (this.updateAvailable) {
                this.showUpdatePrompt();
            }
        }, 60 * 60 * 1000);

        console.log('⏰ Update 1 saat sonra tekrar sorulacak');
    }

    // Zorla güncelleme (kritik bug düzeltmeleri için)
    forceUpdate() {
        if (this.updateAvailable) {
            this.applyUpdate();
        } else {
            this.checkForUpdates();
        }
    }
}

// Global instance oluştur
const updateManager = new UpdateManager();

// Sayfa yüklendiğinde başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updateManager.init());
} else {
    updateManager.init();
}
