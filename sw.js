/* Bee Expert V46.0 - Force Auto Update */
const CACHE_NAME = 'bee-expert-v46-auto'; // ★ 每次更新代碼，務必修改此版號 (例如改 v47, v48...)

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// 1. 安裝：下載新檔案，並強制 "插隊" (Skip Waiting)
self.addEventListener('install', (e) => {
    self.skipWaiting(); // <--- 關鍵：不等待舊版關閉，直接安裝新版
    e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// 2. 攔截請求：優先使用快取，但背景檢查更新
self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});

// 3. 活化：刪除舊版快取，並立即接管頁面
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => Promise.all(keyList.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
        })))
    );
    self.clients.claim(); // <--- 關鍵：立即控制所有開啟的頁面
});
