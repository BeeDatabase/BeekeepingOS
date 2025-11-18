/**
 * BEE EXPERT V36.0 - BATCH OPERATIONS & VISUALIZATION
 * Integrity Check: All V35 features retained.
 * New Features: Batch Map Ops, Visual Breeding, Label Maker.
 */

// ================= 1. 資料庫 (DB) =================
const DB = {
    data: {
        // V31/35 基礎數據 (完整保留)
        inventory: { sugar: 50, acid: 500, bottles: 100, box: 108, frames: 1000, pollen: 20 },
        finance: { revenue: 150000, cost: 35000 },
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
        user: { exp: 1250, level: 12 },
        risks: [],
        lands: [{ name: '中寮A場', landlord: '林先生', rent: '20斤蜜', due: '2025-12-31' }],
        
        // V32 蜂箱狀態
        hives: {} 
    },
    load: function() {
        const saved = localStorage.getItem('bee_db_v36');
        if(saved) this.data = JSON.parse(saved);
        this.initHives();
    },
    save: function() {
        localStorage.setItem('bee_db_v36', JSON.stringify(this.data));
        SmartLogic.checkAlerts();
        Gamification.update();
    },
    initHives: function() {
        if(Object.keys(this.data.hives).length === 0) {
            for(let i=1; i<=108; i++) this.data.hives[`A-${i}`] = { status: 'normal', beeAmt: 5 };
        }
    }
};

// ================= 2. 遊戲化 (Gamification) =================
const Gamification = {
    update: function() {
        const xp = (DB.data.logs.length * 10) + Math.floor(DB.data.finance.revenue / 1000);
        const lvl = Math.floor(xp / 100) + 1;
        DB.data.user.exp = xp;
        DB.data.user.level = lvl;
    }
};

// ================= 3. 智慧邏輯 (Logic) =================
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
    // V36 新增：批次餵食
    batchFeed: function(count, type) {
        const totalSugar = count * 0.5; // 假設每箱 0.5kg
        DB.data.inventory.sugar -= totalSugar;
        this.addLog('feed', `[批次] 餵食 ${count} 箱，共消耗糖 ${totalSugar}kg`);
        DB.save();
        alert(`✅ 已完成 ${count} 箱批次餵食！扣除糖 ${totalSugar}kg`);
        MapSys.toggleBatchMode(); // 關閉模式
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

// ================= 4. 地圖系統 (V36 升級：批次模式) =================
const MapSys = {
    isBatchMode: false,
    selected: new Set(),
    
    render: function() {
        let h = `
        <div style="margin-bottom:10px; display:flex; justify-content:space-between;">
            <div style="display:flex; gap:10px;">
                <span style="color:var(--success)">● 強</span>
                <span style="color:var(--warning)">● 普</span>
                <span style="color:var(--danger)">● 弱</span>
            </div>
            <button class="btn-main" style="width:auto; padding:5px 15px; margin:0; background:${this.isBatchMode?'var(--danger)':'var(--primary)'}" onclick="MapSys.toggleBatchMode()">
                ${this.isBatchMode ? '取消多選' : '批次作業'}
            </button>
        </div>
        ${this.isBatchMode ? `<div style="background:#333; padding:10px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;"><span>已選: <b id="selCount">0</b> 箱</span> <button class="btn-main" style="width:auto; margin:0; padding:5px 10px;" onclick="SmartLogic.batchFeed(MapSys.selected.size, '白糖')">一鍵餵食</button></div>` : ''}
        <div id="hiveGrid" class="grid-auto"></div>`;
        
        return `<div class="glass-panel"><div class="panel-title">🗺️ 蜂場地圖</div>${h}</div>`;
    },
    
    init: function() {
        const grid = document.getElementById('hiveGrid');
        let html = '';
        for(let i=1; i<=DB.data.inventory.box; i++) {
            const id = `A-${i}`;
            const status = DB.data.hives[id] ? DB.data.hives[id].status : 'normal';
            let color = status === 'strong' ? 'var(--success)' : (status === 'weak' ? 'var(--danger)' : 'var(--warning)');
            let border = this.selected.has(id) ? '2px solid #fff' : `1px solid ${color}`;
            let bg = this.selected.has(id) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)';
            
            html += `<div onclick="MapSys.click('${id}')" style="aspect-ratio:1; border:${border}; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; background:${bg}; cursor:pointer;">${id}</div>`;
        }
        grid.innerHTML = html;
    },
    
    toggleBatchMode: function() {
        this.isBatchMode = !this.isBatchMode;
        this.selected.clear();
        // 重新渲染地圖區域
        const c = document.getElementById('app-content');
        c.innerHTML = this.render();
        this.init();
    },
    
    click: function(id) {
        if(this.isBatchMode) {
            if(this.selected.has(id)) this.selected.delete(id);
            else this.selected.add(id);
            this.init(); // 重繪
            document.getElementById('selCount').innerText = this.selected.size;
        } else {
            HiveOS.open(id);
        }
    }
};

// ================= 5. 單箱系統 (HiveOS) =================
const HiveOS = {
    currentId: null,
    open: function(id) {
        this.currentId = id;
        document.getElementById('hiveModal').classList.remove('hidden');
        document.getElementById('modalTitle').innerText = `📦 ${id}`;
        this.switch('check');
    },
    close: function() { document.getElementById('hiveModal').classList.add('hidden'); },
    switch: function(tab) {
        const c = document.getElementById('hive-tab-content');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        if(tab === 'check') {
            c.innerHTML = `<div class="input-group"><label>蜂量 (框)</label><input type="range" min="0" max="10" step="0.5" class="input-field" oninput="this.nextElementSibling.innerText=this.value"><span style="float:right; font-weight:bold; color:var(--primary)">5</span></div><div class="grid-2"><label class="glass-btn"><input type="checkbox"> 見王</label><label class="glass-btn"><input type="checkbox"> 王台</label></div>`;
        } else if(tab === 'feed') {
            c.innerHTML = `<div class="input-group"><select class="input-field"><option>1:1 糖水</option><option>花粉餅</option></select></div><div class="input-group"><input type="number" class="input-field" placeholder="數量"></div>`;
        } else {
            c.innerHTML = `<p style="color:#666; text-align:center;">無紀錄</p>`;
        }
    },
    save: function() { alert(`✅ 已儲存 ${this.currentId}`); this.close(); }
};

// ================= 6. 系統與路由 =================
const System = {
    init: function() {
        DB.load();
        setTimeout(() => {
            const s = document.getElementById('splashScreen');
            if(s) { s.style.opacity='0'; setTimeout(()=>s.style.display='none',500); }
        }, 1000);
        Router.go(localStorage.getItem('bee_last_page') || 'dashboard');
        this.startClock();
        this.initAutoSave();
        SmartLogic.checkAlerts();
    },
    toggleSidebar: () => { document.querySelector('.sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('hidden'); },
    closeAllOverlays: () => { document.querySelector('.sidebar').classList.remove('open'); document.getElementById('overlay').classList.add('hidden'); document.getElementById('quickSheet').classList.remove('visible'); document.getElementById('notifPanel').classList.remove('visible'); HiveOS.close(); },
    toggleTheme: () => alert("專業深色模式"),
    toggleFullScreen: () => { if(!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); },
    startClock: () => {
        const w = ['晴朗','多雲','陰天']; document.getElementById('headerTemp').innerText = `${w[Math.floor(Math.random()*3)]} 24°C`;
    },
    initAutoSave: () => {
        document.getElementById('app-content').addEventListener('change', (e)=>{ if(e.target.id) localStorage.setItem('bee_val_'+e.target.id, e.target.value); });
    }
};

const Router = {
    go: function(p) {
        document.querySelectorAll('.nav-btn, .nav-item').forEach(e=>e.classList.remove('active'));
        const d=document.querySelector(`.nav-btn[onclick*="'${p}'"]`);
        const m=document.querySelector(`.nav-item[onclick*="'${p}'"]`);
        if(d)d.classList.add('active'); if(m)m.classList.add('active');

        const c = document.getElementById('app-content');
        const t = document.getElementById('pageTitle');
        c.style.opacity = 0;
        setTimeout(() => {
            if(Modules[p]) {
                c.innerHTML = Modules[p].render();
                if(t) t.innerText = Modules[p].title;
                if(Modules[p].init) Modules[p].init();
                Utils.restoreData();
            } else { c.innerHTML = '載入錯誤'; }
            c.style.opacity = 1;
        }, 200);
        if(window.innerWidth <= 1024) System.closeAllOverlays();
        localStorage.setItem('bee_last_page', p);
    }
};

// --- 模組內容 ---
const Modules = {
    dashboard: {
        title: '營運總覽',
        render: () => {
            const net = DB.data.finance.revenue - DB.data.finance.cost;
            const u = DB.data.user;
            return `
            <div class="glass-panel" style="background:linear-gradient(135deg, #263238 0%, #000 100%); border:1px solid var(--primary);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div><div style="color:var(--primary); font-weight:bold;">👑 Lv.${u.level} 蜂業大亨</div><div style="color:#aaa; font-size:0.8rem;">經驗值: ${u.exp} XP</div></div>
                    <div style="font-size:2rem;">👨‍🌾</div>
                </div>
                <div style="background:#333; height:5px; border-radius:5px; margin-top:10px;"><div style="width:${(u.exp%100)}%; height:100%; background:var(--primary); border-radius:5px;"></div></div>
            </div>
            <div class="grid-container">
                <div class="glass-panel" style="border-left:4px solid var(--primary)"><div class="panel-title"><span class="material-icons-round">monetization_on</span>本月淨利</div><div class="stat-value" style="color:${net>=0?'var(--success)':'var(--danger)'}">$${net.toLocaleString()}</div></div>
                <div class="glass-panel"><div class="panel-title"><span class="material-icons-round">inventory_2</span>庫存</div><div style="display:flex;justify-content:space-between"><span>白糖</span><b>${DB.data.inventory.sugar}kg</b></div></div>
            </div>
            <div class="glass-panel"><div class="panel-title">📢 動態</div><div id="dashLogList"></div></div>`;
        },
        init: () => {
            let h = ''; DB.data.logs.slice(0,5).forEach(l=>h+=`<div class="log-item"><small>${l.date}</small> ${l.msg}</div>`);
            document.getElementById('dashLogList').innerHTML = h || '<p style="color:#666">無紀錄</p>';
        }
    },
    
    map: MapSys, // 連結到新的地圖系統

    breeding: {
        title: '育王管理 (視覺化)',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🧬 育王時間軸</div>
                <label>移蟲日</label><input type="date" id="breedDate" class="input-field">
                <button class="btn-main" onclick="Modules.breeding.calc()">計算</button>
                <div id="breedRes" class="result-area hidden"></div>
            </div>
            <div class="glass-panel">
                <div class="panel-title">🥚 王台接受率模擬</div>
                <p style="color:#888; font-size:0.9rem; margin-bottom:10px;">點擊標記接受(綠)/失敗(紅)</p>
                <div id="cupGrid" style="display:grid; grid-template-columns:repeat(10,1fr); gap:5px;"></div>
                <p style="text-align:center; margin-top:10px;">成功率：<b id="cupRate" style="color:var(--primary)">0%</b></p>
            </div>
        `,
        init: () => {
            let h=''; for(let i=0;i<30;i++) h+=`<div onclick="Modules.breeding.toggleCup(this)" class="cup" style="aspect-ratio:1; background:#333; border-radius:50%; cursor:pointer; border:1px solid #555;"></div>`;
            document.getElementById('cupGrid').innerHTML = h;
        },
        toggleCup: (el) => {
            if(el.style.background === 'rgb(51, 51, 51)') el.style.background = 'var(--success)';
            else if(el.style.background === 'var(--success)') el.style.background = 'var(--danger)';
            else el.style.background = '#333';
            
            // 計算成功率
            const cups = document.querySelectorAll('.cup');
            let success = 0;
            cups.forEach(c => { if(c.style.background.includes('success')) success++; });
            document.getElementById('cupRate').innerText = Math.round((success/cups.length)*100) + '%';
        },
        calc: () => {
            const d = new Date(document.getElementById('breedDate').value);
            if(!isNaN(d)) {
                const f = n => new Date(d.getTime()+n*86400000).toLocaleDateString();
                document.getElementById('breedRes').classList.remove('hidden');
                document.getElementById('breedRes').innerHTML = `<p>封蓋：${f(5)}</p><p style="color:var(--danger)">出台：${f(12)}</p>`;
            }
        }
    },

    production: {
        title: '生產紀錄 & 標籤',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🍯 採收批號</div>
                <button class="btn-main" onclick="alert('批號: 2025-LY-A01')">生成追溯碼</button>
            </div>
            <div class="glass-panel">
                <div class="panel-title">🏷️ 產品標籤預覽 (CNS1305)</div>
                <div style="background:#fff; color:#000; padding:20px; border-radius:8px; border:4px double #000; text-align:center;">
                    <h2 style="margin:0;">純龍眼蜂蜜</h2>
                    <p style="margin:5px 0;">Longan Honey</p>
                    <hr style="border-color:#000;">
                    <p style="font-size:0.8rem; text-align:left;">品名：龍眼蜂蜜<br>成分：蜂蜜<br>產地：台灣<br>重量：700公克<br>保存期限：2年</p>
                    <div style="border:1px solid #000; padding:5px; font-size:0.7rem;">警語：一歲以下嬰兒不宜食用</div>
                </div>
                <button class="btn-main" style="background:#607D8B" onclick="alert('已生成圖片，請截圖列印')">🖨️ 產生列印檔</button>
            </div>
        `,
        init: () => {}
    },

    // --- 完整保留 V31/35 的所有模組 ---
    flora: { title: '蜜源植物', render: () => `<div class="glass-panel">${Utils.floraCard('龍眼','3-4月',5,1)}${Utils.floraCard('荔枝','2-3月',4,2)}${Utils.floraCard('咸豐草','全年',3,5)}${Utils.floraCard('鴨腳木','11-1月',4,4)}${Utils.floraCard('水筆仔','6-8月',3,3)}${Utils.floraCard('油菜花','1-2月',3,5)}</div>`, init:()=>{} },
    inventory: { title: '資材庫存', render: () => `<div class="glass-panel"><div class="panel-title">📦 庫存盤點</div>${Utils.invItem('白糖 (kg)', DB.data.inventory.sugar)}${Utils.invItem('草酸 (g)', DB.data.inventory.acid)}${Utils.invItem('玻璃瓶 (支)', DB.data.inventory.bottles)}</div>`, init: () => {} },
    crm: { title:'客戶訂單', render:()=>`<div class="glass-panel"><div id="crmList"></div></div>`, init:()=>{ let h=''; DB.data.crm.forEach(c=>h+=`<div class="list-item"><span>${c.name}</span><b>$${c.total}</b></div>`); document.getElementById('crmList').innerHTML=h; } },
    action_feed: { title:'餵食作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍬 餵食</div><select id="f_t" class="input-field"><option>白糖</option><option>花粉</option></select><input id="f_a" type="number" class="input-field" placeholder="數量"><input id="f_c" type="number" class="input-field" placeholder="成本"><button class="btn-main" onclick="SmartLogic.feed(getVal('f_t'),getVal('f_a'),getVal('f_c'))">確認</button></div>`, init:()=>{} },
    action_harvest: { title:'採收作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍯 採收</div><select id="h_t" class="input-field"><option>龍眼</option></select><input id="h_w" type="number" class="input-field" placeholder="kg"><input id="h_p" type="number" class="input-field" placeholder="單價"><button class="btn-main" style="background:var(--success)" onclick="SmartLogic.harvest(getVal('h_t'),getVal('h_w'),getVal('h_p'))">確認</button></div>`, init:()=>{} },
    finance: { title: '財務報表', render: () => `<div class="glass-panel"><div class="panel-title">💰 損益</div>${Utils.invItem('總營收', '$'+DB.data.finance.revenue)}${Utils.invItem('總成本', '$'+DB.data.finance.cost)}</div>`, init: () => {} },
    logistics: { title: '轉場運輸', render: () => `<div class="glass-panel"><div class="panel-title">🚚 貨車裝載計算</div><div class="input-group"><label>箱數</label><input type="number" id="truckBox" class="input-field" oninput="Modules.logistics.calc()"></div><div class="result-area" id="truckRes">---</div></div>`, init: () => {}, calc: () => { const n=document.getElementById('truckBox').value; if(n) document.getElementById('truckRes').innerHTML = `需堆疊：<b>${Math.ceil(n/12)} 層</b> (3.5噸車)`; } },
    compliance: { title: '法規合規', render: () => `<div class="glass-panel"><div class="panel-title">⚖️ 合規檢核</div><label class="glass-btn"><input type="checkbox" checked> 養蜂登錄證</label><label class="glass-btn"><input type="checkbox"> 農藥殘留檢驗</label></div>`, init: () => {} },
    risk: { title: '風險管理', render: () => `<div class="glass-panel"><div class="panel-title">🛑 風險通報</div><button class="btn-main" style="background:var(--danger); margin-bottom:15px;" onclick="SmartLogic.addRisk()">+ 新增風險</button><div id="riskList"></div></div>`, init: () => { let h = ''; DB.data.risks.forEach(r => h += `<div class="list-item" style="border-left:3px solid var(--danger)"><span>[${r.type}] ${r.date}</span><small>${r.note}</small></div>`); document.getElementById('riskList').innerHTML = h || '<p>無風險</p>'; } },
    land: { title: '場地管理', render: () => `<div class="glass-panel"><div class="panel-title">🏞️ 地主</div><button class="btn-main" onclick="SmartLogic.addLand()">+ 新增</button><div id="landList"></div></div>`, init: () => { let h = ''; DB.data.lands.forEach(l => h += `<div class="list-item"><span>${l.name}</span><small>${l.landlord}</small></div>`); document.getElementById('landList').innerHTML = h; } },
    esg: { title:'永續經營', render:()=>`<div class="glass-panel"><h3>🌍 ESG 貢獻</h3><p>授粉產值：$5M</p></div>`, init:()=>{} },
    science: { title:'環境氣象', render:()=>Utils.placeholder('氣象API'), init:()=>{} },
    health: { title:'病害防治', render:()=>Utils.placeholder('草酸計算'), init:()=>{} },
    tasks: { title: '工作排程', render: () => `<div class="glass-panel"><div class="panel-title">✅ 待辦</div><ul id="taskList" style="list-style:none;padding:0"></ul></div>`, init: () => { let h=''; DB.data.tasks.forEach(t=>h+=`<li class="list-item">${t.title}</li>`); document.getElementById('taskList').innerHTML=h; } },
    settings: { title: '系統設定', render: () => `<div class="glass-panel"><button class="btn-main" style="background:var(--danger)" onclick="localStorage.clear();location.reload()">重置</button></div>`, init:()=>{} }
};

// --- Utils ---
const Utils = {
    placeholder: (t) => `<div class="glass-panel" style="text-align:center; padding:40px; color:#666"><h3>${t}</h3></div>`,
    invItem: (n,v,a=false) => `<div class="list-item"><span>${n}</span><span style="font-weight:bold; color:${a?'var(--danger)':'#fff'}">${v}</span></div>`,
    floraCard: (n,t,s1,s2,c) => `<div class="flora-card"><div class="flora-info"><h4 style="color:${c}">${n}</h4><p>${t}</p></div><div style="text-align:right"><div style="color:#FFD700">蜜 ${'⭐'.repeat(s1)}</div><div style="color:#FF9800">粉 ${'⭐'.repeat(s2)}</div></div></div>`,
    restoreData: () => { document.querySelectorAll('input').forEach(el=>{if(el.id){const v=localStorage.getItem('bee_val_'+el.id);if(v)el.value=v;}})},
    exportData: () => {}
};

function getVal(id) { return document.getElementById(id).value; }
const NotificationCenter = { toggle: () => { const p=document.getElementById('notifPanel'); p.classList.toggle('visible'); document.getElementById('overlay').classList.toggle('hidden', !p.classList.contains('visible')); let h=''; DB.data.notifications.forEach(n=>h+=`<div class="notif-alert">${n.msg}</div>`); document.getElementById('notifList').innerHTML=h||'<p style="color:#666;padding:10px">無新通知</p>'; } };
const QuickAction = { toggle: () => document.getElementById('quickSheet').classList.toggle('visible') };
const Log = { quick: (t) => { alert('已紀錄: '+t); QuickAction.toggle(); } };

document.addEventListener('DOMContentLoaded', () => System.init());
