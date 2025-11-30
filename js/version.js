// ==================== VERSION MANAGER ====================
// Uygulama versiyon kontrolü ve semantic versioning

const APP_VERSION = {
    major: 2,
    minor: 4,
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
    '2.4.0': {
        date: '2025-11-29',
        features: [
            'Takvim sekmesi tamamen yenilendi',
            'Program listesi sidebar eklendi',
            'Ay navigasyonu calisiyor',
            'Dark mode tam destek'
        ],
        fixes: [
            'Calendar tab gorsel hatalari duzeltildi',
            'CSS degiskenleri tum dashboard icin guncellendi',
            'Service Worker path sorunu cozuldu'
        ]
    },
    '2.3.0': {
        date: '2025-11-28',
        features: [
            'Dark/Light tema toggle',
            'Motivasyonel altiazlar',
            'PDF export ozelligi',
            'Feedback formu'
        ],
        fixes: [
            'Klasor yapisı duzenlendi',
            'Icon SVG olarak guncellendi'
        ]
    },
    '2.1.0': {
        date: '2025-11-16',
        features: [
            'Family Tree UI - Hiyerarsik program olusturma',
            'Quick Start Wizard - Tek tikla program',
            'User Manager - Kullanici profili ve ayarlar',
            'Update Manager - Otomatik guncelleme',
            'Error Tracking - Hata loglama sistemi'
        ],
        fixes: [
            'Scroll hatalari duzeltildi',
            'Panel cakismalari giderildi',
            'Magnetic tilt tum butonlara eklendi',
            'Tooltip baloncuklari iyilestirildi'
        ]
    },
    '2.0.0': {
        date: '2025-11-15',
        features: [
            'Haftalik takvim gorunumu',
            'Bootcamp sistemi',
            'Bildirim yonetimi',
            'PWA destegi'
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
