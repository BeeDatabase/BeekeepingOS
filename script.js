/**
 * BEE EXPERT V43.1 - DATA RESCUE & INHERITANCE
 * Fixed: Auto-migration from old versions to prevent data loss.
 */

// ================= 1. 資料庫核心 (DB) =================
const DB = {
    // 這是資料的預設結構 (如果完全是新使用者才會用到)
    data: {
        inventory: { sugar: 50, acid: 500, bottles: 100, box: 108, pollen: 20, frames: 1000 },
        finance: { revenue: 150000, cost: 35000, fixedCost: 20000 },
        logs: [],
        tasks: [{ title: '全場檢查王台', done: false }],
        crm: [{ name: '範例客戶', phone: '0912-345678', note: 'VIP', total: 0 }],
        notifications: [],
        user: { exp: 100, level: 1 },
        risks: [],
        lands: [],
        hives: {}, 
        settings: { mapBoxCount: 108 }
    },
    
    // ★ 關鍵修改：資料載入與救援邏輯 ★
    load: function() {
        // 1. 定義一個「永久固定」的鑰匙名稱，以後更新都不準改這個名字！
        const MASTER_KEY = 'bee_expert_master_db';
        
        // 2. 嘗試讀取永久鑰匙
        let saved = localStorage.getItem(MASTER_KEY);

        // 3. 如果永久鑰匙沒資料，代表他是舊版使用者，開始「救援搜索」
        if (!saved) {
            console.log("正在搜尋舊版資料...");
            // 依序檢查所有可能用過的舊鑰匙
            const oldKeys = ['bee_db_v43', 'bee_db_v42', 'bee_db_v41', 'bee_db_v40', 'bee_db_v39', 'bee_db_v38', 'bee_db_v37'];
            
            for (let key of oldKeys) {
                let oldData = localStorage.getItem(key);
                if (oldData) {
                    console.log(`找到舊版資料 (${key})，正在遷移...`);
                    saved = oldData;
                    // 找到後，立刻存入永久鑰匙，完成遷移
                    localStorage.setItem(MASTER_KEY, oldData);
                    break; // 找到最新的就停止
                }
            }
        }

        // 4. 如果有找到資料，就載入；沒找到就用預設值
        if (saved) {
            try {
                // 使用 Object.assign 確保新功能的欄位也會被補進去
                const parsed = JSON.parse(saved);
                this.data = { ...this.data, ...parsed }; 
                // 特別處理巢狀物件的合併 (防止新功能的 inventory 欄位消失)
                this.data.inventory = { ...this.data.inventory, ...(parsed.inventory || {}) };
            } catch(e) {
                console.error("資料損毀，載入預設值");
            }
        }
        
        this.initHives();
    },

    // 儲存時，永遠只存到永久鑰匙
    save: function() {
        localStorage.setItem('bee_expert_master_db', JSON.stringify(this.data));
        SmartLogic.checkAlerts();
        Gamification.update();
    },

    initHives: function() {
        if(!this.data.hives || Object.keys(this.data.hives).length === 0) {
            this.data.hives = {};
            for(let i=1; i<=this.data.settings.mapBoxCount; i++) {
                this.data.hives[`A-${i}`] = { status: 'normal', beeAmt: 5 };
            }
        }
    }
};

// ================= 2. 智慧邏輯 =================
const Gamification = {
    update: function() {
        const xp = (DB.data.logs.length * 15) + Math.floor(DB.data.finance.revenue / 1000);
        const lvl = Math.floor(xp / 200) + 1;
        DB.data.user.exp = xp;
        DB.data.user.level = lvl;
    }
};

const SmartLogic = {
    feed: function(type, amount, cost) {
        this.addLog('feed', `餵食 ${type} ${amount}`);
        const inv = DB.data.inventory;
        if(type.includes('糖')) inv.sugar -= parseFloat(amount) * 0.6;
        if(type.includes('花粉')) inv.pollen -= parseFloat(amount);
        DB.data.finance.cost += parseFloat(cost);
        DB.save(); 
        alert(`✅ 已紀錄！庫存已扣除，獲得經驗值！`);
        Router.go('dashboard');
    },
    harvest: function(type, weight, price) {
        let bottles = 0;
        if(type.includes('蜜')) bottles = Math.ceil(weight / 0.7);
        if(type.includes('王乳')) bottles = Math.ceil(weight / 0.5);
        this.addLog('harvest', `採收 ${type} ${weight}kg`);
        DB.data.inventory.bottles -= bottles;
        DB.data.finance.revenue += (weight * price);
        DB.save(); 
        alert(`🎉 豐收！營收 +$${weight*price}，扣除容器 ${bottles}個`);
        Router.go('dashboard');
    },
    addRisk: function() {
        const t = prompt("風險類型:", "農藥");
        const n = prompt("說明:", "附近果園噴藥");
        if(t) {
            DB.data.risks.unshift({date: new Date().toLocaleDateString(), type: t, note: n});
            DB.save(); Router.go('risk');
        }
    },
    addLand: function() {
        const n = prompt("場地名稱:");
        const l = prompt("地主:");
        if(n) {
            DB.data.lands.push({name: n, landlord: l || '未填', rent: '未填', due: '2025-12-31'});
            DB.save(); Router.go('land');
        }
    },
    addLog: function(type, msg) {
        DB.data.logs.unshift({ date: new Date().toLocaleDateString(), type, msg });
    },
    checkAlerts: function() {
        DB.data.notifications = [];
        const inv = DB.data.inventory;
        if(inv.sugar < 20) DB.data.notifications.push({msg:'⚠️ 白糖庫存低於 20kg'});
        if(inv.bottles < 50) DB.data.notifications.push({msg:'⚠️ 玻璃瓶庫存緊張'});
        const dot = document.getElementById('notifDot');
        if(dot) dot.classList.toggle('hidden', DB.data.notifications.length === 0);
    }
};

// ================= 3. 系統核心 =================
const HiveOS = {
    currentId: null,
    open: function(id) {
        this.currentId = id;
        document.getElementById('hiveModal').classList.remove('hidden');
        document.getElementById('modalTitle').innerText = `📦 ${id} 管理`;
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
            c.innerHTML = `<div class="input-group"><label>飼料</label><select class="input-field"><option>1:1 糖水</option><option>花粉餅</option></select></div><div class="input-group"><input type="number" class="input-field" placeholder="數量"></div>`;
        } else {
            c.innerHTML = `<div class="log-item"><small>2025/11/01</small> 檢查：正常</div>`;
        }
    },
    save: function() { alert(`✅ 已儲存 ${this.currentId}`); this.close(); }
};

const System = {
    init: function() {
        DB.load(); // 這裡會執行資料救援
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
    startClock: () => { const w = ['晴朗','多雲','陰天']; document.getElementById('headerTemp').innerText = `${w[Math.floor(Math.random()*3)]} 24°C`; },
    initAutoSave: () => { document.getElementById('app-content').addEventListener('change', (e)=>{ if(e.target.id) localStorage.setItem('bee_val_'+e.target.id, e.target.value); }); }
};

const Router = {
    go: function(p) {
        document.querySelectorAll('.nav-btn, .nav-item').forEach(e=>e.classList.remove('active'));
        const d=document.querySelector(`.nav-btn[onclick*="'${p}'"]`); const m=document.querySelector(`.nav-item[onclick*="'${p}'"]`);
        if(d)d.classList.add('active'); if(m)m.classList.add('active');

        const c = document.getElementById('app-content');
        const t = document.getElementById('pageTitle');
        c.style.opacity = 0;
        setTimeout(() => {
            if(Modules[p]) { c.innerHTML = Modules[p].render(); if(t) t.innerText = Modules[p].title; if(Modules[p].init) Modules[p].init(); Utils.restoreData(); } else { c.innerHTML = `<div class="glass-panel" style="text-align:center;"><h3>模組載入錯誤</h3></div>`; }
            c.style.opacity = 1;
        }, 200);
        if(window.innerWidth <= 1024) System.closeAllOverlays();
        localStorage.setItem('bee_last_page', p);
    }
};

// ================= 4. 模組內容 (維持 V39 完整性) =================
const Modules = {
    dashboard: {
        title: '營運總覽',
        render: () => {
            const net = DB.data.finance.revenue - DB.data.finance.cost;
            const u = DB.data.user;
            return `
            <div class="glass-panel" style="background:linear-gradient(135deg, #263238 0%, #000 100%); border:1px solid var(--primary);">
                <div style="display:flex; justify-content:space-between; align-items:center;"><div><div style="color:var(--primary); font-weight:bold;">👑 Lv.${u.level} 蜂業大亨</div><div style="color:#aaa; font-size:0.8rem;">Exp: ${u.exp}</div></div><div style="font-size:2rem;">👨‍🌾</div></div>
                <div style="background:#333; height:5px; border-radius:5px; margin-top:10px;"><div style="width:${(u.exp%100)}%; height:100%; background:var(--primary); border-radius:5px;"></div></div>
            </div>
            <div class="grid-container">
                <div class="glass-panel" style="border-left:4px solid var(--primary)"><div class="panel-title"><span class="material-icons-round">monetization_on</span>本月淨利</div><div class="stat-value" style="color:${net>=0?'var(--success)':'var(--danger)'}">$${net.toLocaleString()}</div></div>
                <div class="glass-panel"><div class="panel-title"><span class="material-icons-round">inventory_2</span>庫存</div><div style="display:flex;justify-content:space-between"><span>白糖</span><b>${DB.data.inventory.sugar} kg</b></div></div>
            </div>
            <div class="glass-panel"><div class="panel-title">📢 最新日誌</div><div id="dashLogList"></div></div>`;
        },
        init: () => {
            let h=''; DB.data.logs.slice(0,5).forEach(l=>h+=`<div class="log-item"><small>${l.date}</small> ${l.msg}</div>`);
            document.getElementById('dashLogList').innerHTML = h || '<p style="color:#666">無紀錄</p>';
        }
    },
    map: { title: '蜂場地圖', render: () => `<div class="glass-panel"><div class="panel-title">🗺️ 全場監控</div><div id="hiveGrid" class="grid-auto"></div></div>`, init: () => { let h=''; for(let i=1;i<=DB.data.inventory.box;i++){ let c=i%10===0?'var(--danger)':'var(--success)'; h+=`<div onclick="HiveOS.open('A-${i}')" style="aspect-ratio:1;border:1px solid ${c};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(255,255,255,0.05);cursor:pointer;">A-${i}</div>`; } document.getElementById('hiveGrid').innerHTML = h; } },
    flora: { title: '蜜源植物', render: () => `<div class="glass-panel">${Utils.floraCard('龍眼','3-4月',5,1)}${Utils.floraCard('荔枝','2-3月',4,2)}${Utils.floraCard('咸豐草','全年',3,5)}${Utils.floraCard('鴨腳木','11-1月',4,4)}${Utils.floraCard('水筆仔','6-8月',3,3)}${Utils.floraCard('白千層','8-11月',3,3)}</div>`, init:()=>{} },
    health: { title: '病害防治', render: () => `<div class="glass-panel"><div class="panel-title">🧪 草酸/甲酸 配藥</div><input type="number" id="oaBox" class="input-field" placeholder="箱數" oninput="Modules.health.calcOA()"><div class="result-area" id="oaRes"></div></div>`, init:()=>{}, calcOA:()=>{ const n=document.getElementById('oaBox').value; if(n) document.getElementById('oaRes').innerHTML=`需草酸 <b>${(n*3.5).toFixed(1)}g</b>`; } },
    logistics: { title: '轉場運輸', render: () => `<div class="glass-panel"><div class="panel-title">🚚 貨車裝載</div><input type="number" id="truckBox" class="input-field" placeholder="箱數" oninput="Modules.logistics.calc()"><div class="result-area" id="truckRes">---</div></div>`, init: () => {}, calc: () => { const n=document.getElementById('truckBox').value; if(n) document.getElementById('truckRes').innerHTML = `需堆疊：<b>${Math.ceil(n/12)} 層</b>`; } },
    compliance: { title: '法規合規', render: () => `<div class="glass-panel"><label class="glass-btn"><input type="checkbox" checked> 養蜂登錄證</label><label class="glass-btn"><input type="checkbox"> 農藥殘留檢驗</label></div>`, init: () => {} },
    risk: { title: '風險管理', render: () => `<div class="glass-panel"><button class="btn-main" style="background:var(--danger)" onclick="SmartLogic.addRisk()">+ 新增風險</button><div id="riskList"></div></div>`, init: () => { let h = ''; DB.data.risks.forEach(r => h += `<div class="list-item" style="border-left:3px solid var(--danger)"><span>[${r.type}] ${r.date}</span><small>${r.note}</small></div>`); document.getElementById('riskList').innerHTML = h || '<p>無風險</p>'; } },
    land: { title: '場地管理', render: () => `<div class="glass-panel"><button class="btn-main" onclick="SmartLogic.addLand()">+ 新增場地</button><div id="landList"></div></div>`, init: () => { let h = ''; DB.data.lands.forEach(l => h += `<div class="list-item"><span>${l.name}</span><small>${l.landlord}</small></div>`); document.getElementById('landList').innerHTML = h; } },
    breeding: { title:'育王管理', render:()=>`<div class="glass-panel"><label>移蟲日</label><input type="date" id="breedDate" class="input-field"><button class="btn-main" onclick="Modules.breeding.calc()">計算</button><div id="breedRes" class="hidden"></div></div>`, init:()=>{}, calc:()=>{ const d=new Date(document.getElementById('breedDate').value); if(!isNaN(d)) { const f=n=>new Date(d.getTime()+n*86400000).toLocaleDateString(); document.getElementById('breedRes').classList.remove('hidden'); document.getElementById('breedRes').innerHTML=`<p>封蓋：${f(5)}</p><p style="color:var(--danger)">出台：${f(12)}</p>`; } } },
    production: { title: '生產紀錄', render: () => `<div class="glass-panel"><div class="panel-title">🍯 批號生成</div><button class="btn-main" onclick="alert('批號: 2025-LY-A01')">生成</button></div>`, init:()=>{} },
    inventory: { title: '資材庫存', render: () => `<div class="glass-panel"><div class="panel-title">📦 庫存</div>${Utils.invItem('白糖', DB.data.inventory.sugar+'kg')}${Utils.invItem('瓶子', DB.data.inventory.bottles+'支')}</div>`, init: () => {} },
    crm: { title:'客戶訂單', render:()=>`<div class="glass-panel"><div id="crmList"></div></div>`, init:()=>{ let h=''; DB.data.crm.forEach(c=>h+=`<div class="list-item"><span>${c.name}</span><b>$${c.total}</b></div>`); document.getElementById('crmList').innerHTML=h; } },
    finance: { title: '財務報表', render: () => `<div class="glass-panel"><div class="panel-title">💰 損益</div>${Utils.invItem('總營收', '$'+DB.data.finance.revenue)}${Utils.invItem('總成本', '$'+DB.data.finance.cost)}</div>`, init: () => {} },
    settings: { title: '系統設定', render: () => `<div class="glass-panel"><button class="btn-main" style="background:var(--danger)" onclick="localStorage.clear();location.reload()">重置</button></div>`, init:()=>{} },
    esg: { title:'永續經營', render:()=>`<div class="glass-panel"><h3>🌍 ESG</h3><p>授粉產值：$5M</p></div>`, init:()=>{} },
    science: { title:'環境氣象', render:()=>Utils.placeholder('氣象API'), init:()=>{} },
    action_feed: { title:'餵食作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍬 餵食</div><select id="f_t" class="input-field"><option>白糖</option></select><input id="f_a" type="number" class="input-field" placeholder="數量"><input id="f_c" type="number" class="input-field" placeholder="成本"><button class="btn-main" onclick="SmartLogic.feed(getVal('f_t'),getVal('f_a'),getVal('f_c'))">確認</button></div>`, init:()=>{} },
    action_harvest: { title:'採收作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍯 採收</div><select id="h_t" class="input-field"><option>龍眼</option></select><input id="h_w" type="number" class="input-field" placeholder="kg"><input id="h_p" type="number" class="input-field" placeholder="單價"><button class="btn-main" onclick="SmartLogic.harvest(getVal('h_t'),getVal('h_w'),getVal('h_p'))">確認</button></div>`, init:()=>{} },
    tasks: { title: '工作排程', render: () => `<div class="glass-panel"><div class="panel-title">✅ 待辦</div><ul id="taskList" style="list-style:none;padding:0"></ul></div>`, init: () => { let h=''; DB.data.tasks.forEach(t=>h+=`<li class="list-item">${t.title}</li>`); document.getElementById('taskList').innerHTML=h; } }
};

// --- Utils ---
const Utils = {
    placeholder: (t) => `<div class="glass-panel" style="text-align:center; padding:40px; color:#666"><h3>${t}</h3></div>`,
    invItem: (n,v,a=false) => `<div class="list-item"><span>${n}</span><span style="font-weight:bold; color:${a?'var(--danger)':'#fff'}">${v}</span></div>`,
    floraCard: (n,t,s1,s2,c) => `<div class="flora-card"><div class="flora-info"><h4>${n}</h4><p>${t}</p></div><div style="text-align:right"><div style="color:#FFD700">蜜 ${'⭐'.repeat(s1)}</div><div style="color:#FF9800">粉 ${'⭐'.repeat(s2)}</div></div></div>`,
    restoreData: () => { document.querySelectorAll('input').forEach(el=>{if(el.id){const v=localStorage.getItem('bee_val_'+el.id);if(v)el.value=v;}})},
    exportData: () => {}
};

const Calc = {
    brixToWater: () => {
        const b = parseFloat(document.getElementById('in_brix').value);
        if(b) document.getElementById('res_water').innerText = (400/b - 10).toFixed(1) + '%';
    }
};

function getVal(id) { return document.getElementById(id).value; }
const NotificationCenter = { toggle: () => { const p=document.getElementById('notifPanel'); p.classList.toggle('visible'); document.getElementById('overlay').classList.toggle('hidden', !p.classList.contains('visible')); let h=''; DB.data.notifications.forEach(n=>h+=`<div class="notif-alert">${n.msg}</div>`); document.getElementById('notifList').innerHTML=h||'<p style="color:#666;padding:10px">無新通知</p>'; } };
const QuickAction = { toggle: () => document.getElementById('quickSheet').classList.toggle('visible') };
const Log = { quick: (t) => { alert('已紀錄: '+t); QuickAction.toggle(); } };

document.addEventListener('DOMContentLoaded', () => System.init());
