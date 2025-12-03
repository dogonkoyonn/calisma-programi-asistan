// ==================== FIREBASE CONFIGURATION ====================
// Life Manager - Firebase Entegrasyonu
// Versiyon: 1.0.0

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyAxIVNXhZQEDAogDc7m26tCx4vV7FgZpsA",
    authDomain: "life-manager-app-9c1f7.firebaseapp.com",
    projectId: "life-manager-app-9c1f7",
    storageBucket: "life-manager-app-9c1f7.firebasestorage.app",
    messagingSenderId: "805744962912",
    appId: "1:805744962912:web:9aabe574328151d8548205",
    measurementId: "G-HP7ZS3TMET"
};

// Firebase başlatma durumu
let firebaseInitialized = false;
let db = null;
let auth = null;

// Firebase'i başlat
function initializeFirebase() {
    if (firebaseInitialized) {
        console.log('[Firebase] Zaten başlatılmış');
        return { db, auth };
    }

    try {
        // Firebase App başlat
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        // Firestore
        db = firebase.firestore();

        // Authentication
        auth = firebase.auth();

        // Offline persistence etkinleştir
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.log('[Firebase] Offline persistence etkinleştirildi');
            })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('[Firebase] Birden fazla sekme açık - persistence devre dışı');
                } else if (err.code === 'unimplemented') {
                    console.warn('[Firebase] Tarayıcı offline persistence desteklemiyor');
                }
            });

        // Auth dil ayarı
        auth.languageCode = 'tr';

        firebaseInitialized = true;
        console.log('[Firebase] Başarıyla başlatıldı');

        // Global erişim için
        window.db = db;
        window.auth = auth;

        return { db, auth };
    } catch (error) {
        console.error('[Firebase] Başlatma hatası:', error);
        throw error;
    }
}

// Firebase durumunu kontrol et
function isFirebaseReady() {
    return firebaseInitialized && db !== null && auth !== null;
}

// Firestore referansları
const FirestoreCollections = {
    USERS: 'users',
    TODOS: 'todos',
    STUDY_PROGRAMS: 'studyPrograms',
    STUDY_LOGS: 'studyLogs',
    HEALTH_TRACKING: 'healthTracking',
    EXPENSES: 'expenses',
    SETTINGS: 'settings'
};

// Firestore yardımcı fonksiyonlar
const FirestoreHelpers = {
    // Timestamp oluştur
    timestamp: () => firebase.firestore.FieldValue.serverTimestamp(),

    // Döküman ID oluştur
    generateId: () => db?.collection('_').doc().id || Date.now().toString(),

    // Array'e eleman ekle
    arrayUnion: (...elements) => firebase.firestore.FieldValue.arrayUnion(...elements),

    // Array'den eleman çıkar
    arrayRemove: (...elements) => firebase.firestore.FieldValue.arrayRemove(...elements),

    // Sayıyı artır
    increment: (n) => firebase.firestore.FieldValue.increment(n)
};

// Export for global access
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;
window.isFirebaseReady = isFirebaseReady;
window.FirestoreCollections = FirestoreCollections;
window.FirestoreHelpers = FirestoreHelpers;

console.log('[Firebase Config] Yüklendi');
