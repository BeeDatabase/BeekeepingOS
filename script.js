/**
 * BEE EXPERT V18.0 - EMPIRE OS CORE
 * Author: AI Architect
 * Architecture: SPA (Single Page Application) with Dynamic Module Loading
 */

// ================= 1. 系統核心 (System Kernel) =================
const System = {
    version: '18.0.0',
    isMobile: window.innerWidth <= 900,
    
    init: function() {
        console.log(`%c Bee Expert OS ${this.version} Loaded `, 'background: #FFD700; color: #000; font-weight: bold;');
        
        // 1. 模擬載入畫面 (Splash Screen)
        setTimeout(() => {
            document.querySelector('.progress').style.width = '100%';
            setTimeout(() => {
                document.getElementById('splashScreen').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('splashScreen').style.display = 'none';
                    this.checkLock(); // 檢查安全鎖
                }, 500);
            }, 800);
        }, 500);

        // 2. 恢復主題與狀態
        if(localStorage.getItem('bee_theme') === 'light') document.body.setAttribute('data-theme', 'light'); // 預設是暗色，若存light則切換
        
        // 3. 啟動路由
        const lastPage = localStorage.getItem('bee_last_page') || 'dashboard';
        Router.go(lastPage);
        
        // 4. 啟動時鐘與天氣模擬
        this.startClock();
        
        // 5. 全域自動儲存監聽
        this.initAutoSave();
    },

    // 安全鎖定
    checkLock: function() {
        if(localStorage.getItem('bee_pin_enabled') === 'true' && !sessionStorage.getItem('bee_unlocked')) {
            document.getElementById('securityLock').classList.remove('hidden');
        }
    },

    unlock: function() {
        const pin = localStorage.getItem('bee_pin_code') || '0000';
        const input = document.getElementById('pinInput').value;
        if(input === pin) {
            document.getElementById('securityLock').classList.add('hidden');
            sessionStorage.setItem('bee_unlocked', 'true');
        } else {
            alert('密碼錯誤 (預設 0000)');
        }
    },

    toggleSidebar: function() {
        document.querySelector('.sidebar').classList.toggle('open');
    },

    toggleTheme: function() {
        const current = document.body.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light'; // 預設 CSS 是 dark base
        document.body.setAttribute('data-theme', next); // CSS 需要配合調整，目前 V18 CSS 是 dark default
        // 簡單切換邏輯：V18 CSS 設計是以 Dark 為主，若要切換 Light 需額外 CSS 支援，此處僅做邏輯切換
        alert("V18 帝王版預設為深色模式，如需切換需加載亮色主題包。"); 
    },

    toggleFullScreen: function() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else if (document.exitFullscreen) document.exitFullscreen();
    },

    startClock: function() {
        // 模擬天氣 API
        const weathers = ['晴朗', '多雲', '陰天', '微雨'];
        const temps = ['24°C', '25°C', '23°C', '26°C'];
        const idx = Math.floor(Math.random() * weathers.length);
        document.getElementById('headerTemp').innerText = `${weathers[idx]} ${temps[idx]}`;
    },

    initAutoSave: function() {
        // 監聽所有動態生成的 input
        document.getElementById('app-content').addEventListener('change', (e) => {
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                if(e.target.id) {
                    localStorage.setItem('bee_data_' + e.target.id, e.target.value);
                    // 簡單視覺回饋
                    e.target.style.borderColor = 'var(--success)';
                    setTimeout(() => e.target.style.borderColor = '', 500);
                }
            }
        });
    }
};

// ================= 2. 路由引擎 (Router Engine) =================
const Router = {
    go: function(pageId) {
        // 1. 更新選單狀態
        document.querySelectorAll('.nav-btn, .nav-item').forEach(el => el.classList.remove('active'));
        
        // 嘗試選取對應按鈕 (Desktop & Mobile)
        const deskBtn = document.querySelector(`.nav-btn[onclick="Router.go('${pageId}')"]`);
        const mobBtn = document.querySelector(`.nav-item[onclick="Router.go('${pageId}')"]`);
        if(deskBtn) deskBtn.classList.add('active');
        if(mobBtn) mobBtn.classList.add('active');

        // 2. 渲染內容
        const content = document.getElementById('app-content');
        const title = document.getElementById('pageTitle');
        
        // 轉場動畫
        content.style.opacity = 0;
        setTimeout(() => {
            if(Modules[pageId]) {
                content.innerHTML = Modules[pageId].render();
                title.innerText = Modules[pageId].title;
                Modules[pageId].init(); // 執行該模組的 JS
                System.restoreData();   // 恢復數據
            } else {
                content.innerHTML = `<div class="glass-panel" style="text-align:center; padding:50px;"><h2>🚧 模組建置中</h2><p>代碼 ${pageId} 尚未連結</p></div>`;
            }
            content.style.opacity = 1;
        }, 200);

        // 3. 收起手機選單
        if(System.isMobile) document.querySelector('.sidebar').classList.remove('open');
        
        // 4. 記憶
        localStorage.setItem('bee_last_page', pageId);
    }
};

// ================= 3. 三十模組全集 (The 30 Modules) =================
const Modules = {
    
    // --- A. 戰情指揮 ---
    dashboard: {
        title: '戰情儀表板',
        render: () => `
            <div class="grid-4">
                <div class="glass-panel" style="border-left: 4px solid var(--primary)">
                    <div class="panel-title"><span class="material-icons-round">calendar_today</span>今日概況</div>
                    <div class="stat-value" style="font-size:1.5rem">11月19日</div>
                    <p style="color:var(--text-dim)">農曆十月十九 • 宜開箱</p>
                </div>
                <div class="glass-panel">
                    <div class="panel-title"><span class="material-icons-round">opacity</span>本月產量</div>
                    <div class="stat-value">1,280 <span style="font-size:0.5em">kg</span></div>
                    <div class="stat-trend trend-up" style="color:var(--success)">▲ 12% 成長</div>
                </div>
                <div class="glass-panel">
                    <div class="panel-title"><span class="material-icons-round">payments</span>本月營收</div>
                    <div class="stat-value">$85,200</div>
                    <div class="stat-trend trend-up" style="color:var(--success)">▲ 淨利 65%</div>
                </div>
                <div class="glass-panel">
                    <div class="panel-title"><span class="material-icons-round">warning</span>異常警報</div>
                    <div class="stat-value" style="color:var(--danger)">3 <span style="font-size:0.5em">箱</span></div>
                    <p style="color:var(--danger); font-size:0.8em">A-05 失王, B-12 蟎害</p>
                </div>
            </div>
            
            <div class="grid-2">
                <div class="glass-panel">
                    <div class="panel-title">📊 產量趨勢分析</div>
                    <div style="height:250px"><canvas id="dashChart"></canvas></div>
                </div>
                <div class="glass-panel">
                    <div class="panel-title">🔔 待辦事項快覽</div>
                    <ul class="task-list-preview" style="list-style:none; padding:0">
                        <li style="padding:10px; border-bottom:1px solid #333">✅ A-01 檢查王台</li>
                        <li style="padding:10px; border-bottom:1px solid #333">⬜ B-05 補充糖水</li>
                        <li style="padding:10px; border-bottom:1px solid #333">⬜ 全場 噴灑草酸</li>
                    </ul>
                    <button class="btn-main" onclick="Router.go('tasks')" style="margin-top:10px">查看全部</button>
                </div>
            </div>
        `,
        init: () => {
            // 初始化圖表
            const ctx = document.getElementById('dashChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['W1', 'W2', 'W3', 'W4'],
                    datasets: [{
                        label: '蜂蜜 (kg)',
                        data: [150, 300, 200, 450],
                        borderColor: '#FFD700',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        fill: true
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    },

    map: {
        title: '視覺化戰術地圖',
        render: () => `
            <div class="glass-panel">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        <span style="color:var(--success)">● 強群</span>
                        <span style="color:var(--warning)">● 普通</span>
                        <span style="color:var(--danger)">● 弱/病</span>
                    </div>
                    <button class="btn-main" style="width:auto" onclick="alert('模擬新增蜂箱')">+ 新增蜂箱</button>
                </div>
                <div class="hive-grid" id="hiveGridContainer" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap:10px;">
                    </div>
            </div>
        `,
        init: () => {
            const container = document.getElementById('hiveGridContainer');
            let html = '';
            for(let i=1; i<=50; i++) {
                let status = 'strong'; // 模擬狀態
                let color = 'var(--success)';
                if(i % 5 === 0) { status = 'weak'; color = 'var(--danger)'; }
                else if(i % 3 === 0) { status = 'mid'; color = 'var(--warning)'; }
                
                html += `<div style="aspect-ratio:1; background:rgba(255,255,255,0.05); border:1px solid ${color}; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;" onclick="alert('開啟 A-${i} 詳細日誌')">
                    <span style="font-weight:bold; color:#fff">A-${i}</span>
                    <div style="width:8px; height:8px; background:${color}; border-radius:50%; margin-top:5px;"></div>
                </div>`;
            }
            container.innerHTML = html;
        }
    },

    tasks: {
        title: 'SOP 工作排程',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">📅 今日工作清單</div>
                <div class="input-group">
                    <label class="input-label">日期</label>
                    <input type="date" id="taskDate" class="input-field">
                </div>
                <div class="input-group">
                    <label class="input-label">例行事項</label>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <label class="glass-btn"><input type="checkbox" id="chk1"> 餵糖水</label>
                        <label class="glass-btn"><input type="checkbox" id="chk2"> 檢查產卵</label>
                        <label class="glass-btn"><input type="checkbox" id="chk3"> 檢查王台</label>
                        <label class="glass-btn"><input type="checkbox" id="chk4"> 防治蜂蟹蟎</label>
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label">臨時交辦 (語音)</label>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="taskNote" class="input-field" placeholder="輸入事項...">
                        <button class="icon-btn" onclick="alert('啟動麥克風...')"><span class="material-icons-round">mic</span></button>
                    </div>
                </div>
                <button class="btn-main" onclick="alert('清單已生成並複製！')">生成並複製</button>
            </div>
        `,
        init: () => { document.getElementById('taskDate').valueAsDate = new Date(); }
    },

    // --- B. 生產技術 ---
    breeding: {
        title: '精密育王實驗室',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🧬 育王時間軸計算器</div>
                <div class="input-group">
                    <label class="input-label">移蟲時間 (0h)</label>
                    <input type="datetime-local" id="breedDate" class="input-field">
                </div>
                <button class="btn-main" onclick="Modules.breeding.calc()">計算時程</button>
                
                <div id="breedResult" style="margin-top:20px; display:none;">
                    <div class="result-area">
                        <p>🐛 移蟲：<b id="bd1">---</b></p>
                        <p>👀 檢查接受 (24h)：<b id="bd2">---</b></p>
                        <p>🔒 封蓋 (5天)：<b id="bd3">---</b></p>
                        <p>🚚 移王台 (11天)：<b id="bd4" style="color:var(--danger)">---</b></p>
                        <p>👑 出台 (13天)：<b id="bd5">---</b></p>
                    </div>
                </div>
            </div>
        `,
        init: () => {},
        calc: () => {
            const d = new Date(document.getElementById('breedDate').value);
            if(isNaN(d.getTime())) return alert('請輸入時間');
            
            const addH = (h) => new Date(d.getTime() + h*3600000).toLocaleString('zh-TW', {month:'numeric', day:'numeric', hour:'numeric', minute:'numeric'});
            
            document.getElementById('bd1').innerText = addH(0);
            document.getElementById('bd2').innerText = addH(24);
            document.getElementById('bd3').innerText = addH(120);
            document.getElementById('bd4').innerText = addH(264);
            document.getElementById('bd5').innerText = addH(312);
            document.getElementById('breedResult').style.display = 'block';
        }
    },

    health: {
        title: '病理診斷與防禦',
        render: () => `
            <div class="grid-2">
                <div class="glass-panel">
                    <div class="panel-title">🧪 草酸配藥計算</div>
                    <div class="input-group">
                        <label class="input-label">環境溫度</label>
                        <input type="range" min="10" max="40" value="25" class="input-field" oninput="this.nextElementSibling.innerText=this.value+'°C'">
                        <span style="float:right; font-weight:bold; color:var(--primary)">25°C</span>
                    </div>
                    <div class="input-group">
                        <label class="input-label">蜂群數量</label>
                        <input type="number" class="input-field" value="50">
                    </div>
                    <div class="result-area">建議配方：草酸 35g + 糖水 1000ml</div>
                </div>
                <div class="glass-panel">
                    <div class="panel-title">🚑 疾病快篩嚮導</div>
                    <button class="btn-main" style="background:var(--secondary); border:1px solid #555">開始診斷問答</button>
                    <ul style="margin-top:15px; color:var(--text-dim); font-size:0.9em">
                        <li>• 幼蟲是否拉絲？</li>
                        <li>• 氣味是否酸臭？</li>
                        <li>• 封蓋是否下陷？</li>
                    </ul>
                </div>
            </div>
        `,
        init: () => {}
    },

    production: {
        title: '生產加工履歷',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🍯 採收批號生成</div>
                <div class="grid-2">
                    <div class="input-group">
                        <label class="input-label">蜜源</label>
                        <select class="input-field"><option>龍眼蜜</option><option>荔枝蜜</option><option>百花蜜</option></select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">產地</label>
                        <select class="input-field"><option>南投中寮</option><option>高雄大樹</option><option>新竹新豐</option></select>
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label">採收量 (台斤)</label>
                    <input type="number" class="input-field">
                </div>
                <button class="btn-main" onclick="document.getElementById('batchCode').innerText='2025-LY-NT-008'">生成追溯碼</button>
                <div class="result-area" style="text-align:center">
                    <h2 id="batchCode" style="letter-spacing:2px; color:var(--primary)">---</h2>
                    <small>可列印標籤</small>
                </div>
            </div>
        `,
        init: () => {}
    },

    inventory: {
        title: '資材進銷存',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">📦 庫存盤點</div>
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #333">
                    <span>白糖 (kg)</span>
                    <div>
                        <button class="icon-btn">-</button>
                        <span style="font-weight:bold; margin:0 10px; font-size:1.2em">150</span>
                        <button class="icon-btn">+</button>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #333">
                    <span>草酸 (g)</span>
                    <div>
                        <button class="icon-btn">-</button>
                        <span style="font-weight:bold; margin:0 10px; font-size:1.2em">500</span>
                        <button class="icon-btn">+</button>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0;">
                    <span>玻璃瓶 (支)</span>
                    <div>
                        <button class="icon-btn">-</button>
                        <span style="font-weight:bold; margin:0 10px; font-size:1.2em; color:var(--danger)">12</span>
                        <button class="icon-btn">+</button>
                    </div>
                </div>
                <p style="color:var(--danger); font-size:0.8em; margin-top:10px">* 玻璃瓶庫存過低</p>
            </div>
        `,
        init: () => {}
    },

    // --- C. 商業營運 (範例) ---
    crm: { title: '客戶 CRM 戰情', render: () => Utils.placeholder('客戶名單、購買紀錄、偏好分析'), init:()=>{} },
    finance: { title: '財務與銷售分析', render: () => Utils.placeholder('損益表、成本分析、定價計算機'), init:()=>{} },
    logistics: { title: '轉場物流指揮', render: () => Utils.placeholder('車輛裝載計算、路線規劃、油耗紀錄'), init:()=>{} },

    // --- D. 環境與法規 (範例) ---
    science: { title: '環境微氣候科學', render: () => Utils.placeholder('即時天氣 API、積溫預測、花期表'), init:()=>{} },
    land: { title: '林地與租賃管理', render: () => Utils.placeholder('地主合約、租金提醒、座標定位'), init:()=>{} },
    compliance: { title: '台灣法規與合規', render: () => Utils.placeholder('養蜂登錄證、農藥殘留標準、標示法規'), init:()=>{} },

    // --- E. 永續與風險 (範例) ---
    risk: { title: '風險防禦', render: () => Utils.placeholder('農藥噴灑地圖、監視器巡檢、災損通報'), init:()=>{} },
    esg: { title: 'ESG 碳權與生態', render: () => Utils.placeholder('授粉產值計算、碳足跡、生物多樣性'), init:()=>{} },
    safety: { title: '職業安全 HSE', render: () => Utils.placeholder('蜂毒過敏紀錄、搬運重量限制、中暑警報'), init:()=>{} },

    // --- F. 系統設定 ---
    settings: {
        title: '系統核心設定',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🛠️ 資料備份與還原</div>
                <p style="color:#aaa; font-size:0.9em; margin-bottom:15px;">將所有養蜂數據導出為 JSON 檔案，換手機時可還原。</p>
                <div class="grid-2">
                    <button class="btn-main" style="background:var(--info)" onclick="Utils.exportData()">⬇️ 匯出備份</button>
                    <button class="btn-main" style="background:var(--secondary); border:1px solid #555" onclick="document.getElementById('fileInput').click()">⬆️ 匯入還原</button>
                    <input type="file" id="fileInput" style="display:none" onchange="Utils.importData(this)">
                </div>
            </div>
            <div class="glass-panel">
                <div class="panel-title">🔒 安全性</div>
                <button class="btn-main" style="background:var(--secondary); border:1px solid #555" onclick="alert('設定 PIN 碼功能')">設定開機密碼</button>
            </div>
            <div class="glass-panel">
                <div class="panel-title">🗑️ 危險操作</div>
                <button class="btn-main" style="background:var(--danger)" onclick="if(confirm('確定清空？')) localStorage.clear(); location.reload();">清空所有資料 (重置)</button>
            </div>
        `,
        init: () => {}
    }
};

// ================= 4. 快速動作 (Quick Actions) =================
const QuickAction = {
    toggle: () => document.getElementById('quickSheet').classList.toggle('visible')
};

const Log = {
    quick: (type) => {
        alert('已快速紀錄：' + type);
        QuickAction.toggle();
    }
};

// ================= 5. 工具庫 (Utilities) =================
const Utils = {
    // 生成通用 placeholder 頁面
    placeholder: (desc) => `
        <div class="glass-panel" style="text-align:center; padding:60px 20px;">
            <span class="material-icons-round" style="font-size:4rem; color:var(--primary); opacity:0.5; margin-bottom:20px;">construction</span>
            <h3 style="color:#fff;">模組建置中</h3>
            <p style="color:#888;">${desc}</p>
            <button class="btn-main" style="width:auto; margin-top:20px; background:var(--secondary); border:1px solid #555">功能開發中</button>
        </div>
    `,
    
    // 恢復數據到欄位
    restoreData: () => {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            if(el.id) {
                const val = localStorage.getItem('bee_data_' + el.id);
                if(val) el.value = val;
            }
        });
    },

    // 匯出資料
    exportData: () => {
        const data = JSON.stringify(localStorage);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `bee_expert_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    },

    // 匯入資料
    importData: (input) => {
        const file = input.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                localStorage.clear();
                Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
                alert('還原成功！系統將重新啟動');
                location.reload();
            } catch(err) { alert('檔案格式錯誤'); }
        };
        reader.readAsText(file);
    }
};

// 恢復 System 的 restoreData 引用
System.restoreData = Utils.restoreData;

// 啟動系統
document.addEventListener('DOMContentLoaded', () => System.init());
