/**
 * BEE EXPERT V201.0 - PROFESSIONAL SERVICE WORKER
 * Strategy: Cache First, Network Fallback (Offline Ready)
 * Features: Auto Update, Cache Management, Error Handling
 */

// ★ 核心版本號 (每次更新代碼時，務必修改此處，例如 v201, v202...)
const CACHE_NAME = 'bee-expert-v201-military';

// ★ 必須快取的檔案清單 (白名單)
// 包含所有核心程式、樣式、圖示庫、圖表庫、PDF庫
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    // Google Fonts (Material Icons & Inter/Noto Sans)
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap',
    // 外部函式庫 (Chart.js, JSPDF, Sortable, QRCode, Confetti)
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

// ================= 1. 安裝階段 (Install) =================
// 當瀏覽器發現有新版 sw.js 時觸發
self.addEventListener('install', (event) => {
    console.log('[SW] Installing New Version:', CACHE_NAME);
    
    // 強制進入等待狀態，準備接手
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching App Shell');
            return cache.addAll(ASSETS);
        }).catch((err) => {
            console.error('[SW] Cache Failed:', err);
        })
    );
});

// ================= 2. 啟動階段 (Activate) =================
// 當新版 sw.js 正式接管頁面時觸發
self.addEventListener('activate', (event) => {
    console.log('[SW] Activated');

    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                // 清除舊版本的快取，只保留當前版本
                if (key !== CACHE_NAME) {
                    console.log('[SW] Removing Old Cache:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    
    // 讓 Service Worker 立即控制所有頁面，不用等下次重整
    return self.clients.claim();
});

// ================= 3. 攔截請求 (Fetch) =================
// 這是離線功能的靈魂：優先讀快取，沒有才上網
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // 策略 A: 如果快取有，直接回傳快取 (秒開)
            if (response) {
                return response;
            }
            
            // 策略 B: 如果快取沒有，去網路下載
            return fetch(event.request).catch(() => {
                // 策略 C: 如果網路也斷了 (離線)，且找不到檔案
                // 這裡可以回傳一個自訂的離線頁面 (目前系統架構為 SPA，通常不需要)
                console.warn('[SW] Offline & Missing:', event.request.url);
            });
        })
    );
});

// ================= 4. 監聽訊息 (Message) =================
// 接收來自網頁 (index.html) 的強制更新指令
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Force Update Triggered');
        self.skipWaiting();
    }
});
