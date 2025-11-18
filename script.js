/**
 * BEE EXPERT V40.0 - STABLE CODEBASE (LOGIC CORE)
 */

// ================= 1. 資料庫 (DB) =================
const DB = {
    data: {
        inventory: { sugar: 50, acid: 500, bottles: 100, box: 108, pollen: 20 },
        finance: { revenue: 150000, cost: 35000 },
        logs: [],
        tasks: [{ title: '全場檢查王台', done: false }, { title: '補充 B 區糖水', done: false }],
        crm: [
            { name: '王大明', phone: '0912-345678', note: 'VIP / 喜好龍眼蜜', total: 5000 },
            { name: '陳小姐', phone: '0988-123456', note: '只買蜂王乳 / 宅配', total: 12000 }
        ],
        notifications: [],
        user: { exp: 1450, level: 14 },
        risks: [],
        lands: [{ name: '中寮A場', landlord: '林先生', rent: '20斤蜜/年', due: '2025-12-31' }],
        hives: {} 
    },
    load: function() {
        const saved = localStorage.getItem('bee_db_v40');
        if(saved) this.data = JSON.parse(saved);
        this.initHives();
    },
    save: function() {
        localStorage.setItem('bee_db_v40', JSON.stringify(this.data));
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
        const t = prompt("風險類型 (農藥/防盜/天災):", "農藥");
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

// ================= 3. 系統核心與路由 =================
const System = {
    init: function() {
        DB.load();
        setTimeout(() => {
            document.getElementById('splashScreen').style.opacity='0'; setTimeout(()=>document.getElementById('splashScreen').style.display='none',500); 
        }, 1000);
        Router.go(localStorage.getItem('bee_last_page') || 'dashboard');
        this.startClock();
        SmartLogic.checkAlerts();
    },
    toggleSidebar: () => { document.querySelector('.sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('hidden'); },
    closeAllOverlays: () => { document.querySelector('.sidebar').classList.remove('open'); document.getElementById('overlay').classList.add('hidden'); document.getElementById('quickSheet').classList.remove('visible'); document.getElementById('notifPanel').classList.remove('visible'); HiveOS.close(); },
    startClock: () => { const w = ['晴朗','多雲','陰天']; document.getElementById('headerTemp').innerText = `${w[Math.floor(Math.random()*3)]} 24°C`; }
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

// ================= 4. 模組內容 (V39.0) =================
const Modules = {
    dashboard: {
        title: '營運總覽',
        render: () => {
            const net = DB.data.finance.revenue - DB.data.finance.cost; const u = DB.data.user;
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
    
    map: {
        title: '蜂場地圖',
        render: () => `<div class="glass-panel"><div class="panel-title">🗺️ 全場監控 (${DB.data.inventory.box}箱)</div><div id="hiveGrid" class="grid-auto"></div></div>`,
        init: () => {
            let h=''; for(let i=1;i<=DB.data.inventory.box;i++) { 
                let c=i%10===0?'var(--danger)':'var(--success)'; 
                h+=`<div onclick="HiveOS.open('A-${i}')" style="aspect-ratio:1;border:1px solid ${c};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(255,255,255,0.05);cursor:pointer;">A-${i}</div>`; 
            }
            document.getElementById('hiveGrid').innerHTML = h;
        }
    },
    
    // --- 完整功能模組 ---
    flora: {
        title: '蜜源植物圖鑑',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🌺 台灣完整蜜粉源 (15種)</div>
                <div style="height:500px; overflow-y:auto;">
                    ${Utils.floraCard('龍眼 (Longan)', '3-4月', 5, 1, '#fff')}
                    ${Utils.floraCard('水筆仔 (Kandelia)', '6-8月', 3, 3, '#8bc34a')}
                    ${Utils.floraCard('白千層 (Paperbark)', '8-11月', 3, 3, '#eee')}
                    ${Utils.floraCard('蔓澤蘭', '10-11月', 3, 2, '#cddc39')}
                    ${Utils.floraCard('茶花 (Camellia)', '11-3月', 2, 4, '#d32f2f')}
                    ${Utils.floraCard('荔枝 (Lychee)', '2-3月', 4, 2, '#f5f5f5')}
                    ${Utils.floraCard('咸豐草 (Bidens)', '全年', 3, 5, '#ff9800')}
                    ${Utils.floraCard('鴨腳木 (Schefflera)', '11-1月', 4, 4, '#ffeb3b')}
                    ${Utils.floraCard('羅氏鹽膚木', '9-10月', 1, 5, '#795548')}
                    ${Utils.floraCard('烏桕 (Tallow)', '5-7月', 3, 4, '#4caf50')}
                    ${Utils.floraCard('油菜花 (Rapeseed)', '1-2月', 3, 5, '#ffeb3b')}
                    ${Utils.floraCard('楠木 (Machilus)', '2-3月', 3, 3, '#5d4037')}
                    ${Utils.floraCard('玉米', '全年', 0, 4, '#ffeb3b')}
                    ${Utils.floraCard('南瓜', '全年', 2, 5, '#ff9800')}
                    ${Utils.floraCard('瓜類', '夏季', 2, 4, '#ffeb3b')}
                </div>
            </div>`,
        init: () => {}
    },

    health: {
        title: '病害防治',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🧪 草酸/甲酸 配藥計算</div>
                <div class="input-group"><label>防治箱數</label><input type="number" id="oaBox" class="input-field" oninput="Modules.health.calcOA()"></div>
                <div class="result-area" id="oaRes">請輸入箱數</div>
            </div>
            <div class="glass-panel">
                <div class="panel-title">🦠 蜂蟹蟎寄生率計算</div>
                <div class="input-group"><label>採樣蜂數 (隻)</label><input type="number" id="in_bees" class="input-field" value="300"></div>
                <div class="input-group"><label>落下蟎數 (隻)</label><input type="number" id="in_mites" class="input-field" oninput="Calc.miteRate()"></div>
                <div class="result-area"><p>寄生率：<b id="res_mite_rate" style="color:var(--primary)">0%</b></p><p>建議：<b id="res_mite_advice">---</b></p></div>
            </div>`,
        init: () => {},
        calcOA: () => { const n=document.getElementById('oaBox').value; if(n) document.getElementById('oaRes').innerHTML=`需準備：<br>草酸 <b>${(n*3.5).toFixed(1)}g</b><br>糖水 <b>${(n*50).toFixed(1)}ml</b>`; }
    },

    production: {
        title: '生產紀錄',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🌡️ 蜂蜜品質計算</div>
                <div class="input-group"><label>波美度 (Brix)</label><input type="number" id="in_brix" class="input-field" oninput="Calc.brixToWater()"></div>
                <div class="result-area"><p>含水量：<b id="res_water">---</b></p><p>CNS標準：<b id="res_rank">---</b></p></div>
            </div>
            <div class="glass-panel">
                <div class="panel-title">🏷️ 標籤產生器</div>
                <button class="btn-main" onclick="alert('請使用瀏覽器列印功能')">預覽列印</button>
            </div>`,
        init: () => {}
    },

    logistics: {
        title: '轉場運輸',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">🚚 貨車裝載計算</div>
                <div class="input-group"><label>箱數</label><input type="number" id="truckBox" class="input-field" oninput="Modules.logistics.calc()"></div>
                <div class="result-area" id="truckRes">---</div>
            </div>`,
        init: () => {},
        calc: () => { const n=document.getElementById('truckBox').value; if(n) document.getElementById('truckRes').innerHTML = `需堆疊：<b>${Math.ceil(n/12)} 層</b> (3.5噸車)`; }
    },

    compliance: {
        title: '法規合規',
        render: () => `
            <div class="glass-panel">
                <div class="panel-title">⚖️ 台灣養蜂法規檢核</div>
                <label class="glass-btn"><input type="checkbox" checked> 養蜂登錄證 (效期內)</label>
                <label class="glass-btn"><input type="checkbox"> 農藥殘留檢驗 (SGS)</label>
                <label class="glass-btn"><input type="checkbox"> 產品標示檢查 (CNS1305)</label>
                <label class="glass-btn"><input type="checkbox"> 林地借用契約</label>
            </div>
            <div class="glass-panel"><div class="panel-title">🚫 農藥殘留容許量標準</div><p>福化利：不得檢出</p><p>四環黴素：不得檢出</p></div>`,
        init: () => {}
    },
    
    // --- 簡化模組 ---
    tasks: { title: '工作排程', render: () => `<div class="glass-panel"><div class="panel-title">✅ 待辦</div><ul id="taskList" style="list-style:none;padding:0"></ul></div>`, init: () => { let h=''; DB.data.tasks.forEach(t=>h+=`<li class="list-item">${t.title}</li>`); document.getElementById('taskList').innerHTML=h; } },
    breeding: { title:'育王管理', render:()=>`<div class="glass-panel"><label>移蟲日</label><input type="date" id="breedDate" class="input-field"><button class="btn-main" onclick="Modules.breeding.calc()">計算</button><div id="breedRes" class="hidden"></div></div>`, init:()=>{}, calc:()=>{ const d=new Date(document.getElementById('breedDate').value); if(!isNaN(d)) { const f=n=>new Date(d.getTime()+n*86400000).toLocaleDateString(); document.getElementById('breedRes').classList.remove('hidden'); document.getElementById('breedRes').innerHTML=`<p>封蓋：${f(5)}</p><p style="color:var(--danger)">出台：${f(12)}</p>`; } } },
    finance: { title: '財務報表', render: () => `<div class="glass-panel"><div class="panel-title">💰 損益</div>${Utils.invItem('總營收', '$'+DB.data.finance.revenue)}${Utils.invItem('總成本', '$'+DB.data.finance.cost)}</div>`, init: () => {} },
    settings: { title: '系統設定', render: () => `<div class="glass-panel"><button class="btn-main" style="background:#2196F3" onclick="Utils.exportData()">備份</button><button class="btn-main" style="background:var(--danger); margin-top:10px" onclick="localStorage.clear();location.reload()">重置</button></div>`, init: () => {} },
    crm: { title:'客戶訂單', render:()=>`<div class="glass-panel"><div id="crmList"></div></div>`, init:()=>{ let h=''; DB.data.crm.forEach(c=>h+=`<div class="list-item"><span>${c.name}</span><b>$${c.total}</b></div>`); document.getElementById('crmList').innerHTML=h; } },
    inventory: { title: '資材庫存', render: () => `<div class="glass-panel"><div class="panel-title">📦 庫存</div>${Utils.invItem('白糖', DB.data.inventory.sugar+'kg')}${Utils.invItem('花粉', DB.data.inventory.pollen+'kg')}${Utils.invItem('玻璃瓶', DB.data.inventory.bottles+'支')}${Utils.invItem('草酸', DB.data.inventory.acid+'g')}</div>`, init: () => {} },
    risk: { title: '風險管理', render: () => `<div class="glass-panel"><div class="panel-title">🛑 風險通報</div><button class="btn-main" style="background:var(--danger); margin-bottom:15px;" onclick="SmartLogic.addRisk()">+ 新增風險</button><div id="riskList"></div></div>`, init: () => { let h = ''; DB.data.risks.forEach(r => h += `<div class="list-item" style="border-left:3px solid var(--danger)"><span>[${r.type}] ${r.date}</span><small>${r.note}</small></div>`); document.getElementById('riskList').innerHTML = h || '<p>無風險</p>'; } },
    land: { title: '場地管理', render: () => `<div class="glass-panel"><div class="panel-title">🏞️ 地主</div><button class="btn-main" onclick="SmartLogic.addLand()">+ 新增</button><div id="landList"></div></div>`, init: () => { let h = ''; DB.data.lands.forEach(l => h += `<div class="list-item"><span>${l.name}</span><small>${l.landlord}</small></div>`); document.getElementById('landList').innerHTML = h; } },
    science: { title:'環境氣象', render:()=>`<div class="glass-panel"><h3>🌤️ 微氣候</h3><p>濕度 75%</p></div>`, init:()=>{} },
    esg: { title:'永續經營', render:()=>`<div class="glass-panel"><h3>🌍 ESG</h3><p>授粉產值：$5M</p></div>`, init:()=>{} },
    production: { title: '生產紀錄', render: () => `<div class="glass-panel"><div class="panel-title">🍯 批號</div><button class="btn-main" onclick="alert('批號: 2025-LY-A01')">生成</button></div>`, init:()=>{} },
    action_feed: { title:'餵食作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍬 餵食</div><select id="f_t" class="input-field"><option>白糖</option></select><input id="f_a" type="number" class="input-field" placeholder="數量"><input id="f_c" type="number" class="input-field" placeholder="成本"><button class="btn-main" onclick="SmartLogic.feed(getVal('f_t'),getVal('f_a'),getVal('f_c'))">確認</button></div>`, init:()=>{} },
    action_harvest: { title:'採收作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍯 採收</div><select id="h_t" class="input-field"><option>龍眼</option></select><input id="h_w" type="number" class="input-field" placeholder="kg"><input id="h_p" type="number" class="input-field" placeholder="單價"><button class="btn-main" onclick="SmartLogic.harvest(getVal('h_t'),getVal('h_w'),getVal('h_p'))">確認</button></div>`, init:()=>{} },
};

// --- Utils ---
const Utils = {
    invItem: (n,v,a=false) => `<div class="list-item"><span>${n}</span><span style="font-weight:bold; color:${a?'var(--danger)':'#fff'}">${v}</span></div>`,
    floraCard: (n,t,s1,s2,c) => `<div class="flora-card"><div class="flora-info"><h4>${n}</h4><p>${t}</p></div><div style="text-align:right"><div style="color:#FFD700">蜜 ${'⭐'.repeat(s1)}</div><div style="color:#FF9800">粉 ${'⭐'.repeat(s2)}</div></div></div>`,
    restoreData: () => { document.querySelectorAll('input').forEach(el=>{if(el.id){const v=localStorage.getItem('bee_val_'+el.id);if(v)el.value=v;}})}
};

const Calc = {
    // Brix 轉含水量
    brixToWater: () => {
        const b = parseFloat(document.getElementById('in_brix').value);
        if(b) {
            let w = 0; if(b >= 43) w = 17; else if(b >= 42) w = 18.6; else if(b >= 41) w = 21; else if(b >= 40) w = 23; else w = 25;
            document.getElementById('res_water').innerText = w + '%';
            document.getElementById('res_rank').innerText = w <= 20 ? '🏆 甲級 (合規)' : '❌ 水分過高';
        }
    },
    // 蟎害寄生率
    miteRate: () => {
        const b = parseFloat(document.getElementById('in_bees').value);
        const m = parseFloat(document.getElementById('in_mites').value);
        if(b && m) {
            const r = (m/b)*100;
            document.getElementById('res_mite_rate').innerText = r.toFixed(1) + '%';
            document.getElementById('res_mite_advice').innerText = r > 3 ? '🔴 立即用藥 (超標)' : '🟢 安全範圍';
        }
    }
};

function getVal(id) { return document.getElementById(id).value; }
const NotificationCenter = { toggle: () => { const p=document.getElementById('notifPanel'); p.classList.toggle('visible'); document.getElementById('overlay').classList.toggle('hidden', !p.classList.contains('visible')); let h=''; DB.data.notifications.forEach(n=>h+=`<div class="notif-alert">${n.msg}</div>`); document.getElementById('notifList').innerHTML=h||'<p style="color:#666;padding:10px">無新通知</p>'; } };
const QuickAction = { toggle: () => document.getElementById('quickSheet').classList.toggle('visible') };
const Log = { quick: (t) => { alert('已紀錄: '+t); QuickAction.toggle(); } };

document.addEventListener('DOMContentLoaded', () => System.init());
