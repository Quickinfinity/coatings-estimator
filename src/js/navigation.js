// ═══════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════
function showScreen(id){window.scrollTo({top:0,behavior:'smooth'})}
function goHome(){flushAutoSave();Object.assign(nav,{screen:'home',folderStatus:null,folderActive:true,recordId:null,estimateId:null,systemId:null,invoiceId:null});renderBreadcrumb();renderHome();showScreen('home');updateSidebarActive();closeMobileSidebar()}
function goFolder(s,a){flushAutoSave();nav.screen='list';nav.folderStatus=s;nav.folderActive=a;nav.recordId=null;nav.estimateId=null;nav.systemId=null;renderBreadcrumb();renderList();showScreen('list');updateSidebarActive();closeMobileSidebar()}
function goRecord(id){flushAutoSave();nav.screen='record';nav.recordId=id;nav.estimateId=null;nav.systemId=null;renderBreadcrumb();renderRecord();showScreen('record');updateSidebarActive();setTimeout(()=>{const f=document.getElementById('recFirst');if(f&&!f.value)f.focus()},150)}
function goEstimate(id){flushAutoSave();nav.screen='estimate';nav.estimateId=id;nav.systemId=null;renderBreadcrumb();renderEstimate();showScreen('estimate');updateSidebarActive()}
function goSystem(id){flushAutoSave();nav.screen='system';nav.systemId=id;renderBreadcrumb();renderSystem();showScreen('system');updateSidebarActive()}
function goInvoice(id){flushAutoSave();nav.screen='invoice';nav.invoiceId=id;renderBreadcrumb();renderInvoice();showScreen('invoice');updateSidebarActive()}
function goReporting(){flushAutoSave();Object.assign(nav,{screen:'reporting',folderStatus:null,folderActive:true,recordId:null,estimateId:null,systemId:null,invoiceId:null});renderBreadcrumb();renderReporting();showScreen('reporting');updateSidebarActive()}
function goSettings(){flushAutoSave();Object.assign(nav,{screen:'settings',folderStatus:null,folderActive:true,recordId:null,estimateId:null,systemId:null,invoiceId:null});renderBreadcrumb();renderSettings();showScreen('settings');updateSidebarActive()}
function newRecordFromHeader(){nav.folderStatus='lead';nav.folderActive=true;newRecord()}
let estTab='areas';
function switchEstTab(tab){
  estTab=tab;
  document.querySelectorAll('#estTabs .tab-btn').forEach(b=>b.classList.remove('ac'));
  document.querySelector('#estTabs .tab-btn[onclick*="'+tab+'"]').classList.add('ac');
  document.getElementById('estTabAreas').style.display=tab==='areas'?'':'none';
  document.getElementById('estTabOrderlist').style.display=tab==='orderlist'?'':'none';
  document.getElementById('estTabContract').style.display=tab==='contract'?'':'none';
  document.getElementById('estTabInvoices').style.display=tab==='invoices'?'':'none';
  if(tab==='orderlist')renderOrderList();
  if(tab==='contract')initSignaturePads();
  if(tab==='invoices')renderInvoicesList();
}

function renderBreadcrumb(){
  const el=document.getElementById('breadcrumb');
  let p=['<span onclick="goHome()">Home</span>'];
  if(nav.folderStatus){const st=STATUSES.find(s=>s.id===nav.folderStatus);p.push('<span class="sep">&#8250;</span>','<span onclick="goFolder(\''+nav.folderStatus+'\','+nav.folderActive+')">'+(nav.folderActive?'':'Inactive ')+st.label+'s</span>')}
  if(nav.recordId){const r=db.records.find(r=>r.id===nav.recordId);if(r){p.push('<span class="sep">&#8250;</span>','<span onclick="goRecord(\''+r.id+'\')">'+(r.firstName||r.lastName?r.firstName+' '+r.lastName:'Unnamed').trim()+'</span>')}}
  if(nav.estimateId){const r=db.records.find(r=>r.id===nav.recordId);const e=r?r.estimates.find(e=>e.id===nav.estimateId):null;if(e){p.push('<span class="sep">&#8250;</span>','<span onclick="goEstimate(\''+e.id+'\')">'+(e.name||'Estimate')+'</span>')}}
  if(nav.systemId){const r=db.records.find(r=>r.id===nav.recordId);const e=r?r.estimates.find(e=>e.id===nav.estimateId):null;const s=e?e.systems.find(s=>s.id===nav.systemId):null;if(s)p.push('<span class="sep">&#8250;</span>','<span class="current">'+(s.areaName||'New Area')+'</span>')}
  if(nav.invoiceId){const inv=getInvoiceById(nav.invoiceId);if(inv)p.push('<span class="sep">&#8250;</span>','<span class="current">'+inv.number+'</span>')}
  if(nav.screen==='reporting')p.push('<span class="sep">&#8250;</span>','<span class="current">Reports</span>');
  if(nav.screen==='invoices-all')p.push('<span class="sep">&#8250;</span>','<span class="current">Invoices</span>');
  if(nav.screen==='settings')p.push('<span class="sep">&#8250;</span>','<span class="current">Settings</span>');
  if(nav.screen==='calendar')p.push('<span class="sep">&#8250;</span>','<span class="current">Calendar</span>');
  el.innerHTML=p.join('');
}

// ═══════════════════════════════════════════════════════════
// COST HELPERS
// ═══════════════════════════════════════════════════════════
function calcSysCosts(sys){
  const sqft=sys.sqft||0;
  const sr=sys.sellRate||0;
  const prod=getAllProducts().find(p=>p.id===sys.productId);
  const tc=getAllTopcoats().find(t=>t.id===sys.topcoatId);
  let sellTotal=sqft*sr;
  let costTotal=(prod?prod.cost*sqft:0)+(tc?tc.cost*sqft:0);
  if(sys.repairs){Object.entries(sys.repairs).forEach(([id,r])=>{if(r.on){const def=getAllRepairs().find(x=>x.id===id);if(def){const qty=r.qty||0;costTotal+=def.cost*qty;sellTotal+=((r.sell||0)*qty)}}})}
  if(sys.addons){Object.entries(sys.addons).forEach(([id,a])=>{if(a.on){const def=getAllAddons().find(x=>x.id===id);if(def){const qty=a.qty||0;costTotal+=def.cost*qty;sellTotal+=((a.sell||0)*qty)}}})}
  if(sys.customLineItems){sys.customLineItems.forEach(li=>{sellTotal+=(li.qty||0)*(li.rate||0)})}
  const taxRate=settings.taxRate||0;
  const taxable=sys.taxable!==false;
  const taxAmount=(taxable&&taxRate>0)?(sellTotal*taxRate/100):0;
  return{sell:sellTotal,cost:costTotal,profit:sellTotal-costTotal,margin:sellTotal>0?((sellTotal-costTotal)/sellTotal*100):0,taxAmount,sellWithTax:sellTotal+taxAmount};
}
function calcEstCosts(est){
  let sell=0,cost=0,tax=0;
  est.systems.forEach(sys=>{const c=calcSysCosts(sys);sell+=c.sell;cost+=c.cost;tax+=c.taxAmount});
  return{sell,cost,profit:sell-cost,margin:sell>0?((sell-cost)/sell*100):0,sqft:est.systems.reduce((s,sys)=>s+(sys.sqft||0),0),taxAmount:tax,totalWithTax:sell+tax};
}
function calcRecCosts(rec){
  let sell=0,cost=0,tax=0;
  rec.estimates.forEach(est=>{const c=calcEstCosts(est);sell+=c.sell;cost+=c.cost;tax+=c.taxAmount});
  return{sell,cost,taxAmount:tax,totalWithTax:sell+tax};
}

// ═══════════════════════════════════════════════════════════
// ACTIVITY LOG
// ═══════════════════════════════════════════════════════════
function logActivity(recordId,type,message){
  const rec=db.records.find(r=>r.id===recordId);if(!rec)return;
  if(!rec.activityLog)rec.activityLog=[];
  rec.activityLog.unshift({id:uid(),timestamp:new Date().toISOString(),type,message});
  rec.updatedAt=new Date().toISOString();
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════
function toggleSidebar(){
  const sb=document.getElementById('sidebar');
  sb.classList.toggle('collapsed');
  document.body.classList.toggle('sb-collapsed');
  const btn=sb.querySelector('.sb-toggle');
  btn.innerHTML=sb.classList.contains('collapsed')?'&#9654;':'&#9664;';
  localStorage.setItem('ce_sidebar_collapsed',sb.classList.contains('collapsed'));
}
function updateSidebarActive(){
  document.querySelectorAll('#sidebar .sb-item').forEach(el=>el.classList.remove('active'));
  let screen=nav.screen;
  if(screen==='list'||screen==='record'||screen==='estimate'||screen==='system'){
    const item=document.querySelector('#sidebar .sb-item[data-screen="'+nav.folderStatus+'"]');
    if(item)item.classList.add('active');
  }else{
    const item=document.querySelector('#sidebar .sb-item[data-screen="'+screen+'"]');
    if(item)item.classList.add('active');
  }
}
function toggleMobileSidebar(){
  const sb=document.getElementById('sidebar');
  sb.classList.toggle('mobile-open');
  document.getElementById('sbOverlay').classList.toggle('active');
}
function closeMobileSidebar(){
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sbOverlay').classList.remove('active');
}
function initSidebar(){
  if(localStorage.getItem('ce_sidebar_collapsed')==='true'){
    document.getElementById('sidebar').classList.add('collapsed');
    document.body.classList.add('sb-collapsed');
    document.querySelector('#sidebar .sb-toggle').innerHTML='&#9654;';
  }
}

// ── Keyboard Shortcuts ──────────────────────────────────────
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    closeConfirm();closeExport();closeImport();closePaymentModal();closeQuickAdd();closeMobileSidebar();
    const gs=document.getElementById('globalSearchResults');if(gs)gs.style.display='none';
  }
  if((e.metaKey||e.ctrlKey)&&e.key==='s'){
    e.preventDefault();
    if(nav.screen==='system'){saveSystem();flashSaveBtn('sysSaveBtn')}
    else if(nav.screen==='estimate'){saveEstimate()}
    else if(nav.screen==='record'){saveRecord();flashSaveBtn('saveRecordBtn')}
    else if(nav.screen==='settings'){saveSettings()}
    else if(nav.screen==='invoice'){const inv=getInvoiceById(nav.invoiceId);if(inv){updateInvoiceField('notes',document.getElementById('invNotes').value);toast('Saved','Invoice updated.')}}
  }
});
document.addEventListener('click',function(e){
  const gs=document.getElementById('globalSearchResults');
  const gi=document.getElementById('globalSearch');
  if(gs&&gi&&!gs.contains(e.target)&&e.target!==gi)gs.style.display='none';
});
