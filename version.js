// ==================== VERSION MANAGER ====================
// Uygulama versiyon kontrolü ve semantic versioning

const APP_VERSION = {
    major: 2,
    minor: 1,
    patch: 0,

    toString() {
        return `${this.major}.${this.minor}.${this.patch}`;
    },

    // Semantic versioning karşılaştırma
    compare(other) {
        if (typeof other === 'string') {
            const [otherMajor, otherMinor, otherPatch] = other.split('.').map(Number);

            if (this.major > otherMajor) return 1;
            if (this.major < otherMajor) return -1;
            if (this.minor > otherMinor) return 1;
            if (this.minor < otherMinor) return -1;
            if (this.patch > otherPatch) return 1;
            if (this.patch < otherPatch) return -1;
            return 0;
        }
        return 0;
    },

    isNewer(other) {
        return this.compare(other) > 0;
    },

    isOlder(other) {
        return this.compare(other) < 0;
    },

    isSame(other) {
        return this.compare(other) === 0;
    }
};

// Changelog (yeni versiyonlarda güncellenir)
const CHANGELOG = {
    '2.1.0': {
        date: '2025-11-16',
        features: [
            'Family Tree UI - Hiyerarşik program oluşturma',
            'Quick Start Wizard - Tek tıkla program',
            'User Manager - Kullanıcı profili ve ayarlar',
            'Update Manager - Otomatik güncelleme',
            'Error Tracking - Hata loglama sistemi'
        ],
        fixes: [
            'Scroll hataları düzeltildi',
            'Panel çakışmaları giderildi',
            'Magnetic tilt tüm butonlara eklendi',
            'Tooltip baloncukları iyileştirildi'
        ]
    },
    '2.0.0': {
        date: '2025-11-15',
        features: [
            'Haftalık takvim görünümü',
            'Bootcamp sistemi',
            'Bildirim yönetimi',
            'PWA desteği'
        ],
        fixes: []
    }
};

// Version display helper
function getVersionInfo() {
    const version = APP_VERSION.toString();
    const changelogEntry = CHANGELOG[version] || {};

    return {
        version,
        date: changelogEntry.date || new Date().toISOString().split('T')[0],
        features: changelogEntry.features || [],
        fixes: changelogEntry.fixes || []
    };
}

// Console'a version bilgisi yazdır
console.log(`
╔══════════════════════════════════════╗
║  📚 Çalışma Programı Asistanı       ║
║  Version: ${APP_VERSION.toString().padEnd(24)} ║
║  Build: ${new Date().toISOString().split('T')[0].padEnd(27)} ║
╚══════════════════════════════════════╝
`);
