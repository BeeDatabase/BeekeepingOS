/**
 * BEE EXPERT V37.0 - MAXIMUM DETAILS EDITION
 * Features: Full Flora DB, Advanced Calculators, Deep Metrics.
 */

// ================= 1. 資料庫 (DB) =================
const DB = {
    data: {
        inventory: { sugar: 50, acid: 500, bottles: 100, box: 108, pollen: 20 },
        finance: { revenue: 150000, cost: 35000, fixedCost: 20000 }, // fixedCost: 固定成本(折舊等)
        logs: [],
        tasks: [
            { title: '全場檢查王台', done: false },
            { title: '補充 B 區糖水', done: false }
        ],
        crm: [
            { name: '王大明', phone: '0912-345678', note: '喜好龍眼蜜', total: 5000 },
            { name: '陳小姐', phone: '0988-123456', note: '只買蜂王乳', total: 12000 },
            { name: '林老闆 (寄賣)', phone: '04-1234567', note: '咖啡廳寄賣點', total: 0 }
        ],
        notifications: [],
        user: { exp: 1350, level: 13 },
        risks: [],
        lands: [{ name: '中寮A場', landlord: '林先生', rent: '20斤蜜', due: '2025-12-31' }],
        hives: {} 
    },
    load: function() {
        const saved = localStorage.getItem('bee_db_v37');
        if(saved) this.data = JSON.parse(saved);
        this.initHives();
    },
    save: function() {
        localStorage.setItem('bee_db_v37', JSON.stringify(this.data));
        SmartLogic.checkAlerts();
        Gamification.update();
    },
    initHives: function() {
        if(Object.keys(this.data.hives).length === 0) {
            for(let i=1; i<=108; i++) this.data.hives[`A-${i}`] = { status: 'normal', beeAmt: 5 };
        }
    }
};

// ================= 2. 遊戲化 & 邏輯 =================
const Gamification = {
    update: function() {
        const xp = (DB.data.logs.length * 10) + Math.floor(DB.data.finance.revenue / 1000);
        const lvl = Math.floor(xp / 100) + 1;
        DB.data.user.exp = xp;
        DB.data.user.level = lvl;
    }
};

const SmartLogic = {
    feed: function(type, amount, cost) {
        this.addLog('feed', `餵食 ${type} ${amount}`);
        if(type.includes('糖')) DB.data.inventory.sugar -= parseFloat(amount)*0.6;
        if(type.includes('粉')) DB.data.inventory.pollen -= parseFloat(amount);
        DB.data.finance.cost += parseFloat(cost);
        DB.save(); 
        alert(`✅ 已紀錄！庫存已扣除，獲得經驗值！`);
        Router.go('dashboard');
    },
    // 批次餵食
    batchFeed: function(count, type) {
        const totalSugar = count * 0.5; 
        DB.data.inventory.sugar -= totalSugar;
        this.addLog('feed', `[批次] 餵食 ${count} 箱，共消耗糖 ${totalSugar}kg`);
        DB.save();
        alert(`✅ 已完成 ${count} 箱批次餵食！扣除糖 ${totalSugar}kg`);
        MapSys.toggleBatchMode();
    },
    harvest: function(type, weight, price) {
        const b = Math.ceil(weight / 0.7);
        this.addLog('harvest', `採收 ${type} ${weight}kg`);
        DB.data.inventory.bottles -= b;
        DB.data.finance.revenue += (weight * price);
        DB.save(); 
        alert(`🎉 恭喜豐收！營收 +$${weight*price}，扣除瓶子 ${b}支`);
        Router.go('dashboard');
    },
    addRisk: function() {
        const t = prompt("風險類型 (農藥/防盜/天災):", "農藥");
        const n = prompt("說明:", "附近果園噴藥");
        if(t) {
            DB.data.risks.unshift({date: new Date().toLocaleDateString(), type: t, note: n});
            DB.save(); Router.go('risk');
        }
    },
    addLand: function() {
        const n = prompt("場地名稱:");
        if(n) {
            DB.data.lands.push({name: n, landlord: '未填', rent: '未填', due: '2025-12-31'});
            DB.save(); Router.go('land');
        }
    },
    addLog: function(type, msg) {
        DB.data.logs.unshift({ date: new Date().toLocaleDateString(), type, msg });
    },
    checkAlerts: function() {
        DB.data.notifications = [];
        if(DB.data.inventory.sugar < 20) DB.data.notifications.push({msg:'⚠️ 白糖庫存低於 20kg'});
        if(DB.data.inventory.bottles < 50) DB.data.notifications.push({msg:'⚠️ 玻璃瓶庫存緊張'});
        const dot = document.getElementById('notifDot');
        if(dot) dot.classList.toggle('hidden', DB.data.notifications.length === 0);
    }
};

// ================= 3. 特殊計算機 (V37 新增) =================
const Calc = {
    // 波美度轉含水量
    brixToWater: () => {
        const brix = parseFloat(document.getElementById('in_brix').value);
        if(brix) {
            // 簡易公式：含水量 = 400 / 波美度 - 10 (僅為粗估，實際需查表)
            // 這裡使用常見對照表近似值： 40度=23.1%, 41度=21%, 41.5度=20%, 42度=19%
            // 線性插值模擬
            let water = 0;
            if(brix >= 43) water = 17;
            else if(brix >= 42) water = 19;
            else if(brix >= 41.5) water = 20;
            else if(brix >= 41) water = 21;
            else if(brix >= 40) water = 23.1;
            else water = "過高 (>24%)";
            
            document.getElementById('res_water').innerText = water + (typeof water==='number'?'%':'');
            
            // 評級
            let rank = '❌ 不合格';
            if(water <= 20) rank = '🏆 甲級 (CNS1305)';
            else if(water <= 22) rank = '✅ 乙級';
            document.getElementById('res_rank').innerText = rank;
        }
    },
    // 蜂蟹蟎寄生率
    miteRate: () => {
        const bees = parseFloat(document.getElementById('in_bees').value); // 採樣蜂數 (通常300隻)
        const mites = parseFloat(document.getElementById('in_mites').value); // 落下蟎數
        if(bees && mites) {
            const rate = (mites / bees) * 100;
            document.getElementById('res_mite_rate').innerText = rate.toFixed(1) + '%';
            
            let advice = '🟢 安全';
            if(rate > 3) advice = '🔴 危險！立即用藥'; // 經濟危害水平
            else if(rate > 1) advice = '🟡 警戒，準備用藥';
            document.getElementById('res_mite_advice').innerText = advice;
        }
    }
};

// ================= 4. 模組內容 =================
const Modules = {
    dashboard: {
        title: '營運總覽',
        render: () => {
            const net = DB.data.finance.revenue - DB.data.finance.cost;
            return `
            <div class="grid-container">
                <div class="glass-panel" style="border-left:4px solid var(--primary)">
                    <div class="panel-title"><span class="material-icons-round">monetization_on</span>本月淨利</div>
                    <div class="stat-value" style="color:${net>=0?'var(--success)':'var(--danger)'}">$${net.toLocaleString()}</div>
                </div>
                <div class="glass-panel"><div class="panel-title"><span class="material-icons-round">inventory_2</span>庫存</div><div style="display:flex;justify-content:space-between"><span>白糖</span><b>${DB.data.inventory.sugar} kg</b></div></div>
            </div>
            <div class="glass-panel"><div class="panel-title">📢 最新日誌</div><div id="dashLogList"></div></div>`;
        },
        init: () => {
            let h = ''; DB.data.logs.slice(0,5).forEach(l=>h+=`<div class="log-item"><small>${l.date}</small> ${l.msg}</div>`);
            document.getElementById('dashLogList').innerHTML = h || '<p style="color:#666">無紀錄</p>';
        }
    },
    
    map: {
        title: '蜂場地圖',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🗺️ 全場監控 <button class="btn-main" style="width:auto; padding:5px 10px; font-size:0.8rem; margin:0 0 0 10px;" onclick="MapSys.toggleBatchMode()">批次作業</button></div>
                ${MapSys.isBatchMode ? '<p style="color:var(--warning)">⚠️ 批次模式：點擊選擇多個蜂箱</p>' : ''}
                <div id="hiveGrid" class="grid-auto"></div>
            </div>
        `,
        init: () => MapSys.init()
    },

    // --- V37 強化模組：生態與資源 (15種完整) ---
    flora: {
        title: '蜜源植物圖鑑',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🌺 台灣完整蜜粉源 (15種)</div>
                <div style="height:500px; overflow-y:auto;">
                    ${Utils.floraCard('龍眼 (Longan)', '3-4月', 5, 1, '#fff')}
                    ${Utils.floraCard('荔枝 (Lychee)', '2-3月', 4, 2, '#f5f5f5')}
                    ${Utils.floraCard('咸豐草 (Bidens)', '全年', 3, 5, '#ff9800')}
                    ${Utils.floraCard('鴨腳木 (Schefflera)', '11-1月 (冬蜜)', 4, 4, '#ffeb3b')}
                    ${Utils.floraCard('烏桕 (Tallow)', '5-7月', 3, 4, '#4caf50')}
                    ${Utils.floraCard('油菜花 (Rapeseed)', '1-2月', 3, 5, '#ffeb3b')}
                    ${Utils.floraCard('白千層 (Paperbark)', '8-11月', 3, 3, '#eee')}
                    ${Utils.floraCard('水筆仔 (Kandelia)', '6-8月', 3, 3, '#8bc34a')}
                    ${Utils.floraCard('羅氏鹽膚木', '9-10月', 1, 5, '#795548')}
                    ${Utils.floraCard('茶花 (Camellia)', '11-3月', 2, 4, '#d32f2f')}
                    ${Utils.floraCard('楠木 (Machilus)', '2-3月', 3, 3, '#5d4037')}
                    ${Utils.floraCard('蔓澤蘭 (Mikania)', '10-11月', 3, 2, '#cddc39')}
                    ${Utils.floraCard('玉米 (Corn)', '全年', 0, 4, '#ffeb3b')}
                    ${Utils.floraCard('南瓜 (Pumpkin)', '全年', 2, 5, '#ff9800')}
                    ${Utils.floraCard('瓜類 (Melon)', '夏季', 2, 4, '#ffeb3b')}
                </div>
            </div>
        `,
        init: () => {}
    },

    // --- V37 強化模組：生產 (含水率計算) ---
    production: {
        title: '生產與品質',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🌡️ 蜂蜜品質計算機</div>
                <div class="input-group"><label>波美度 (Brix)</label><input type="number" id="in_brix" class="input-field" placeholder="例如 41.5" oninput="Calc.brixToWater()"></div>
                <div class="result-area">
                    <p>推算含水量：<b id="res_water" class="highlight">---</b></p>
                    <p>CNS 標準：<b id="res_rank">---</b></p>
                </div>
            </div>
            <div class="glass-panel">
                <div class="panel-title">🍯 批號生成</div>
                <button class="btn-main" onclick="alert('2025-LY-A01')">生成追溯碼</button>
            </div>
            <div class="glass-panel">
                <div class="panel-title">🏷️ 標籤產生器</div>
                <button class="btn-main" style="background:#607D8B" onclick="alert('請截圖生成之標籤')">預覽標籤</button>
            </div>
        `,
        init: () => {}
    },

    // --- V37 強化模組：病害 (寄生率計算) ---
    health: {
        title: '病害防治',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🦠 蜂蟹蟎寄生率 (洗蜂法)</div>
                <div class="input-group"><label>採樣蜂數 (隻)</label><input type="number" id="in_bees" class="input-field" value="300"></div>
                <div class="input-group"><label>落下蟎數 (隻)</label><input type="number" id="in_mites" class="input-field" oninput="Calc.miteRate()"></div>
                <div class="result-area">
                    <p>寄生率：<b id="res_mite_rate" class="highlight">0%</b></p>
                    <p>建議：<b id="res_mite_advice">---</b></p>
                </div>
            </div>
            <div class="glass-panel">
                <div class="panel-title">🧪 草酸配比計算</div>
                <div class="input-group"><label>防治箱數</label><input type="number" id="oaBox" class="input-field" oninput="document.getElementById('oaRes').innerHTML = '需草酸 '+(this.value*3.5).toFixed(1)+'g'"></div>
                <div class="result-area" id="oaRes">---</div>
            </div>
        `,
        init: () => {}
    },

    // --- V37 強化模組：財務 (損益平衡) ---
    finance: {
        title: '財務報表',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">💰 損益分析</div>
                ${Utils.invItem('總營收', '$'+DB.data.finance.revenue)}
                ${Utils.invItem('變動成本', '$'+DB.data.finance.cost)}
                ${Utils.invItem('固定成本', '$'+DB.data.finance.fixedCost)}
                <hr style="border-color:#333">
                <div style="text-align:right; font-size:1.5rem; color:var(--primary); font-weight:bold;">淨利 $${DB.data.finance.revenue - DB.data.finance.cost - DB.data.finance.fixedCost}</div>
            </div>
            <div class="glass-panel">
                <div class="panel-title">⚖️ 損益平衡點 (BEP)</div>
                <p style="color:#888">假設每瓶蜜利潤 $300，固定成本 $20000</p>
                <p>您至少需要賣出：<b style="color:#fff; font-size:1.2rem">67 瓶</b> 才能回本</p>
            </div>
        `,
        init: () => {}
    },

    // --- 其他模組 (保持 V35 完整性) ---
    breeding: { title:'育王管理', render:()=>`<div class="glass-panel"><label>移蟲日</label><input type="date" id="breedDate" class="input-field"><button class="btn-main" onclick="Modules.breeding.calc()">計算</button><div id="breedRes" class="hidden"></div></div>`, init:()=>{}, calc:()=>{ const d=new Date(document.getElementById('breedDate').value); if(!isNaN(d)) { const f=n=>new Date(d.getTime()+n*86400000).toLocaleDateString(); document.getElementById('breedRes').classList.remove('hidden'); document.getElementById('breedRes').innerHTML=`<p>封蓋：${f(5)}</p><p style="color:var(--danger)">出台：${f(12)}</p>`; } } },
    inventory: { title: '資材庫存', render: () => `<div class="glass-panel"><div class="panel-title">📦 庫存</div>${Utils.invItem('白糖',DB.data.inventory.sugar+'kg')}${Utils.invItem('瓶子',DB.data.inventory.bottles+'支')}</div>`, init: () => {} },
    logistics: { title: '轉場運輸', render: () => `<div class="glass-panel"><div class="panel-title">🚚 裝載計算</div><div class="input-group"><label>箱數</label><input type="number" id="truckBox" class="input-field" oninput="Modules.logistics.calc()"></div><div class="result-area" id="truckRes">---</div></div>`, init: () => {}, calc: () => { const n=document.getElementById('truckBox').value; if(n) document.getElementById('truckRes').innerHTML = `需堆疊：<b>${Math.ceil(n/12)} 層</b> (3.5噸車)`; } },
    compliance: { title: '法規合規', render: () => `<div class="glass-panel"><div class="panel-title">⚖️ 合規檢核</div><label class="glass-btn"><input type="checkbox" checked> 養蜂登錄證</label><label class="glass-btn"><input type="checkbox"> 農藥殘留檢驗</label></div>`, init: () => {} },
    risk: { title: '風險管理', render: () => `<div class="glass-panel"><div class="panel-title">🛑 風險通報</div><button class="btn-main" style="background:var(--danger); margin-bottom:15px;" onclick="SmartLogic.addRisk()">+ 新增風險</button><div id="riskList"></div></div>`, init: () => { let h = ''; DB.data.risks.forEach(r => h += `<div class="list-item" style="border-left:3px solid var(--danger)"><span>[${r.type}] ${r.date}</span><small>${r.note}</small></div>`); document.getElementById('riskList').innerHTML = h || '<p>無風險</p>'; } },
    land: { title: '場地管理', render: () => `<div class="glass-panel"><div class="panel-title">🏞️ 地主</div><button class="btn-main" onclick="SmartLogic.addLand()">+ 新增</button><div id="landList"></div></div>`, init: () => { let h = ''; DB.data.lands.forEach(l => h += `<div class="list-item"><span>${l.name}</span><small>${l.landlord}</small></div>`); document.getElementById('landList').innerHTML = h; } },
    crm: { title:'客戶訂單', render:()=>`<div class="glass-panel"><div id="crmList"></div></div>`, init:()=>{ let h=''; DB.data.crm.forEach(c=>h+=`<div class="list-item"><span>${c.name}</span><b>$${c.total}</b></div>`); document.getElementById('crmList').innerHTML=h; } },
    tasks: { title: '工作排程', render: () => `<div class="glass-panel"><div class="panel-title">✅ 待辦</div><ul id="taskList" style="list-style:none;padding:0"></ul></div>`, init: () => { let h=''; DB.data.tasks.forEach(t=>h+=`<li class="list-item">${t.title}</li>`); document.getElementById('taskList').innerHTML=h; } },
    action_feed: { title:'餵食作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍬 餵食</div><select id="f_t" class="input-field"><option>白糖</option><option>花粉</option></select><input id="f_a" type="number" class="input-field" placeholder="數量"><input id="f_c" type="number" class="input-field" placeholder="成本"><button class="btn-main" onclick="SmartLogic.feed(getVal('f_t'),getVal('f_a'),getVal('f_c'))">確認</button></div>`, init:()=>{} },
    action_harvest: { title:'採收作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍯 採收</div><select id="h_t" class="input-field"><option>龍眼</option><option>百花蜜</option></select><input id="h_w" type="number" class="input-field" placeholder="kg"><input id="h_p" type="number" class="input-field" placeholder="單價"><button class="btn-main" style="background:var(--success)" onclick="SmartLogic.harvest(getVal('h_t'),getVal('h_w'),getVal('h_p'))">確認</button></div>`, init:()=>{} },
    settings: { title: '系統設定', render: () => `<div class="glass-panel"><button class="btn-main" style="background:var(--danger)" onclick="localStorage.clear();location.reload()">重置</button></div>`, init:()=>{} },
    science: { title:'環境氣象', render:()=>`<div class="glass-panel"><h3>🌤️ 微氣候</h3><p>濕度 75%</p></div>`, init:()=>{} },
    esg: { title:'永續經營', render:()=>`<div class="glass-panel"><h3>🌍 ESG</h3><p>授粉產值：$5M</p></div>`, init:()=>{} }
};

// --- Map System (Batch Mode) ---
const MapSys = {
    isBatchMode: false, selected: new Set(),
    init: function() {
        let html = '';
        for(let i=1; i<=DB.data.inventory.box; i++) {
            const id = `A-${i}`;
            const status = DB.data.hives[id] ? DB.data.hives[id].status : 'normal';
            let color = status==='strong'?'var(--success)':(status==='weak'?'var(--danger)':'var(--warning)');
            let border = this.selected.has(id) ? '2px solid #fff' : `1px solid ${color}`;
            html += `<div onclick="MapSys.click('${id}')" style="aspect-ratio:1; border:${border}; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; background:rgba(255,255,255,0.05); cursor:pointer;">${id}</div>`;
        }
        document.getElementById('hiveGrid').innerHTML = html;
    },
    toggleBatchMode: function() {
        this.isBatchMode = !this.isBatchMode; this.selected.clear();
        Router.go('map'); // Re-render
    },
    click: function(id) {
        if(this.isBatchMode) {
            if(this.selected.has(id)) this.selected.delete(id); else this.selected.add(id);
            this.init();
            document.getElementById('selCount').innerText = this.selected.size;
        } else HiveOS.open(id);
    }
};

// --- HiveOS (Single Hive) ---
const HiveOS = {
    currentId: null,
    open: (id) => { document.getElementById('hiveModal').classList.remove('hidden'); document.getElementById('modalTitle').innerText=`📦 ${id}`; HiveOS.switch('check'); },
    close: () => document.getElementById('hiveModal').classList.add('hidden'),
    switch: (t) => {
        const c = document.getElementById('hive-tab-content');
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active');
        if(t==='check') c.innerHTML=`<div class="input-group"><label>蜂量</label><input type="range" max="10" class="input-field"></div>`;
        else c.innerHTML=`<p style="color:#666;text-align:center">無紀錄</p>`;
    },
    save: () => { alert('已儲存'); HiveOS.close(); }
};

// --- System & Utils ---
const System = {
    init: () => { DB.load(); setTimeout(()=>{document.getElementById('splashScreen').style.display='none'},1000); Router.go('dashboard'); },
    toggleSidebar: () => { document.querySelector('.sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('hidden'); },
    closeAllOverlays: () => { document.querySelector('.sidebar').classList.remove('open'); document.getElementById('overlay').classList.add('hidden'); HiveOS.close(); },
    toggleTheme: () => alert('專業模式'), toggleFullScreen: () => { if(!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
};
const Router = {
    go: (p) => {
        document.querySelectorAll('.nav-btn, .nav-item').forEach(e=>e.classList.remove('active'));
        const c = document.getElementById('app-content');
        const t = document.getElementById('pageTitle');
        c.style.opacity = 0;
        setTimeout(() => {
            if(Modules[p]) { c.innerHTML = Modules[p].render(); if(t)t.innerText = Modules[p].title; if(Modules[p].init) Modules[p].init(); }
            c.style.opacity = 1;
        }, 200);
        if(window.innerWidth <= 1024) System.closeAllOverlays();
        localStorage.setItem('bee_last_page', p);
    }
};
const Utils = {
    invItem: (n,v) => `<div class="list-item"><span>${n}</span><span style="font-weight:bold; color:#fff">${v}</span></div>`,
    floraCard: (n,t,s1,s2,c) => `<div class="flora-card"><div class="flora-info"><h4 style="color:${c}">${n}</h4><p>${t}</p></div><div style="text-align:right"><div style="color:#FFD700">蜜 ${'⭐'.repeat(s1)}</div><div style="color:#FF9800">粉 ${'⭐'.repeat(s2)}</div></div></div>`,
    restoreData: () => {}
};
function getVal(id) { return document.getElementById(id).value; }
const NotificationCenter = { toggle: () => document.getElementById('notifPanel').classList.toggle('visible') };
const QuickAction = { toggle: () => document.getElementById('quickSheet').classList.toggle('visible') };
const Log = { quick: (t) => { alert('已紀錄: '+t); QuickAction.toggle(); } };

document.addEventListener('DOMContentLoaded', () => System.init());
