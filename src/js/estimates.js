// ═══════════════════════════════════════════════════════════
// ESTIMATE
// ═══════════════════════════════════════════════════════════
function getEstimate(){const rec=getRecord();return rec?rec.estimates.find(e=>e.id===nav.estimateId):null}
function renderEstimate(){
  const est=getEstimate();const rec=getRecord();if(!est||!rec){goRecord(nav.recordId);return}
  const rn=((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'Client';
  document.getElementById('estNameInput').value=est.name||'';
  document.getElementById('estSubline').textContent=rn;
  // Quote status badge + approve/decline buttons
  const qs=est.quoteStatus||'draft';
  const qsColors={draft:'background:var(--s3);color:var(--t3)',sent:'background:rgba(91,155,245,.15);color:#5b9bf5',approved:'background:rgba(52,211,153,.15);color:#34d399',declined:'background:rgba(248,113,113,.15);color:#f87171'};
  const qsLabels={draft:'Draft',sent:'Sent',approved:'Approved',declined:'Declined'};
  let qsBadgeHtml='<span style="display:inline-block;font-size:11px;font-weight:600;padding:3px 10px;border-radius:6px;'+qsColors[qs]+'">'+qsLabels[qs]+'</span>';
  if(qs==='sent')qsBadgeHtml+=' <button class="btn btn-success" onclick="approveQuote(\''+est.id+'\')" style="font-size:11px;padding:3px 10px;margin-left:6px">Client Approved \u2713</button><button class="btn btn-danger" onclick="declineQuote(\''+est.id+'\')" style="font-size:11px;padding:3px 10px;margin-left:4px">Declined \u2717</button>';
  else if(qs==='draft'&&est.systems.length>0)qsBadgeHtml+=' <span style="font-size:11px;color:var(--t4);margin-left:6px">Ready to send?</span>';
  document.getElementById('quoteStatusBadge').innerHTML=qsBadgeHtml;
  estTab='areas';switchEstTab('areas');
  const ec=calcEstCosts(est);
  let etbRight='';
  if(ec.taxAmount>0){etbRight='<div class="est-total-amount">'+fmt(ec.totalWithTax)+'</div><div class="est-total-detail">Subtotal '+fmt(ec.sell)+' + Tax '+fmt(ec.taxAmount)+'</div><div class="est-total-detail">Cost '+fmt(ec.cost)+' \u00b7 Margin '+ec.margin.toFixed(1)+'%</div>'}
  else{etbRight='<div class="est-total-amount">'+fmt(ec.sell)+'</div><div class="est-total-detail">Cost '+fmt(ec.cost)+' \u00b7 Margin '+ec.margin.toFixed(1)+'%</div>'}
  document.getElementById('estTotalBar').innerHTML='<div><div class="est-total-left">Estimate Total</div><div class="est-total-detail">'+est.systems.length+' area'+(est.systems.length!==1?'s':'')+' \u00b7 '+ec.sqft.toLocaleString()+' sqft</div></div><div style="text-align:right">'+etbRight+'</div>';
  if(!est.systems.length){document.getElementById('systemsList').innerHTML='<div class="empty"><div class="empty-icon">&#9874;</div><div class="empty-text">No areas yet.</div><button class="btn btn-primary" onclick="newSystem()" style="margin-top:10px">+ Add Area</button></div>';return}
  document.getElementById('systemsList').innerHTML=est.systems.map((sys,i)=>{
    const sc=calcSysCosts(sys);
    const prod=getAllProducts().find(p=>p.id===sys.productId);
    const d=[sys.sqft?sys.sqft.toLocaleString()+' sqft':'',prod?prod.name:'No system',sys.sellRate?'$'+sys.sellRate.toFixed(2)+'/sqft':''].filter(Boolean).join(' \u00b7 ');
    return'<div class="sys-card'+(prod?' has-product':'')+'" onclick="goSystem(\''+sys.id+'\')"><div><div class="sys-area">'+(sys.areaName||'Area '+(i+1))+'</div><div class="sys-detail">'+d+'</div></div><div class="sys-right"><div class="sys-price">'+fmt(sc.sell)+'</div>'+(sc.cost>0?'<div class="sys-cost">Cost '+fmt(sc.cost)+'</div>':'')+'</div></div>'
  }).join('');
}
function updateEstName(){const est=getEstimate();if(est){est.name=document.getElementById('estNameInput').value.trim();autoSave()}}
function newEstimate(){
  const rec=getRecord();if(!rec)return;saveRecord();
  const tpls=settings.estimateTemplates||[];
  if(tpls.length){showTemplatePickerModal(rec);return}
  createBlankEstimate(rec);
}
function createBlankEstimate(rec,templateSystems){
  const c=rec.estimates.length+1;const est={id:uid(),name:'Estimate #'+c,createdAt:new Date().toISOString(),systems:templateSystems?JSON.parse(JSON.stringify(templateSystems)):[],quoteStatus:'draft',quoteSentAt:null,quoteApprovedAt:null};
  rec.estimates.push(est);logActivity(rec.id,'estimate_created','Estimate \''+est.name+'\' created');rec.updatedAt=new Date().toISOString();
  if(rec.status==='lead'){rec.status='estimate';nav.folderStatus='estimate'}
  saveDB(db);goEstimate(est.id);toast('Created',templateSystems?'Created from template with '+templateSystems.length+' area(s).':'Add areas to start quoting.');
}
function showTemplatePickerModal(rec){
  const tpls=settings.estimateTemplates||[];
  const items=tpls.map((t,i)=>'<div onclick="closeConfirm();createBlankEstimate(getRecord(),settings.estimateTemplates['+i+'].systems)" style="padding:14px 16px;background:var(--s3);border-radius:10px;margin-bottom:8px;cursor:pointer;border:1px solid var(--brd);transition:border-color .15s" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--brd)\'"><div style="font-weight:600;font-size:14px;color:var(--t1)">'+esc(t.name)+'</div><div style="font-size:12px;color:var(--t3);margin-top:2px">'+t.systems.length+' area'+(t.systems.length!==1?'s':'')+'</div></div>').join('');
  const modal=document.getElementById('confirmModal');
  modal.querySelector('.modal').innerHTML='<div style="padding:20px"><h3 style="font-size:16px;font-weight:700;margin-bottom:4px">New Estimate</h3><p style="font-size:13px;color:var(--t3);margin-bottom:16px">Start blank or use a template</p><div onclick="closeConfirm();createBlankEstimate(getRecord())" style="padding:14px 16px;background:var(--s3);border-radius:10px;margin-bottom:12px;cursor:pointer;border:2px solid var(--accent)"><div style="font-weight:600;font-size:14px;color:var(--accent)">+ Start Blank</div><div style="font-size:12px;color:var(--t3);margin-top:2px">Empty estimate — add areas manually</div></div><div style="font-size:12px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Or choose a template</div>'+items+'</div>';
  modal.scrollTop=0;modal.classList.add('active');
}
function saveEstimate(){
  saveDB(db);
  // Button feedback
  const btn=document.getElementById('estSaveBtn');
  if(btn){const orig=btn.innerHTML;btn.innerHTML='&#10003; Saved!';btn.style.background='#16a34a';setTimeout(()=>{btn.innerHTML=orig;btn.style.background=''},1500)}
  // Show next-step actions
  const est=getEstimate();const ec=calcEstCosts(est);
  const hasAreas=est&&est.systems.length>0;
  const hasInvoice=est&&est.invoices&&est.invoices.length>0;
  let actions='<div style="display:flex;gap:8px;flex-wrap:wrap;padding:10px 0;align-items:center"><span style="font-size:12px;color:var(--success);font-weight:600">\u2713 Saved</span>';
  if(hasAreas)actions+='<button class="btn btn-primary" onclick="generateProposal()" style="font-size:12px;padding:6px 14px">Generate Proposal</button>';
  if(hasAreas)actions+='<button class="btn btn-ghost" onclick="emailProposal()" style="font-size:12px;padding:6px 14px">Email Proposal</button>';
  if(hasAreas&&!hasInvoice)actions+='<button class="btn btn-ghost" onclick="switchEstTab(\'invoices\')" style="font-size:12px;padding:6px 14px">Create Invoice</button>';
  actions+='<button class="btn btn-ghost" onclick="goRecord(nav.recordId)" style="font-size:12px;padding:6px 14px">Back to Record</button>';
  actions+='</div>';
  const el=document.getElementById('estSavedActions');
  el.innerHTML=actions;el.style.display='';
  setTimeout(()=>{el.style.display='none'},8000);
  toast('Saved','Estimate saved.');
}
function saveEstimateWithFeedback(){saveEstimate()}
function confirmDeleteEstimate(){const rec=getRecord();if(!rec)return;const est=getEstimate();const eName=(est||{}).name||'Estimate';openConfirm('Delete Estimate','Delete this estimate and all areas?',()=>{if(est)_lastDeleted={type:'estimate',data:JSON.parse(JSON.stringify(est)),parentId:rec.id};logActivity(rec.id,'estimate_deleted','Estimate \''+eName+'\' deleted');rec.estimates=rec.estimates.filter(e=>e.id!==nav.estimateId);rec.updatedAt=new Date().toISOString();saveDB(db);goRecord(nav.recordId);toast('Deleted','Estimate removed.',{fn:true})},'Delete')}

// ═══════════════════════════════════════════════════════════
// SYSTEM EDITOR
// ═══════════════════════════════════════════════════════════
function getSystem(){const est=getEstimate();return est?est.systems.find(s=>s.id===nav.systemId):null}
function renderSystem(){
  const sys=getSystem();if(!sys){goEstimate(nav.estimateId);return}
  // Initialize repairs/addons if missing
  if(!sys.repairs){sys.repairs={}}
  if(!sys.addons){sys.addons={}}
  document.getElementById('sysHeader').innerHTML='<h2>'+(sys.areaName||'New Area')+'</h2><p>Select a product system and set your sell rate.</p>';
  document.getElementById('sysArea').value=sys.areaName||'';
  document.getElementById('sysLength').value=sys.length||0;
  document.getElementById('sysWidth').value=sys.width||1;
  document.getElementById('sysSqft').value=sys.sqft||0;
  document.getElementById('sysSellRate').value=sys.sellRate||0;
  document.getElementById('sysNotes').value=sys.notes||'';
  document.getElementById('sysTaxable').checked=sys.taxable!==false;
  seriesFilter='All';renderSeriesFilter();renderProductList(sys);renderTopcoatList(sys);renderRepairList(sys);renderAddonList(sys);calcSystem();
  renderLineItems();
}
function renderSeriesFilter(){const s=['All','C-Series','M-Series','G-Series','E-Series','I-Series'];if(settings.customProducts&&settings.customProducts.length)s.push('Custom');document.getElementById('seriesFilter').innerHTML=s.map(x=>'<button class="sf-btn'+(x===seriesFilter?' ac':'')+'" onclick="setSeriesFilter(\''+x+'\')">'+x+'</button>').join('')}
function setSeriesFilter(s){seriesFilter=s;renderSeriesFilter();const sys=getSystem();if(sys)renderProductList(sys)}
function renderProductList(sys){
  const ps=seriesFilter==='All'?getAllProducts():getAllProducts().filter(p=>p.series===seriesFilter);
  document.getElementById('prodList').innerHTML=ps.map(p=>{const sel=sys.productId===p.id;return'<div class="prod-option'+(sel?' sel':'')+'" onclick="selectProduct(\''+p.id+'\')"><div><div class="prod-name">'+p.name+'</div><div class="prod-sku">'+p.sku+' \u00b7 '+p.cat+'</div></div><div class="prod-prices"><div class="cost">'+fmt(p.cost)+'/sf</div><div class="sell">Sell '+fmt(p.low)+'\u2013'+fmt(p.mid)+'</div></div></div>'}).join('');
}
function renderTopcoatList(sys){
  document.getElementById('tcList').innerHTML=getAllTopcoats().map(t=>{const sel=(sys.topcoatId||'tc-none')===t.id;return'<div class="prod-option'+(sel?' sel':'')+'" onclick="selectTopcoat(\''+t.id+'\')"><div><div class="prod-name">'+t.name+'</div>'+(t.desc?'<div class="prod-sku">'+t.desc+'</div>':'')+'</div><div class="prod-prices"><div class="cost">'+(t.cost>0?fmt(t.cost)+'/sf':'\u2014')+'</div></div></div>'}).join('');
}
function selectProduct(id){const sys=getSystem();if(!sys)return;sys.productId=id;const p=getAllProducts().find(p=>p.id===id);if(p&&!sys.sellRate){sys.sellRate=p.low;document.getElementById('sysSellRate').value=p.low.toFixed(2)}renderProductList(sys);calcSystem()}
function selectTopcoat(id){const sys=getSystem();if(!sys)return;sys.topcoatId=id==='tc-none'?null:id;renderTopcoatList(sys);calcSystem()}
function calcSystem(sqm){
  const sys=getSystem();if(!sys)return;
  const l=parseFloat(document.getElementById('sysLength').value)||0;
  const w=parseFloat(document.getElementById('sysWidth').value)||0;
  let sq=sqm?(parseFloat(document.getElementById('sysSqft').value)||0):(l*w);
  if(!sqm)document.getElementById('sysSqft').value=sq;
  const sr=parseFloat(document.getElementById('sysSellRate').value)||0;
  sys.areaName=document.getElementById('sysArea').value.trim();sys.length=l;sys.width=w;sys.sqft=sq;sys.sellRate=sr;sys.notes=document.getElementById('sysNotes').value.trim();
  sys.taxable=document.getElementById('sysTaxable').checked;
  const sc=calcSysCosts(sys);
  document.getElementById('sysPrice').textContent=fmt(sc.sellWithTax);
  let statsHtml='<div class="sx hl"><div class="sl">Total Price</div><div class="sv">'+fmt(sc.sell)+'</div></div>';
  if(sc.taxAmount>0){statsHtml+='<div class="sx"><div class="sl">Tax ('+settings.taxRate+'%)</div><div class="sv">'+fmt(sc.taxAmount)+'</div></div><div class="sx hl"><div class="sl">Price + Tax</div><div class="sv" style="color:var(--accent)">'+fmt(sc.sellWithTax)+'</div></div>'}
  statsHtml+='<div class="sx"><div class="sl">Material Cost</div><div class="sv" style="color:var(--comp)">'+fmt(sc.cost)+'</div></div><div class="sx"><div class="sl">Gross Profit</div><div class="sv" style="color:var(--success)">'+fmt(sc.profit)+'</div></div><div class="sx"><div class="sl">Margin</div><div class="sv" style="color:'+(sc.margin>=50?'var(--success)':sc.margin>=30?'var(--accent)':'var(--comp)')+'">'+sc.margin.toFixed(1)+'%</div></div>';
  document.getElementById('sysStats').innerHTML=statsHtml;
  autoSave();
}
function renderRepairList(sys){
  document.getElementById('repairList').innerHTML=getAllRepairs().map(r=>{
    const d=sys.repairs[r.id]||{on:false,qty:0,sell:0};
    return'<div class="ra-row'+(d.on?' on':'')+'">'+
      '<div class="ra-toggle"><input type="checkbox"'+(d.on?' checked':'')+' onchange="toggleRepair(\''+r.id+'\',this.checked)"></div>'+
      '<div class="ra-info"><div class="ra-name">'+r.name+'</div><div class="ra-sku">'+r.sku+' \u00b7 Cost '+fmt(r.cost)+'/'+r.unit+'</div></div>'+
      '<div class="ra-fields"'+(d.on?'':' style="opacity:.3;pointer-events:none"')+'>'+
        '<input type="number" value="'+(d.qty||0)+'" min="0" step="1" placeholder="Qty" onchange="updateRepair(\''+r.id+'\',\'qty\',this.value)">'+
        '<div class="ra-unit">'+r.unit+'</div>'+
        '<input type="number" value="'+(d.sell||0)+'" min="0" step="0.01" placeholder="Sell" onchange="updateRepair(\''+r.id+'\',\'sell\',this.value)">'+
        '<div class="ra-unit">$/'+r.unit+'</div>'+
      '</div>'+
      '<div class="ra-cost">'+fmt((d.sell||0)*(d.qty||0))+'</div>'+
    '</div>'
  }).join('');
}
function toggleRepair(id,on){
  const sys=getSystem();if(!sys)return;
  if(!sys.repairs[id])sys.repairs[id]={on:false,qty:0,sell:0};
  sys.repairs[id].on=on;
  renderRepairList(sys);calcSystem();
}
function updateRepair(id,field,val){
  const sys=getSystem();if(!sys)return;
  if(!sys.repairs[id])sys.repairs[id]={on:true,qty:0,sell:0};
  sys.repairs[id][field]=parseFloat(val)||0;
  renderRepairList(sys);calcSystem();
}
function renderAddonList(sys){
  document.getElementById('addonList').innerHTML=getAllAddons().map(a=>{
    const d=sys.addons[a.id]||{on:false,qty:0,sell:a.low};
    return'<div class="ra-row'+(d.on?' on':'')+'">'+
      '<div class="ra-toggle"><input type="checkbox"'+(d.on?' checked':'')+' onchange="toggleAddon(\''+a.id+'\',this.checked)"></div>'+
      '<div class="ra-info"><div class="ra-name">'+a.name+'</div><div class="ra-sku">'+a.sku+' \u00b7 Cost '+fmt(a.cost)+'/'+a.unit+' \u00b7 Sell '+fmt(a.low)+'\u2013'+fmt(a.mid)+'</div></div>'+
      '<div class="ra-fields"'+(d.on?'':' style="opacity:.3;pointer-events:none"')+'>'+
        '<input type="number" value="'+(d.qty||0)+'" min="0" step="1" placeholder="Qty" onchange="updateAddon(\''+a.id+'\',\'qty\',this.value)">'+
        '<div class="ra-unit">'+a.unit+'</div>'+
        '<input type="number" value="'+(d.sell||a.low)+'" min="0" step="0.01" placeholder="Sell" onchange="updateAddon(\''+a.id+'\',\'sell\',this.value)">'+
        '<div class="ra-unit">$/'+a.unit+'</div>'+
      '</div>'+
      '<div class="ra-cost">'+fmt((d.sell||0)*(d.qty||0))+'</div>'+
    '</div>'
  }).join('');
}
function toggleAddon(id,on){
  const sys=getSystem();if(!sys)return;
  const def=getAllAddons().find(a=>a.id===id);
  if(!sys.addons[id])sys.addons[id]={on:false,qty:0,sell:def?def.low:0};
  sys.addons[id].on=on;
  // Auto-fill qty with sqft for sqft-based add-ons
  if(on&&def&&def.unit==='sqft'&&!sys.addons[id].qty)sys.addons[id].qty=sys.sqft||0;
  renderAddonList(sys);calcSystem();
}
function updateAddon(id,field,val){
  const sys=getSystem();if(!sys)return;
  const def=getAllAddons().find(a=>a.id===id);
  if(!sys.addons[id])sys.addons[id]={on:true,qty:0,sell:def?def.low:0};
  sys.addons[id][field]=parseFloat(val)||0;
  renderAddonList(sys);calcSystem();
}
function saveSystem(){calcSystem();saveDB(db);renderBreadcrumb();toast('Saved','Area saved.')}
function saveSystemWithFeedback(){
  saveSystem();
  const btn=document.getElementById('sysSaveBtn');if(!btn)return;
  const orig=btn.innerHTML;btn.innerHTML='&#10003; Saved!';btn.style.background='#16a34a';
  setTimeout(()=>{btn.innerHTML=orig;btn.style.background=''},1500);
}
function newSystem(){const est=getEstimate();if(!est)return;const sys={id:uid(),areaName:'',length:0,width:0,sqft:0,productId:null,sellRate:0,topcoatId:null,notes:'',taxable:true,repairs:{},addons:{}};est.systems.push(sys);if(nav.recordId)logActivity(nav.recordId,'area_added','Area added to \''+est.name+'\'');saveDB(db);goSystem(sys.id)}
function confirmDeleteSystem(){const est=getEstimate();if(!est)return;const sys=getSystem();const aName=(sys||{}).areaName||'Area';openConfirm('Remove Area','Remove this area from the estimate?',()=>{if(sys)_lastDeleted={type:'system',data:JSON.parse(JSON.stringify(sys)),parentId:nav.estimateId,recordId:nav.recordId};if(nav.recordId)logActivity(nav.recordId,'area_removed','Area \''+aName+'\' removed from \''+est.name+'\'');est.systems=est.systems.filter(s=>s.id!==nav.systemId);saveDB(db);goEstimate(nav.estimateId);toast('Removed','Area removed.',{fn:true})},'Remove')}
function duplicateSystem(){
  const est=getEstimate();const sys=getSystem();if(!est||!sys)return;
  const dup=JSON.parse(JSON.stringify(sys));dup.id=uid();dup.areaName=(sys.areaName||'Area')+' (Copy)';
  est.systems.push(dup);if(nav.recordId)logActivity(nav.recordId,'area_duplicated','Area "'+sys.areaName+'" duplicated');
  saveDB(db);goSystem(dup.id);toast('Duplicated','Area copied. Edit as needed.');
}
function duplicateEstimate(){
  const rec=getRecord();const est=getEstimate();if(!rec||!est)return;
  const dup=JSON.parse(JSON.stringify(est));dup.id=uid();dup.name=(est.name||'Estimate')+' (Copy)';dup.createdAt=new Date().toISOString();dup.quoteStatus='draft';dup.quoteSentAt=null;dup.quoteApprovedAt=null;
  if(dup.invoices)dup.invoices=[];
  dup.systems.forEach(s=>{s.id=uid()});
  rec.estimates.push(dup);logActivity(rec.id,'estimate_duplicated','Estimate "'+est.name+'" duplicated');
  rec.updatedAt=new Date().toISOString();saveDB(db);goEstimate(dup.id);toast('Duplicated','Estimate copied. Edit as needed.');
}

// ═══════════════════════════════════════════════════════════
// CUSTOM LINE ITEMS
// ═══════════════════════════════════════════════════════════
function renderLineItems(){
  const sys=getSystem();if(!sys)return;
  const el=document.getElementById('lineItemsList');if(!el)return;
  const items=sys.customLineItems||[];
  if(!items.length){el.innerHTML='<div style="font-size:12px;color:var(--t4);padding:8px 0">No custom items. Add charges like stencil work, custom colors, or misc fees.</div>';return}
  el.innerHTML=items.map((item,i)=>
    '<div style="padding:10px 14px;border:1px solid var(--b1);border-radius:8px;background:var(--s1);margin-bottom:6px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
        '<span style="font-weight:600;font-size:13px;color:var(--t1)">'+(item.description||'Line Item')+'</span>'+
        '<button class="btn btn-danger" onclick="removeSysLineItem('+i+')" style="font-size:11px;padding:2px 8px">Remove</button>'+
      '</div>'+
      '<div class="g3" style="gap:8px">'+
        '<div class="fg" style="margin-bottom:0"><label style="font-size:11px">Description</label><input type="text" value="'+esc(item.description||'')+'" onchange="updateSysLineItem('+i+',\'description\',this.value)" style="font-size:13px;padding:8px"></div>'+
        '<div class="fg" style="margin-bottom:0"><label style="font-size:11px">Qty</label><input type="number" value="'+(item.qty||0)+'" min="0" step="1" onchange="updateSysLineItem('+i+',\'qty\',parseFloat(this.value)||0)" style="font-size:13px;padding:8px"></div>'+
        '<div class="fg" style="margin-bottom:0"><label style="font-size:11px">Unit</label><select onchange="updateSysLineItem('+i+',\'unit\',this.value)" style="font-size:13px;padding:8px"><option value="each"'+(item.unit==='each'?' selected':'')+'>each</option><option value="sqft"'+(item.unit==='sqft'?' selected':'')+'>sqft</option><option value="lnft"'+(item.unit==='lnft'?' selected':'')+'>lnft</option><option value="hr"'+(item.unit==='hr'?' selected':'')+'>hr</option></select></div>'+
      '</div>'+
      '<div class="g3" style="gap:8px;margin-top:6px">'+
        '<div class="fg" style="margin-bottom:0"><label style="font-size:11px">Rate ($)</label><input type="number" value="'+(item.rate||0)+'" min="0" step="0.01" onchange="updateSysLineItem('+i+',\'rate\',parseFloat(this.value)||0)" style="font-size:13px;padding:8px"></div>'+
        '<div class="fg" style="margin-bottom:0"><label style="font-size:11px">Total</label><div style="padding:8px;font-family:\'JetBrains Mono\',monospace;font-size:14px;font-weight:600;color:var(--accent)">'+fmt((item.qty||0)*(item.rate||0))+'</div></div>'+
        '<div class="fg" style="margin-bottom:0"><label style="font-size:11px">Taxable</label><div style="padding:8px"><input type="checkbox" '+(item.taxable!==false?'checked':'')+' onchange="updateSysLineItem('+i+',\'taxable\',this.checked)"></div></div>'+
      '</div>'+
    '</div>'
  ).join('');
}

function addSysLineItem(){
  const sys=getSystem();if(!sys)return;
  if(!sys.customLineItems)sys.customLineItems=[];
  sys.customLineItems.push({id:'cli-'+uid(),description:'',qty:1,unit:'each',rate:0,taxable:true});
  autoSave();renderLineItems();calcSystem();
}

function updateSysLineItem(idx,field,val){
  const sys=getSystem();if(!sys)return;
  const items=sys.customLineItems;if(!items||!items[idx])return;
  items[idx][field]=val;
  autoSave();renderLineItems();calcSystem();
}

function removeSysLineItem(idx){
  const sys=getSystem();if(!sys)return;
  const items=sys.customLineItems;if(!items||!items[idx])return;
  items.splice(idx,1);
  autoSave();renderLineItems();calcSystem();
}

// ═══════════════════════════════════════════════════════════
// MODALS / TOAST / IMPORT-EXPORT
// ═══════════════════════════════════════════════════════════
function openConfirm(t,m,fn,btnLabel){
  document.getElementById('confirmTitle').textContent=t;
  document.getElementById('confirmMsg').textContent=m;
  const yesBtn=document.getElementById('confirmYes');
  yesBtn.onclick=()=>{closeConfirm();fn()};
  yesBtn.textContent=btnLabel||'Confirm';
  // Use danger style for delete, success for positive actions, primary for general
  yesBtn.className='btn '+(btnLabel==='Delete'?'btn-danger':btnLabel==='Invoice'?'btn-success':'btn-primary');
  const overlay=document.getElementById('confirmModal');
  overlay.scrollTop=0;
  overlay.classList.add('active');
}
function closeConfirm(){document.getElementById('confirmModal').classList.remove('active')}
function openExport(){const e=document.getElementById('exportModal');e.scrollTop=0;e.classList.add('active')}
function closeExport(){document.getElementById('exportModal').classList.remove('active')}
function openImport(){const i=document.getElementById('importModal');i.scrollTop=0;i.classList.add('active')}
function closeImport(){document.getElementById('importModal').classList.remove('active')}
let _lastDeleted=null;let _toastTimer=null;
function toast(t,m,undoOpt){
  const el=document.getElementById('toast');document.getElementById('toastT').textContent=t;
  const mEl=document.getElementById('toastM');
  if(undoOpt&&undoOpt.fn){mEl.innerHTML=esc(m)+' <a href="#" onclick="event.preventDefault();undoLastDelete()" style="color:var(--accent);font-weight:600;text-decoration:underline;margin-left:8px">Undo</a>'}
  else{mEl.textContent=m}
  el.classList.add('show');clearTimeout(_toastTimer);_toastTimer=setTimeout(()=>{el.classList.remove('show');if(_lastDeleted)_lastDeleted=null},undoOpt?8000:3000);
}
function undoLastDelete(){
  if(!_lastDeleted){toast('Nothing to Undo','');return}
  const d=_lastDeleted;_lastDeleted=null;
  if(d.type==='record'){db.records.push(d.data);saveDB(db);goFolder(nav.folderStatus||'lead',true);toast('Restored','Record restored.')}
  else if(d.type==='estimate'){const rec=db.records.find(r=>r.id===d.parentId);if(rec){rec.estimates.push(d.data);saveDB(db);goRecord(d.parentId);toast('Restored','Estimate restored.')}}
  else if(d.type==='system'){const rec=db.records.find(r=>r.id===d.recordId);const est=rec?rec.estimates.find(e=>e.id===d.parentId):null;if(est){est.systems.push(d.data);saveDB(db);goEstimate(d.parentId);toast('Restored','Area restored.')}}
}
function doExport(){const b=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='coatings-estimator-'+new Date().toISOString().slice(0,10)+'.json';a.click();closeExport();toast('Exported','Download started.')}
function doImport(){const f=document.getElementById('importFile').files[0];if(!f){toast('Error','Select a file.');return}const r=new FileReader();r.onload=e=>{try{const d=JSON.parse(e.target.result);if(d.records&&Array.isArray(d.records)){db=d;saveDB(db);closeImport();goHome();toast('Imported',db.records.length+' records loaded.')}else{toast('Error','Invalid format.')}}catch{toast('Error','Could not parse file.')}};r.readAsText(f)}

// ═══════════════════════════════════════════════════════════
// ORDER LIST (Phase 2 — Ingredient Intelligence)
// ═══════════════════════════════════════════════════════════
function getSystemIngredients(sys){
  const items=[];
  const sqft=sys.sqft||0;
  if(!sqft)return items;
  // Product system ingredients
  const ings=INGREDIENTS[sys.productId];
  if(ings){ings.forEach(ing=>{
    const unitsNeeded=Math.ceil(sqft/ing.coverage);
    items.push({name:ing.name,sku:ing.sku,qty:unitsNeeded,unit:ing.unit,costPer:ing.costPer,totalCost:unitsNeeded*ing.costPer,source:'system',area:sys.areaName||'Unnamed'});
  })}
  // Top coat (uses real coverage rates from YEILD tab)
  const tc=getAllTopcoats().find(t=>t.id===sys.topcoatId);
  if(tc&&tc.cost>0){const tcCov=tc.coverage||200;const tcQty=Math.ceil(sqft/tcCov);const tcUnit=tc.unitPrice||0;items.push({name:tc.name,sku:tc.sku||'',qty:tcQty,unit:'gal',costPer:tcUnit,totalCost:tcQty*tcUnit,source:'topcoat',area:sys.areaName||'Unnamed'})}
  // Repairs
  if(sys.repairs){Object.entries(sys.repairs).forEach(([id,r])=>{if(r.on&&r.qty>0){const def=getAllRepairs().find(x=>x.id===id);if(def)items.push({name:def.name,sku:def.sku,qty:r.qty,unit:def.unit,costPer:def.cost,totalCost:def.cost*r.qty,source:'repair',area:sys.areaName||'Unnamed'})}})}
  // Add-ons
  if(sys.addons){Object.entries(sys.addons).forEach(([id,a])=>{if(a.on&&a.qty>0){const def=getAllAddons().find(x=>x.id===id);if(def)items.push({name:def.name,sku:def.sku,qty:a.qty,unit:def.unit,costPer:def.cost,totalCost:def.cost*a.qty,source:'addon',area:sys.areaName||'Unnamed'})}})}
  // Custom Line Items
  if(sys.customLineItems){sys.customLineItems.forEach(li=>{if(li.description){const amt=(li.qty||0)*(li.rate||0);items.push({name:li.description,sku:'',qty:li.qty||0,unit:li.unit||'each',costPer:li.rate||0,totalCost:amt,source:'custom',area:sys.areaName||'Unnamed'})}})}
  return items;
}
function renderOrderList(){
  const est=getEstimate();if(!est){return}
  if(!est.systems.length){document.getElementById('orderListContent').innerHTML='<div class="empty"><div class="empty-icon">&#9776;</div><div class="empty-text">Add areas with products to see the order list.</div></div>';return}
  // Collect all ingredients grouped by area
  let allItems=[];let totalCost=0;
  est.systems.forEach(sys=>{const items=getSystemIngredients(sys);allItems.push({area:sys.areaName||'Unnamed',sqft:sys.sqft,items});items.forEach(i=>totalCost+=i.totalCost)});
  // Aggregate duplicate items
  const agg={};allItems.forEach(g=>g.items.forEach(i=>{const k=i.sku||i.name;if(!agg[k])agg[k]={...i,qty:0,totalCost:0};agg[k].qty+=i.qty;agg[k].totalCost+=i.totalCost}));
  let html='<div style="margin-bottom:16px"><strong style="font-size:14px">By Area</strong></div><table class="ol-table">';
  html+='<tr><th>Item</th><th>SKU</th><th class="right">Qty</th><th>Unit</th><th class="right">Unit Cost</th><th class="right">Total</th></tr>';
  allItems.forEach(g=>{
    html+='<tr class="group-hdr"><td colspan="6">'+g.area+' \u2014 '+g.sqft.toLocaleString()+' sqft</td></tr>';
    g.items.forEach(i=>{html+='<tr><td>'+i.name+'</td><td class="mono">'+i.sku+'</td><td class="right mono">'+i.qty+'</td><td>'+i.unit+'</td><td class="right mono">'+fmt(i.costPer)+'</td><td class="right mono accent">'+fmt(i.totalCost)+'</td></tr>'});
  });
  html+='<tr class="ol-total"><td colspan="5">Total Material Cost</td><td class="right mono accent">'+fmt(totalCost)+'</td></tr></table>';
  // Aggregated purchase list
  html+='<div style="margin:24px 0 16px"><strong style="font-size:14px">Consolidated Purchase List</strong></div><table class="ol-table">';
  html+='<tr><th>Item</th><th>SKU</th><th class="right">Total Qty</th><th>Unit</th><th class="right">Est. Cost</th></tr>';
  Object.values(agg).sort((a,b)=>a.name.localeCompare(b.name)).forEach(i=>{html+='<tr><td>'+i.name+'</td><td class="mono">'+i.sku+'</td><td class="right mono">'+i.qty+'</td><td>'+i.unit+'</td><td class="right mono accent">'+fmt(i.totalCost)+'</td></tr>'});
  html+='<tr class="ol-total"><td colspan="4">Total</td><td class="right mono accent">'+fmt(totalCost)+'</td></tr></table>';
  document.getElementById('orderListContent').innerHTML=html;
}