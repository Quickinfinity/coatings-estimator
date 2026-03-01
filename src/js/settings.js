// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
let settingsTab = 'company';

function renderSettings(){
  // v-model handles simple form fields. Render only dynamic content.
  renderCustomCatTabs();renderCustomItems();
  renderTemplateList();
  renderEmailjsStatus();
  renderSettingsStats();
  renderLeadSources();
  renderCrewList();
  // PDF color picker (not v-model — needs hex conversion)
  const ci=document.getElementById('setPdfAccentColor');
  if(ci)ci.value=rgbToHex(settings.pdfAccentR||37,settings.pdfAccentG||99,settings.pdfAccentB||235);
  const pe=document.getElementById('pdfColorPreview');
  if(pe)pe.style.background='rgb('+(settings.pdfAccentR||37)+','+(settings.pdfAccentG||99)+','+(settings.pdfAccentB||235)+')';
}

function saveSettings(){
  // v-model keeps settings in sync. Validate numerics and persist.
  if(isNaN(settings.taxRate))settings.taxRate=0;
  if(isNaN(settings.depositPercent))settings.depositPercent=50;
  if(isNaN(settings.lateFeePercent))settings.lateFeePercent=0;
  if(isNaN(settings.proposalValidDays))settings.proposalValidDays=30;
  if(isNaN(settings.warrantyYears))settings.warrantyYears=1;
  if(isNaN(settings.invoiceNumberPadding))settings.invoiceNumberPadding=3;
  if(isNaN(settings.laborRate))settings.laborRate=0;
  if(isNaN(settings.targetMargin))settings.targetMargin=0;
  if(!settings.invoicePrefix)settings.invoicePrefix='INV-';
  if(!settings.pdfFilePrefix)settings.pdfFilePrefix='TCP';
  if(!settings.pdfFontFamily)settings.pdfFontFamily='helvetica';
  // PDF accent color from color picker
  const ci=document.getElementById('setPdfAccentColor');
  if(ci){const rgb=hexToRgb(ci.value);settings.pdfAccentR=rgb.r;settings.pdfAccentG=rgb.g;settings.pdfAccentB=rgb.b}
  // EmailJS init
  if(settings.emailjsPublicKey&&typeof emailjs!=='undefined'){emailjs.init(settings.emailjsPublicKey)}
  saveSettingsData(settings);toast('Saved','Settings updated.');
}

function confirmClearAll(){openConfirm('Clear All Data','This will permanently delete ALL records, estimates, and settings. This cannot be undone.',()=>{db.records=[];saveDB(db);Object.assign(settings,SETTINGS_DEFAULTS);saveSettingsData(settings);goHome();toast('Cleared','All data removed.')},'Clear All')}

// ── EmailJS Integration ──────────────────────────────────────
function isEmailJSReady(){return typeof emailjs!=='undefined'&&settings.emailjsPublicKey&&settings.emailjsServiceId&&settings.emailjsTemplateId}
function initEmailJS(){if(settings.emailjsPublicKey&&typeof emailjs!=='undefined'){try{emailjs.init(settings.emailjsPublicKey)}catch(e){}}}
function renderEmailjsStatus(){
  const el=document.getElementById('emailjsStatus');if(!el)return;
  if(isEmailJSReady()){
    el.innerHTML='<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;font-size:12px;color:#22c55e"><span style="font-size:16px">&#10003;</span> EmailJS connected &mdash; emails send with PDF attachments automatically.</div>';
  }else if(settings.emailjsPublicKey||settings.emailjsServiceId||settings.emailjsTemplateId){
    el.innerHTML='<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:8px;font-size:12px;color:#fbbf24"><span style="font-size:16px">&#9888;</span> Incomplete &mdash; fill in all three fields.</div>';
  }else{
    el.innerHTML='<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(127,127,140,0.1);border:1px solid rgba(127,127,140,0.2);border-radius:8px;font-size:12px;color:var(--t3)"><span style="font-size:16px">&#9993;</span> Not configured &mdash; emails use your default mail app.</div>';
  }
}
function testEmailJS(){
  if(!isEmailJSReady()){toast('Incomplete','Fill in all EmailJS fields and save first.');return}
  const testEmail=settings.email||prompt('Enter your email to send a test:');
  if(!testEmail)return;
  toast('Sending...','Sending test email to '+testEmail);
  emailjs.send(settings.emailjsServiceId,settings.emailjsTemplateId,{
    to_email:testEmail,to_name:settings.contactName||'Test',from_name:settings.companyName||'Coatings Estimator',
    reply_to:settings.email||'',subject:'Coatings Estimator - Test Email',
    message:'This is a test email from Coatings Estimator. If you received this, EmailJS is working correctly!'
  }).then(function(){toast('Test Passed','Check your inbox at '+testEmail)},
    function(err){toast('Test Failed',(err&&err.text)||'Check your EmailJS settings.')});
}

// ── Custom Products & Services ──────────────────────────────
// customCat and CUSTOM_CATS defined in data.js
function renderCustomCatTabs(){
  const el=document.getElementById('customCatTabs');if(!el)return;
  el.innerHTML=CUSTOM_CATS.map(c=>
    '<button class="tab-btn'+(customCat===c.id?' ac':'')+'" onclick="customCat=\''+c.id+'\';renderCustomCatTabs();renderCustomItems()">'+c.label+' ('+(settings[c.key]||[]).length+')</button>'
  ).join('');
}
function renderCustomItems(){
  const el=document.getElementById('customItemsList');if(!el)return;
  const cat=CUSTOM_CATS.find(c=>c.id===customCat);if(!cat)return;
  const items=settings[cat.key]||[];
  if(!items.length){el.innerHTML='<div style="font-size:12px;color:var(--t4);padding:8px 0">No custom '+cat.label.toLowerCase()+' yet.</div>';return}
  el.innerHTML=items.map((item,i)=>{
    const isProduct=customCat==='products';const isTopcoat=customCat==='topcoats';const isRepair=customCat==='repairs';
    let fields='<div class="g2"><div class="fg"><label>Name</label><input type="text" value="'+esc(item.name)+'" onchange="updateCustomItem('+i+',\'name\',this.value)"></div><div class="fg"><label>SKU</label><input type="text" value="'+esc(item.sku||'')+'" onchange="updateCustomItem('+i+',\'sku\',this.value)"></div></div>';
    fields+='<div class="g2"><div class="fg"><label>Material Cost ($/'+((isRepair||customCat==='addons')?item.unit||'unit':'sqft')+')</label><input type="number" step="0.01" min="0" value="'+(item.cost||0)+'" onchange="updateCustomItem('+i+',\'cost\',parseFloat(this.value)||0)"></div>';
    if(isProduct||customCat==='addons')fields+='<div class="fg"><label>Sell Low ($)</label><input type="number" step="0.01" min="0" value="'+(item.low||0)+'" onchange="updateCustomItem('+i+',\'low\',parseFloat(this.value)||0)"></div></div><div class="g2"><div class="fg"><label>Sell Mid ($)</label><input type="number" step="0.01" min="0" value="'+(item.mid||0)+'" onchange="updateCustomItem('+i+',\'mid\',parseFloat(this.value)||0)"></div>';
    if(isProduct)fields+='<div class="fg"><label>Category</label><input type="text" value="'+esc(item.cat||'Custom')+'" onchange="updateCustomItem('+i+',\'cat\',this.value)"></div></div>';
    else if(customCat==='addons')fields+='<div class="fg"><label>Unit</label><select onchange="updateCustomItem('+i+',\'unit\',this.value)"><option value="sqft"'+(item.unit==='sqft'?' selected':'')+'>sqft</option><option value="lnft"'+(item.unit==='lnft'?' selected':'')+'>lnft</option><option value="each"'+(item.unit==='each'?' selected':'')+'>each</option></select></div></div>';
    if(isTopcoat)fields+='<div class="fg"><label>Description</label><input type="text" value="'+esc(item.desc||'')+'" onchange="updateCustomItem('+i+',\'desc\',this.value)"></div></div><div class="g2"><div class="fg"><label>Unit Price ($)</label><input type="number" step="0.01" min="0" value="'+(item.unitPrice||0)+'" onchange="updateCustomItem('+i+',\'unitPrice\',parseFloat(this.value)||0)"></div><div class="fg"><label>Coverage (sqft/unit)</label><input type="number" step="1" min="1" value="'+(item.coverage||1)+'" onchange="updateCustomItem('+i+',\'coverage\',parseFloat(this.value)||1)"></div></div>';
    if(isRepair)fields+='<div class="fg"><label>Unit</label><select onchange="updateCustomItem('+i+',\'unit\',this.value)"><option value="sqft"'+(item.unit==='sqft'?' selected':'')+'>sqft</option><option value="lnft"'+(item.unit==='lnft'?' selected':'')+'>lnft</option><option value="each"'+(item.unit==='each'?' selected':'')+'>each</option></select></div></div>';
    return'<div style="padding:12px;border:1px solid var(--b1);border-radius:10px;background:var(--s2);margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-weight:600;font-size:13px;color:var(--t1)">'+(item.name||'New Item')+'</span><button class="btn btn-danger" onclick="deleteCustomItem('+i+')" style="font-size:11px;padding:3px 10px">Delete</button></div>'+fields+'</div>';
  }).join('');
}
// esc() defined in data.js
function addCustomItem(){
  const cat=CUSTOM_CATS.find(c=>c.id===customCat);if(!cat)return;
  if(!settings[cat.key])settings[cat.key]=[];
  const id='custom-'+uid();
  if(customCat==='products')settings[cat.key].push({id,sku:'',name:'',series:'Custom',cat:'Custom',cost:0,low:0,mid:0});
  else if(customCat==='topcoats')settings[cat.key].push({id,sku:'',name:'',cost:0,desc:'',unitPrice:0,coverage:1});
  else if(customCat==='repairs')settings[cat.key].push({id,sku:'',name:'',cost:0,unit:'sqft'});
  else if(customCat==='addons')settings[cat.key].push({id,sku:'',name:'',cost:0,low:0,mid:0,unit:'sqft'});
  saveSettingsData(settings);renderCustomCatTabs();renderCustomItems();
}
function updateCustomItem(idx,field,val){
  const cat=CUSTOM_CATS.find(c=>c.id===customCat);if(!cat)return;
  const items=settings[cat.key];if(!items||!items[idx])return;
  items[idx][field]=val;saveSettingsData(settings);renderCustomCatTabs();
}
function deleteCustomItem(idx){
  const cat=CUSTOM_CATS.find(c=>c.id===customCat);if(!cat)return;
  const items=settings[cat.key];if(!items||!items[idx])return;
  openConfirm('Delete Item','Remove "'+items[idx].name+'" from custom '+cat.label.toLowerCase()+'?',()=>{
    items.splice(idx,1);saveSettingsData(settings);renderCustomCatTabs();renderCustomItems();toast('Deleted','Custom item removed.');
  });
}

// ── Estimate Templates ──────────────────────────────────────
function renderTemplateList(){
  const el=document.getElementById('templateList');if(!el)return;
  const tpls=settings.estimateTemplates||[];
  if(!tpls.length){el.innerHTML='<div style="font-size:12px;color:var(--t4);padding:8px 0">No templates saved yet.</div>';return}
  el.innerHTML=tpls.map((t,i)=>'<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--s3);border-radius:8px;margin-bottom:6px"><div><div style="font-weight:600;font-size:14px;color:var(--t1)">'+esc(t.name)+'</div><div style="font-size:12px;color:var(--t3)">'+t.systems.length+' area'+(t.systems.length!==1?'s':'')+'</div></div><button class="btn btn-ghost" onclick="deleteTemplate('+i+')" style="font-size:11px;padding:3px 10px;color:var(--danger)">Delete</button></div>').join('');
}
function deleteTemplate(idx){
  const tpls=settings.estimateTemplates||[];if(!tpls[idx])return;
  openConfirm('Delete Template','Remove "'+tpls[idx].name+'"?',()=>{tpls.splice(idx,1);saveSettingsData(settings);renderTemplateList();toast('Deleted','Template removed.')});
}
function saveAsTemplate(){
  const est=getEstimate();if(!est||!est.systems.length){toast('No Systems','Add at least one area before saving as template.');return}
  const name=prompt('Template name:',est.name||'');if(!name)return;
  if(!settings.estimateTemplates)settings.estimateTemplates=[];
  const sysCopy=JSON.parse(JSON.stringify(est.systems));
  settings.estimateTemplates.push({id:'tpl-'+uid(),name:name,systems:sysCopy});
  saveSettingsData(settings);toast('Template Saved','"'+name+'" saved with '+sysCopy.length+' area(s).');
}

// ── Lead Sources ──────────────────────────────────────────
function renderLeadSources(){
  const el=document.getElementById('leadSourceList');if(!el)return;
  const sources=settings.leadSourcePresets||[];
  if(!sources.length){el.innerHTML='<div style="font-size:12px;color:var(--t4);padding:8px 0">No lead sources configured. Add some below.</div>';return}
  el.innerHTML=sources.map((s,i)=>
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--s3);border-radius:8px;margin-bottom:4px">'+
      '<span style="font-size:14px;color:var(--t1)">'+esc(s)+'</span>'+
      '<button class="btn btn-ghost" onclick="removeLeadSource('+i+')" style="font-size:11px;padding:3px 10px;color:var(--danger)">Remove</button>'+
    '</div>'
  ).join('');
}
function addLeadSource(){
  const input=document.getElementById('newLeadSource');
  const val=input.value.trim();
  if(!val)return;
  if(!settings.leadSourcePresets)settings.leadSourcePresets=[];
  if(settings.leadSourcePresets.includes(val)){toast('Duplicate','That lead source already exists.');return}
  settings.leadSourcePresets.push(val);
  input.value='';
  saveSettingsData(settings);renderLeadSources();
  toast('Added','"'+val+'" added to lead sources.');
}
function removeLeadSource(idx){
  const sources=settings.leadSourcePresets;
  if(!sources||!sources[idx])return;
  const name=sources[idx];
  sources.splice(idx,1);
  saveSettingsData(settings);renderLeadSources();
  toast('Removed','"'+name+'" removed.');
}

// ── Team / Crew ──────────────────────────────────────────
function renderCrewList(){
  const el=document.getElementById('crewList');if(!el)return;
  const crew=settings.crewMembers||[];
  if(!crew.length){el.innerHTML='<div style="font-size:12px;color:var(--t4);padding:8px 0">No crew members yet. Add your team below.</div>';return}
  el.innerHTML=crew.map((m,i)=>
    '<div style="padding:12px;border:1px solid var(--b1);border-radius:10px;background:var(--s2);margin-bottom:8px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
        '<div style="display:flex;align-items:center;gap:8px"><div style="width:12px;height:12px;border-radius:50%;background:'+(m.color||'#3b82f6')+'"></div><span style="font-weight:600;font-size:14px;color:var(--t1)">'+esc(m.name||'New Member')+'</span></div>'+
        '<button class="btn btn-danger" onclick="removeCrewMember('+i+')" style="font-size:11px;padding:3px 10px">Remove</button>'+
      '</div>'+
      '<div class="g2">'+
        '<div class="fg"><label>Name</label><input type="text" value="'+esc(m.name||'')+'" onchange="updateCrewMember('+i+',\'name\',this.value)"></div>'+
        '<div class="fg"><label>Role</label><input type="text" value="'+esc(m.role||'')+'" onchange="updateCrewMember('+i+',\'role\',this.value)" placeholder="e.g. Installer, Lead"></div>'+
      '</div>'+
      '<div class="g2">'+
        '<div class="fg"><label>Phone</label><input type="tel" value="'+esc(m.phone||'')+'" onchange="updateCrewMember('+i+',\'phone\',this.value)" placeholder="(555) 123-4567"></div>'+
        '<div class="fg"><label>Color</label><input type="color" value="'+(m.color||'#3b82f6')+'" onchange="updateCrewMember('+i+',\'color\',this.value)" style="width:48px;height:36px;padding:2px;cursor:pointer;border:1px solid var(--b1);border-radius:6px"></div>'+
      '</div>'+
    '</div>'
  ).join('');
}
function addCrewMember(){
  if(!settings.crewMembers)settings.crewMembers=[];
  settings.crewMembers.push({id:'crew-'+uid(),name:'',color:'#3b82f6',phone:'',role:''});
  saveSettingsData(settings);renderCrewList();
}
function updateCrewMember(idx,field,val){
  const crew=settings.crewMembers;if(!crew||!crew[idx])return;
  crew[idx][field]=val;saveSettingsData(settings);renderCrewList();
}
function removeCrewMember(idx){
  const crew=settings.crewMembers;if(!crew||!crew[idx])return;
  openConfirm('Remove Crew Member','Remove "'+(crew[idx].name||'this member')+'" from the team?',()=>{
    crew.splice(idx,1);saveSettingsData(settings);renderCrewList();toast('Removed','Crew member removed.');
  });
}

// ── Data Stats ──────────────────────────────────────────
function renderSettingsStats(){
  const el=document.getElementById('settingsStats');if(!el)return;
  const totalRecs=db.records.length;
  const totalEsts=db.records.reduce((sum,r)=>sum+r.estimates.length,0);
  const totalSqft=db.records.reduce((sum,r)=>sum+r.estimates.reduce((s2,e)=>s2+e.systems.reduce((s3,sys)=>s3+(sys.sqft||0),0),0),0);
  el.innerHTML='<div class="sg"><div class="sx"><div class="sl">Records</div><div class="sv">'+totalRecs+'</div></div>'+
    '<div class="sx"><div class="sl">Estimates</div><div class="sv">'+totalEsts+'</div></div>'+
    '<div class="sx"><div class="sl">Total Sqft</div><div class="sv">'+totalSqft.toLocaleString()+'</div></div></div>';
}

// ── Estimate Comparison ─────────────────────────────────────
function showEstimateComparison(){
  const rec=getRecord();if(!rec||rec.estimates.length<2)return;
  const ests=rec.estimates;
  const cols=ests.map(est=>{
    const ec=calcEstCosts(est);
    const areas=est.systems.map(s=>(s.areaName||'Unnamed')+' ('+s.sqft+' sqft)').join('<br>');
    const products=est.systems.map(s=>{const p=getAllProducts().find(x=>x.id===s.productId);return p?p.name:'Custom'}).join('<br>');
    const qs=est.quoteStatus||'draft';
    const margin=ec.sell>0?Math.round((ec.sell-ec.cost)/ec.sell*100):0;
    return'<div style="flex:1;min-width:200px;padding:16px;background:var(--s3);border-radius:12px;border:1px solid var(--brd)">'+
      '<div style="font-weight:700;font-size:15px;margin-bottom:12px;color:var(--t1)">'+(est.name||'Estimate')+'</div>'+
      '<div style="font-size:12px;text-transform:uppercase;font-weight:600;color:var(--t4);margin-bottom:4px">Status</div><div style="font-size:14px;margin-bottom:12px">'+qs.charAt(0).toUpperCase()+qs.slice(1)+'</div>'+
      '<div style="font-size:12px;text-transform:uppercase;font-weight:600;color:var(--t4);margin-bottom:4px">Areas ('+est.systems.length+')</div><div style="font-size:13px;margin-bottom:12px;line-height:1.5">'+areas+'</div>'+
      '<div style="font-size:12px;text-transform:uppercase;font-weight:600;color:var(--t4);margin-bottom:4px">Products</div><div style="font-size:13px;margin-bottom:12px;line-height:1.5">'+products+'</div>'+
      '<div style="font-size:12px;text-transform:uppercase;font-weight:600;color:var(--t4);margin-bottom:4px">Total Sqft</div><div style="font-size:14px;margin-bottom:12px">'+ec.sqft.toLocaleString()+'</div>'+
      '<div style="font-size:12px;text-transform:uppercase;font-weight:600;color:var(--t4);margin-bottom:4px">Price</div><div style="font-size:18px;font-weight:700;color:var(--accent);margin-bottom:8px">'+fmt(ec.totalWithTax)+'</div>'+
      (ec.cost>0?'<div style="font-size:12px;text-transform:uppercase;font-weight:600;color:var(--t4);margin-bottom:4px">Cost / Margin</div><div style="font-size:14px;margin-bottom:8px">'+fmt(ec.cost)+' <span style="color:var(--success)">('+margin+'%)</span></div>':'')+
      '<div style="font-size:12px;text-transform:uppercase;font-weight:600;color:var(--t4);margin-bottom:4px">$/sqft</div><div style="font-size:14px">'+(ec.sqft>0?'$'+(ec.sell/ec.sqft).toFixed(2):'\u2014')+'</div>'+
    '</div>'
  }).join('');
  const prices=ests.map(e=>calcEstCosts(e).totalWithTax);
  const delta=Math.max(...prices)-Math.min(...prices);
  const deltaLine=ests.length>=2?'<div style="text-align:center;padding:12px;font-size:13px;color:var(--t3)">Price difference: <strong>'+fmt(delta)+'</strong></div>':'';
  const modal=document.getElementById('confirmModal');
  modal.querySelector('.modal').innerHTML='<div style="padding:20px"><h3 style="font-size:16px;font-weight:700;margin-bottom:4px">Estimate Comparison</h3><p style="font-size:13px;color:var(--t3);margin-bottom:16px">Side-by-side view of all estimates</p>'+deltaLine+'<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px">'+cols+'</div><div style="text-align:right;margin-top:16px"><button class="btn btn-ghost" onclick="closeConfirm()">Close</button></div></div>';
  modal.scrollTop=0;modal.classList.add('active');
}

// ── Settings Helpers ──────────────────────────────────────
// rgbToHex() and hexToRgb() defined in utils.js
function handleLogoUpload(event){
  const file=event.target.files[0];if(!file)return;
  if(file.size>500000){toast('Too Large','Logo must be under 500KB.');event.target.value='';return}
  const reader=new FileReader();
  reader.onload=function(e){settings.companyLogo=e.target.result;saveSettingsData(settings);toast('Logo Saved','Company logo updated.')};
  reader.readAsDataURL(file);
}
function clearLogo(){settings.companyLogo='';saveSettingsData(settings);document.getElementById('setLogo').value='';toast('Logo Removed','Company logo cleared.')}
function updateInvoicePreview(){}
function updateColorPreview(){
  const ci=document.getElementById('setPdfAccentColor');if(!ci)return;
  const hex=ci.value;const rgb=hexToRgb(hex);
  settings.pdfAccentR=rgb.r;settings.pdfAccentG=rgb.g;settings.pdfAccentB=rgb.b;
  const pe=document.getElementById('pdfColorPreview');
  if(pe)pe.style.background='rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
}

// ── Booking Widget Generator ──────────────────────────────
function generateBookingWidget(){
  if(!isEmailJSReady()){toast('EmailJS Required','Configure EmailJS in the Email section first.');return}
  const types=(settings.bookingProjectTypes||[]).map(t=>"'"+t.replace(/'/g,"\\'")+"'").join(',');
  const code='<!-- Coatings Estimator Booking Widget -->\n<div id="ce-booking-widget"></div>\n<scr'+'ipt>\n(function(){\n  var c=document.getElementById("ce-booking-widget");\n  c.innerHTML=\'<form id="ce-book" style="max-width:500px;font-family:system-ui,sans-serif">'+
    '<h3 style="margin:0 0 16px;font-size:20px">Request a Free Estimate</h3>'+
    '<div style="margin-bottom:12px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px">Name *</label><input name="name" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:15px"></div>'+
    '<div style="margin-bottom:12px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px">Email *</label><input name="email" type="email" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:15px"></div>'+
    '<div style="margin-bottom:12px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px">Phone</label><input name="phone" type="tel" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:15px"></div>'+
    '<div style="margin-bottom:12px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px">Project Type</label><select name="type" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:15px"><option value="">Select...</option>\'+['+types+'].map(function(t){return \'<option>\'+t+\'</option>\'}).join(\'\')+\'</select></div>'+
    '<div style="margin-bottom:12px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px">Notes</label><textarea name="notes" rows="3" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:15px;resize:vertical"></textarea></div>'+
    '<button type="submit" style="background:#2563eb;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:600;cursor:pointer;width:100%">Submit Request</button>'+
    '</form>\';\n})();\n<\/scr'+'ipt>';
  // Show in modal
  const modal=document.getElementById('confirmModal');
  modal.querySelector('.modal').innerHTML='<div style="padding:20px"><h3 style="font-size:16px;font-weight:700;margin-bottom:4px">Booking Widget Code</h3><p style="font-size:13px;color:var(--t3);margin-bottom:12px">Copy and paste this into your website HTML.</p><textarea id="widgetCode" style="width:100%;height:200px;font-family:monospace;font-size:12px;padding:12px;background:var(--s1);border:1px solid var(--b1);border-radius:8px;color:var(--t1);resize:vertical" readonly>'+esc(code)+'</textarea><div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end"><button class="btn btn-primary" onclick="document.getElementById(\'widgetCode\').select();document.execCommand(\'copy\');toast(\'Copied\',\'Widget code copied to clipboard.\')">Copy Code</button><button class="btn btn-ghost" onclick="closeConfirm()">Close</button></div></div>';
  modal.scrollTop=0;modal.classList.add('active');
}
