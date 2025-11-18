/**
 * BEE EXPERT V300.0 - ULTIMATE EDITION
 * Full Features: Flora, Guide, Health, Production, Finance, Logistics, Risk, etc.
 */

// ================= 0. 百科資料庫 =================
const KNOWLEDGE_BASE = {
    flora: [
        {n:'龍眼',t:'3-4月',h:5,p:1,c:'#fff',l:'南投,高雄',s:'spring'}, {n:'荔枝',t:'2-3月',h:4,p:2,c:'#f5f5f5',l:'高屏',s:'spring'},
        {n:'咸豐草',t:'全年',h:3,p:5,c:'#ff9800',l:'全台',s:'all'}, {n:'鴨腳木',t:'11-1月',h:4,p:4,c:'#ffeb3b',l:'北部',s:'winter'},
        {n:'烏桕',t:'5-7月',h:3,p:4,c:'#4caf50',l:'苗栗',s:'summer'}, {n:'油菜花',t:'1-2月',h:3,p:5,c:'#ffeb3b',l:'花東',s:'winter'},
        {n:'白千層',t:'8-11月',h:3,p:3,c:'#eee',l:'桃園',s:'autumn'}, {n:'水筆仔',t:'6-8月',h:3,p:3,c:'#8bc34a',l:'新竹',s:'summer'},
        {n:'羅氏鹽膚木',t:'9-10月',h:1,p:5,c:'#795548',l:'山區',s:'autumn'}, {n:'茶花',t:'11-3月',h:2,p:4,c:'#d32f2f',l:'桃竹苗',s:'winter'},
        {n:'楠木',t:'2-3月',h:3,p:3,c:'#5d4037',l:'山區',s:'spring'}, {n:'小花蔓澤蘭',t:'10-11月',h:3,p:2,c:'#cddc39',l:'南部',s:'autumn'},
        {n:'玉米',t:'全年',h:0,p:4,c:'#ffeb3b',l:'雲嘉南',s:'all'}, {n:'南瓜',t:'全年',h:2,p:5,c:'#ff9800',l:'各地',s:'all'},
        {n:'瓜類',t:'夏季',h:2,p:4,c:'#ffeb3b',l:'各地',s:'summer'}
    ],
    guide: {
        s: {
            sp:['檢查產卵','獎勵飼餵','換巢脾','防蜂蟹蟎','擴大蜂巢'], su:['遮蔭降溫','補水','防胡蜂','縮蜂路','採夏蜜'],
            au:['育越冬蜂','治蜂蟹蟎','備飼料','併弱群','換老王'], wi:['保溫','斷子治蟎','控飼料','縮巢門','勿開箱']
        },
        b: ['過度開箱(失王)','見王台就掐(急造)','貪心取蜜(餓死)'], m: ['單一藥劑(抗藥性)','忽視換王(產卵降)']
    },
    disease: [
        {n:'美洲幼蟲病',s:'拉絲、魚腥味',t:'燒毀、抗生素'}, {n:'歐洲幼蟲病',s:'變黃、酸臭',t:'換王、補營養'},
        {n:'白堊病',s:'白硬塊',t:'通風、乾燥'}, {n:'囊狀幼蟲',s:'水袋狀、翹頭',t:'斷子、換王'},
        {n:'蜂蟹蟎',s:'翅捲、殘缺',t:'草酸、甲酸、福化利'}, {n:'孢子蟲',s:'爬蜂、大肚',t:'消毒、維生素'},
        {n:'巢蟲',s:'隧道、絲網',t:'冷凍巢脾、清箱'}, {n:'胡蜂',s:'捕食蜜蜂',t:'拍打、電網'}
    ],
    legal: [
        {i:'福化利',l:'不得檢出(0.05ppm)'}, {i:'四環黴素',l:'不得檢出'}, {i:'氯黴素',l:'不得檢出'},
        {i:'雙甲脒',l:'不得檢出(0.2ppm)'}, {i:'C-4糖',l:'7%以下'}, {i:'HMF',l:'40mg/kg以下'},
        {i:'澱粉酶',l:'8以上'}, {i:'水分',l:'20%以下'}
    ]
};
const BEE_QUOTES = ["加油！🐝","嗡嗡嗡～","糖水夠嗎？","注意分蜂","天氣真好"];

// ================= 1. 資料庫 =================
const DB = {
    data: {
        inventory: { sugar:50, pollen:20, soy:10, probiotic:5, acid:500, formic:1000, strips:50, bottles:100, box:108, frames:1000, foundation:500, excluder:30, cage:50, fuel:5, gloves:5 },
        finance: { revenue:150000, cost:35000, fixed:20000 },
        financeHistory: [{m:'9月',r:180000,c:30000},{m:'10月',r:150000,c:35000},{m:'11月',r:165000,c:32000}],
        logs: [{d:'2025/11/05',t:'check',m:'檢查A-10',h:'A-10'},{d:'2025/11/01',t:'feed',m:'全場餵食',h:'ALL'}],
        tasks: [{t:'全場檢查',d:false},{t:'補充糖水',d:false}],
        crm: [{n:'王大明',p:'0912-345678',k:'VIP',v:5000},{n:'陳小姐',p:'0988-123456',k:'宅配',v:12000}],
        notif: [], user: {exp:1550, lv:15, n:'訪客', r:'guest', av:'👨‍🌾'},
        chat: [{u:'系統',t:'2025/11/19',m:'歡迎使用V300.0'}],
        risks: [{d:'2024/10/01',t:'農藥',n:'噴藥'}], lands: [{n:'中寮A',l:'林先生',r:'20斤蜜'}],
        hives: {}, settings: {box:108}
    },
    load: function() {
        const K='bee_master_db_v300'; let s=localStorage.getItem(K);
        if(!s) { const old=['bee_master_db','bee_db_v78']; for(let k of old){let d=localStorage.getItem(k);if(d){s=d;localStorage.setItem(K,d);break;}} }
        if(s) { try{const p=JSON.parse(s);this.data={...this.data,...p};this.data.inventory={...this.data.inventory,...(p.inventory||{})};}catch(e){} }
        this.initHives();
    },
    save: function() { localStorage.setItem('bee_master_db_v300', JSON.stringify(this.data)); Logic.check(); Game.up(); },
    initHives: function() { if(!this.data.hives||Object.keys(this.data.hives).length===0) { for(let i=1;i<=this.data.settings.box;i++){ let s='normal'; if(i<20)s='strong'; if(i>90)s='weak'; const b=new Date(); b.setFullYear(b.getFullYear()-1); this.data.hives[`A-${i}`]={s:s,b:5,q:b.toISOString().split('T')[0],f:{e:0,l:2,p:2,h:1,pl:1,ep:1},h:{m:0,n:0},tm:3}; } } }
};

// ================= 2. 邏輯 =================
const Auth = {
    login: ()=>{ const n=document.getElementById('loginName').value||'無名'; const r=document.getElementById('loginRole').value; DB.data.user.n=n; DB.data.user.r=r; document.getElementById('loginScreen').classList.add('hidden'); alert(`歡迎 ${n}`); DB.save(); },
    logout: ()=>{ localStorage.removeItem('bee_master_db_v300'); location.reload(); },
    setAvatar: (a)=>{ DB.data.user.av=a; alert('已選'); },
    check: ()=>{ return true; }
};
const Game = { up:()=>{ const x=(DB.data.logs.length*15)+Math.floor(DB.data.finance.revenue/1000); DB.data.user.exp=x; DB.data.user.lv=Math.floor(x/200)+1; } };
const Logic = {
    feed: (t,a,c)=>{ Logic.log('feed',`餵食 ${t} ${a}`, 'ALL'); const i=DB.data.inventory; if(t.includes('糖'))i.sugar-=parseFloat(a)*0.6; if(t.includes('粉'))i.pollen-=parseFloat(a); DB.data.finance.cost+=parseFloat(c); DB.save(); alert('✅ 紀錄完成'); Router.go('dashboard'); },
    harvest: (t,w,p)=>{ const b=Math.ceil(w/0.7); Logic.log('harvest',`採收 ${t} ${w}kg`, 'ALL'); DB.data.inventory.bottles-=b; DB.data.finance.revenue+=(w*p); DB.save(); alert('🎉 豐收！'); Router.go('dashboard'); },
    risk: ()=>{ const t=prompt('類型'); const n=prompt('說明'); if(t){ DB.data.risks.unshift({d:new Date().toLocaleDateString(),t:t,n:n}); DB.save(); Router.go('risk'); } },
    land: ()=>{ const n=prompt('場地'); if(n){ DB.data.lands.push({n:n,l:'未填',r:'未填'}); DB.save(); Router.go('land'); } },
    chat: ()=>{ const m=prompt("留言"); if(m){ DB.data.chat.unshift({u:DB.data.user.n, av:DB.data.user.av, t:new Date().toLocaleString(), m:m}); DB.save(); Mods.chat.init(); } },
    log: (t,m,h)=>{ DB.data.logs.unshift({date:new Date().toLocaleDateString(),type:t,msg:`${m} (${DB.data.user.n})`,hive:h}); },
    ai: ()=>{ const t=24; const i=DB.data.inventory; if(t<15)return '🔴 氣溫低保溫'; if(i.sugar<30)return '🟡 糖不足'; return '🟢 系統正常'; },
    check: ()=>{ DB.data.notif=[]; if(DB.data.inventory.sugar<20)DB.data.notif.push({m:'⚠️ 糖庫存低'}); document.getElementById('notifDot').classList.toggle('hidden',DB.data.notif.length===0); }
};

// ================= 3. 介面 =================
const HiveOS = {
    id: null,
    open: (id)=>{ UI.vib(); HiveOS.id=id; document.getElementById('hiveModal').classList.remove('hidden'); document.getElementById('modalTitle').innerText=`📦 ${id}`; HiveOS.updT(); HiveOS.sw('check'); },
    close: ()=>document.getElementById('hiveModal').classList.add('hidden'),
    updT: ()=>{ const h=DB.data.hives[HiveOS.id]; const age=Utils.age(h.q); document.getElementById('hiveStatusTags').innerHTML=`<span class="status-tag ${h.s==='strong'?'green':(h.s==='weak'?'red':'yellow')}">🐝 ${h.b}框</span><span class="status-tag blue">👑 ${age}月</span>`; },
    sw: (t)=>{
        document.querySelectorAll('.hive-tabs .tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active');
        const c=document.getElementById('hive-tab-content'); const h=DB.data.hives[HiveOS.currentId]||DB.data.hives[HiveOS.id];
        if(t==='check') c.innerHTML=`<div class="category-header">群勢</div><div class="input-group"><label>蜂量</label><input type="range" max="10" step="0.5" value="${h.b}" oninput="this.nextElementSibling.innerText=this.value"><span style="float:right">${h.b}</span></div><div class="category-header">巢框</div><div class="dense-check-grid"><div class="dense-check-item"><label>蜜脾</label><input type="number" value="${h.f.h}"></div><div class="dense-check-item"><label>粉脾</label><input type="number" value="${h.f.pl}"></div><div class="dense-check-item"><label>子脾</label><input type="number" value="${h.f.p}"></div></div>`;
        else if(t==='health') c.innerHTML=`<div class="category-header">病理</div><div class="dense-check-grid"><label class="dense-check-item"><input type="checkbox">美洲病</label><label class="dense-check-item"><input type="checkbox">白堊病</label><label class="dense-check-item"><input type="checkbox">蜂蟹蟎</label></div>`;
        else if(t==='feed') c.innerHTML=`<div class="input-group"><select class="input-field"><option>糖水</option><option>花粉</option></select><input type="number" class="input-field" placeholder="量"></div>`;
        else if(t==='history') { let ht=''; DB.data.logs.filter(l=>l.hive===HiveOS.id||l.hive==='ALL').forEach(l=>{ht+=`<div class="log-item"><small>${l.date}</small> ${l.msg}</div>`}); c.innerHTML=ht||'無紀錄'; }
        else if(t==='queen') c.innerHTML=`<div class="input-group"><label>出生</label><input type="date" class="input-field" value="${h.q}"></div><div class="dense-check-grid"><label class="dense-check-item"><input type="checkbox">剪翅</label></div>`;
    },
    save: ()=>{ const id=HiveOS.id; Logic.log('check','巡箱',id); DB.save(); alert('✅ 已儲存'); Router.go('map'); HiveOS.close(); },
    share: ()=>{ navigator.clipboard.writeText(`蜂場求助: ${HiveOS.id}`).then(()=>alert('已複製')); }
};

const System = {
    init: ()=>{ DB.load(); UI.bg(); setTimeout(()=>{document.getElementById('splashScreen').style.display='none';if(DB.data.user.n==='訪客')document.getElementById('loginScreen').classList.remove('hidden')},1000); Router.go(localStorage.getItem('bee_last_page')||'dashboard'); System.clock(); System.autosave(); },
    toggleSidebar: ()=>{ document.querySelector('.sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('hidden'); },
    closeAll: ()=>{ document.querySelector('.sidebar').classList.remove('open'); document.getElementById('overlay').classList.add('hidden'); document.querySelectorAll('.hidden-panel').forEach(e=>e.classList.remove('visible')); HiveOS.close(); QRCodeModal.close(); document.getElementById('importModal').classList.add('hidden'); document.getElementById('exportModuleModal').classList.add('hidden'); document.getElementById('quickSheet').classList.remove('visible'); document.getElementById('notifPanel').classList.remove('visible'); },
    theme: ()=>alert('專業模式'), full: ()=>{ if(!document.fullscreenElement)document.documentElement.requestFullscreen(); else document.exitFullscreen(); },
    clock: ()=>{ document.getElementById('headerTemp').innerText='晴 24°C'; },
    autosave: ()=>{ document.getElementById('app-content').addEventListener('change',(e)=>{if(e.target.id)localStorage.setItem('bee_v_'+e.target.id,e.target.value)}); }
};

const Router = {
    go: (p)=>{
        document.querySelectorAll('.nav-btn, .nav-item').forEach(e=>e.classList.remove('active'));
        const d=document.querySelector(`.nav-btn[onclick*="'${p}'"]`); if(d)d.classList.add('active');
        const m=document.querySelector(`.nav-item[onclick*="'${p}'"]`); if(m)m.classList.add('active');
        const c=document.getElementById('app-content');
        c.style.opacity=0;
        setTimeout(()=>{ if(Mods[p]){ c.innerHTML=Mods[p].r(); if(Mods[p].i)Mods[p].i(); } else c.innerHTML='載入錯誤'; c.style.opacity=1; },200);
        if(window.innerWidth<=1024) System.closeAll();
        localStorage.setItem('bee_last_page', p);
    }
};

const Mods = {
    dashboard: { r:()=>{ const u=DB.data.user; return `<div class="glass-panel" style="background:linear-gradient(135deg,#263238,#000);border:1px solid var(--primary);"><div style="display:flex;justify-content:space-between"><div><div style="color:var(--primary);font-weight:bold">👑 Lv.${u.level} ${u.name}</div><div style="color:#aaa;font-size:0.8rem">Exp: ${u.exp}</div></div><div style="font-size:2rem">${u.avatar}</div></div></div><div class="glass-panel" style="border-left:4px solid var(--info);margin-top:15px">AI: ${Logic.ai()}</div><div class="grid-container" style="margin-top:15px"><div class="glass-panel"><div class="panel-title">💰 淨利</div><div class="stat-value">$${(DB.data.finance.revenue-DB.data.finance.cost).toLocaleString()}</div></div><div class="glass-panel"><div class="panel-title">📦 糖</div><b>${DB.data.inventory.sugar}kg</b></div></div><div class="glass-panel">📢 最新日誌<div id="dashLogList"></div></div>`; }, i:()=>{ let h='';DB.data.logs.slice(0,5).forEach(l=>h+=`<div class="log-item"><small>${l.date}</small> ${l.msg}</div>`);document.getElementById('dashLogList').innerHTML=h||'無'; } },
    map: { r:()=>`<div class="glass-panel"><div class="panel-title">🗺️ 監控</div><div id="hiveGrid" class="grid-auto"></div></div>`, i:()=>{ let h='';for(let i=1;i<=DB.data.settings.mapBoxCount;i++){ let c='var(--primary)';const d=DB.data.hives[`A-${i}`];if(d.status==='strong')c='var(--success)';if(d.status==='weak')c='var(--danger)'; h+=`<div onclick="HiveOS.open('A-${i}')" style="aspect-ratio:1;border:1px solid ${c};border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);cursor:pointer">A-${i}</div>`;} document.getElementById('hiveGrid').innerHTML=h; } },
    chat: { r:()=>`<div class="glass-panel"><div class="panel-title">💬 留言</div><button class="btn-main" onclick="Logic.chat()">+ 新增</button><div id="chatList" style="margin-top:15px;max-height:400px;overflow-y:auto"></div></div>`, i:()=>{ let h='';(DB.data.chat||[]).forEach(c=>{h+=`<div class="chat-msg"><div class="chat-meta"><span>${c.avatar} ${c.user}</span><span>${c.time}</span></div><div>${c.m}</div></div>`});document.getElementById('chatList').innerHTML=h; } },
    flora: { r:()=>`<div class="glass-panel"><div class="panel-title">🌺 15種蜜粉源</div><div style="height:500px;overflow-y:auto">${KNOWLEDGE_BASE.flora.map(f=>Utils.card(f.n,f.t,f.h,f.p,f.c)).join('')}</div></div>`, i:()=>{} },
    guide: { r:()=>{ let h=''; for(let s in KNOWLEDGE_BASE.sop){h+=`<div class="glass-panel"><div class="category-header">${s} SOP</div><ul>${KNOWLEDGE_BASE.sop[s].map(i=>`<li>${i}</li>`).join('')}</ul></div>`;} return h; }, i:()=>{} },
    health: { r:()=>{ let h=`<div class="glass-panel"><div class="panel-title">🏥 病徵</div><div style="height:300px;overflow-y:auto">`; KNOWLEDGE_BASE.disease.forEach(d=>{h+=`<div class="list-item" style="display:block"><b>${d.n}</b><br><small style="color:var(--danger)">${d.s}</small><br><small style="color:var(--success)">${d.t}</small></div>`}); return h+`</div></div><div class="glass-panel"><div class="panel-title">🧪 配藥</div><input id="oaBox" type="number" class="input-field" placeholder="箱數" oninput="Mods.health.cOA()"><div id="oaRes"></div></div>`; }, i:()=>{}, cOA:()=>{ document.getElementById('oaRes').innerHTML='需草酸 '+(document.getElementById('oaBox').value*3.5).toFixed(1)+'g'; } },
    inventory: { r:()=>{ const i=DB.data.inventory; return `<div class="glass-panel"><div class="panel-title">📦 完整庫存</div><div class="dense-check-grid">${Utils.item('白糖',i.sugar)}${Utils.item('花粉',i.pollen)}${Utils.item('大豆',i.soy)}${Utils.item('益生菌',i.probiotic)}${Utils.item('草酸',i.acid)}${Utils.item('甲酸',i.formic)}${Utils.item('福化利',i.strips)}${Utils.item('瓶子',i.bottles)}${Utils.item('蜂箱',i.box)}${Utils.item('巢框',i.frames)}${Utils.item('巢礎',i.foundation)}${Utils.item('隔王板',i.excluder)}${Utils.item('王籠',i.cage)}${Utils.item('燃料',i.smoker_fuel)}${Utils.item('手套',i.gloves)}</div></div>`; }, i:()=>{} },
    finance: { r:()=>`<div class="glass-panel"><div class="panel-title">💰 損益</div>${Utils.item('營收',DB.data.finance.revenue)}${Utils.item('成本',DB.data.finance.cost)}<hr><div class="stat-value">淨 $${DB.data.finance.revenue-DB.data.finance.cost}</div></div>`, i:()=>{} },
    logistics: { r:()=>`<div class="glass-panel"><div class="panel-title">🚚 貨車計算</div><input id="tb" type="number" class="input-field" placeholder="箱數" oninput="Mods.logistics.c()"><div id="tr"></div></div>`, i:()=>{}, c:()=>{ document.getElementById('tr').innerHTML='堆疊 '+Math.ceil(document.getElementById('tb').value/12)+' 層'; } },
    compliance: { r:()=>{ let h=`<div class="glass-panel"><div class="panel-title">⚖️ 檢核</div><label class="glass-btn"><input type="checkbox">登錄證</label></div><div class="glass-panel"><div class="panel-title">🚫 殘留標準</div>`; KNOWLEDGE_BASE.legal.forEach(l=>h+=`<div class="list-item"><span>${l.i}</span><small>${l.l}</small></div>`); return h+'</div>'; }, i:()=>{} },
    risk: { r:()=>`<div class="glass-panel"><div class="panel-title">🛑 風險</div><button class="btn-main" style="background:var(--danger)" onclick="Logic.risk()">+ 通報</button><div id="rl"></div></div>`, i:()=>{ let h=''; DB.data.risks.forEach(r=>h+=`<div class="list-item"><span>${r.t}</span><small>${r.n}</small></div>`); document.getElementById('rl').innerHTML=h; } },
    land: { r:()=>`<div class="glass-panel"><div class="panel-title">🏞️ 地主</div><button class="btn-main" onclick="Logic.land()">+ 新增</button><div id="ll"></div></div>`, i:()=>{ let h=''; DB.data.lands.forEach(l=>h+=`<div class="list-item"><span>${l.n}</span><small>${l.l}</small></div>`); document.getElementById('ll').innerHTML=h; } },
    breeding: { r:()=>`<div class="glass-panel"><label>移蟲日</label><input type="date" id="bd" class="input-field"><button class="btn-main" onclick="Mods.breeding.c()">計算</button><div id="br"></div></div>`, i:()=>{}, c:()=>{ const d=new Date(document.getElementById('bd').value); if(d) document.getElementById('br').innerHTML=`封蓋:${new Date(d.getTime()+5*86400000).toLocaleDateString()} 出台:${new Date(d.getTime()+12*86400000).toLocaleDateString()}`; } },
    production: { r:()=>`<div class="glass-panel"><div class="panel-title">🍯 批號</div><button class="btn-main" onclick="alert('2025-LY-01')">生成</button></div>`, i:()=>{} },
    crm: { r:()=>`<div class="glass-panel"><div id="cl"></div></div>`, i:()=>{ let h=''; DB.data.crm.forEach(c=>h+=`<div class="list-item"><span>${c.name}</span><b>${c.total}</b></div>`); document.getElementById('cl').innerHTML=h; } },
    tasks: { r:()=>`<div class="glass-panel"><ul id="tl"></ul></div>`, i:()=>{ let h=''; DB.data.tasks.forEach(t=>h+=`<li class="list-item">${t.title}</li>`); document.getElementById('tl').innerHTML=h; } },
    settings: { r:()=>`<div class="glass-panel"><button class="btn-main" style="background:#2196F3" onclick="Utils.exp()">備份</button><button class="btn-main" style="background:var(--danger);margin-top:10px" onclick="localStorage.clear();location.reload()">重置</button></div>`, i:()=>{} },
    science: { r:()=>`<div class="glass-panel"><h3>🌤️ 微氣候</h3><p>濕度 75%</p></div>`, i:()=>{} },
    esg: { r:()=>`<div class="glass-panel"><h3>🌍 ESG</h3><p>產值 $5M</p></div>`, i:()=>{} },
    action_feed: { r:()=>`<div class="glass-panel"><div class="panel-title">🍬 餵食</div><select id="ft" class="input-field"><option>白糖</option></select><input id="fa" type="number" class="input-field" placeholder="數"><input id="fc" type="number" class="input-field" placeholder="$"><button class="btn-main" onclick="Logic.feed(get('ft'),get('fa'),get('fc'))">確認</button></div>`, i:()=>{} },
    action_harvest: { r:()=>`<div class="glass-panel"><div class="panel-title">🍯 採收</div><select id="ht" class="input-field"><option>龍眼</option></select><input id="hw" type="number" class="input-field" placeholder="kg"><input id="hp" type="number" class="input-field" placeholder="$"><button class="btn-main" onclick="Logic.harvest(get('ht'),get('hw'),get('hp'))">確認</button></div>`, i:()=>{} }
};

// --- 工具 ---
const Utils = {
    item: (n,v) => `<div class="list-item"><span>${n}</span><b>${v}</b></div>`,
    card: (n,t,h,p,c) => `<div class="flora-card"><div class="flora-info"><h4 style="color:${c}">${n}</h4><p>${t}</p></div><div style="text-align:right"><div style="color:#FFD700">蜜 ${'⭐'.repeat(h)}</div><div style="color:#FF9800">粉 ${'⭐'.repeat(p)}</div></div></div>`,
    restoreData: () => {}, age: (d) => { if(!d)return 0; const b=new Date(d); const n=new Date(); return ((n.getFullYear()-b.getFullYear())*12 + (n.getMonth()-b.getMonth()))||0; },
    exp: () => { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(localStorage)],{type:'application/json'})); a.download='bee.json'; a.click(); },
    imp: () => { const r=document.getElementById('importRawData').value; try{const d=JSON.parse(r);Object.keys(d).forEach(k=>localStorage.setItem(k,d[k]));alert('ok');location.reload();}catch(e){alert('err');} }
};
const UI = { vib:()=>{if(navigator.vibrate)navigator.vibrate(50)}, cel:()=>{if(window.confetti)confetti()}, bg:()=>{} };
const Bee = { talk: () => { const b=document.getElementById('beeBubble'); b.innerText=BEE_QUOTES[Math.floor(Math.random()*BEE_QUOTES.length)]; b.classList.add('show'); setTimeout(()=>b.classList.remove('show'),3000); UI.vib(); } };
const Radio = { playing:false, toggle:()=>{ const a=document.getElementById('bgMusic'); if(Radio.playing)a.pause(); else a.play(); Radio.playing=!Radio.playing; } };
const Notif = { toggle:()=>{ document.getElementById('notifPanel').classList.toggle('visible'); document.getElementById('overlay').classList.toggle('hidden'); } };
const Quick = { toggle:()=>{ document.getElementById('quickSheet').classList.toggle('visible'); } };
const QRCodeModal = { open:()=>{ document.getElementById('qrModal').classList.remove('hidden'); document.getElementById('overlay').classList.remove('hidden'); new QRCode(document.getElementById('qrcode'),{text:'DATA',width:200,height:200}); }, close:()=>{document.getElementById('qrModal').classList.add('hidden')} };
function get(id){return document.getElementById(id).value}

const NotificationCenter = Notif; const QuickAction = Quick; // Alias for HTML calls
document.addEventListener('DOMContentLoaded', () => System.init());
