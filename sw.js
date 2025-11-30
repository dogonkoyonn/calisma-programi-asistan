// ==================== SERVICE WORKER - PWA ====================
// Offline support & caching strategy

const VERSION = '2.5.1';
const CACHE_NAME = `studyplan-v${VERSION}`;
const DYNAMIC_CACHE = `studyplan-dynamic-v${VERSION}`;

// Base URL - GitHub Pages subdirectory desteği
const BASE = self.location.pathname.replace(/\/sw\.js$/, '');

// Önbelleğe alınacak dosyalar (kritik)
const urlsToCache = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  // CSS
  BASE + '/css/styles.css',
  BASE + '/css/program-panel-styles.css',
  BASE + '/css/wizard-styles.css',
  BASE + '/css/program-dashboard.css',
  BASE + '/css/session-styles.css',
  BASE + '/css/timer-styles.css',
  BASE + '/css/daily-log-styles.css',
  BASE + '/css/badges-styles.css',
  BASE + '/css/theme-styles.css',
  BASE + '/css/settings-panel.css',
  BASE + '/css/notification-dialog.css',
  BASE + '/css/calendar-view.css',
  BASE + '/css/magnetic-tilt.css',
  // JS
  BASE + '/js/app.js',
  BASE + '/js/version.js',
  BASE + '/js/user-manager.js',
  BASE + '/js/resources-db.js',
  BASE + '/js/study-tracker.js',
  BASE + '/js/program-wizard.js',
  BASE + '/js/program-dashboard.js',
  BASE + '/js/session-manager.js',
  BASE + '/js/pomodoro-timer.js',
  BASE + '/js/daily-log-viewer.js',
  BASE + '/js/badges-system.js',
  BASE + '/js/calendar-view.js',
  BASE + '/js/notification-manager.js',
  BASE + '/js/settings-panel.js',
  BASE + '/js/theme-manager.js',
  BASE + '/js/motivational-quotes.js',
  BASE + '/js/loading-spinner.js',
  BASE + '/js/pdf-export.js',
  BASE + '/js/feedback-form.js',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// ==================== INSTALL ====================
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${VERSION}...`);
  console.log(`[SW] Base path: ${BASE}`);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${VERSION}...`);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE && cache.startsWith('studyplan-')) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ==================== MESSAGE HANDLER ====================
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('[SW] skipWaiting message received');
    self.skipWaiting();
  }
});

// ==================== FETCH ====================
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache'de var mı?
      if (response) {
        return response;
      }

      // Yoksa network'ten çek
      return fetch(event.request).then((fetchResponse) => {
        // Geçerli response değil mi?
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }

        // Dynamic cache'e ekle
        const responseToCache = fetchResponse.clone();

        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return fetchResponse;
      }).catch(() => {
        // Offline ise, fallback sayfası göster
        if (event.request.destination === 'document') {
          return caches.match(BASE + '/index.html');
        }
      });
    })
  );
});

// ==================== PUSH NOTIFICATION ====================
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'StudyPlan';
  const options = {
    body: data.body || 'Çalışma zamanı!',
    icon: BASE + '/icons/icon-192x192.png',
    badge: BASE + '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || BASE + '/',
    actions: [
      { action: 'open', title: 'Aç' },
      { action: 'close', title: 'Kapat' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ==================== NOTIFICATION CLICK ====================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || BASE + '/')
    );
  }
});

// ==================== BACKGROUND SYNC ====================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-study-logs') {
    event.waitUntil(syncStudyLogs());
  }
});

async function syncStudyLogs() {
  // Offline'da toplanan log'ları senkronize et (gelecekte)
  console.log('[SW] Syncing study logs...');
}
