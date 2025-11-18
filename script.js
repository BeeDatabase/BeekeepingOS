/**
 * BEE EXPERT V69.0 - THE PROMISE EDITION
 * Full Integration: Auth, Chat, Interactive, Full Content.
 */

// ================= 0. 靜態資料庫 (15種植物) =================
const FLORA_DB = [
    {name:'龍眼', time:'3-4月', honey:5, pollen:1, color:'#fff', loc:'南投中寮', season:'spring'},
    {name:'荔枝', time:'2-3月', honey:4, pollen:2, color:'#f5f5f5', loc:'高雄大樹', season:'spring'},
    {name:'咸豐草', time:'全年', honey:3, pollen:5, color:'#ff9800', loc:'全台平地', season:'all'},
    {name:'鴨腳木', time:'11-1月', honey:4, pollen:4, color:'#ffeb3b', loc:'北部山區', season:'winter'},
    {name:'烏桕', time:'5-7月', honey:3, pollen:4, color:'#4caf50', loc:'苗栗', season:'summer'},
    {name:'油菜花', time:'1-2月', honey:3, pollen:5, color:'#ffeb3b', loc:'花東', season:'winter'},
    {name:'白千層', time:'8-11月', honey:3, pollen:3, color:'#eee', loc:'桃園', season:'autumn'},
    {name:'水筆仔', time:'6-8月', honey:3, pollen:3, color:'#8bc34a', loc:'新竹', season:'summer'},
    {name:'羅氏鹽膚木', time:'9-10月', honey:1, pollen:5, color:'#795548', loc:'山區', season:'autumn'},
    {name:'茶花', time:'11-3月', honey:2, pollen:4, color:'#d32f2f', loc:'桃竹苗', season:'winter'},
    {name:'楠木', time:'2-3月', honey:3, pollen:3, color:'#5d4037', loc:'山區', season:'spring'},
    {name:'小花蔓澤蘭', time:'10-11月', honey:3, pollen:2, color:'#cddc39', loc:'南部', season:'autumn'},
    {name:'玉米', time:'全年', honey:0, pollen:4, color:'#ffeb3b', loc:'雲嘉南', season:'all'},
    {name:'南瓜', time:'全年', honey:2, pollen:5, color:'#ff9800', loc:'各地', season:'all'},
    {name:'瓜類', time:'夏季', honey:2, pollen:4, color:'#ffeb3b', loc:'各地', season:'summer'}
];

const BEE_QUOTES = ["主人加油！🐝","今天適合巡場喔","注意蜂王狀態","別忘了餵糖水","我是你的好夥伴"];

// ================= 1. 資料庫核心 =================
const DB = {
    data: {
        inventory: { sugar: 50, acid: 500, bottles: 100, box: 108, pollen: 20, frames: 1000, soy: 10, probiotic: 5, formic: 1000, strips: 50, foundation: 500, excluder: 30, cage: 50 },
        finance: { revenue: 150000, cost: 35000, fixedCost: 20000 },
        financeHistory: [{month:'九月',revenue:180000,cost:30000},{month:'十月',revenue:150000,cost:35000},{month:'十一月',revenue:165000,cost:32000}],
        logs: [{date:'2025/11/05',type:'check',msg:'檢查 A-10 王台',hive:'A-10'},{date:'2025/11/01',type:'feed',msg:'全場餵食 1:1 糖水',hive:'ALL'}],
        tasks: [{date:'2025-11-20',title:'全場檢查王台',done:false},{date:'2025-11-25',title:'補充 B 區糖水',done:false}],
        crm: [{name:'王大明',phone:'0912-345678',note:'VIP',total:5000},{name:'陳小姐',phone:'0988-123456',note:'宅配',total:12000}],
        notifications: [], 
        user: {exp:1550, level:15},
        chat: [{user:'系統',time:'2025/11/19',msg:'歡迎使用 V69.0'}],
        risks: [{date:'2024/10/01',type:'農藥',note:'附近噴藥'}],
        lands: [{name:'中寮A場',landlord:'林先生',rent:'20斤蜜',due:'2025-12-31'}],
        hives: {}, settings: {mapBoxCount:108}
    },
    load: function() {
        const MASTER_KEY = 'bee_master_db';
        let saved = localStorage.getItem(MASTER_KEY);
        if(!saved) {
             const oldKeys = ['bee_db_v68','bee_db_v67','bee_db_v66','bee_db_v63','bee_db_v44'];
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
                const birth = new Date(); birth.setFullYear(birth.getFullYear() - 1);
                this.data.hives[`A-${i}`] = {status:s, beeAmt:5, queenBirthDate: birth.toISOString().split('T')[0]};
            }
        }
    }
};

// ================= 2. 身分與互動 =================
const Auth = {
    currentUser: { name:'訪客', role:'guest' },
    login: function() {
        const r = document.getElementById('loginRole').value;
        const n = document.getElementById('loginName').value || '無名氏';
        this.currentUser = { name:n, role:r };
        document.getElementById('userBadge').innerText = `${r==='admin'?'👨‍🌾':'👷‍♂️'} ${n}`;
        if(r!=='admin') document.querySelectorAll('.role-admin').forEach(e=>e.style.display='none');
        document.getElementById('loginScreen').style.display='none';
        alert(`歡迎 ${n}！`);
    },
    logout: function() { location.reload(); },
    check: function() { if(this.currentUser.role==='guest') { alert('請先登入'); return false; } return true; }
};

const Bee = {
    talk: () => {
        const b = document.getElementById('beeBubble');
        b.innerText = BEE_QUOTES[Math.floor(Math.random()*BEE_QUOTES.length)];
        b.classList.add('show'); setTimeout(()=>b.classList.remove('show'),3000); UI.vibrate();
    }
};

const Radio = {
    playing: false,
    toggle: () => {
        const a = document.getElementById('bgMusic');
        const i = document.getElementById('radioIcon');
        if(Radio.playing) { a.pause(); i.innerText='music_note'; } else { a.play(); i.innerText='music_off'; alert('🎶 播放白噪音'); }
        Radio.playing = !Radio.playing;
    }
};

// ================= 3. 智慧邏輯 =================
const Gamification = { update:()=>{ const x=(DB.data.logs.length*15)+Math.floor(DB.data.finance.revenue/1000); DB.data.user.exp=x; DB.data.user.level=Math.floor(x/200)+1; } };
const SmartLogic = {
    feed: (t,a,c)=>{ if(!Auth.check())return; UI.vibrate(); SmartLogic.addLog('feed',`餵食 ${t} ${a}`, 'ALL'); const i=DB.data.inventory; if(t.includes('糖'))i.sugar-=parseFloat(a)*0.6; if(t.includes('粉'))i.pollen-=parseFloat(a); DB.data.finance.cost+=parseFloat(c); DB.save(); alert('✅ 已紀錄'); Router.go('dashboard'); },
    harvest: (t,w,p)=>{ if(!Auth.check())return; UI.vibrate(); UI.celebrate(); const b=Math.ceil(w/0.7); SmartLogic.addLog('harvest',`採收 ${t} ${w}kg`, 'ALL'); DB.data.inventory.bottles-=b; DB.data.finance.revenue+=(w*p); DB.save(); alert('🎉 豐收！'); Router.go('dashboard'); },
    addRisk: ()=>{ const t=prompt('類型'); const n=prompt('說明'); if(t){ DB.data.risks.unshift({date:new Date().toLocaleDateString(),type:t,note:n}); DB.save(); Router.go('risk'); } },
    addLand: ()=>{ const n=prompt('場地'); if(n){ DB.data.lands.push({name:n,landlord:'未填',rent:'未填',due:'2025-12-31'}); DB.save(); Router.go('land'); } },
    addChat: ()=>{ const m=prompt("留言"); if(m){ DB.data.chat.unshift({user:Auth.currentUser.name,time:new Date().toLocaleString(),msg:m}); DB.save(); Modules.chat.init(); } },
    addLog: (t,m,h)=>{ const u=Auth.currentUser.name; DB.data.logs.unshift({date:new Date().toLocaleDateString(),type:t,msg:`${m} (${u})`,hive:h}); },
    aiDecision: ()=>{ const t=24; const i=DB.data.inventory; if(t<15)return '🔴 氣溫低，保溫'; if(i.sugar<30)return '🟡 糖不足，補貨'; return '🟢 系統正常，宜育王'; },
    checkAlerts: ()=>{ DB.data.notifications=[]; if(DB.data.inventory.sugar<20)DB.data.notifications.push({msg:'⚠️ 糖庫存低'}); document.getElementById('notifDot').classList.toggle('hidden',DB.data.notifications.length===0); }
};

// ================= 4. 介面模組 =================
const UI = { vibrate:()=>{if(navigator.vibrate)navigator.vibrate(50)}, celebrate:()=>{if(window.confetti)confetti({particleCount:150,spread:70,origin:{y:0.6}})}, updateBg:()=>{const h=new Date().getHours();const b=document.body;b.className='';if(h>=5&&h<11)b.classList.add('morning');else if(h>=11&&h<16)b.classList.add('afternoon');else if(h>=16&&h<19)b.classList.add('evening');else b.classList.add('night');} };

const HiveOS = {
    currentId: null,
    open: (id)=>{ UI.vibrate(); HiveOS.currentId=id; document.getElementById('hiveModal').classList.remove('hidden'); document.getElementById('modalTitle').innerText=`📦 ${id}`; HiveOS.switch('check'); },
    close: ()=>document.getElementById('hiveModal').classList.add('hidden'),
    switch: (t)=>{
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active');
        const c=document.getElementById('hive-tab-content');
        if(t==='check') c.innerHTML=`<div class="input-group"><label>蜂量</label><input type="range" max="10" class="input-field"><div class="grid-2"><label class="glass-btn"><input type="checkbox">見王</label><label class="glass-btn"><input type="checkbox">王台</label></div></div>`;
        else if(t==='feed') c.innerHTML=`<div class="input-group"><select class="input-field"><option>糖水</option></select><input type="number" class="input-field" placeholder="量"></div>`;
        else { let h=''; DB.data.logs.filter(l=>l.hive===HiveOS.currentId).forEach(l=>{h+=`<div class="log-item"><small>${l.date}</small> ${l.msg}</div>`}); c.innerHTML=h||'<p style="color:#666">無紀錄</p>'; }
    },
    save: ()=>{ SmartLogic.addLog('check',`檢查`,HiveOS.currentId); DB.save(); alert('✅ 已儲存'); Router.go('map'); HiveOS.close(); },
    shareForConsultation: ()=>{ const id=HiveOS.currentId; const msg=`--- 蜂場求助 ---\n📦 ${id}\n請協助！`; navigator.clipboard.writeText(msg).then(()=>alert('✅ 已複製求助訊息')); }
};

const System = {
    init: ()=>{ DB.load(); UI.updateBg(); setTimeout(()=>{document.getElementById('splashScreen').style.display='none'; document.getElementById('loginScreen').classList.remove('hidden');},1000); Router.go(localStorage.getItem('bee_last_page')||'dashboard'); System.startClock(); System.initAutoSave(); },
    toggleSidebar: ()=>{ document.querySelector('.sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('hidden'); },
    closeAllOverlays: ()=>{ document.querySelector('.sidebar').classList.remove('open'); document.getElementById('overlay').classList.add('hidden'); document.getElementById('quickSheet').classList.remove('visible'); document.getElementById('notifPanel').classList.remove('visible'); HiveOS.close(); QRCodeModal.close(); document.getElementById('importModal').classList.add('hidden'); },
    toggleTheme: ()=>alert('專業模式'), toggleFullScreen: ()=>{ if(!document.fullscreenElement)document.documentElement.requestFullscreen(); else document.exitFullscreen(); },
    startClock: ()=>{ document.getElementById('headerTemp').innerText = `晴朗 24°C`; },
    initAutoSave: ()=>{ document.getElementById('app-content').addEventListener('change', (e)=>{ if(e.target.id) localStorage.setItem('bee_val_'+e.target.id, e.target.value); }); }
};

const Router = {
    go: (p)=>{
        document.querySelectorAll('.nav-btn, .nav-item').forEach(e=>e.classList.remove('active'));
        const d=document.querySelector(`.nav-btn[onclick*="'${p}'"]`); const m=document.querySelector(`.nav-item[onclick*="'${p}'"]`);
        if(d)d.classList.add('active'); if(m)m.classList.add('active');
        const c=document.getElementById('app-content'); const t=document.getElementById('pageTitle');
        c.style.opacity=0;
        setTimeout(()=>{ if(Modules[p]){ c.innerHTML=Modules[p].render(); if(t)t.innerText=Modules[p].title; if(Modules[p].init)Modules[p].init(); Utils.restoreData(); } else { c.innerHTML = `<div class="glass-panel" style="text-align:center;"><h3>模組載入錯誤</h3></div>`; } c.style.opacity=1; },200);
        if(window.innerWidth<=1024) System.closeAllOverlays(); localStorage.setItem('bee_last_page', p);
    }
};

const Modules = {
    // 核心
    dashboard: {
        title: '營運總覽',
        render: ()=>{
            const net=DB.data.finance.revenue-DB.data.finance.cost; const u=DB.data.user;
            return `<div class="glass-panel" style="background:linear-gradient(135deg,#263238,#000);border:1px solid var(--primary);"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="color:var(--primary);font-weight:bold">👑 Lv.${u.level} 蜂業大亨</div><div style="color:#aaa;font-size:0.8rem">Exp: ${u.exp}</div></div><div style="font-size:2rem">👨‍🌾</div></div><div style="background:#333;height:5px;margin-top:10px;border-radius:5px"><div style="width:${u.exp%100}%;height:100%;background:var(--primary);border-radius:5px"></div></div></div><div class="glass-panel" style="border-left:4px solid var(--info);margin-top:15px"><div class="panel-title" style="color:var(--info)"><span class="material-icons-round">psychology</span>AI 顧問</div><p>${SmartLogic.aiDecision()}</p></div><div class="grid-container" style="margin-top:15px"><div class="glass-panel" style="border-left:4px solid var(--primary)"><div class="panel-title">💰 淨利</div><div class="stat-value" style="color:${net>=0?'var(--success)':'var(--danger)'}">$${net.toLocaleString()}</div></div><div class="glass-panel"><div class="panel-title">📦 庫存</div><div style="display:flex;justify-content:space-between"><span>白糖</span><b>${DB.data.inventory.sugar} kg</b></div></div></div><div class="glass-panel"><div class="panel-title">📢 最新日誌</div><div id="dashLogList"></div></div>`;
        },
        init: ()=>{ let h=''; DB.data.logs.slice(0,5).forEach(l=>h+=`<div class="log-item"><small>${l.date}</small> ${l.msg}</div>`); document.getElementById('dashLogList').innerHTML=h||'無紀錄'; }
    },
    map: { title: '蜂場地圖', render: () => `<div class="glass-panel"><div class="panel-title">🗺️ 全場監控</div><div id="hiveGrid" class="grid-auto"></div></div>`, init: () => { let h=''; for(let i=1;i<=DB.data.settings.mapBoxCount;i++){ let c=i%10===0?'var(--danger)':'var(--success)'; h+=`<div onclick="HiveOS.open('A-${i}')" style="aspect-ratio:1;border:1px solid ${c};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(255,255,255,0.05);cursor:pointer;">A-${i}</div>`; } document.getElementById('hiveGrid').innerHTML = h; } },
    // 社群與互動
    chat: {
        title: '交班留言板',
        render: () => `<div class="glass-panel"><div class="panel-title">💬 團隊訊息</div><button class="btn-main" onclick="SmartLogic.addChat()">+ 新增留言</button><div id="chatList" style="margin-top:15px;max-height:400px;overflow-y:auto"></div></div>`,
        init: () => { let h=''; (DB.data.chat||[]).forEach(c=>{h+=`<div class="chat-msg"><div class="chat-meta"><span>${c.user}</span><span>${c.time}</span></div><div>${c.msg}</div></div>`}); document.getElementById('chatList').innerHTML=h||'無留言'; }
    },
    community: { title:'外部社群', render:()=>`<div class="glass-panel"><button class="btn-main" style="background:#00C853" onclick="window.open('https://line.me/')">🚀 LINE 社群</button></div>`, init:()=>{} },
    // 完整模組
    flora: { title: '蜜源植物', render: () => `<div class="glass-panel">${Utils.floraCard('龍眼','3-4月',5,1)}${Utils.floraCard('荔枝','2-3月',4,2)}${Utils.floraCard('咸豐草','全年',3,5)}${Utils.floraCard('鴨腳木','11-1月',4,4)}${Utils.floraCard('水筆仔','6-8月',3,3)}${Utils.floraCard('白千層','8-11月',3,3)}</div>`, init:()=>{} },
    inventory: { title: '資材庫存', render: () => `<div class="glass-panel"><div class="panel-title">📦 完整庫存</div>${Utils.invItem('白糖 (kg)',DB.data.inventory.sugar)}${Utils.invItem('花粉 (kg)',DB.data.inventory.pollen)}${Utils.invItem('草酸 (g)',DB.data.inventory.acid)}${Utils.invItem('甲酸 (ml)',DB.data.inventory.formic)}${Utils.invItem('福化利 (片)',DB.data.inventory.strips)}${Utils.invItem('蜂箱 (個)',DB.data.inventory.box)}${Utils.invItem('巢框',DB.data.inventory.frames)}${Utils.invItem('巢礎',DB.data.inventory.foundation)}</div>`, init: () => {} },
    finance: { title: '財務報表', render: () => `<div class="glass-panel"><div class="panel-title">💰 損益</div>${Utils.invItem('總營收', '$'+DB.data.finance.revenue)}${Utils.invItem('總成本', '$'+DB.data.finance.cost)}</div>`, init: () => {} },
    logistics: { title: '轉場運輸', render: () => `<div class="glass-panel"><div class="panel-title">🚚 貨車裝載計算</div><div class="input-group"><label>箱數</label><input type="number" id="truckBox" class="input-field" placeholder="箱數" oninput="Modules.logistics.calc()"></div><div class="result-area" id="truckRes">---</div></div>`, init: () => {}, calc: () => { const n=document.getElementById('truckBox').value; if(n) document.getElementById('truckRes').innerHTML = `需堆疊：<b>${Math.ceil(n/12)} 層</b> (3.5噸車)`; } },
    compliance: { title: '法規合規', render: () => `<div class="glass-panel"><div class="panel-title">⚖️ 合規檢核</div><label class="glass-btn"><input type="checkbox" checked> 養蜂登錄證</label><label class="glass-btn"><input type="checkbox"> 農藥殘留檢驗</label></div>`, init: () => {} },
    risk: { title: '風險管理', render: () => `<div class="glass-panel"><div class="panel-title">🛑 風險通報</div><button class="btn-main" style="background:var(--danger)" onclick="SmartLogic.addRisk()">+ 新增風險</button><div id="riskList"></div></div>`, init: () => { let h = ''; DB.data.risks.forEach(r => h += `<div class="list-item" style="border-left:3px solid var(--danger)"><span>${r.type}</span><small>${r.note}</small></div>`); document.getElementById('riskList').innerHTML = h || '<p>無風險</p>'; } },
    land: { title: '場地管理', render: () => `<div class="glass-panel"><div class="panel-title">🏞️ 地主</div><button class="btn-main" onclick="SmartLogic.addLand()">+ 新增場地</button><div id="landList"></div></div>`, init: () => { let h = ''; DB.data.lands.forEach(l => h += `<div class="list-item"><span>${l.name}</span><small>${l.landlord}</small></div>`); document.getElementById('landList').innerHTML = h; } },
    breeding: { title:'育王管理', render:()=>`<div class="glass-panel"><label>移蟲日</label><input type="date" id="breedDate" class="input-field"><button class="btn-main" onclick="Modules.breeding.calc()">計算</button><div id="breedRes" class="hidden"></div></div>`, init:()=>{}, calc:()=>{ const d=new Date(document.getElementById('breedDate').value); if(!isNaN(d)) { const f=n=>new Date(d.getTime()+n*86400000).toLocaleDateString(); document.getElementById('breedRes').classList.remove('hidden'); document.getElementById('breedRes').innerHTML=`<p>封蓋：${f(5)}</p><p style="color:var(--danger)">出台：${f(12)}</p>`; } } },
    production: { title: '生產紀錄', render: () => `<div class="glass-panel"><div class="panel-title">🍯 批號生成</div><button class="btn-main" onclick="alert('批號: 2025-LY-A01')">生成</button></div>`, init:()=>{} },
    crm: { title:'客戶訂單', render:()=>`<div class="glass-panel"><div id="crmList"></div></div>`, init:()=>{ let h=''; DB.data.crm.forEach(c=>h+=`<div class="list-item"><span>${c.name}</span><b>$${c.total}</b></div>`); document.getElementById('crmList').innerHTML=h; } },
    tasks: { title: '工作排程', render: () => `<div class="glass-panel"><div class="panel-title">✅ 待辦</div><ul id="taskList" style="list-style:none;padding:0"></ul></div>`, init: () => { let h=''; DB.data.tasks.forEach(t=>h+=`<li class="list-item">${t.title}</li>`); document.getElementById('taskList').innerHTML=h; } },
    settings: { title: '系統設定', render: () => `<div class="glass-panel"><button class="btn-main" style="background:#2196F3" onclick="Utils.exportData()">備份</button><button class="btn-main" style="background:#4CAF50; margin-top:10px" onclick="Utils.copyDataToClipboard()">複製資料</button><button class="btn-main" style="background:#FF9800; margin-top:10px" onclick="QRCodeModal.open()">QR轉移</button><button class="btn-main" style="background:#2979FF; margin-top:10px" onclick="Utils.openImportModal()">還原</button><button class="btn-main" style="background:var(--danger); margin-top:10px" onclick="localStorage.clear();location.reload()">重置</button></div>`, init:()=>{} },
    science: { title:'環境氣象', render:()=>`<div class="glass-panel"><h3>🌤️ 微氣候</h3><p>濕度 75%</p></div>`, init:()=>{} },
    esg: { title:'永續經營', render:()=>`<div class="glass-panel"><h3>🌍 ESG</h3><p>授粉產值：$5M</p></div>`, init:()=>{} },
    health: { title:'病害防治', render:()=>`<div class="glass-panel"><div class="panel-title">🧪 草酸/甲酸 配藥</div><input type="number" id="oaBox" class="input-field" placeholder="箱數" oninput="Modules.health.calcOA()"><div class="result-area" id="oaRes"></div></div>`, init:()=>{}, calcOA:()=>{ const n=document.getElementById('oaBox').value; if(n) document.getElementById('oaRes').innerHTML=`需草酸 <b>${(n*3.5).toFixed(1)}g</b>`; } },
    action_feed: { title:'餵食作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍬 餵食</div><select id="f_t" class="input-field"><option>白糖</option><option>花粉</option></select><input id="f_a" type="number" class="input-field" placeholder="數量"><input id="f_c" type="number" class="input-field" placeholder="成本"><button class="btn-main" onclick="SmartLogic.feed(getVal('f_t'),getVal('f_a'),getVal('f_c'))">確認</button></div>`, init:()=>{} },
    action_harvest: { title:'採收作業', render:()=>`<div class="glass-panel"><div class="panel-title">🍯 採收</div><select id="h_t" class="input-field"><option>龍眼</option><option>荔枝</option></select><input id="h_w" type="number" class="input-field" placeholder="kg"><input id="h_p" type="number" class="input-field" placeholder="單價"><button class="btn-main" onclick="SmartLogic.harvest(getVal('h_t'),getVal('h_w'),getVal('h_p'))">確認</button></div>`, init:()=>{} }
};

// --- Utils ---
const Utils = {
    invItem: (n,v,a=false) => `<div class="list-item"><span>${n}</span><span style="font-weight:bold; color:${a?'var(--danger)':'#fff'}">${v}</span></div>`,
    floraCard: (n,t,s1,s2,c) => `<div class="flora-card"><div class="flora-info"><h4 style="color:${c}">${n}</h4><p>${t}</p></div><div style="text-align:right"><div style="color:#FFD700">蜜 ${'⭐'.repeat(s1)}</div><div style="color:#FF9800">粉 ${'⭐'.repeat(s2)}</div></div></div>`,
    restoreData: () => { document.querySelectorAll('input').forEach(el=>{if(el.id){const v=localStorage.getItem('bee_val_'+el.id);if(v)el.value=v;}})},
    exportData: () => { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(localStorage)],{type:'application/json'})); a.download='bee_backup.json'; a.click(); },
    copyDataToClipboard: () => { navigator.clipboard.writeText(JSON.stringify(localStorage)).then(() => alert('✅ 已複製')); },
    openImportModal: () => { document.getElementById('importModal').classList.remove('hidden'); document.getElementById('overlay').classList.remove('hidden'); },
    importData: () => { const r=document.getElementById('importRawData').value; try{ const d=JSON.parse(r); Object.keys(d).forEach(k=>localStorage.setItem(k,d[k])); alert('還原成功'); location.reload(); }catch(e){alert('格式錯誤');} },
    calcQueenAge: (d) => { if(!d) return 'N/A'; const b=new Date(d); const n=new Date(); return ((n.getFullYear()-b.getFullYear())*12 + (n.getMonth()-b.getMonth())) || 0; },
    exportPDF: (id, t) => { const {jsPDF}=window.jspdf; const d=new jsPDF(); d.text(t,10,10); d.save('report.pdf'); alert('報表生成'); }
};

function getVal(id) { return document.getElementById(id).value; }
const NotificationCenter = { toggle: () => { const p=document.getElementById('notifPanel'); p.classList.toggle('visible'); document.getElementById('overlay').classList.toggle('hidden', !p.classList.contains('visible')); let h=''; DB.data.notifications.forEach(n=>h+=`<div class="notif-alert">${n.msg}</div>`); document.getElementById('notifList').innerHTML=h||'<p style="color:#666;padding:10px">無新通知</p>'; } };
const QuickAction = { toggle: () => document.getElementById('quickSheet').classList.toggle('visible') };
const Log = { quick: (t) => { alert('已紀錄: '+t); QuickAction.toggle(); } };
const QRCodeModal = { qrCode:null, open:()=>{ document.getElementById('qrModal').classList.remove('hidden'); document.getElementById('overlay').classList.remove('hidden'); if(!QRCodeModal.qrCode){document.getElementById('qrcode').innerHTML='';QRCodeModal.qrCode=new QRCode(document.getElementById('qrcode'),{text:JSON.stringify(localStorage).substring(0,500),width:200,height:200});} }, close:()=>{document.getElementById('qrModal').classList.add('hidden');} };

document.addEventListener('DOMContentLoaded', () => System.init());
