// ═══════════════════════════════════════════════════════════
// PDF PROPOSAL (Phase 3)
// ═══════════════════════════════════════════════════════════
function generateProposal(returnBase64){
  const rec=getRecord();const est=getEstimate();
  if(!rec||!est){toast('Error','No estimate to generate.');return null}
  if(typeof window.jspdf==='undefined'){toast('Error','PDF library not loaded. Check internet connection.');return null}
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF();
  const pw=doc.internal.pageSize.getWidth();
  const rn=((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'Client';
  const ec=calcEstCosts(est);
  const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const ar=settings.pdfAccentR||37,ag=settings.pdfAccentG||99,ab=settings.pdfAccentB||235;
  const pf=settings.pdfFontFamily||'helvetica';
  // Header bar
  const compName=settings.companyName||'The Concrete Protector';
  const compTag=settings.tagline||'Decorative Concrete Coatings Proposal';
  doc.setFillColor(ar,ag,ab);doc.rect(0,0,pw,32,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(20);doc.setFont(pf,'bold');
  doc.text(compName,14,16);
  doc.setFontSize(10);doc.setFont(pf,'normal');
  doc.text(compTag,14,24);
  doc.setFontSize(9);doc.text(today,pw-14,16,{align:'right'});
  doc.text((est.name||'Estimate'),pw-14,24,{align:'right'});
  if(settings.companyLogo){try{doc.addImage(settings.companyLogo,'PNG',pw-54,4,40,24)}catch(e){}}
  // Client info
  let y=44;doc.setTextColor(60);doc.setFontSize(12);doc.setFont(pf,'bold');doc.text('Prepared For:',14,y);
  y+=7;doc.setFont(pf,'normal');doc.setFontSize(11);doc.setTextColor(30);
  doc.text(rn,14,y);y+=6;
  if(rec.company){doc.text(rec.company,14,y);y+=6}
  if(rec.address){doc.text(rec.address,14,y);y+=6}
  const loc=[rec.city,rec.state,rec.zip].filter(Boolean).join(', ');
  if(loc){doc.text(loc,14,y);y+=6}
  if(rec.phone){doc.text(rec.phone,14,y);y+=6}
  if(rec.email){doc.text(rec.email,14,y);y+=6}
  // Area table
  y+=8;doc.setFillColor(240,240,240);doc.rect(14,y,pw-28,8,'F');
  doc.setFontSize(9);doc.setFont(pf,'bold');doc.setTextColor(80);
  doc.text('Area',16,y+6);doc.text('System',70,y+6);doc.text('Sqft',120,y+6,{align:'right'});
  doc.text('$/Sqft',145,y+6,{align:'right'});doc.text('Price',pw-16,y+6,{align:'right'});
  y+=12;doc.setFont(pf,'normal');doc.setTextColor(30);
  est.systems.forEach((sys,i)=>{
    if(y>260){doc.addPage();y=20}
    const prod=getAllProducts().find(p=>p.id===sys.productId);
    const sc=calcSysCosts(sys);
    doc.setFontSize(10);
    doc.text(sys.areaName||'Area '+(i+1),16,y);
    doc.text(prod?prod.name:'—',70,y);
    doc.text((sys.sqft||0).toLocaleString(),120,y,{align:'right'});
    doc.text('$'+(sys.sellRate||0).toFixed(2),145,y,{align:'right'});
    doc.setFont(pf,'bold');doc.text(fmt(sc.sell),pw-16,y,{align:'right'});doc.setFont(pf,'normal');
    y+=7;
    // Line items for repairs/addons
    const extras=[];
    if(sys.repairs){Object.entries(sys.repairs).forEach(([id,r])=>{if(r.on&&r.qty>0){const def=getAllRepairs().find(x=>x.id===id);if(def)extras.push('  '+def.name+': '+r.qty+' '+def.unit+' @ $'+(r.sell||0).toFixed(2))}})}
    if(sys.addons){Object.entries(sys.addons).forEach(([id,a])=>{if(a.on&&a.qty>0){const def=getAllAddons().find(x=>x.id===id);if(def)extras.push('  '+def.name+': '+a.qty+' '+def.unit+' @ $'+(a.sell||0).toFixed(2))}})}
    if(extras.length){doc.setFontSize(8);doc.setTextColor(120);extras.forEach(ex=>{doc.text(ex,18,y);y+=5});doc.setTextColor(30)}
    doc.setDrawColor(230);doc.line(14,y-2,pw-14,y-2);y+=3;
  });
  // Total
  y+=4;
  if(ec.taxAmount>0){
    doc.setFontSize(10);doc.setFont(pf,'normal');doc.setTextColor(80);
    doc.text('Subtotal:',130,y+2);doc.text(fmt(ec.sell),pw-16,y+2,{align:'right'});y+=8;
    doc.text('Tax ('+(settings.taxRate||0)+'%):',130,y+2);doc.text(fmt(ec.taxAmount),pw-16,y+2,{align:'right'});y+=8;
  }
  doc.setFillColor(ar,ag,ab);doc.rect(100,y-5,pw-114,10,'F');
  doc.setFontSize(12);doc.setFont(pf,'bold');doc.setTextColor(255,255,255);
  doc.text('TOTAL:',102,y+2);doc.text(fmt(ec.taxAmount>0?ec.totalWithTax:ec.sell),pw-16,y+2,{align:'right'});
  // Terms
  y+=20;doc.setTextColor(80);doc.setFontSize(9);doc.setFont(pf,'bold');
  doc.text('Terms & Conditions',14,y);y+=6;doc.setFont(pf,'normal');doc.setFontSize(8);
  const terms=document.getElementById('contractTerms')?document.getElementById('contractTerms').value:(settings.terms||'Proposal valid for 30 days. 50% deposit required to schedule.');
  const tlines=doc.splitTextToSize(terms,pw-28);
  tlines.forEach(l=>{if(y>280){doc.addPage();y=20}doc.text(l,14,y);y+=4});
  // Signature lines
  y+=12;if(y>250){doc.addPage();y=20}
  doc.setDrawColor(180);doc.setLineWidth(0.5);
  doc.line(14,y,90,y);doc.line(110,y,pw-14,y);
  y+=5;doc.setFontSize(8);doc.text('Contractor Signature / Date',14,y);doc.text('Customer Signature / Date',110,y);
  // Footer
  y+=12;doc.setFontSize(7);doc.setTextColor(160);
  doc.text('Generated by Coatings Estimator \u2014 '+(settings.companyName||'The Concrete Protector'),pw/2,y,{align:'center'});
  const fn=(settings.pdfFilePrefix||'TCP')+'-Proposal-'+rn.replace(/\s+/g,'-')+'-'+new Date().toISOString().slice(0,10)+'.pdf';
  if(returnBase64){return{base64:doc.output('datauristring').split(',')[1],filename:fn}}
  doc.save(fn);if(nav.recordId)logActivity(nav.recordId,'proposal_generated','Proposal PDF generated for \''+est.name+'\'');
  if(!est.quoteStatus||est.quoteStatus==='draft'){est.quoteStatus='sent';est.quoteSentAt=new Date().toISOString()}
  saveDB(db);toast('Proposal Saved',fn);
}

// ═══════════════════════════════════════════════════════════
// CONTRACT / SIGNATURE (Phase 3)
// ═══════════════════════════════════════════════════════════
const sigPads={};
function initSignaturePads(){
  ['sigContractor','sigCustomer'].forEach(id=>{
    if(sigPads[id])return;
    const canvas=document.getElementById(id);if(!canvas)return;
    const ctx=canvas.getContext('2d');
    canvas.width=canvas.offsetWidth*2;canvas.height=canvas.offsetHeight*2;
    ctx.scale(2,2);ctx.strokeStyle='#1f2937';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';
    let drawing=false;let lx=0,ly=0;
    function getPos(e){const r=canvas.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top}}
    canvas.addEventListener('mousedown',e=>{drawing=true;const p=getPos(e);lx=p.x;ly=p.y});
    canvas.addEventListener('mousemove',e=>{if(!drawing)return;const p=getPos(e);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(p.x,p.y);ctx.stroke();lx=p.x;ly=p.y});
    canvas.addEventListener('mouseup',()=>drawing=false);
    canvas.addEventListener('mouseleave',()=>drawing=false);
    canvas.addEventListener('touchstart',e=>{e.preventDefault();drawing=true;const p=getPos(e);lx=p.x;ly=p.y},{passive:false});
    canvas.addEventListener('touchmove',e=>{e.preventDefault();if(!drawing)return;const p=getPos(e);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(p.x,p.y);ctx.stroke();lx=p.x;ly=p.y},{passive:false});
    canvas.addEventListener('touchend',()=>drawing=false);
    sigPads[id]={canvas,ctx};
  });
}
function clearSig(id){
  const pad=sigPads[id];
  if(pad){pad.ctx.clearRect(0,0,pad.canvas.width/2,pad.canvas.height/2)}
  else{const c=document.getElementById(id);if(c){const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height)}}
}
function generateContract(){
  const rec=getRecord();const est=getEstimate();
  if(!rec||!est){toast('Error','No estimate selected.');return}
  if(typeof window.jspdf==='undefined'){toast('Error','PDF library not loaded.');return}
  const{jsPDF}=window.jspdf;const doc=new jsPDF();
  const pw=doc.internal.pageSize.getWidth();
  const rn=((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'Client';
  const ec=calcEstCosts(est);
  const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const ar=settings.pdfAccentR||37,ag=settings.pdfAccentG||99,ab=settings.pdfAccentB||235;
  const pf=settings.pdfFontFamily||'helvetica';
  // Header
  doc.setFillColor(30,30,30);doc.rect(0,0,pw,28,'F');
  doc.setTextColor(ar,ag,ab);doc.setFontSize(18);doc.setFont(pf,'bold');
  doc.text('SERVICE CONTRACT',14,14);
  doc.setFontSize(10);doc.setTextColor(200,200,200);doc.setFont(pf,'normal');
  doc.text(settings.companyName||'The Concrete Protector',14,22);doc.text(today,pw-14,14,{align:'right'});
  // Parties
  let y=40;doc.setTextColor(30);doc.setFontSize(11);doc.setFont(pf,'bold');
  doc.text('Client:',14,y);doc.setFont(pf,'normal');doc.text(rn+(rec.company?' \u2014 '+rec.company:''),50,y);
  y+=7;const addr=[rec.address,[rec.city,rec.state,rec.zip].filter(Boolean).join(', ')].filter(Boolean).join(', ');
  if(addr){doc.setFontSize(10);doc.text(addr,50,y);y+=7}
  // Scope table
  y+=6;doc.setFontSize(11);doc.setFont(pf,'bold');doc.text('Scope of Work',14,y);y+=8;
  doc.setFillColor(245,245,245);doc.rect(14,y-4,pw-28,8,'F');
  doc.setFontSize(9);doc.setTextColor(80);doc.text('Area',16,y+2);doc.text('System',70,y+2);
  doc.text('Sqft',130,y+2,{align:'right'});doc.text('Price',pw-16,y+2,{align:'right'});y+=10;
  doc.setFont(pf,'normal');doc.setTextColor(30);
  est.systems.forEach((sys,i)=>{
    const prod=getAllProducts().find(p=>p.id===sys.productId);const sc=calcSysCosts(sys);
    doc.text(sys.areaName||'Area '+(i+1),16,y);doc.text(prod?prod.name:'\u2014',70,y);
    doc.text((sys.sqft||0).toLocaleString(),130,y,{align:'right'});
    doc.setFont(pf,'bold');doc.text(fmt(sc.sell),pw-16,y,{align:'right'});doc.setFont(pf,'normal');y+=7
  });
  y+=2;
  if(ec.taxAmount>0){
    doc.setFontSize(10);doc.setFont(pf,'normal');doc.setTextColor(80);
    doc.text('Subtotal:',130,y);doc.text(fmt(ec.sell),pw-16,y,{align:'right'});y+=7;
    doc.text('Tax ('+(settings.taxRate||0)+'%):',130,y);doc.text(fmt(ec.taxAmount),pw-16,y,{align:'right'});y+=7;
    doc.setTextColor(30);
  }
  doc.setDrawColor(ar,ag,ab);doc.setLineWidth(1);doc.line(100,y,pw-14,y);y+=6;
  doc.setFontSize(13);doc.setFont(pf,'bold');doc.text('Contract Total: '+fmt(ec.taxAmount>0?ec.totalWithTax:ec.sell),pw-16,y,{align:'right'});
  // Terms
  y+=14;doc.setFontSize(10);doc.text('Terms & Conditions',14,y);y+=7;
  doc.setFont(pf,'normal');doc.setFontSize(8);doc.setTextColor(60);
  const termsEl=document.getElementById('contractTerms');
  const terms=termsEl?termsEl.value:(settings.terms||'Proposal valid for 30 days. 50% deposit required to schedule.');
  doc.splitTextToSize(terms,pw-28).forEach(l=>{if(y>265){doc.addPage();y=20}doc.text(l,14,y);y+=4});
  // Signatures
  y+=10;if(y>230){doc.addPage();y=20}
  doc.setTextColor(30);doc.setFontSize(10);doc.setFont(pf,'bold');doc.text('Signatures',14,y);y+=10;
  ['sigContractor','sigCustomer'].forEach((id,i)=>{
    const c=document.getElementById(id);
    if(c){try{const img=c.toDataURL('image/png');doc.addImage(img,i===0?14:110,y,75,28)}catch(e){}}
  });
  y+=32;doc.setDrawColor(180);doc.setLineWidth(0.5);
  doc.line(14,y,90,y);doc.line(110,y,pw-14,y);y+=5;
  doc.setFontSize(8);doc.setFont(pf,'normal');doc.setTextColor(100);
  doc.text('Contractor Signature / Date',14,y);doc.text('Customer Signature / Date',110,y);
  y+=10;doc.setFontSize(7);doc.setTextColor(160);
  doc.text('Generated by Coatings Estimator \u2014 '+(settings.companyName||'The Concrete Protector'),pw/2,y,{align:'center'});
  const fn=(settings.pdfFilePrefix||'TCP')+'-Contract-'+rn.replace(/\s+/g,'-')+'-'+new Date().toISOString().slice(0,10)+'.pdf';
  doc.save(fn);if(nav.recordId)logActivity(nav.recordId,'contract_generated','Contract PDF generated for \''+est.name+'\'');saveDB(db);toast('Contract Saved',fn);
}