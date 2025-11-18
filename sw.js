/**
 * BEE EXPERT V300.0 - SERVICE WORKER (FULL STANDARD VERSION)
 * Strategy: Cache First, Network Fallback
 * Integrity: Full Asset List, Strict Cache Cleanup, Update Listener
 */

// ★★★ 核心版本號 (每次更新網頁代碼，務必修改此處變數) ★★★
// 修改這個名字，瀏覽器才會知道有新版本，進而觸發更新
const CACHE_NAME = 'bee-expert-v300-ultimate-full';

// ★ 必須快取的資產清單 (白名單)
// 包含本地檔案與所有外部 CDN 連結，確保離線時功能完整
const ASSETS = [
    // 1. 本地核心檔案
    './',
    './index.html',
    './style.css',
    './script.js',

    // 2. Google Fonts (介面圖示與中文字體)
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap',

    // 3. 外部函式庫 (圖表、PDF、拖曳排序、QR Code、慶典特效)
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

// ================= 1. 安裝階段 (Install Phase) =================
// 當瀏覽器偵測到 sw.js 內容有變更時觸發
self.addEventListener('install', (event) => {
    console.log(`[Service Worker] 安裝新版本: ${CACHE_NAME}`);
    
    // 強制進入等待狀態 (Skip Waiting)，讓新版 SW 盡快準備好
    self.skipWaiting();

    // 下載並快取所有 ASSETS 列表中的檔案
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] 正在快取核心檔案...');
                return cache.addAll(ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] 快取完成，安裝成功。');
            })
            .catch((error) => {
                console.error('[Service Worker] 快取失敗，請檢查網路或網址:', error);
            })
    );
});

// ================= 2. 啟動階段 (Activate Phase) =================
// 當新版 SW 正式接管頁面時觸發 (通常是關閉分頁重開後)
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] 新版本已啟動，準備清理舊快取...');

    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                // 如果發現舊版本的快取 (名稱不等於當前版本)，直接刪除
                if (key !== CACHE_NAME) {
                    console.log(`[Service Worker] 刪除舊快取: ${key}`);
                    return caches.delete(key);
                }
            }));
        })
        .then(() => {
            console.log(`[Service Worker] 舊快取清理完畢，目前運行: ${CACHE_NAME}`);
            // 立即接管所有客戶端頁面，確保使用者立刻看到新內容
            return self.clients.claim();
        })
    );
});

// ================= 3. 請求攔截 (Fetch Strategy) =================
// 這是離線功能的靈魂：攔截網頁發出的請求，決定讀快取還是讀網路
self.addEventListener('fetch', (event) => {
    // 只處理 HTTP/HTTPS 請求 (忽略 chrome-extension 等協議)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 策略 A: 快取優先 (Cache First)
            // 如果快取裡有這個檔案，直接回傳 (速度最快)
            if (cachedResponse) {
                return cachedResponse;
            }

            // 策略 B: 網路候補 (Network Fallback)
            // 如果快取沒有，才去網路上抓
            return fetch(event.request).catch((error) => {
                console.warn(`[Service Worker] 網路請求失敗 (可能是離線狀態): ${event.request.url}`);
                // 這裡可以加入自訂的「離線畫面」邏輯，但目前 SPA 架構不強制要求
            });
        })
    );
});

// ================= 4. 訊息監聽 (Message Listener) =================
// 接收來自 index.html 中「立即更新」按鈕的指令
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[Service Worker] 收到強制更新指令，執行 skipWaiting()...');
        self.skipWaiting();
    }
});
