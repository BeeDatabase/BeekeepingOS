/**
 * BEE EXPERT V46.0 - FULL CONTENT & AUTO UPDATE
 */

// 資料庫與核心
const DB = {
    data: {
        inventory: { sugar: 50, acid: 500, bottles: 100, box: 108, pollen: 20, frames: 1000, foundation: 500, excluder: 30, cage: 50 },
        finance: { revenue: 150000, cost: 35000, fixedCost: 20000 },
        financeHistory: [{month:'九月',revenue:180000,cost:30000},{month:'十月',revenue:150000,cost:35000},{month:'十一月',revenue:165000,cost:32000}],
        logs: [{date:'2025/11/05',type:'check',msg:'檢查 A-10 王台'},{date:'2025/11/01',type:'feed',msg:'全場餵食 1:1 糖水'}],
        tasks: [{date:'2025-11-20',title:'全場檢查王台 (今)',done:false},{date:'2025-11-25',title:'補充 B 區糖水',done:false}],
        crm: [{name:'王大明',phone:'0912-345678',note:'VIP',total:5000},{name:'陳小姐',phone:'0988-123456',note:'宅配',total:12000}],
        notifications: [],
        user: {exp:1450, level:14},
        risks: [{date:'2024/10/01',type:'農藥',note:'附近噴藥'}],
        lands: [{name:'中寮A場',landlord:'林先生',rent:'20斤蜜',due:'2025-12-31'}],
        hives: {}, settings: {mapBoxCount:108}
    },
    load: function() {
        const MASTER_KEY = 'bee_master_db';
        let saved = localStorage.getItem(MASTER_KEY);
        if(!saved) {
             const oldKeys = ['bee_db_v44','bee_db_v43','bee_db_v42','bee_db_v41','bee_db_v40'];
             for(let k of oldKeys) { let d = localStorage.getItem(k); if(d) { saved = d; localStorage.setItem(MASTER_KEY, d); break; } }
        }
        if(saved) { try { const p = JSON.parse(saved); this.data = { ...this.data, ...p }; this.data.inventory = { ...this.data.inventory, ...(p.inventory || {}) }; } catch(e) {} }
        this.initHives();
    },
    save: function() { localStorage.setItem('bee_master_db', JSON.stringify(this.data)); SmartLogic.checkAlerts(); Gamification.update(); },
    initHives: function() {
        if(!this.data.hives || Object.keys(this.data.hives).length === 0) {
            for(let i=1; i<=this.data.settings.mapBoxCount; i++) {
                let s='normal'; if(i<20)s='strong'; else if(i>90)s='weak';
                this.data.hives[`A-${i}`] = {status:s, beeAmt:5};
            }
        }
    }
};

const Gamification = { update:()=>{ const x=(DB.data.logs.length*15)+Math.floor(DB.data.finance.revenue/1000); DB.data.user.exp=x; DB.data.user.level=Math.floor(x/200)+1; } };
const SmartLogic = {
    feed: (t,a,c)=>{ SmartLogic.addLog('feed',`餵食 ${t} ${a}`); const i=DB.data.inventory; if(t.includes('糖'))i.sugar-=parseFloat(a)*0.6; if(t.includes('粉'))i.pollen-=parseFloat(a); DB.data.finance.cost+=parseFloat(c); DB.save(); alert('✅ 已紀錄'); Router.go('dashboard'); },
    harvest: (t,w,p)=>{ const b=Math.ceil(w/0.7); SmartLogic.addLog('harvest',`採收 ${t} ${w}kg`); DB.data.inventory.bottles-=b; DB.data.finance.revenue+=(w*p); DB.save(); alert('🎉 豐收！'); Router.go('dashboard'); },
    addRisk: ()=>{ const t=prompt('風險類型'); const n=prompt('說明'); if(t){ DB.data.risks.unshift({date:new Date().toLocaleDateString(),type:t,note:n}); DB.save(); Router.go('risk'); } },
    addLand: ()=>{ const n=prompt('場地'); if(n){ DB.data.lands.push({name:n,landlord:'未填',rent:'未填'}); DB.save(); Router.go('land'); } },
    addLog: (t,m)=>{ DB.data.logs.unshift({date:new Date().toLocaleDateString(),type:t,msg:m}); },
    aiDecision: ()=>{ const t=24; const i=DB.data.inventory; if(t<15)return '🔴 氣溫低，保溫'; if(i.sugar<30)return '🟡 糖不足，補貨'; return '🟢 系統正常，宜育王'; },
    checkAlerts: ()=>{ DB.data.notifications=[]; if(DB.data.inventory.sugar<20)DB.data.notifications.push({msg:'⚠️ 糖庫存低'}); if(DB.data.inventory.bottles<50)DB.data.notifications.push({msg:'⚠️ 瓶子不足'}); document.getElementById('notifDot').classList.toggle('hidden',DB.data.notifications.length===0); }
};

const HiveOS = {
    currentId: null,
    open: (id)=>{ HiveOS.currentId=id; document.getElementById('hiveModal').classList.remove('hidden'); document.getElementById('modalTitle').innerText=`📦 ${id}`; HiveOS.switch('check'); },
    close: ()=>document.getElementById('hiveModal').classList.add('hidden'),
    switch: (t)=>{
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active');
        const c=document.getElementById('hive-tab-content');
        if(t==='check') c.innerHTML=`<div class="input-group"><label>蜂量</label><input type="range" max="10" class="input-field"><div class="grid-2"><label class="glass-btn"><input type="checkbox">見王</label></div></div>`;
        else if(t==='feed') c.innerHTML=`<div class="input-group"><select class="input-field"><option>糖水</option></select><input type="number" class="input-field" placeholder="量"></div>`;
        else c.innerHTML=`<div class="log-item"><small>2025/11/01</small> 正常</div>`;
    },
    save: ()=>{ alert('✅ 已儲存'); HiveOS.close(); }
};

const System = {
    init: ()=>{ 
        DB.load(); 
        setTimeout(()=>{ document.getElementById('splashScreen').style.opacity='0'; setTimeout(()=>document.getElementById('splashScreen').style.display='none',500); },1000);
        Router.go(localStorage.getItem('bee_last_page')||'dashboard'); 
        System.startClock(); 
    },
    toggleSidebar: ()=>{ document.querySelector('.sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('hidden'); },
    closeAllOverlays: ()=>{ document.querySelector('.sidebar').classList.remove('open'); document.getElementById('overlay').classList.add('hidden'); document.getElementById('quickSheet').classList.remove('visible'); document.getElementById('notifPanel').classList.remove('visible'); HiveOS.close(); },
    toggleTheme: ()=>alert('專業模式'),
    toggleFullScreen: ()=>{ if(!document.fullscreenElement)document.documentElement.requestFullscreen(); else document.exitFullscreen(); },
    startClock: ()=>{ document.getElementById('headerTemp').innerText = `晴朗 24°C`; }
};

const Router = {
    go: (p)=>{
        document.querySelectorAll('.nav-btn, .nav-item').forEach(e=>e.classList.remove('active'));
        const d=document.querySelector(`.nav-btn[onclick*="'${p}'"]`); const m=document.querySelector(`.nav-item[onclick*="'${p}'"]`);
        if(d)d.classList.add('active'); if(m)m.classList.add('active');
        const c=document.getElementById('app-content'); const t=document.getElementById('pageTitle');
        c.style.opacity=0;
        setTimeout(()=>{
            if(Modules[p]) { c.innerHTML=Modules[p].render(); if(t)t.innerText=Modules[p].title; if(Modules[p].init)Modules[p].init(); Utils.restoreData(); } else { c.innerHTML = `<div class="glass-panel" style="text-align:center;"><h3>載入錯誤</h3></div>`; }
            c.style.opacity=1;
        },200);
        if(window.innerWidth<=1024) System.closeAllOverlays();
        localStorage.setItem('bee_last_page', p);
    }
};

const Modules = {
    dashboard: {
        title: '營運總覽',
        render: ()=>{
            const u=DB.data.user; const net=DB.data.finance.revenue-DB.data.finance.cost;
            return `<div class="glass-panel" style="border:1px solid var(--primary); background:linear-gradient(135deg, #263238, #000);"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="color:var(--primary);font-weight:bold">👑 Lv.${u.level} 蜂業大亨</div><div style="color:#aaa;font-size:0.8rem">Exp: ${u.exp}</div></div><div style="font-size:2rem">👨‍🌾</div></div><div style="background:#333;height:5px;margin-top:10px;border-radius:5px"><div style="width:${u.exp%100}%;height:100%;background:var(--primary);border-radius:5px"></div></div></div>
            <div class="glass-panel" style="border-left:4px solid var(--info); margin-top:15px;"><div class="panel-title" style="color:var(--info)"><span class="material-icons-round">psychology</span>AI 顧問</div><p>${SmartLogic.aiDecision()}</p></div>
            <div class="grid-container" style="margin-top:15px"><div class="glass-panel" style="border-left:4px solid var(--primary)"><div class="panel-title">💰 淨利</div><div class="stat-value">$${net.toLocaleString()}</div></div><div class="glass-panel"><div class="panel-title">📦 總箱數</div><div class="stat-value">${DB.data.inventory.box}</div></div></div>
            <div class="glass-panel"><div class="panel-title">📢 最新日誌</div><div id="dashLogList"></div></div>`;
        },
        init: ()=>{ let h=''; DB.data.logs.slice(0,5).forEach(l=>h+=`<div class="log-item"><small>${l.date}</small> ${l.msg}</div>`); document.getElementById('dashLogList').innerHTML=h||'無紀錄'; }
    },
    map: { title:'蜂場地圖', render:()=>`<div class="glass-panel"><div id="hiveGrid" class="grid-auto"></div></div>`, init:()=>{ let h=''; for(let i=1;i<=DB.data.inventory.box;i++) h+=`<div onclick="HiveOS.open('A-${i}')" style="aspect-ratio:1;border:1px solid var(--success);border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);cursor:pointer">A-${i}</div>`; document.getElementById('hiveGrid').innerHTML=h; } },
    
    flora: { title:'蜜源植物', render:()=>`<div class="glass-panel">${Utils.floraCard('龍眼','3-4月',5,1)}${Utils.floraCard('荔枝','2-3月',4,2)}${Utils.floraCard('咸豐草','全年',3,5)}${Utils.floraCard('鴨腳木','11-1月',4,4)}${Utils.floraCard('水筆仔','6-8月',3,3)}${Utils.floraCard('白千層','8-11月',3,3)}${Utils.floraCard('羅氏鹽膚木','9-10月',1,5)}${Utils.floraCard('烏桕','5-7月',3,4)}${Utils.floraCard('油菜花','1-2月',3,5)}${Utils.floraCard('茶花','11-3月',2,4)}${Utils.floraCard('楠木','2-3月',3,3)}${Utils.floraCard('蔓澤蘭','10-11月',3,2)}${Utils.floraCard('玉米','全年',0,4)}${Utils.floraCard('南瓜','全年',2,5)}${Utils.floraCard('瓜類','夏季',2,4)}</div>`, init:()=>{} },
    
    finance: { title: '財務報表', render: () => `<div class="glass-panel"><div class="panel-title">💰 損益</div>${Utils.invItem('總營收', '$'+DB.data.finance.revenue)}${Utils.invItem('總成本', '$'+DB.data.finance.cost)}<hr style="border-color:#333"><div style="text-align:right; font-size:1.5rem; color:var(--primary); font-weight:bold;">淨利 $${DB.data.finance.revenue-DB.data.finance.cost}</div></div>`, init: () => {} },
    
    logistics: { title: '轉場運輸', render: () => `<div class="glass-panel"><div class="panel-title">🚚 貨車裝載</div><input type="number" id="truckBox" class="input-field" placeholder="箱數" oninput="Modules.logistics.calc()"><div class="result-area" id="truckRes">---</div></div>`, init: () => {}, calc: () => { const n=document.getElementById('truckBox').value; if(n) document.getElementById('truckRes').innerHTML = `需堆疊：<b>${Math.ceil(n/12)} 層</b> (3.5噸車)`; } },
    
    compliance: { title: '法規合規', render: () => `<div class="glass-panel"><div class="panel-title">⚖️ 合規檢核</div><label class="glass-btn"><input type="checkbox" checked> 養蜂登錄證</label><label class="glass-btn"><input type="checkbox"> 農藥殘留檢驗</label><label class="glass-btn"><input type="checkbox"> 林地契約</label><label class="glass-btn"><input type="checkbox"> 標示合規</label></div><div class="glass-panel"><div class="panel-title">🚫 農藥標準</div><p>福化利：不得檢出</p><p>四環黴素：不得檢出</p></div>`, init: () => {} },
    
    risk: { title: '風險管理', render: () => `<div class="glass-panel"><div class="panel-title">🛑 風險通報</div><button class="btn-main" style="background:var(--danger)" onclick="SmartLogic.addRisk()">+ 新增風險</button><div id="riskList"></div></div>`, init: () => { let h = ''; DB.data.risks.forEach(r => h += `<div class="list-item" style="border-left:3px solid var(--danger)"><span>${r.type}</span><small>${r.note}</small></div>`); document.getElementById('riskList').innerHTML = h || '<p>無風險</p>'; } },
    land: { title: '場地管理', render: () => `<div class="glass-panel"><div class="panel-title">🏞️ 地主</div><button class="btn-main" onclick="SmartLogic.addLand()">+ 新增場地</button><div id="landList"></div></div>`, init: () => { let h = ''; DB.data.lands.forEach(l => h += `<div class="list-item"><span>${l.name}</span><small>${l.landlord}</small></div>`); document.getElementById('landList').innerHTML = h; } },
    breeding: { title:'育王管理', render:()=>`<div class="glass-panel"><label>移蟲日</label><input type="date" id="breedDate" class="input-field"><button class="btn-main" onclick="Modules.breeding.calc()">計算</button><div id="breedRes" class="hidden"></div></div>`, init:()=>{}, calc:()=>{ const d=new Date(document.getElementById('breedDate').value); if(!isNaN(d)) { const f=n=>new Date(d.getTime()+n*86400000).toLocaleDateString(); document.getElementById('breedRes').classList.remove('hidden'); document.getElementById('breedRes').innerHTML=`<p>封蓋：${f(5)}</p><p style="color:var(--danger)">出台：${f(12)}</p>`; } } },
    production: { title: '生產紀錄', render: () => `<div class="glass-panel"><div class="panel-title">🍯 批號生成</div><button class="btn-main" onclick="alert('批號: 2025-LY-A01')">生成</button></div>`, init:()=>{} },
    inventory: { title: '資材庫存', render: () => `<div class="glass-panel"><div class="panel-title">📦 庫存</div>${Utils.invItem('白糖', DB.data.inventory.sugar+'kg')}${Utils.invItem('瓶子', DB.data.inventory.bottles+'支')}${Utils.invItem('草酸', DB.data.inventory.acid+'g')}${Utils.invItem('甲酸', DB.data.inventory.formic+'ml')}${Utils.invItem('福化利', DB.data.inventory.strips+'片')}${Utils.invItem('蜂箱', DB.data.inventory.box+'個')}${Utils.invItem('巢框', DB.data.inventory.frames+'個')}</div>`, init: () => {} },
    crm: { title:'客戶訂單', render:()=>`<div class="glass-panel"><div id="crmList"></div></div>`, init:()=>{ let h=''; DB.data.crm.forEach(c=>h+=`<div class="list-item"><span>${c.name}</span><b>$${c.total}</b></div>`); document.getElementById('crmList').innerHTML=h; } },
    tasks: { title: '工作排程', render: () => `<div class="glass-panel"><div class="panel-title">✅ 待辦</div><ul id="taskList" style="list-style:none;padding:0"></ul></div>`, init: () => { let h=''; DB.data.tasks.forEach(t=>h+=`<li class="list-item">${t.title}</li>`); document.getElementById('taskList').innerHTML=h; } },
    science: { title:'環境氣象', render:()=>`<div class="glass-panel"><h3>🌤️ 微氣候</h3><p>濕度 75%</p></div>`, init:()=>{} },
    esg: { title:'永續經營', render:()=>`<div class="glass-panel"><h3>🌍 ESG</h3><p>授粉產值：$5M</p></div>`, init:()=>{} },
    settings: { title: '系統設定', render: () => `<div class="glass-panel"><button class="btn-main" style="background:#2196F3" onclick="Utils.exportData()">備份</button><button class="btn-main" style="background:var(--danger); margin-top:10px" onclick="localStorage.clear();location.reload()">重置</button></div>`, init:()=>{} },
    health: { title: '病害防治', render: () => `<div class="glass-panel"><div class="panel-title">🧪 草酸/甲酸 配藥</div><input type="number" id="oaBox" class="input-field" placeholder="箱數" oninput="Modules.health.calcOA()"><div class="result-area" id="oaRes"></div></div>`, init:()=>{}, calcOA:()=>{ const n=document.getElementById('oaBox').value; if(n) document.getElementById('oaRes').innerHTML=`需草酸 <b>${(n*3.5).toFixed(1)}g</b>`; } },
    action_feed: { title:'餵食作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍬 餵食</div><select id="f_t" class="input-field"><option>白糖</option><option>花粉</option><option>益生菌</option></select><input id="f_a" type="number" class="input-field" placeholder="數量"><input id="f_c" type="number" class="input-field" placeholder="成本"><button class="btn-main" onclick="SmartLogic.feed(getVal('f_t'),getVal('f_a'),getVal('f_c'))">確認</button></div>`, init:()=>{} },
    action_harvest: { title:'採收作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍯 採收</div><select id="h_t" class="input-field"><option>龍眼</option><option>百花蜜</option><option>蜂王乳</option></select><input id="h_w" type="number" class="input-field" placeholder="kg"><input id="h_p" type="number" class="input-field" placeholder="單價"><button class="btn-main" onclick="SmartLogic.harvest(getVal('h_t'),getVal('h_w'),getVal('h_p'))">確認</button></div>`, init:()=>{} }
};

// --- Utils ---
const Utils = {
    invItem: (n,v,a=false) => `<div class="list-item"><span>${n}</span><span style="font-weight:bold; color:${a?'var(--danger)':'#fff'}">${v}</span></div>`,
    floraCard: (n,t,s1,s2,c) => `<div class="flora-card"><div class="flora-info"><h4 style="color:${c}">${n}</h4><p>${t}</p></div><div style="text-align:right"><div style="color:#FFD700">蜜 ${'⭐'.repeat(s1)}</div><div style="color:#FF9800">粉 ${'⭐'.repeat(s2)}</div></div></div>`,
    restoreData: () => { document.querySelectorAll('input').forEach(el=>{if(el.id){const v=localStorage.getItem('bee_val_'+el.id);if(v)el.value=v;}})},
    exportData: () => { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(localStorage)],{type:'application/json'})); a.download='bee_backup.json'; a.click(); }
};

function getVal(id) { return document.getElementById(id).value; }
const NotificationCenter = { toggle: () => { const p=document.getElementById('notifPanel'); p.classList.toggle('visible'); document.getElementById('overlay').classList.toggle('hidden', !p.classList.contains('visible')); let h=''; DB.data.notifications.forEach(n=>h+=`<div class="notif-alert">${n.msg}</div>`); document.getElementById('notifList').innerHTML=h||'<p style="color:#666;padding:10px">無新通知</p>'; } };
const QuickAction = { toggle: () => document.getElementById('quickSheet').classList.toggle('visible') };
const Log = { quick: (t) => { alert('已紀錄: '+t); QuickAction.toggle(); } };

document.addEventListener('DOMContentLoaded', () => System.init());
