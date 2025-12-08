// ==================== SYNC MANAGER ====================
// Life Manager - Firebase & localStorage Senkronizasyon Yöneticisi
// Versiyon: 1.0.0

class SyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.isSyncing = false;
        this.pendingOperations = [];
        this.listeners = new Map();
        this.lastSyncTime = null;
        this.syncInterval = null;

        // Koleksiyon mapping
        this.collectionMap = {
            [DataManager.KEYS.TODO_ITEMS]: FirestoreCollections.TODOS,
            [DataManager.KEYS.STUDY_PROGRAMS]: FirestoreCollections.STUDY_PROGRAMS,
            [DataManager.KEYS.STUDY_LOGS]: FirestoreCollections.STUDY_LOGS,
            [DataManager.KEYS.HEALTH_TRACKING]: FirestoreCollections.HEALTH_TRACKING,
            [DataManager.KEYS.EXPENSES]: FirestoreCollections.EXPENSES
        };

        this.init();
    }

    // Başlatma
    init() {
        console.log('[SyncManager] Başlatılıyor...');

        // Online/offline durumunu dinle
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Bekleyen işlemleri localStorage'dan yükle
        this.loadPendingOperations();

        // Auth state değişikliğini dinle
        if (auth) {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    this.startSync();
                } else {
                    this.stopSync();
                }
            });
        }

        console.log('[SyncManager] Hazır - Online:', this.isOnline);
    }

    // Online olduğunda
    handleOnline() {
        console.log('[SyncManager] Online oldu');
        this.isOnline = true;
        this.updateSyncIndicator('online');
        this.processPendingOperations();
    }

    // Offline olduğunda
    handleOffline() {
        console.log('[SyncManager] Offline oldu');
        this.isOnline = false;
        this.updateSyncIndicator('offline');
    }

    // Senkronizasyonu başlat
    async startSync() {
        const user = auth?.currentUser;
        if (!user) {
            console.log('[SyncManager] Kullanıcı yok, sync başlatılmadı');
            return;
        }

        console.log('[SyncManager] Sync başlatılıyor...');

        // İlk senkronizasyon
        await this.fullSync();

        // Real-time listeners kur
        this.setupRealtimeListeners();

        // Periyodik sync (her 5 dakika)
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.processPendingOperations();
            }
        }, 5 * 60 * 1000);
    }

    // Senkronizasyonu durdur
    stopSync() {
        console.log('[SyncManager] Sync durduruluyor...');

        // Listener'ları kapat
        this.listeners.forEach((unsubscribe) => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.listeners.clear();

        // Interval'ı temizle
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Tam senkronizasyon
    async fullSync() {
        const user = auth?.currentUser;
        if (!user || !this.isOnline) return;

        this.isSyncing = true;
        this.updateSyncIndicator('syncing');

        try {
            console.log('[SyncManager] Tam senkronizasyon başladı');

            // Her koleksiyon için sync yap
            await Promise.all([
                this.syncCollection(DataManager.KEYS.TODO_ITEMS),
                this.syncCollection(DataManager.KEYS.STUDY_PROGRAMS),
                this.syncCollection(DataManager.KEYS.HEALTH_TRACKING),
                this.syncCollection(DataManager.KEYS.EXPENSES)
            ]);

            this.lastSyncTime = new Date();
            console.log('[SyncManager] Tam senkronizasyon tamamlandı');

        } catch (error) {
            console.error('[SyncManager] Sync hatası:', error);
        } finally {
            this.isSyncing = false;
            this.updateSyncIndicator(this.isOnline ? 'online' : 'offline');
        }
    }

    // Tek koleksiyon senkronizasyonu
    async syncCollection(localKey) {
        const user = auth?.currentUser;
        if (!user) return;

        const collectionName = this.collectionMap[localKey];
        if (!collectionName) return;

        try {
            // Firestore'dan veri çek
            const snapshot = await db.collection(collectionName)
                .where('userId', '==', user.uid)
                .get();

            const serverData = [];
            snapshot.forEach(doc => {
                serverData.push({ id: doc.id, ...doc.data() });
            });

            // Local veriyi al
            const localData = DataManager.load(localKey);

            // Merge stratejisi: Server-wins (çakışmalarda sunucu verisini al)
            const mergedData = this.mergeData(localKey, localData, serverData);

            // Local'e kaydet
            DataManager.save(localKey, mergedData);

            console.log(`[SyncManager] ${localKey} senkronize edildi:`, serverData.length, 'kayıt');

        } catch (error) {
            console.error(`[SyncManager] ${localKey} sync hatası:`, error);
        }
    }

    // Veri birleştirme
    mergeData(localKey, localData, serverData) {
        // TODO_ITEMS için özel işlem
        if (localKey === DataManager.KEYS.TODO_ITEMS) {
            return {
                items: serverData.length > 0 ? serverData : (localData?.items || [])
            };
        }

        // STUDY_PROGRAMS için
        if (localKey === DataManager.KEYS.STUDY_PROGRAMS) {
            return serverData.length > 0 ? serverData : (localData || []);
        }

        // Diğer veriler için obje merge
        if (serverData.length > 0) {
            // Server verisini array'den objeye dönüştür
            const merged = { ...localData };
            serverData.forEach(item => {
                if (item.type) {
                    merged[item.type] = item.data;
                }
            });
            return merged;
        }

        return localData;
    }

    // Real-time listener'ları kur
    setupRealtimeListeners() {
        const user = auth?.currentUser;
        if (!user) return;

        // TODO'lar için listener
        const todosUnsubscribe = db.collection(FirestoreCollections.TODOS)
            .where('userId', '==', user.uid)
            .onSnapshot((snapshot) => {
                this.handleRealtimeUpdate(DataManager.KEYS.TODO_ITEMS, snapshot);
            }, (error) => {
                console.error('[SyncManager] Todos listener hatası:', error);
            });

        this.listeners.set('todos', todosUnsubscribe);

        // Çalışma programları için listener
        const programsUnsubscribe = db.collection(FirestoreCollections.STUDY_PROGRAMS)
            .where('userId', '==', user.uid)
            .onSnapshot((snapshot) => {
                this.handleRealtimeUpdate(DataManager.KEYS.STUDY_PROGRAMS, snapshot);
            }, (error) => {
                console.error('[SyncManager] Programs listener hatası:', error);
            });

        this.listeners.set('programs', programsUnsubscribe);

        console.log('[SyncManager] Real-time listeners kuruldu');
    }

    // Real-time güncelleme işle
    handleRealtimeUpdate(localKey, snapshot) {
        if (this.isSyncing) return; // Sync sırasında güncelleme yapma

        const data = [];
        snapshot.forEach(doc => {
            data.push({ id: doc.id, ...doc.data() });
        });

        if (localKey === DataManager.KEYS.TODO_ITEMS) {
            DataManager.save(localKey, { items: data });
            // UI'ı güncelle
            if (window.todoManager) {
                todoManager.loadFromStorage();
                todoManager.renderTodoList();
            }
        } else if (localKey === DataManager.KEYS.STUDY_PROGRAMS) {
            DataManager.save(localKey, data);
            // UI'ı güncelle
            if (typeof renderStudyPrograms === 'function') {
                renderStudyPrograms();
            }
        }

        // Custom event dispatch
        document.dispatchEvent(new CustomEvent('dataSync', {
            detail: { collection: localKey, count: data.length }
        }));
    }

    // ==================== CRUD OPERASYONLARI ====================

    // Veri ekle
    async add(localKey, item) {
        const user = auth?.currentUser;

        // Local'e ekle
        const localData = DataManager.load(localKey);

        // ID oluştur
        if (!item.id) {
            item.id = FirestoreHelpers.generateId();
        }

        // Timestamps ekle
        item.createdAt = new Date().toISOString();
        item.updatedAt = item.createdAt;
        item.userId = user?.uid || 'local';

        // Local kaydet
        if (localKey === DataManager.KEYS.TODO_ITEMS) {
            localData.items = localData.items || [];
            localData.items.push(item);
        } else if (Array.isArray(localData)) {
            localData.push(item);
        }
        DataManager.save(localKey, localData);

        // Firebase'e gönder
        if (user && this.isOnline) {
            try {
                const collectionName = this.collectionMap[localKey];
                await db.collection(collectionName).doc(item.id).set({
                    ...item,
                    createdAt: FirestoreHelpers.timestamp(),
                    updatedAt: FirestoreHelpers.timestamp()
                });
                console.log('[SyncManager] Firestore\'a eklendi:', item.id);
            } catch (error) {
                console.error('[SyncManager] Firestore ekleme hatası:', error);
                this.queueOperation('add', localKey, item);
            }
        } else if (user) {
            // Offline - kuyruğa ekle
            this.queueOperation('add', localKey, item);
        }

        return item;
    }

    // Veri güncelle
    async update(localKey, itemId, updates) {
        const user = auth?.currentUser;

        // Local'i güncelle
        const localData = DataManager.load(localKey);
        let item;

        if (localKey === DataManager.KEYS.TODO_ITEMS) {
            const index = localData.items.findIndex(i => i.id === itemId);
            if (index !== -1) {
                localData.items[index] = { ...localData.items[index], ...updates, updatedAt: new Date().toISOString() };
                item = localData.items[index];
            }
        } else if (Array.isArray(localData)) {
            const index = localData.findIndex(i => i.id === itemId);
            if (index !== -1) {
                localData[index] = { ...localData[index], ...updates, updatedAt: new Date().toISOString() };
                item = localData[index];
            }
        }
        DataManager.save(localKey, localData);

        // Firebase'i güncelle
        if (user && this.isOnline && item) {
            try {
                const collectionName = this.collectionMap[localKey];
                await db.collection(collectionName).doc(itemId).update({
                    ...updates,
                    updatedAt: FirestoreHelpers.timestamp()
                });
                console.log('[SyncManager] Firestore güncellendi:', itemId);
            } catch (error) {
                console.error('[SyncManager] Firestore güncelleme hatası:', error);
                this.queueOperation('update', localKey, { id: itemId, ...updates });
            }
        } else if (user) {
            this.queueOperation('update', localKey, { id: itemId, ...updates });
        }

        return item;
    }

    // Veri sil
    async delete(localKey, itemId) {
        const user = auth?.currentUser;

        // Local'den sil
        const localData = DataManager.load(localKey);

        if (localKey === DataManager.KEYS.TODO_ITEMS) {
            localData.items = localData.items.filter(i => i.id !== itemId);
        } else if (Array.isArray(localData)) {
            const index = localData.findIndex(i => i.id === itemId);
            if (index !== -1) {
                localData.splice(index, 1);
            }
        }
        DataManager.save(localKey, localData);

        // Firebase'den sil
        if (user && this.isOnline) {
            try {
                const collectionName = this.collectionMap[localKey];
                await db.collection(collectionName).doc(itemId).delete();
                console.log('[SyncManager] Firestore\'dan silindi:', itemId);
            } catch (error) {
                console.error('[SyncManager] Firestore silme hatası:', error);
                this.queueOperation('delete', localKey, { id: itemId });
            }
        } else if (user) {
            this.queueOperation('delete', localKey, { id: itemId });
        }
    }

    // ==================== OFFLINE QUEUE ====================

    // İşlemi kuyruğa ekle
    queueOperation(type, collection, data) {
        const operation = {
            id: Date.now().toString(),
            type,
            collection,
            data,
            timestamp: new Date().toISOString()
        };

        this.pendingOperations.push(operation);
        this.savePendingOperations();

        console.log('[SyncManager] İşlem kuyruğa eklendi:', type, collection);
        this.updateSyncIndicator('pending');
    }

    // Bekleyen işlemleri kaydet
    savePendingOperations() {
        localStorage.setItem('syncPendingOperations', JSON.stringify(this.pendingOperations));
    }

    // Bekleyen işlemleri yükle
    loadPendingOperations() {
        try {
            const saved = localStorage.getItem('syncPendingOperations');
            this.pendingOperations = saved ? JSON.parse(saved) : [];

            if (this.pendingOperations.length > 0) {
                console.log('[SyncManager] Bekleyen işlemler:', this.pendingOperations.length);
            }
        } catch (error) {
            this.pendingOperations = [];
        }
    }

    // Bekleyen işlemleri işle
    async processPendingOperations() {
        if (!this.isOnline || this.pendingOperations.length === 0) return;

        const user = auth?.currentUser;
        if (!user) return;

        console.log('[SyncManager] Bekleyen işlemler işleniyor:', this.pendingOperations.length);
        this.updateSyncIndicator('syncing');

        const failedOperations = [];

        for (const op of this.pendingOperations) {
            try {
                const collectionName = this.collectionMap[op.collection];

                switch (op.type) {
                    case 'add':
                        await db.collection(collectionName).doc(op.data.id).set({
                            ...op.data,
                            syncedAt: FirestoreHelpers.timestamp()
                        });
                        break;

                    case 'update':
                        await db.collection(collectionName).doc(op.data.id).update({
                            ...op.data,
                            syncedAt: FirestoreHelpers.timestamp()
                        });
                        break;

                    case 'delete':
                        await db.collection(collectionName).doc(op.data.id).delete();
                        break;
                }

                console.log('[SyncManager] İşlem tamamlandı:', op.type, op.data.id);

            } catch (error) {
                console.error('[SyncManager] İşlem hatası:', error);
                failedOperations.push(op);
            }
        }

        // Başarısız olanları geri ekle
        this.pendingOperations = failedOperations;
        this.savePendingOperations();

        this.updateSyncIndicator(this.isOnline ? 'online' : 'offline');
    }

    // ==================== SYNC INDICATOR ====================

    // Sync durumunu güncelle
    updateSyncIndicator(status) {
        const indicator = document.getElementById('syncIndicator');
        if (!indicator) return;

        indicator.className = 'sync-indicator';

        switch (status) {
            case 'online':
                indicator.innerHTML = '<span class="sync-dot online"></span><span>Senkronize</span>';
                indicator.classList.add('online');
                break;
            case 'offline':
                indicator.innerHTML = '<span class="sync-dot offline"></span><span>Çevrimdışı</span>';
                indicator.classList.add('offline');
                break;
            case 'syncing':
                indicator.innerHTML = '<span class="sync-dot syncing"></span><span>Senkronize ediliyor...</span>';
                indicator.classList.add('syncing');
                break;
            case 'pending':
                indicator.innerHTML = `<span class="sync-dot pending"></span><span>Bekleyen: ${this.pendingOperations.length}</span>`;
                indicator.classList.add('pending');
                break;
        }

        // Event dispatch
        document.dispatchEvent(new CustomEvent('syncStatusChanged', { detail: { status } }));
    }

    // Sync durumunu al
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
            pendingCount: this.pendingOperations.length,
            lastSyncTime: this.lastSyncTime
        };
    }

    // Manuel sync tetikle
    async manualSync() {
        if (!this.isOnline) {
            console.log('[SyncManager] Offline - manual sync yapılamaz');
            return false;
        }

        await this.fullSync();
        await this.processPendingOperations();
        return true;
    }
}

// Global instance
let syncManager;
let syncManagerInitialized = false;

// SyncManager'ı güvenli şekilde başlat (race condition önleme)
function initializeSyncManager() {
    if (syncManagerInitialized) return;
    syncManagerInitialized = true;

    syncManager = new SyncManager();
    window.syncManager = syncManager;
    console.log('[SyncManager] Başlatıldı');
}

// Firebase hazır olana kadar bekle (Promise-based)
function waitForFirebase(timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const check = () => {
            if (isFirebaseReady()) {
                resolve(true);
            } else if (Date.now() - startTime >= timeout) {
                console.warn('[SyncManager] Firebase başlatılamadı, offline mod');
                resolve(false);
            } else {
                // 250ms interval (100ms yerine - daha az CPU kullanımı)
                setTimeout(check, 250);
            }
        };

        check();
    });
}

// DOM yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', async () => {
    await waitForFirebase(5000);
    initializeSyncManager();
});

console.log('[Sync Manager] Yüklendi');
