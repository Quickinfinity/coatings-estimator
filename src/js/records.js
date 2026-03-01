// ═══════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════
function renderHome(){
  // Greeting
  const now=new Date();const hour=now.getHours();
  const greeting=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  const dateStr=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  document.getElementById('homeGreeting').innerHTML='<div style="font-size:13px;color:var(--t3);margin-bottom:4px">'+dateStr+'</div><h2 style="font-size:22px;font-weight:700;letter-spacing:-.5px;margin-bottom:20px">'+greeting+'</h2>';
  // Counts and values
  const c={};const vals={};
  STATUSES.forEach(s=>{c[s.id]={active:0,inactive:0};vals[s.id]=0});
  db.records.forEach(r=>{if(c[r.status]){c[r.status][r.active?'active':'inactive']++;if(r.active)vals[r.status]+=calcRecCosts(r).totalWithTax}});
  // Workflow cards — enhanced with contextual counts
  const todayStr=new Date().toISOString().slice(0,10);
  const newToday=db.records.filter(r=>r.status==='lead'&&r.active&&r.createdAt&&r.createdAt.slice(0,10)===todayStr).length;
  const quotesSent=db.records.filter(r=>r.status==='estimate'&&r.active).reduce((s,r)=>s+r.estimates.filter(e=>e.quoteStatus==='sent').length,0);
  const next7=new Date();next7.setDate(next7.getDate()+7);const next7Str=next7.toISOString().slice(0,10);
  const startingSoon=db.records.filter(r=>r.status==='project'&&r.active&&r.projectStartDate&&r.projectStartDate>=todayStr&&r.projectStartDate<=next7Str).length;
  document.getElementById('workflowCards').innerHTML=
    '<div class="wf-card lead" onclick="goFolder(\'lead\',true)"><div class="wf-num">'+c.lead.active+'</div><div class="wf-label">New Leads</div><div class="wf-links"><div class="wf-link" onclick="event.stopPropagation();goFolder(\'lead\',true)"><span>Active</span><span class="wf-val">'+c.lead.active+'</span></div>'+(newToday?'<div class="wf-link"><span style="color:var(--lead)">New today</span><span class="wf-val" style="color:var(--lead)">'+newToday+'</span></div>':'<div class="wf-link" onclick="event.stopPropagation();goFolder(\'lead\',false)"><span>Archived</span><span class="wf-val">'+c.lead.inactive+'</span></div>')+'</div></div>'+
    '<div class="wf-card est" onclick="goFolder(\'estimate\',true)"><div class="wf-num">'+c.estimate.active+'</div><div class="wf-label">Estimates</div><div class="wf-links"><div class="wf-link"><span>Pipeline</span><span class="wf-val">'+fmt(vals.estimate)+'</span></div>'+(quotesSent?'<div class="wf-link"><span style="color:var(--info)">Quotes sent</span><span class="wf-val" style="color:var(--info)">'+quotesSent+'</span></div>':'<div class="wf-link" onclick="event.stopPropagation();goFolder(\'estimate\',true)"><span>Active</span><span class="wf-val">'+c.estimate.active+'</span></div>')+'</div></div>'+
    '<div class="wf-card proj" onclick="goFolder(\'project\',true)"><div class="wf-num">'+c.project.active+'</div><div class="wf-label">Projects</div><div class="wf-links"><div class="wf-link"><span>Value</span><span class="wf-val">'+fmt(vals.project)+'</span></div>'+(startingSoon?'<div class="wf-link"><span style="color:var(--proj)">Starting soon</span><span class="wf-val" style="color:var(--proj)">'+startingSoon+'</span></div>':'<div class="wf-link" onclick="event.stopPropagation();goFolder(\'project\',true)"><span>Active</span><span class="wf-val">'+c.project.active+'</span></div>')+'</div></div>'+
    '<div class="wf-card comp" onclick="goFolder(\'completed\',true)"><div class="wf-num">'+c.completed.active+'</div><div class="wf-label">Completed</div><div class="wf-links"><div class="wf-link" onclick="event.stopPropagation();invFilter=\'invoiced\';goFolder(\'completed\',true)"><span>Invoiced</span><span class="wf-val">'+db.records.filter(r=>r.status==='completed'&&r.active&&isRecordInvoiced(r)).length+'</span></div><div class="wf-link" onclick="event.stopPropagation();invFilter=\'need\';goFolder(\'completed\',true)"><span style="color:var(--accent)">Need Invoiced</span><span class="wf-val" style="color:var(--accent)">'+db.records.filter(r=>r.status==='completed'&&r.active&&!isRecordInvoiced(r)).length+'</span></div></div></div>';
  // Overdue alert
  const overdueInvs=getAllInvoices().filter(x=>x.invoice.status==='overdue');
  if(overdueInvs.length){
    const overdueTotal=overdueInvs.reduce((s,x)=>s+x.invoice.balance,0);
    document.getElementById('overdueAlert').innerHTML='<div onclick="goAllInvoices()" style="padding:14px 18px;border-radius:12px;border:1px solid rgba(248,113,113,.3);background:rgba(248,113,113,.08);cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:12px"><div style="font-size:24px">\u26A0</div><div><div style="font-weight:600;font-size:14px;color:#f87171">'+overdueInvs.length+' Overdue Invoice'+(overdueInvs.length>1?'s':'')+'</div><div style="font-size:12px;color:var(--t3)">'+fmt(overdueTotal)+' outstanding \u2014 click to view</div></div></div>';
  }else{document.getElementById('overdueAlert').innerHTML=''}
  // Recent Activity
  const recent=db.records.slice().sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt)).slice(0,6);
  if(recent.length){
    document.getElementById('recentActivity').innerHTML=recent.map(r=>{
      const name=((r.firstName||'')+' '+(r.lastName||'')).trim()||'Unnamed';
      const ago=timeAgo(new Date(r.updatedAt||r.createdAt));
      return'<div class="list-item" onclick="goFolder(\''+r.status+'\','+r.active+');setTimeout(()=>goRecord(\''+r.id+'\'),50)" style="margin-bottom:4px;padding:10px 14px"><div class="li-left"><div class="li-avatar '+r.status+'" style="width:32px;height:32px;font-size:11px;border-radius:8px">'+((r.firstName||'?')[0]+(r.lastName||'?')[0]).toUpperCase()+'</div><div><div class="li-name" style="font-size:13px">'+name+'</div><div class="li-meta">'+ago+'</div></div></div><div class="li-right"><div class="li-badge '+r.status+'">'+r.status+'</div></div></div>'
    }).join('');
  }else{document.getElementById('recentActivity').innerHTML='<div class="empty"><div class="empty-text">No activity yet. Create your first lead!</div></div>'}
  // Follow-ups due
  renderFollowUpSection();
  // Business Performance with Trends
  const activeRecs=db.records.filter(r=>r.active);
  const totalPipeline=activeRecs.reduce((s,r)=>s+calcRecCosts(r).totalWithTax,0);
  const completedRecs=activeRecs.filter(r=>r.status==='completed');
  const totalRevenue=completedRecs.reduce((s,r)=>s+calcRecCosts(r).totalWithTax,0);
  const avgJob=completedRecs.length>0?totalRevenue/completedRecs.length:0;
  // Monthly revenue trend
  const mNow=new Date();const mStart=new Date(mNow.getFullYear(),mNow.getMonth(),1).toISOString().slice(0,10);
  const mPrevStart=new Date(mNow.getFullYear(),mNow.getMonth()-1,1).toISOString().slice(0,10);
  const mPrevEnd=new Date(mNow.getFullYear(),mNow.getMonth(),0).toISOString().slice(0,10);
  const thisMonthRev=completedRecs.filter(r=>r.updatedAt&&r.updatedAt.slice(0,10)>=mStart).reduce((s,r)=>s+calcRecCosts(r).totalWithTax,0);
  const lastMonthRev=completedRecs.filter(r=>r.updatedAt&&r.updatedAt.slice(0,10)>=mPrevStart&&r.updatedAt.slice(0,10)<=mPrevEnd).reduce((s,r)=>s+calcRecCosts(r).totalWithTax,0);
  const revTrend=lastMonthRev>0?Math.round((thisMonthRev-lastMonthRev)/lastMonthRev*100):0;
  const revArrow=revTrend>0?'<span style="color:var(--success);font-size:11px"> &#9650; '+revTrend+'%</span>':revTrend<0?'<span style="color:#f87171;font-size:11px"> &#9660; '+Math.abs(revTrend)+'%</span>':'';
  // Win rate
  const quoteSent=db.records.filter(r=>r.active&&r.estimates.some(e=>e.quoteStatus==='sent'||e.quoteStatus==='approved'||e.quoteStatus==='declined'));
  const approved=db.records.filter(r=>r.active&&r.estimates.some(e=>e.quoteStatus==='approved')).length;
  const declined=db.records.filter(r=>r.active&&r.estimates.some(e=>e.quoteStatus==='declined')).length;
  const winRate=approved+declined>0?Math.round(approved/(approved+declined)*100):0;
  // Avg days to close
  const closedRecs=completedRecs.filter(r=>r.createdAt);
  const avgClose=closedRecs.length>0?Math.round(closedRecs.reduce((s,r)=>{const d=(new Date(r.updatedAt||r.createdAt)-new Date(r.createdAt))/(1000*60*60*24);return s+Math.max(0,d)},0)/closedRecs.length):0;
  document.getElementById('perfCards').innerHTML=
    '<div class="sx hl"><div class="sl">Active Pipeline</div><div class="sv">'+fmt(totalPipeline)+'</div></div>'+
    '<div class="sx"><div class="sl">This Month'+revArrow+'</div><div class="sv" style="color:var(--success)">'+fmt(thisMonthRev)+'</div></div>'+
    '<div class="sx"><div class="sl">Total Revenue</div><div class="sv">'+fmt(totalRevenue)+'</div></div>'+
    '<div class="sx"><div class="sl">Win Rate</div><div class="sv">'+(winRate?winRate+'%':'\u2014')+'</div></div>'+
    '<div class="sx"><div class="sl">Avg Close</div><div class="sv">'+(avgClose?avgClose+' days':'\u2014')+'</div></div>'+
    '<div class="sx"><div class="sl">Avg Job Size</div><div class="sv">'+fmt(avgJob)+'</div></div>';
  // Lead Source breakdown
  const lsData={};
  activeRecs.forEach(r=>{if(r.leadSource){lsData[r.leadSource]=(lsData[r.leadSource]||0)+1}});
  if(Object.keys(lsData).length>0){
    const sorted=Object.entries(lsData).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const maxCount=sorted[0][1];
    document.getElementById('leadSourceChart').innerHTML='<div style="font-size:12px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Top Lead Sources</div>'+sorted.map(([src,count])=>'<div class="bar-row"><div class="bar-label">'+esc(src)+'</div><div class="bar-track"><div class="bar-fill" style="width:'+Math.round(count/maxCount*100)+'%"></div></div><div class="bar-val">'+count+'</div></div>').join('');
  }else{document.getElementById('leadSourceChart').innerHTML=''}
  // Archived folders (hidden by default)
  document.getElementById('inactiveFolders').innerHTML=STATUSES.map(s=>'<div class="folder '+s.color+' inactive" onclick="goFolder(\''+s.id+'\',false)" style="padding:16px"><div class="f-icon" style="margin-bottom:8px;width:32px;height:32px;font-size:14px">'+FOLDER_ICONS[s.id]+'</div><div class="f-count" style="font-size:20px">'+c[s.id].inactive+'</div><div class="f-label" style="font-size:11px">Inactive '+s.label+'s</div></div>').join('');
}
function toggleArchived(){
  const el=document.getElementById('archivedSection');
  el.style.display=el.style.display==='none'?'block':'none';
}
function globalSearchRender(){
  const q=(document.getElementById('globalSearch').value||'').toLowerCase().trim();
  const box=document.getElementById('globalSearchResults');
  if(!q||q.length<2){box.style.display='none';return}
  const results=db.records.filter(r=>[r.firstName,r.lastName,r.company,r.address,r.city,r.email,r.phone,r.notes].join(' ').toLowerCase().includes(q)).slice(0,8);
  if(!results.length){box.innerHTML='<div style="padding:12px;font-size:12px;color:var(--t4)">No results found.</div>';box.style.display='block';return}
  box.innerHTML=results.map(r=>{
    const name=((r.firstName||'')+' '+(r.lastName||'')).trim()||'Unnamed';
    const ini=((r.firstName||'?')[0]+(r.lastName||'?')[0]).toUpperCase();
    const meta=[r.company,r.city,r.phone].filter(Boolean).join(' \u00b7 ');
    return'<div class="list-item" onclick="document.getElementById(\'globalSearch\').value=\'\';document.getElementById(\'globalSearchResults\').style.display=\'none\';goFolder(\''+r.status+'\','+r.active+');setTimeout(()=>goRecord(\''+r.id+'\'),50)" style="padding:10px 14px;cursor:pointer"><div class="li-left"><div class="li-avatar '+r.status+'" style="width:28px;height:28px;font-size:10px;border-radius:6px">'+ini+'</div><div><div class="li-name" style="font-size:13px">'+name+'</div><div class="li-meta">'+meta+'</div></div></div><div class="li-right"><div class="li-badge '+r.status+'" style="font-size:10px">'+r.status+'</div></div></div>'
  }).join('');
  box.style.display='block';
}

// ═══════════════════════════════════════════════════════════
// LIST
// ═══════════════════════════════════════════════════════════
let invFilter='all';let batchMode=false;let batchSelected=new Set();
function toggleBatchMode(){
  batchMode=!batchMode;batchSelected.clear();
  document.getElementById('batchBar').style.display=batchMode?'':'none';
  document.getElementById('batchToggleBtn').textContent=batchMode?'Cancel':'Select';
  filterList();
}
function toggleBatchItem(id,ev){
  ev.stopPropagation();if(batchSelected.has(id))batchSelected.delete(id);else batchSelected.add(id);
  document.getElementById('batchCount').textContent=batchSelected.size+' selected';
  document.getElementById('bc-'+id).checked=batchSelected.has(id);
}
function batchMoveStatus(){
  if(!batchSelected.size)return;
  const target=document.getElementById('batchStatusTarget').value;
  batchSelected.forEach(id=>{const r=db.records.find(x=>x.id===id);if(r){logActivity(r.id,'status_change','Moved to '+target+' (batch)');r.status=target;r.updatedAt=new Date().toISOString()}});
  saveDB(db);toggleBatchMode();filterList();toast('Batch Update',batchSelected.size+' record(s) moved to '+target+'.');
}
function batchArchive(){
  if(!batchSelected.size)return;
  const n=batchSelected.size;
  batchSelected.forEach(id=>{const r=db.records.find(x=>x.id===id);if(r){r.active=false;r.updatedAt=new Date().toISOString();logActivity(r.id,'archived','Archived (batch)')}});
  saveDB(db);toggleBatchMode();filterList();toast('Archived',n+' record(s) archived.');
}
function batchDelete(){
  if(!batchSelected.size)return;
  const n=batchSelected.size;
  openConfirm('Batch Delete','Permanently delete '+n+' record(s)? This cannot be undone.',()=>{
    batchSelected.forEach(id=>{db.records=db.records.filter(r=>r.id!==id)});
    saveDB(db);toggleBatchMode();filterList();toast('Deleted',n+' record(s) deleted.');
  });
}
function isRecordInvoiced(r){
  if(!r.estimates.length)return false;
  return r.estimates.every(e=>e.invoices&&e.invoices.length>0);
}
function quickInvoiceRecord(recId){
  const rec=db.records.find(r=>r.id===recId);if(!rec)return;
  // Find first estimate without an invoice
  const est=rec.estimates.find(e=>!e.invoices||!e.invoices.length);
  if(!est){goRecord(recId);return}
  // Navigate to the record/estimate and create an invoice
  nav.recordId=recId;nav.folderStatus=rec.status;nav.folderActive=rec.active;nav.estimateId=est.id;
  // Create the invoice automatically
  if(!est.invoices)est.invoices=[];
  const ec=calcEstCosts(est);
  const items=est.systems.map(sys=>{const sc=calcSysCosts(sys);const prod=getAllProducts().find(p=>p.id===sys.productId);return{description:(sys.areaName||'Area')+' \u2014 '+(prod?prod.name:'Custom')+' ('+sys.sqft+' sqft)',qty:1,unit:'ea',rate:sc.sell,amount:sc.sell,taxable:sys.taxable!==false}});
  const termDays={due_on_receipt:0,net15:15,net30:30,net60:60};
  const due=new Date();due.setDate(due.getDate()+(termDays[settings.paymentTerms]||30));
  const inv={id:uid(),number:getNextInvoiceNumber(),createdAt:new Date().toISOString(),dueDate:due.toISOString().slice(0,10),status:'draft',type:'standard',lineItems:items,subtotal:ec.sell,taxRate:settings.taxRate||0,taxAmount:ec.taxAmount,total:ec.sell+ec.taxAmount,depositPercent:null,discountType:'none',discountValue:0,discountAmount:0,payments:[],amountPaid:0,balance:ec.sell+ec.taxAmount,notes:'',sentAt:null};
  est.invoices.push(inv);
  logActivity(rec.id,'invoice_created','Invoice '+inv.number+' created ('+fmt(inv.total)+')');
  saveDB(db);goInvoice(inv.id);toast('Invoice Created',inv.number+' for '+(est.name||'Estimate'));
}
function setInvFilter(f){
  invFilter=f;
  document.querySelectorAll('#invoiceFilterBar .tab-btn').forEach(b=>b.classList.remove('ac'));
  document.querySelector('#invoiceFilterBar .tab-btn[onclick*="\''+f+'\'"]').classList.add('ac');
  filterList();
}
function renderList(){
  const st=STATUSES.find(s=>s.id===nav.folderStatus);
  const prefix=nav.folderActive?'':'Inactive ';
  document.getElementById('listHeader').innerHTML='<h2>'+prefix+st.label+'s</h2><p>'+getListDesc(st.id,nav.folderActive)+'</p>';
  document.getElementById('newLeadBtn').style.display=(nav.folderStatus==='lead'&&nav.folderActive)?'':'none';
  // Show invoice filter bar only for Completed
  const showInvFilter=(nav.folderStatus==='completed'&&nav.folderActive);
  document.getElementById('invoiceFilterBar').style.display=showInvFilter?'':'none';
  if(!showInvFilter)invFilter='all';
  document.getElementById('searchInput').value='';populateTagFilter();filterList();
}
function getListDesc(s,a){if(!a)return'Archived records.';return{lead:'New contacts and inquiries.',estimate:'Leads with quotes ready for review.',project:'Jobs on your calendar.',completed:'Finished jobs.'}[s]||''}
function filterList(){
  const q=(document.getElementById('searchInput').value||'').toLowerCase();
  const tagVal=(document.getElementById('tagFilter')||{}).value||'';
  let items=db.records.filter(r=>r.status===nav.folderStatus&&r.active===nav.folderActive);
  // Apply invoice sub-filter for Completed
  if(nav.folderStatus==='completed'&&invFilter==='invoiced')items=items.filter(r=>isRecordInvoiced(r));
  if(nav.folderStatus==='completed'&&invFilter==='need')items=items.filter(r=>!isRecordInvoiced(r));
  if(tagVal)items=items.filter(r=>(r.tags||[]).includes(tagVal));
  const f=q?items.filter(r=>[r.firstName,r.lastName,r.company,r.address,r.city,r.email,r.phone,r.notes].join(' ').toLowerCase().includes(q)):items;
  if(!f.length){document.getElementById('listItems').innerHTML='<div class="empty"><div class="empty-icon">&#128194;</div><div class="empty-text">'+(invFilter!=='all'?'No records match this filter.':'No records here yet.')+'</div></div>';return}
  document.getElementById('listItems').innerHTML=f.map(r=>{
    const name=(r.firstName||'')+' '+(r.lastName||'');
    const ini=((r.firstName||'?')[0]+(r.lastName||'?')[0]).toUpperCase();
    const ec=r.estimates.length;
    const tot=calcRecCosts(r).totalWithTax;
    const invoiced=isRecordInvoiced(r);
    const invLabel=r.status==='completed'?(invoiced?'<span style="color:var(--success);font-size:11px;margin-left:6px">INVOICED</span>':'<span style="color:var(--accent);font-size:11px;margin-left:6px">NEED INVOICED</span>'):'';
    const meta=[r.company,r.city&&r.state?r.city+', '+r.state:r.city||r.state,ec?ec+' estimate'+(ec>1?'s':''):''].filter(Boolean).join(' \u00b7 ');
    const invoiceBtn=r.status==='completed'&&!invoiced?'<button class="btn btn-primary" onclick="event.stopPropagation();quickInvoiceRecord(\''+r.id+'\')" style="font-size:11px;padding:4px 12px;white-space:nowrap">Invoice</button>':'';
    const batchCb=batchMode?'<input type="checkbox" id="bc-'+r.id+'" '+(batchSelected.has(r.id)?'checked':'')+' onclick="toggleBatchItem(\''+r.id+'\',event)" style="width:18px;height:18px;margin-right:8px;flex-shrink:0;cursor:pointer">':'';
    return'<div class="list-item" onclick="'+(batchMode?'toggleBatchItem(\''+r.id+'\',event)':'goRecord(\''+r.id+'\')')+'"><div class="li-left">'+batchCb+'<div class="li-avatar '+r.status+'">'+ini+'</div><div><div class="li-name">'+name.trim()+invLabel+'</div><div class="li-meta">'+meta+(r.leadSource?' <span style="color:var(--accent);font-size:11px">\u25CF '+esc(r.leadSource)+'</span>':'')+'</div></div></div><div class="li-right" style="display:flex;align-items:center;gap:8px">'+invoiceBtn+(tot>0?'<div class="li-amount">'+fmt(tot)+'</div>':'')+'<div class="li-badge '+r.status+'">'+r.status+'</div></div></div>'
  }).join('');
}

// ═══════════════════════════════════════════════════════════
// RECORD
// ═══════════════════════════════════════════════════════════
function getRecord(){return db.records.find(r=>r.id===nav.recordId)}
function renderRecord(){
  const rec=getRecord();if(!rec){goHome();return}
  const name=((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'New Lead';
  // Stage-aware header
  const recTotal=calcRecCosts(rec);
  let headerSub='';
  if(rec.status==='lead')headerSub='<span class="li-badge lead" style="font-size:10px">New Lead</span>';
  else if(rec.status==='estimate'){const ec=rec.estimates.length;const sent=rec.estimates.filter(e=>e.quoteStatus==='sent').length;headerSub='<span style="font-size:12px;color:var(--t3)">'+ec+' estimate'+(ec!==1?'s':'')+' \u00b7 '+fmt(recTotal.totalWithTax)+(sent?' \u00b7 '+sent+' sent':'')+'</span>'}
  else if(rec.status==='project'){const sd=rec.projectStartDate;const ed=rec.projectEndDate;headerSub=sd?'<span style="font-size:12px;color:var(--t3)">'+new Date(sd+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})+(ed?' \u2013 '+new Date(ed+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'')+'</span>':'<span style="font-size:12px;color:var(--accent)">Unscheduled</span>'}
  else if(rec.status==='completed'){const inv=isRecordInvoiced(rec);headerSub='<span style="font-size:12px;color:var(--t3)">'+fmt(recTotal.totalWithTax)+(inv?' \u00b7 <span style="color:var(--success)">Invoiced</span>':' \u00b7 <span style="color:var(--accent)">Needs Invoice</span>')+'</span>'}
  document.getElementById('recordHeader').innerHTML='<h2>'+name+'</h2>'+(rec.company?'<p style="color:var(--t3);font-size:13px;margin-bottom:2px">'+rec.company+'</p>':'')+headerSub;
  document.getElementById('statusPills').innerHTML=STATUSES.map(s=>'<button class="status-pill '+s.color+(rec.status===s.id?' active':'')+'" onclick="changeStatus(\''+s.id+'\')">'+s.label+'</button>').join('');
  document.getElementById('recActive').checked=rec.active;
  renderDuplicateWarning();
  // Project details card
  const showProject=rec.status==='project'||rec.status==='completed';
  document.getElementById('projectDetailsCard').style.display=showProject?'':'none';
  if(showProject){document.getElementById('recStartDate').value=rec.projectStartDate||'';document.getElementById('recEndDate').value=rec.projectEndDate||'';document.getElementById('recScheduledTime').value=rec.scheduledTime||'';document.getElementById('recScheduledDuration').value=rec.scheduledDuration||'';const crewSel=document.getElementById('recAssignedCrew');crewSel.innerHTML='<option value="">-- None --</option>'+(settings.crewMembers||[]).map(c=>'<option value="'+c.id+'"'+(rec.assignedCrew===c.id?' selected':'')+'>'+esc(c.name)+'</option>').join('');document.getElementById('recProjectNotes').value=rec.projectNotes||''}
  // Next action bar
  renderNextAction(rec);
  document.getElementById('recFirst').value=rec.firstName||'';
  document.getElementById('recLast').value=rec.lastName||'';
  document.getElementById('recCompany').value=rec.company||'';
  document.getElementById('recEmail').value=rec.email||'';
  document.getElementById('recPhone').value=rec.phone||'';
  document.getElementById('recPhoneType').value=rec.phoneType||'cell';
  document.getElementById('recBestTime').value=rec.bestTimeToCall||'';
  document.getElementById('recAddress').value=rec.address||'';
  document.getElementById('recCity').value=rec.city||'';
  document.getElementById('recState').value=rec.state||'';
  document.getElementById('recZip').value=rec.zip||'';
  document.getElementById('recNotes').value=rec.notes||'';
  // Follow-up
  document.getElementById('recFollowUpDate').value=rec.followUpDate||'';
  document.getElementById('recFollowUpNote').value=rec.followUpNote||'';
  renderFollowUpStatus();renderTagBar();
  // Lead source dropdown
  const lsEl=document.getElementById('recLeadSource');
  if(lsEl){
    const sources=settings.leadSourcePresets||[];
    lsEl.innerHTML='<option value="">-- Select --</option>'+sources.map(s=>'<option value="'+esc(s)+'"'+(rec.leadSource===s?' selected':'')+'>'+esc(s)+'</option>').join('')+((rec.leadSource&&!sources.includes(rec.leadSource))?'<option value="'+esc(rec.leadSource)+'" selected>'+esc(rec.leadSource)+'</option>':'');
  }
  renderEstimatesList(rec);renderActivityLog();renderQuickContactBtns();
}
function renderEstimatesList(rec){
  const cmpBtn=document.getElementById('compareEstBtn');if(cmpBtn)cmpBtn.style.display=rec.estimates.length>=2?'':'none';
  if(!rec.estimates.length){document.getElementById('estimatesList').innerHTML='<div class="empty"><div class="empty-icon">&#9997;</div><div class="empty-text">No estimates yet.</div><button class="btn btn-primary" onclick="newEstimate()" style="margin-top:10px">+ Create Estimate</button></div>';return}
  document.getElementById('estimatesList').innerHTML=rec.estimates.map(est=>{
    const ec=calcEstCosts(est);
    const areas=est.systems.map(s=>s.areaName||'Unnamed').join(', ');
    const hasInv=est.invoices&&est.invoices.length>0;
    const invStatus=rec.status==='completed'?(hasInv?' <span style="color:var(--success);font-size:11px">INVOICED</span>':' <span style="color:var(--accent);font-size:11px">NEEDS INVOICE</span>'):'';
    const invBtn=rec.status==='completed'&&!hasInv&&est.systems.length>0?'<button class="btn btn-primary" onclick="event.stopPropagation();nav.estimateId=\''+est.id+'\';createInvoice(\'standard\')" style="font-size:11px;padding:3px 10px;margin-top:2px">Invoice</button>':'';
    const qs=est.quoteStatus||'draft';
    const qsCol={draft:'color:var(--t4)',sent:'color:#5b9bf5',approved:'color:#34d399',declined:'color:#f87171'};
    const qsLab={draft:'Draft',sent:'Sent',approved:'Approved',declined:'Declined'};
    const qsBadge=rec.status!=='completed'?' <span style="font-size:10px;font-weight:600;'+qsCol[qs]+'">'+qsLab[qs].toUpperCase()+'</span>':'';
    return'<div class="sys-card'+(ec.sell>0?' has-product':'')+'" onclick="goEstimate(\''+est.id+'\')"><div><div class="sys-area">'+(est.name||'Estimate')+qsBadge+invStatus+'</div><div class="sys-detail">'+est.systems.length+' area'+(est.systems.length!==1?'s':'')+' \u00b7 '+ec.sqft.toLocaleString()+' sqft'+(areas?' \u00b7 '+areas:'')+'</div></div><div class="sys-right"><div class="sys-price">'+fmt(ec.totalWithTax)+'</div>'+(ec.cost>0?'<div class="sys-cost">Cost '+fmt(ec.cost)+'</div>':'')+invBtn+'</div></div>'
  }).join('');
}
function autoSaveRecord(){
  const rec=getRecord();if(!rec)return;
  rec.firstName=document.getElementById('recFirst').value.trim();
  rec.lastName=document.getElementById('recLast').value.trim();
  rec.company=document.getElementById('recCompany').value.trim();
  rec.email=document.getElementById('recEmail').value.trim();
  rec.phone=document.getElementById('recPhone').value.trim();
  rec.phoneType=document.getElementById('recPhoneType').value;
  rec.bestTimeToCall=document.getElementById('recBestTime').value.trim();
  rec.address=document.getElementById('recAddress').value.trim();
  rec.city=document.getElementById('recCity').value.trim();
  rec.state=document.getElementById('recState').value.trim();
  rec.zip=document.getElementById('recZip').value.trim();
  rec.notes=document.getElementById('recNotes').value.trim();
  rec.leadSource=document.getElementById('recLeadSource').value;
  rec.updatedAt=new Date().toISOString();
  autoSave();renderDuplicateWarning();
}
function saveRecord(){
  const rec=getRecord();if(!rec)return;
  rec.firstName=document.getElementById('recFirst').value.trim();
  rec.lastName=document.getElementById('recLast').value.trim();
  rec.company=document.getElementById('recCompany').value.trim();
  rec.email=document.getElementById('recEmail').value.trim();
  rec.phone=document.getElementById('recPhone').value.trim();
  rec.phoneType=document.getElementById('recPhoneType').value;
  rec.bestTimeToCall=document.getElementById('recBestTime').value.trim();
  rec.address=document.getElementById('recAddress').value.trim();
  rec.city=document.getElementById('recCity').value.trim();
  rec.state=document.getElementById('recState').value.trim();
  rec.zip=document.getElementById('recZip').value.trim();
  rec.notes=document.getElementById('recNotes').value.trim();
  rec.leadSource=document.getElementById('recLeadSource').value;
  rec.updatedAt=new Date().toISOString();
  saveDB(db);renderBreadcrumb();toast('Saved','Record updated.');
}
function changeStatus(s){const rec=getRecord();if(!rec)return;const label=STATUSES.find(x=>x.id===s).label;logActivity(rec.id,'status_change','Status changed to '+label);rec.status=s;rec.active=true;saveDB(db);nav.folderStatus=s;nav.folderActive=true;renderRecord();renderBreadcrumb();toast('Moved','Now in '+label+'s.');
  // Auto-advance prompts
  if(s==='completed'&&!isRecordInvoiced(rec)&&rec.estimates.some(e=>e.systems.length>0)){setTimeout(()=>openConfirm('Create Invoice?','Job complete! Ready to invoice this project?',()=>{quickInvoiceRecord(rec.id)}),500)}
}
function toggleActive(){const rec=getRecord();if(!rec)return;rec.active=document.getElementById('recActive').checked;logActivity(rec.id,rec.active?'activated':'archived',rec.active?'Record activated':'Record archived');rec.updatedAt=new Date().toISOString();saveDB(db);nav.folderActive=rec.active;renderBreadcrumb();toast(rec.active?'Active':'Archived',rec.active?'Record is active.':'Moved to inactive.')}
function newRecord(){const rec={id:uid(),status:'lead',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),firstName:'',lastName:'',company:'',email:'',phone:'',phoneType:'cell',bestTimeToCall:'',address:'',city:'',state:'',zip:'',notes:'',estimates:[],activityLog:[],projectStartDate:null,projectEndDate:null,projectNotes:'',scheduledTime:'',scheduledDuration:0,assignedCrew:'',followUpDate:null,followUpNote:'',followUpCompleted:false,tags:[],leadSource:''};db.records.unshift(rec);saveDB(db);goRecord(rec.id);toast('New Lead','Enter contact details.')}
function confirmDeleteRecord(){const rec=getRecord();if(!rec)return;const ec=rec.estimates.length;const ic=rec.estimates.reduce((s,e)=>s+(e.invoices?e.invoices.length:0),0);const msg='Permanently delete this record'+(ec?' with '+ec+' estimate'+(ec>1?'s':''):'')+(ic?' and '+ic+' invoice'+(ic>1?'s':''):'')+' ? You can also Archive it instead.';openConfirm('Delete Record',msg,()=>{_lastDeleted={type:'record',data:JSON.parse(JSON.stringify(rec))};db.records=db.records.filter(r=>r.id!==nav.recordId);saveDB(db);goFolder(nav.folderStatus,nav.folderActive);toast('Deleted','Record removed.',{fn:true})})}

// ── Duplicate Detection ─────────────────────────────────────
function findDuplicates(rec){
  const name=(rec.firstName+rec.lastName).toLowerCase().replace(/\s/g,'');
  return db.records.filter(r=>r.id!==rec.id&&r.active!==false&&(
    (name.length>1&&(r.firstName+r.lastName).toLowerCase().replace(/\s/g,'')===name)||
    (rec.phone&&rec.phone.length>5&&r.phone&&r.phone.replace(/\D/g,'')===rec.phone.replace(/\D/g,''))||
    (rec.email&&rec.email.length>3&&r.email&&r.email.toLowerCase()===rec.email.toLowerCase())
  ));
}
function renderDuplicateWarning(){
  const el=document.getElementById('duplicateWarning');if(!el)return;
  const rec=getRecord();if(!rec){el.innerHTML='';return}
  const dupes=findDuplicates(rec);
  if(!dupes.length){el.innerHTML='';return}
  el.innerHTML=dupes.slice(0,3).map(d=>{
    const dn=((d.firstName||'')+' '+(d.lastName||'')).trim()||'Unnamed';
    return'<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.3);border-radius:10px;margin-bottom:8px;font-size:13px"><div><span style="color:#ca8a04;font-weight:600">Possible duplicate:</span> '+esc(dn)+' <span style="color:var(--t3)">('+d.status+')</span></div><button class="btn btn-ghost" onclick="goFolder(\''+d.status+'\',true);setTimeout(()=>goRecord(\''+d.id+'\'),50)" style="font-size:11px;padding:3px 10px">View</button></div>'
  }).join('');
}

// ── Follow-Up Reminders ─────────────────────────────────────
function saveFollowUp(){
  const rec=getRecord();if(!rec)return;
  rec.followUpDate=document.getElementById('recFollowUpDate').value||null;
  rec.followUpNote=document.getElementById('recFollowUpNote').value.trim();
  rec.updatedAt=new Date().toISOString();autoSave();renderFollowUpStatus()
}
function completeFollowUp(){
  const rec=getRecord();if(!rec)return;
  rec.followUpCompleted=true;rec.followUpDate=null;rec.followUpNote='';
  rec.activityLog=rec.activityLog||[];
  rec.activityLog.unshift({id:uid(),type:'followup',text:'Follow-up completed',timestamp:new Date().toISOString()});
  rec.updatedAt=new Date().toISOString();autoSave();renderRecord()
}
function renderFollowUpStatus(){
  const el=document.getElementById('followUpStatus');if(!el)return;
  const rec=getRecord();if(!rec){el.innerHTML='';return}
  const d=rec.followUpDate;
  if(!d){el.innerHTML='';return}
  const today=new Date().toISOString().slice(0,10);
  const isOverdue=d<today;const isToday=d===today;
  const label=isOverdue?'<span style="color:#f87171;font-weight:600">Overdue</span>':isToday?'<span style="color:#f59e0b;font-weight:600">Due today</span>':'<span style="color:var(--t3)">Due '+new Date(d+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})+'</span>';
  el.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between">'+label+'<button class="btn btn-success" onclick="completeFollowUp()" style="font-size:11px;padding:3px 10px">Mark Complete</button></div>'
}
function getFollowUpsDue(){
  const today=new Date().toISOString().slice(0,10);
  return db.records.filter(r=>r.active&&r.followUpDate&&!r.followUpCompleted&&r.followUpDate<=today);
}
function renderFollowUpSection(){
  const el=document.getElementById('followUpSection');if(!el)return;
  const due=getFollowUpsDue();
  if(!due.length){el.innerHTML='';return}
  const items=due.sort((a,b)=>a.followUpDate.localeCompare(b.followUpDate)).slice(0,5).map(r=>{
    const name=((r.firstName||'')+' '+(r.lastName||'')).trim()||'Unnamed';
    const note=r.followUpNote?' \u2014 '+esc(r.followUpNote):'';
    const isOverdue=r.followUpDate<new Date().toISOString().slice(0,10);
    return'<div class="list-item" onclick="goFolder(\''+r.status+'\',true);setTimeout(()=>goRecord(\''+r.id+'\'),50)" style="margin-bottom:4px;padding:10px 14px;cursor:pointer"><div class="li-left"><div style="font-size:18px;width:32px;text-align:center">'+(isOverdue?'&#128308;':'&#128276;')+'</div><div><div class="li-name" style="font-size:13px">'+esc(name)+note+'</div><div class="li-meta">'+(isOverdue?'<span style="color:#f87171">Overdue</span>':'Due today')+' \u00b7 '+r.status+'</div></div></div></div>'
  }).join('');
  el.innerHTML='<div style="padding:14px 18px;border-radius:12px;border:1px solid rgba(245,158,11,.3);background:rgba(245,158,11,.06);margin-bottom:16px"><div style="font-weight:600;font-size:14px;color:#f59e0b;margin-bottom:8px">&#128276; '+due.length+' Follow-up'+(due.length>1?'s':'')+' Due</div>'+items+'</div>'
}

// ── Record Tags ─────────────────────────────────────────────
function renderTagBar(){
  const el=document.getElementById('tagBar');if(!el)return;
  const rec=getRecord();if(!rec){el.innerHTML='';return}
  if(!rec.tags)rec.tags=[];
  const chips=rec.tags.map(t=>'<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:var(--accent);color:#000;border-radius:6px;font-size:11px;font-weight:600">'+esc(t)+'<span onclick="removeTag(\''+esc(t)+'\')" style="cursor:pointer;font-size:13px;line-height:1;opacity:.7">&times;</span></span>').join('');
  const presets=(settings.tagPresets||[]).filter(t=>!rec.tags.includes(t));
  const addBtn=presets.length?'<select onchange="addTag(this.value);this.value=\'\'" style="font-size:11px;padding:3px 8px;border-radius:6px;border:1px solid var(--brd);background:var(--s3);color:var(--t2)"><option value="">+ Tag</option>'+presets.map(t=>'<option value="'+esc(t)+'">'+esc(t)+'</option>').join('')+'</select>':'';
  el.innerHTML=chips+addBtn;
}
function addTag(tag){
  if(!tag)return;const rec=getRecord();if(!rec)return;
  if(!rec.tags)rec.tags=[];
  if(!rec.tags.includes(tag)){rec.tags.push(tag);rec.updatedAt=new Date().toISOString();autoSave();renderTagBar()}
}
function removeTag(tag){
  const rec=getRecord();if(!rec)return;
  if(!rec.tags)return;
  rec.tags=rec.tags.filter(t=>t!==tag);rec.updatedAt=new Date().toISOString();autoSave();renderTagBar();
}
function populateTagFilter(){
  const sel=document.getElementById('tagFilter');if(!sel)return;
  const allTags=new Set();
  db.records.filter(r=>r.status===nav.folderStatus&&r.active===nav.folderActive).forEach(r=>{(r.tags||[]).forEach(t=>allTags.add(t))});
  const current=sel.value;
  sel.innerHTML='<option value="">All Tags</option>'+[...allTags].sort().map(t=>'<option value="'+esc(t)+'"'+(t===current?' selected':'')+'>'+esc(t)+'</option>').join('');
}

// ── Next Action Bar ─────────────────────────────────────────
function renderNextAction(rec){
  const bar=document.getElementById('nextActionBar');if(!bar)return;
  const estCount=rec.estimates.length;
  const recTotal=calcRecCosts(rec);
  let h='';
  const btnP=(label,fn)=>'<button class="btn btn-primary" onclick="'+fn+'" style="font-size:13px;padding:8px 18px">'+label+'</button>';
  const btnG=(label,fn)=>'<button class="btn btn-ghost" onclick="'+fn+'" style="font-size:12px;padding:6px 14px">'+label+'</button>';
  if(rec.status==='lead'){
    if(!estCount)h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+btnP('Create Estimate \u2192','newEstimate()')+'<span style="font-size:12px;color:var(--t3)">Create an estimate to start quoting this lead.</span></div>';
    else h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:12px;color:var(--t3)">'+estCount+' estimate'+(estCount!==1?'s':'')+' \u00b7 '+fmt(recTotal.totalWithTax)+'</span>'+btnP('Move to Estimates \u2192',"changeStatus('estimate')")+btnG('Add Estimate','newEstimate()')+'</div>';
  }else if(rec.status==='estimate'){
    const withAreas=rec.estimates.filter(e=>e.systems.length>0).length;
    const sent=rec.estimates.filter(e=>e.quoteStatus==='sent').length;
    const approved=rec.estimates.filter(e=>e.quoteStatus==='approved').length;
    if(!withAreas)h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+btnP('Add Areas to Estimate \u2192',"goEstimate('"+rec.estimates[0].id+"')")+'<span style="font-size:12px;color:var(--t3)">Add areas and systems to build your quote.</span></div>';
    else if(approved>0)h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:12px;color:var(--success);font-weight:600">\u2713 '+approved+' quote'+(approved!==1?'s':'')+' approved</span>'+btnP('Move to Project \u2192',"changeStatus('project')")+btnG('Email Quote','emailProposal()')+btnG('PDF Proposal','generateProposal()')+'</div>';
    else if(sent>0)h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:12px;color:var(--info);font-weight:500">'+sent+' quote'+(sent!==1?'s':'')+' sent \u2014 awaiting response</span>'+btnP('Move to Project \u2192',"changeStatus('project')")+btnG('Send Reminder','emailProposal()')+'</div>';
    else h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+btnP('Email Quote','emailProposal()')+btnG('PDF Proposal','generateProposal()')+btnG('Text Quote','textProposal()')+btnG('Move to Project \u2192',"changeStatus('project')")+'</div>';
  }else if(rec.status==='project'){
    const sd=rec.projectStartDate;const ed=rec.projectEndDate;
    if(!sd)h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+btnP('Set Project Dates \u2191',"document.getElementById('recStartDate').focus()")+'<span style="font-size:12px;color:var(--t3)">Set start and end dates for scheduling.</span></div>';
    else h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:12px;color:var(--t3)">'+new Date(sd+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})+(ed?' \u2013 '+new Date(ed+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'')+'</span>'+btnP('Mark Complete \u2192',"changeStatus('completed')")+btnG('Back to Estimate \u2192',"changeStatus('estimate')")+'</div>';
  }else if(rec.status==='completed'){
    const invoiced=isRecordInvoiced(rec);
    const allInvs=[];rec.estimates.forEach(e=>{if(e.invoices)e.invoices.forEach(i=>allInvs.push(i))});
    const unpaid=allInvs.filter(i=>i.status!=='paid');
    const totalPaid=allInvs.reduce((s,i)=>s+(i.amountPaid||0),0);
    if(!invoiced)h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+btnP('Invoice This Job \u2192',"quickInvoiceRecord('"+rec.id+"')")+'<span style="font-size:12px;color:var(--t3)">Create an invoice to collect payment.</span></div>';
    else if(unpaid.length)h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:12px;color:var(--accent);font-weight:500">'+unpaid.length+' invoice'+(unpaid.length!==1?'s':'')+' outstanding \u2014 '+fmt(unpaid.reduce((s,i)=>s+i.balance,0))+' due</span>'+btnG('View Invoices',"goEstimate('"+rec.estimates[0].id+"');setTimeout(()=>switchEstTab('invoices'),50)")+'</div>';
    else h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:12px;color:var(--success);font-weight:600">\u2713 Fully paid \u2014 '+fmt(totalPaid)+' collected</span></div>';
  }
  bar.innerHTML=h?'<div style="padding:12px 16px;border-radius:10px;background:var(--s2);border:1px solid var(--b1)">'+h+'</div>':'';
}

// ── Project Dates ───────────────────────────────────────────
function saveProjectDates(){
  const rec=getRecord();if(!rec)return;
  rec.projectStartDate=document.getElementById('recStartDate').value||null;
  rec.projectEndDate=document.getElementById('recEndDate').value||null;
  rec.scheduledTime=document.getElementById('recScheduledTime').value||'';
  rec.scheduledDuration=parseFloat(document.getElementById('recScheduledDuration').value)||0;
  rec.assignedCrew=document.getElementById('recAssignedCrew').value||'';
  rec.projectNotes=document.getElementById('recProjectNotes').value.trim();
  rec.updatedAt=new Date().toISOString();
  saveDB(db);renderNextAction(rec);
}

// ── Quote Status ────────────────────────────────────────────
function approveQuote(estId){
  const rec=getRecord();if(!rec)return;
  const est=rec.estimates.find(e=>e.id===estId);if(!est)return;
  est.quoteStatus='approved';est.quoteApprovedAt=new Date().toISOString();
  logActivity(rec.id,'quote_approved','Quote "'+est.name+'" approved');
  saveDB(db);
  if(nav.screen==='estimate')renderEstimate();else renderRecord();
  if(rec.status==='estimate'){
    openConfirm('Move to Project?','Quote approved! Ready to move this to Projects?',()=>{changeStatus('project')});
  }
}
function declineQuote(estId){
  const rec=getRecord();if(!rec)return;
  const est=rec.estimates.find(e=>e.id===estId);if(!est)return;
  est.quoteStatus='declined';
  logActivity(rec.id,'quote_declined','Quote "'+est.name+'" declined');
  saveDB(db);
  if(nav.screen==='estimate')renderEstimate();else renderRecord();
  toast('Declined','Quote marked as declined.');
}