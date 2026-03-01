// ═══════════════════════════════════════════════════════════
// CLIENT PORTAL & ONLINE APPROVAL
// ═══════════════════════════════════════════════════════════
// Generates self-contained HTML files for:
// 1. Online estimate approval (with signature capture)
// 2. Client portal (estimates overview + payment links)

function generateApprovalPage(){
  const rec=getRecord();const est=getEstimate();
  if(!rec||!est){toast('Error','No estimate selected.');return}
  const rn=((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'Client';
  const ec=calcEstCosts(est);
  const accentR=settings.pdfAccentR||37,accentG=settings.pdfAccentG||99,accentB=settings.pdfAccentB||235;
  const accent='rgb('+accentR+','+accentG+','+accentB+')';
  const logo=settings.companyLogo?'<img src="'+settings.companyLogo+'" style="max-height:50px;max-width:180px;margin-bottom:12px">':'';
  const areas=est.systems.map(s=>{
    const sc=calcSysCosts(s);
    const prod=getAllProducts().find(p=>p.id===s.productId);
    return'<tr><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">'+esc(s.areaName||'Area')+'</td>'+
      '<td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">'+(prod?esc(prod.name):'Custom')+'</td>'+
      '<td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right">'+(s.sqft||0).toLocaleString()+' sqft</td>'+
      '<td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">'+fmt(sc.sellWithTax)+'</td></tr>'
  }).join('');
  const approvalMsg=settings.approvalMessage||'Please review the estimate below. If everything looks good, sign and click Approve.';
  const html='<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Estimate Approval - '+(est.name||'Estimate')+'</title>'+
    '<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:#f3f4f6;color:#1f2937;padding:24px}'+
    '.container{max-width:700px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden}'+
    '.header{background:'+accent+';color:#fff;padding:28px 32px}.header h1{font-size:20px;font-weight:700;margin-bottom:4px}.header p{font-size:14px;opacity:.85}'+
    '.body{padding:28px 32px}table{width:100%;border-collapse:collapse;margin:16px 0}th{text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;padding:8px 12px;border-bottom:2px solid #e5e7eb}'+
    '.total{font-size:28px;font-weight:700;color:'+accent+';text-align:right;padding:16px 0;border-top:2px solid '+accent+'}'+
    '.sig-area{margin:24px 0;padding:20px;border:2px dashed #d1d5db;border-radius:12px;text-align:center}'+
    'canvas{border:1px solid #d1d5db;border-radius:8px;cursor:crosshair;touch-action:none;background:#fafafa}'+
    '.btn{display:inline-block;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;border:none;cursor:pointer;margin:4px}'+
    '.btn-approve{background:'+accent+';color:#fff}.btn-approve:hover{filter:brightness(1.1)}'+
    '.btn-decline{background:#fee2e2;color:#ef4444}.btn-clear{background:#f3f4f6;color:#6b7280;font-size:13px;padding:8px 16px}'+
    '.confirmed{display:none;text-align:center;padding:40px}.confirmed h2{color:#22c55e;font-size:24px;margin-bottom:8px}'+
    '.terms{font-size:12px;color:#9ca3af;margin-top:16px;line-height:1.6}'+
    '</style></head><body><div class="container"><div class="header">'+logo+'<h1>'+(settings.companyName||'Estimate')+'</h1><p>Estimate for '+esc(rn)+'</p></div>'+
    '<div class="body" id="reviewSection"><p style="font-size:14px;color:#6b7280;margin-bottom:16px">'+esc(approvalMsg)+'</p>'+
    '<h3 style="font-size:16px;font-weight:600;margin-bottom:8px">'+(est.name||'Estimate')+'</h3>'+
    '<table><thead><tr><th>Area</th><th>System</th><th style="text-align:right">Size</th><th style="text-align:right">Price</th></tr></thead><tbody>'+areas+'</tbody></table>'+
    '<div class="total">Total: '+fmt(ec.totalWithTax)+'</div>'+
    (settings.terms?'<div class="terms"><strong>Terms & Conditions:</strong><br>'+esc(settings.terms)+'</div>':'')+
    '<div class="sig-area"><p style="font-size:13px;color:#6b7280;margin-bottom:8px">Sign below to approve</p>'+
    '<canvas id="sigCanvas" width="600" height="150"></canvas><br>'+
    '<button class="btn btn-clear" onclick="clearSig()">Clear Signature</button></div>'+
    '<div style="text-align:center;margin-top:16px">'+
    '<button class="btn btn-approve" onclick="approve()">Approve Estimate</button> '+
    '<button class="btn btn-decline" onclick="decline()">Decline</button></div></div>'+
    '<div class="confirmed" id="confirmedSection"><div style="font-size:48px;margin-bottom:12px">&#10004;</div><h2>Estimate Approved!</h2>'+
    '<p style="color:#6b7280">Confirmation Code: <strong id="confCode"></strong></p>'+
    '<p style="color:#9ca3af;font-size:13px;margin-top:8px">Please screenshot or save this page for your records.</p></div>'+
    '</div><scr'+'ipt>'+
    'var c=document.getElementById("sigCanvas"),ctx=c.getContext("2d"),drawing=false,lx=0,ly=0;'+
    'ctx.strokeStyle="#1f2937";ctx.lineWidth=2;ctx.lineCap="round";'+
    'function gp(e){var r=c.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top}}'+
    'c.addEventListener("mousedown",function(e){drawing=true;var p=gp(e);lx=p.x;ly=p.y});'+
    'c.addEventListener("mousemove",function(e){if(!drawing)return;var p=gp(e);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(p.x,p.y);ctx.stroke();lx=p.x;ly=p.y});'+
    'c.addEventListener("mouseup",function(){drawing=false});c.addEventListener("mouseleave",function(){drawing=false});'+
    'c.addEventListener("touchstart",function(e){e.preventDefault();drawing=true;var p=gp(e);lx=p.x;ly=p.y},{passive:false});'+
    'c.addEventListener("touchmove",function(e){e.preventDefault();if(!drawing)return;var p=gp(e);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(p.x,p.y);ctx.stroke();lx=p.x;ly=p.y},{passive:false});'+
    'c.addEventListener("touchend",function(){drawing=false});'+
    'function clearSig(){ctx.clearRect(0,0,c.width,c.height)}'+
    'function approve(){var code=Math.random().toString(36).substr(2,8).toUpperCase();document.getElementById("confCode").textContent=code;document.getElementById("reviewSection").style.display="none";document.getElementById("confirmedSection").style.display="block"}'+
    'function decline(){if(confirm("Are you sure you want to decline this estimate?")){document.getElementById("reviewSection").innerHTML="<div style=\\"text-align:center;padding:40px\\"><div style=\\"font-size:48px;margin-bottom:12px\\">&#10006;</div><h2 style=\\"color:#ef4444\\">Estimate Declined</h2><p style=\\"color:#6b7280;margin-top:8px\\">The contractor has been notified.</p></div>"}}'+
    '<\/script></body></html>';
  // Download as HTML file
  const blob=new Blob([html],{type:'text/html'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=(settings.pdfFilePrefix||'TCP')+'-Approval-'+esc(rn).replace(/\s+/g,'-')+'.html';
  a.click();URL.revokeObjectURL(a.href);
  toast('Downloaded','Approval page ready to send to client.');
  logActivity(rec.id,'approval_sent','Estimate approval page generated for '+(est.name||'Estimate'));
}

function generateClientPortal(){
  const rec=getRecord();
  if(!rec){toast('Error','No record selected.');return}
  const rn=((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'Client';
  const accentR=settings.pdfAccentR||37,accentG=settings.pdfAccentG||99,accentB=settings.pdfAccentB||235;
  const accent='rgb('+accentR+','+accentG+','+accentB+')';
  const logo=settings.companyLogo?'<img src="'+settings.companyLogo+'" style="max-height:50px;max-width:180px;margin-bottom:12px">':'';
  // Estimates
  let estHTML='';
  rec.estimates.forEach(est=>{
    const ec=calcEstCosts(est);
    const qs=est.quoteStatus||'draft';
    const qsLabel={draft:'Draft',sent:'Sent',approved:'Approved',declined:'Declined'};
    const qsColor={draft:'#9ca3af',sent:'#3b82f6',approved:'#22c55e',declined:'#ef4444'};
    estHTML+='<div style="border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:12px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'+
        '<h3 style="font-size:16px;font-weight:600">'+(est.name||'Estimate')+'</h3>'+
        '<span style="font-size:12px;font-weight:600;color:'+qsColor[qs]+';text-transform:uppercase">'+qsLabel[qs]+'</span>'+
      '</div>'+
      '<div style="font-size:14px;color:#6b7280;margin-bottom:8px">'+est.systems.length+' area'+(est.systems.length!==1?'s':'')+' &middot; '+ec.sqft.toLocaleString()+' sqft</div>'+
      '<div style="font-size:24px;font-weight:700;color:'+accent+'">'+fmt(ec.totalWithTax)+'</div>'+
    '</div>';
  });
  // Invoices
  let invHTML='';
  const allInvs=rec.estimates.reduce((arr,est)=>{if(est.invoices)est.invoices.forEach(inv=>arr.push({inv,est}));return arr},[]);
  if(allInvs.length){
    allInvs.forEach(({inv})=>{
      const statusColor={draft:'#9ca3af',sent:'#3b82f6',paid:'#22c55e',partial:'#f59e0b',overdue:'#ef4444'};
      invHTML+='<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px">'+
        '<div><div style="font-weight:600;font-size:14px">'+esc(inv.number||'Invoice')+'</div>'+
        '<div style="font-size:12px;color:#6b7280">'+new Date(inv.date||inv.createdAt).toLocaleDateString()+'</div></div>'+
        '<div style="text-align:right"><div style="font-weight:600;color:'+accent+'">'+fmt(inv.total||0)+'</div>'+
        '<div style="font-size:12px;font-weight:600;color:'+(statusColor[inv.status]||'#9ca3af')+'">'+(inv.status||'draft').toUpperCase()+'</div></div>'+
      '</div>';
    });
  }
  // Stripe payment link
  const paymentBtn=settings.stripeEnabled&&settings.stripePaymentLinkBase?
    '<a href="'+esc(settings.stripePaymentLinkBase)+'?client_reference_id='+encodeURIComponent(rec.id)+'&prefilled_email='+encodeURIComponent(rec.email||'')+'" target="_blank" style="display:inline-block;padding:14px 32px;background:'+accent+';color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;margin-top:16px">Pay Now</a>':'';

  const html='<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>Client Portal - '+esc(rn)+'</title>'+
    '<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:#f3f4f6;color:#1f2937;padding:24px}'+
    '.container{max-width:700px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden}'+
    '.header{background:'+accent+';color:#fff;padding:28px 32px}.header h1{font-size:20px;font-weight:700;margin-bottom:4px}.header p{font-size:14px;opacity:.85}'+
    '.body{padding:28px 32px}h2{font-size:18px;font-weight:600;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #f3f4f6}'+
    '.footer{padding:20px 32px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af}'+
    '</style></head><body><div class="container"><div class="header">'+logo+
    '<h1>'+(settings.companyName||'Client Portal')+'</h1>'+
    '<p>Project details for '+esc(rn)+'</p></div>'+
    '<div class="body">'+
    (rec.address?'<div style="font-size:14px;color:#6b7280;margin-bottom:20px">'+esc(rec.address)+(rec.city?', '+esc(rec.city):'')+(rec.state?' '+esc(rec.state):'')+(rec.zip?' '+esc(rec.zip):'')+'</div>':'')+
    (estHTML?'<h2>Estimates</h2>'+estHTML:'')+
    (invHTML?'<h2 style="margin-top:24px">Invoices</h2>'+invHTML:'')+
    (paymentBtn?'<div style="text-align:center;margin-top:24px">'+paymentBtn+'</div>':'')+
    '</div><div class="footer">&copy; '+(new Date().getFullYear())+' '+(settings.companyName||'')+(settings.phone?' &middot; '+esc(settings.phone):'')+(settings.email?' &middot; '+esc(settings.email):'')+'</div>'+
    '</div></body></html>';
  const blob=new Blob([html],{type:'text/html'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=(settings.pdfFilePrefix||'TCP')+'-Portal-'+esc(rn).replace(/\s+/g,'-')+'.html';
  a.click();URL.revokeObjectURL(a.href);
  toast('Downloaded','Client portal ready to send.');
  logActivity(rec.id,'portal_sent','Client portal generated');
}
