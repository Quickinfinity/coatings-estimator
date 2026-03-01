// ═══════════════════════════════════════════════════════════
// INVOICING
// ═══════════════════════════════════════════════════════════
function getNextInvoiceNumber(){
  let n=parseInt(localStorage.getItem('ce_inv_num_'+getActiveProfileId()))||0;
  n++;localStorage.setItem('ce_inv_num_'+getActiveProfileId(),n);
  return(settings.invoicePrefix||'INV-')+String(n).padStart(settings.invoiceNumberPadding||3,'0');
}
function getInvoiceById(invId){
  for(const r of db.records){for(const e of r.estimates){if(!e.invoices)continue;const inv=e.invoices.find(i=>i.id===invId);if(inv)return inv}}return null;
}
function getAllInvoices(){
  const all=[];
  db.records.forEach(r=>r.estimates.forEach(e=>{if(e.invoices)e.invoices.forEach(inv=>{all.push({invoice:inv,estimate:e,record:r})})}));
  return all;
}
function createInvoice(type){
  const est=getEstimate();const rec=getRecord();if(!est||!rec)return;
  if(!est.invoices)est.invoices=[];
  const ec=calcEstCosts(est);
  const depositPct=type==='deposit'?(settings.depositPercent!=null?settings.depositPercent:50):null;
  const lineTotal=depositPct?ec.sell*(depositPct/100):ec.sell;
  const taxAmt=depositPct?ec.taxAmount*(depositPct/100):ec.taxAmount;
  const items=type==='deposit'?[{description:'Deposit ('+depositPct+'%) for '+est.name,qty:1,unit:'ea',rate:lineTotal,amount:lineTotal,taxable:true}]:
    est.systems.map(sys=>{const sc=calcSysCosts(sys);const prod=getAllProducts().find(p=>p.id===sys.productId);return{description:(sys.areaName||'Area')+' — '+(prod?prod.name:'Custom')+' ('+sys.sqft+' sqft)',qty:1,unit:'ea',rate:sc.sell,amount:sc.sell,taxable:sys.taxable!==false}});
  const termDays={due_on_receipt:0,net15:15,net30:30,net60:60};
  const due=new Date();due.setDate(due.getDate()+(termDays[settings.paymentTerms]||30));
  const inv={
    id:uid(),number:getNextInvoiceNumber(),createdAt:new Date().toISOString(),
    dueDate:due.toISOString().slice(0,10),
    status:'draft',type:type==='deposit'?'deposit':'standard',
    lineItems:items,subtotal:lineTotal,taxRate:settings.taxRate||0,taxAmount:taxAmt,
    total:lineTotal+taxAmt,depositPercent:depositPct,
    discountType:'none',discountValue:0,discountAmount:0,
    payments:[],amountPaid:0,balance:lineTotal+taxAmt,
    notes:'',sentAt:null
  };
  est.invoices.push(inv);
  logActivity(rec.id,'invoice_created','Invoice '+inv.number+' created ('+fmt(inv.total)+')');
  saveDB(db);goInvoice(inv.id);toast('Invoice Created',inv.number);
}
function renderInvoicesList(){
  const est=getEstimate();if(!est)return;
  if(!est.invoices||!est.invoices.length){document.getElementById('invoicesList').innerHTML='<div class="empty"><div class="empty-icon">&#128179;</div><div class="empty-text">No invoices yet. Create one from this estimate.</div></div>';return}
  checkOverdueInvoices();
  document.getElementById('invoicesList').innerHTML=est.invoices.map(inv=>{
    const statusColors={draft:'var(--t3)',sent:'var(--accent)',partial:'var(--accent)',paid:'var(--success)',overdue:'var(--comp)'};
    return'<div class="sys-card has-product" onclick="goInvoice(\''+inv.id+'\')"><div><div class="sys-area">'+inv.number+'</div><div class="sys-detail">'+inv.type+' \u00b7 '+(inv.dueDate||'No due date')+' \u00b7 <span style="color:'+(statusColors[inv.status]||'var(--t3)')+'">'+inv.status.toUpperCase()+'</span></div></div><div class="sys-right"><div class="sys-price">'+fmt(inv.total)+'</div>'+(inv.balance>0&&inv.balance<inv.total?'<div class="sys-cost">Balance '+fmt(inv.balance)+'</div>':'')+'</div></div>'
  }).join('');
}
function renderInvoice(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv){goEstimate(nav.estimateId);return}
  const rec=getRecord();
  const rn=rec?((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'Client':'Client';
  document.getElementById('invNumber').textContent=inv.number;
  const statusColors={draft:'lead',sent:'est',partial:'est',paid:'comp',overdue:'proj'};
  document.getElementById('invStatusBadge').className='li-badge '+(statusColors[inv.status]||'');
  document.getElementById('invStatusBadge').textContent=inv.status.toUpperCase();
  const created=inv.createdAt?new Date(inv.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
  const sent=inv.sentAt?'Sent '+new Date(inv.sentAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
  document.getElementById('invSubline').textContent=rn+(rec&&rec.company?' \u2014 '+rec.company:'')+(inv.type==='deposit'?' \u2014 Deposit':'')+(created?' \u00b7 Created '+created:'')+(sent?' \u00b7 '+sent:'');
  // From / To
  const fromLines=[(settings.companyName||''),(settings.contactName||''),(settings.address||''),([settings.city,settings.state,settings.zip].filter(Boolean).join(', ')),(settings.phone||''),(settings.email||'')].filter(Boolean);
  const toLines=[rn,(rec&&rec.company?rec.company:''),(rec&&rec.address?rec.address:''),([rec&&rec.city,rec&&rec.state,rec&&rec.zip].filter(Boolean).join(', ')),(rec&&rec.phone?rec.phone:''),(rec&&rec.email?rec.email:'')].filter(Boolean);
  document.getElementById('invFrom').innerHTML=fromLines.join('<br>');
  document.getElementById('invTo').innerHTML=toLines.join('<br>');
  document.getElementById('invDueDate').value=inv.dueDate||'';
  document.getElementById('invType').textContent=inv.type==='deposit'?'Deposit ('+inv.depositPercent+'%)':'Standard';
  document.getElementById('invStatus').innerHTML='<span style="color:'+(inv.status==='paid'?'var(--success)':inv.status==='overdue'?'var(--comp)':'var(--t1)')+'">'+inv.status.charAt(0).toUpperCase()+inv.status.slice(1)+'</span>';
  document.getElementById('invNotes').value=inv.notes||'';
  // Action buttons by status
  let btns='<button class="btn btn-primary" onclick="generateInvoicePDF()">Download PDF</button>';
  if(inv.status!=='paid'){
    btns+='<button class="btn btn-ghost" onclick="emailInvoice()">Email</button>';
    btns+='<button class="btn btn-ghost" onclick="textInvoice()">Text</button>';
  }
  if(inv.status==='draft'){
    btns+='<button class="btn btn-ghost" onclick="markInvoiceSent()">Mark Sent</button>';
    btns+='<button class="btn btn-danger" onclick="deleteInvoice()">Delete</button>';
  }
  if(inv.status!=='paid'&&inv.status!=='draft'){
    btns+='<button class="btn btn-success" onclick="openPaymentModal()">Record Payment</button>';
    btns+='<button class="btn btn-ghost" onclick="markInvoicePaid()">Mark Paid</button>';
    btns+='<button class="btn btn-ghost" onclick="sendInvoiceReminder()">Reminder</button>';
  }
  document.getElementById('invActions').innerHTML=btns;
  // Editable line items
  renderInvoiceLineItems();
  // Discount
  renderInvoiceDiscount();
  // Totals
  renderInvoiceTotals();
  // Payments
  if(inv.payments.length){
    let payHtml='<table style="width:100%;font-size:13px;border-collapse:collapse"><tr style="border-bottom:1px solid var(--b1)"><th style="text-align:left;padding:6px 4px;color:var(--t3);font-weight:500">Date</th><th style="text-align:left;padding:6px 4px;color:var(--t3);font-weight:500">Method</th><th style="text-align:right;padding:6px 4px;color:var(--t3);font-weight:500">Amount</th></tr>';
    inv.payments.forEach(pay=>{payHtml+='<tr style="border-bottom:1px solid var(--b1)"><td style="padding:8px 4px">'+pay.date+'</td><td style="padding:8px 4px">'+pay.method+(pay.note?' \u2014 '+pay.note:'')+'</td><td style="text-align:right;padding:8px 4px;font-family:monospace;color:var(--success)">'+fmt(pay.amount)+'</td></tr>'});
    payHtml+='</table>';
    document.getElementById('invPayments').innerHTML=payHtml;
  }else{document.getElementById('invPayments').innerHTML='<div class="empty"><div class="empty-text">No payments recorded yet.</div></div>'}
  // Balance
  document.getElementById('invBalance').innerHTML='<div class="sx"><div class="sl">Total Paid</div><div class="sv" style="color:var(--success)">'+fmt(inv.amountPaid)+'</div></div><div class="sx hl"><div class="sl">Balance Due</div><div class="sv" style="color:'+(inv.balance>0?'var(--comp)':'var(--success)')+'">'+fmt(inv.balance)+'</div></div>';
  // Stripe pay button
  renderStripePayButton();
}
function renderInvoiceLineItems(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv)return;
  const editable=inv.status==='draft';
  let h='<table style="width:100%;font-size:13px;border-collapse:collapse">';
  h+='<tr style="border-bottom:1px solid var(--b1)"><th style="text-align:left;padding:6px 4px;color:var(--t3);font-weight:500">Description</th><th style="text-align:right;padding:6px 4px;color:var(--t3);font-weight:500;width:65px">Qty</th><th style="text-align:right;padding:6px 4px;color:var(--t3);font-weight:500;width:85px">Rate</th><th style="text-align:right;padding:6px 4px;color:var(--t3);font-weight:500;width:85px">Amount</th>'+(editable?'<th style="width:32px"></th>':'')+'</tr>';
  inv.lineItems.forEach((li,i)=>{
    if(editable){
      h+='<tr style="border-bottom:1px solid var(--b1)"><td style="padding:4px 2px"><input type="text" value="'+li.description.replace(/"/g,'&quot;')+'" onchange="updateLineItem('+i+',\'description\',this.value)" style="width:100%;font-size:12px;padding:4px 6px;background:var(--s2);border:1px solid var(--b1);color:var(--t1);border-radius:4px"></td>';
      h+='<td style="padding:4px 2px"><input type="number" value="'+li.qty+'" min="0" step="1" onchange="updateLineItem('+i+',\'qty\',this.value)" style="width:100%;text-align:right;font-size:12px;padding:4px 6px;background:var(--s2);border:1px solid var(--b1);color:var(--t1);border-radius:4px"></td>';
      h+='<td style="padding:4px 2px"><input type="number" value="'+li.rate.toFixed(2)+'" min="0" step="0.01" onchange="updateLineItem('+i+',\'rate\',this.value)" style="width:100%;text-align:right;font-size:12px;padding:4px 6px;background:var(--s2);border:1px solid var(--b1);color:var(--t1);border-radius:4px"></td>';
      h+='<td style="text-align:right;padding:8px 4px;font-family:monospace">'+fmt(li.amount)+'</td>';
      h+='<td style="text-align:center"><button onclick="removeLineItem('+i+')" style="background:none;border:none;color:var(--comp);cursor:pointer;font-size:16px;padding:4px" title="Remove">&times;</button></td></tr>';
    }else{
      h+='<tr style="border-bottom:1px solid var(--b1)"><td style="padding:8px 4px">'+li.description+(li.taxable&&inv.taxRate>0?' <span style="font-size:10px;color:var(--t3)">T</span>':'')+'</td><td style="text-align:right;padding:8px 4px">'+li.qty+'</td><td style="text-align:right;padding:8px 4px;font-family:monospace">'+fmt(li.rate)+'</td><td style="text-align:right;padding:8px 4px;font-family:monospace">'+fmt(li.amount)+'</td></tr>';
    }
  });
  h+='</table>';
  document.getElementById('invLineItems').innerHTML=h;
}
function updateLineItem(idx,field,val){
  const inv=getInvoiceById(nav.invoiceId);if(!inv||!inv.lineItems[idx])return;
  const li=inv.lineItems[idx];
  if(field==='description')li.description=val;
  else if(field==='qty'){li.qty=parseFloat(val)||0;li.amount=li.qty*li.rate}
  else if(field==='rate'){li.rate=parseFloat(val)||0;li.amount=li.qty*li.rate}
  recalcInvoiceTotals();renderInvoiceLineItems();renderInvoiceTotals();
}
function addLineItem(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv)return;
  inv.lineItems.push({description:'Custom item',qty:1,unit:'ea',rate:0,amount:0,taxable:true});
  recalcInvoiceTotals();renderInvoiceLineItems();renderInvoiceTotals();
}
function removeLineItem(idx){
  const inv=getInvoiceById(nav.invoiceId);if(!inv)return;
  inv.lineItems.splice(idx,1);
  recalcInvoiceTotals();renderInvoiceLineItems();renderInvoiceTotals();
}
function recalcInvoiceTotals(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv)return;
  const rawSubtotal=inv.lineItems.reduce((s,li)=>s+li.amount,0);
  if(inv.discountType==='percent')inv.discountAmount=rawSubtotal*(inv.discountValue/100);
  else if(inv.discountType==='flat')inv.discountAmount=Math.min(inv.discountValue,rawSubtotal);
  else inv.discountAmount=0;
  inv.subtotal=rawSubtotal-inv.discountAmount;
  const taxableSubtotal=inv.lineItems.filter(li=>li.taxable).reduce((s,li)=>s+li.amount,0);
  if(inv.discountAmount>0){
    const discountRatio=rawSubtotal>0?inv.discountAmount/rawSubtotal:0;
    inv.taxAmount=(taxableSubtotal*(1-discountRatio))*(inv.taxRate/100);
  }else{
    inv.taxAmount=taxableSubtotal*(inv.taxRate/100);
  }
  inv.total=inv.subtotal+inv.taxAmount;
  inv.balance=Math.max(0,inv.total-inv.amountPaid);
  if(inv.balance<=0&&inv.amountPaid>0)inv.status='paid';
  saveDB(db);
}
function renderInvoiceDiscount(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv)return;
  const el=document.getElementById('invDiscount');
  if(inv.status!=='draft'){el.style.display=inv.discountAmount>0?'':'none';if(inv.discountAmount>0)el.innerHTML='<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:var(--t2)"><span>Discount'+(inv.discountType==='percent'?' ('+inv.discountValue+'%)':'')+'</span><span style="color:var(--success)">-'+fmt(inv.discountAmount)+'</span></div>';return}
  el.style.display='';
  el.innerHTML='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><label style="font-size:12px;color:var(--t3);white-space:nowrap">Discount</label><select onchange="updateInvoiceDiscount(\'type\',this.value)" style="font-size:12px;padding:4px 8px;background:var(--s2);border:1px solid var(--b1);color:var(--t1);border-radius:4px"><option value="none"'+(inv.discountType==='none'?' selected':'')+'>None</option><option value="percent"'+(inv.discountType==='percent'?' selected':'')+'>%</option><option value="flat"'+(inv.discountType==='flat'?' selected':'')+'>$</option></select>'+(inv.discountType!=='none'?'<input type="number" value="'+inv.discountValue+'" min="0" step="0.01" onchange="updateInvoiceDiscount(\'value\',this.value)" style="width:80px;font-size:12px;padding:4px 8px;text-align:right;background:var(--s2);border:1px solid var(--b1);color:var(--t1);border-radius:4px"><span style="font-size:12px;color:var(--success)">-'+fmt(inv.discountAmount)+'</span>':'')+'</div>';
}
function updateInvoiceDiscount(field,val){
  const inv=getInvoiceById(nav.invoiceId);if(!inv)return;
  if(field==='type'){inv.discountType=val;if(val==='none'){inv.discountValue=0;inv.discountAmount=0}}
  else if(field==='value')inv.discountValue=parseFloat(val)||0;
  recalcInvoiceTotals();renderInvoiceDiscount();renderInvoiceTotals();
}
function renderInvoiceTotals(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv)return;
  const rawSub=inv.lineItems.reduce((s,li)=>s+li.amount,0);
  let h='<div class="sx"><div class="sl">Subtotal</div><div class="sv">'+fmt(rawSub)+'</div></div>';
  if(inv.discountAmount>0)h+='<div class="sx"><div class="sl">Discount</div><div class="sv" style="color:var(--success)">-'+fmt(inv.discountAmount)+'</div></div>';
  if(inv.taxAmount>0)h+='<div class="sx"><div class="sl">Tax ('+inv.taxRate+'%)</div><div class="sv">'+fmt(inv.taxAmount)+'</div></div>';
  h+='<div class="sx hl"><div class="sl">Total</div><div class="sv" style="color:var(--accent)">'+fmt(inv.total)+'</div></div>';
  document.getElementById('invTotals').innerHTML=h;
}
function updateInvoiceField(field,val){const inv=getInvoiceById(nav.invoiceId);if(!inv)return;inv[field]=val;saveDB(db)}
function markInvoiceSent(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv)return;
  inv.status='sent';inv.sentAt=new Date().toISOString();
  if(nav.recordId)logActivity(nav.recordId,'invoice_sent','Invoice '+inv.number+' marked as sent');
  saveDB(db);renderInvoice();toast('Sent','Invoice marked as sent.');
}
function markInvoicePaid(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv||inv.balance<=0)return;
  const amt=inv.balance;
  inv.payments.push({id:uid(),date:new Date().toISOString().slice(0,10),amount:amt,method:'Manual',note:'Marked as paid'});
  inv.amountPaid=(inv.amountPaid||0)+amt;inv.balance=0;inv.status='paid';
  if(nav.recordId)logActivity(nav.recordId,'payment_received','Payment of '+fmt(amt)+' received for '+inv.number+' (marked paid)');
  saveDB(db);renderInvoice();
  const rec=getRecord();if(rec&&isRecordInvoiced(rec)){const allPaid=rec.estimates.every(e=>!e.invoices||e.invoices.every(i=>i.status==='paid'));if(allPaid)toast('Paid in Full','\u2713 All invoices paid!');else toast('Paid',inv.number+' marked as paid.')}else toast('Paid',inv.number+' marked as paid.');
}
function deleteInvoice(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv||inv.status!=='draft')return;
  openConfirm('Delete Invoice','Delete '+inv.number+'? This cannot be undone.',()=>{
    const est=getEstimate();if(!est||!est.invoices)return;
    est.invoices=est.invoices.filter(i=>i.id!==inv.id);
    if(nav.recordId)logActivity(nav.recordId,'invoice_deleted','Invoice '+inv.number+' deleted');
    saveDB(db);goEstimate(nav.estimateId);switchEstTab('invoices');toast('Deleted',inv.number+' removed.');
  },'Delete');
}
function openPaymentModal(){
  document.getElementById('payAmount').value='';
  document.getElementById('payDate').value=new Date().toISOString().slice(0,10);
  document.getElementById('payNote').value='';
  const pm=document.getElementById('paymentModal');pm.scrollTop=0;pm.classList.add('active');
}
function closePaymentModal(){document.getElementById('paymentModal').classList.remove('active')}
function recordPayment(){
  const inv=getInvoiceById(nav.invoiceId);if(!inv)return;
  const amt=parseFloat(document.getElementById('payAmount').value)||0;
  if(amt<=0){toast('Error','Enter a payment amount.');return}
  const pay={id:uid(),date:document.getElementById('payDate').value,amount:amt,method:document.getElementById('payMethod').value,note:document.getElementById('payNote').value.trim()};
  inv.payments.push(pay);
  inv.amountPaid=(inv.amountPaid||0)+amt;
  inv.balance=inv.total-inv.amountPaid;
  if(inv.balance<=0){inv.status='paid';inv.balance=0}
  else if(inv.amountPaid>0)inv.status='partial';
  if(nav.recordId)logActivity(nav.recordId,'payment_received','Payment of '+fmt(amt)+' received for '+inv.number);
  closePaymentModal();saveDB(db);renderInvoice();
  if(inv.status==='paid'){const rec=getRecord();if(rec&&isRecordInvoiced(rec)){const allPaid=rec.estimates.every(e=>!e.invoices||e.invoices.every(i=>i.status==='paid'));if(allPaid){toast('Paid in Full','\u2713 All invoices paid!');return}}}
  toast('Payment Recorded',fmt(amt)+' applied to '+inv.number);
}
function checkOverdueInvoices(){
  const now=new Date().toISOString().slice(0,10);
  db.records.forEach(r=>r.estimates.forEach(e=>{if(e.invoices)e.invoices.forEach(inv=>{if(inv.status==='sent'&&inv.dueDate&&inv.dueDate<now)inv.status='overdue'})}));
}
function generateInvoicePDF(returnBase64){
  const inv=getInvoiceById(nav.invoiceId);const rec=getRecord();const est=getEstimate();
  if(!inv||!rec){toast('Error','Invoice not found.');return null}
  if(typeof window.jspdf==='undefined'){toast('Error','PDF library not loaded.');return null}
  const{jsPDF}=window.jspdf;const doc=new jsPDF();
  const pw=doc.internal.pageSize.getWidth();
  const rn=((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'Client';
  const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const ar=settings.pdfAccentR||37,ag=settings.pdfAccentG||99,ab=settings.pdfAccentB||235;
  const pf=settings.pdfFontFamily||'helvetica';
  // Header
  doc.setFillColor(ar,ag,ab);doc.rect(0,0,pw,32,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(20);doc.setFont(pf,'bold');
  doc.text('INVOICE',14,16);
  doc.setFontSize(10);doc.setFont(pf,'normal');
  doc.text(settings.companyName||'The Concrete Protector',14,24);
  doc.setFontSize(9);doc.text(inv.number,pw-14,12,{align:'right'});
  doc.text('Date: '+today,pw-14,18,{align:'right'});
  doc.text('Due: '+(inv.dueDate||'N/A'),pw-14,24,{align:'right'});
  if(settings.companyLogo){try{doc.addImage(settings.companyLogo,'PNG',pw-54,4,40,24)}catch(e){}}
  // From / Bill To
  let y=44;doc.setTextColor(80);doc.setFontSize(9);doc.setFont(pf,'bold');doc.text('FROM:',14,y);doc.text('BILL TO:',110,y);
  y+=6;doc.setFont(pf,'normal');doc.setTextColor(30);doc.setFontSize(10);
  doc.text(settings.companyName||'',14,y);doc.text(rn,110,y);y+=5;
  if(settings.contactName)doc.text(settings.contactName,14,y);if(rec.company)doc.text(rec.company,110,y);y+=5;
  if(settings.address)doc.text(settings.address,14,y);if(rec.address)doc.text(rec.address,110,y);y+=5;
  const fromLoc=[settings.city,settings.state,settings.zip].filter(Boolean).join(', ');
  const toLoc=[rec.city,rec.state,rec.zip].filter(Boolean).join(', ');
  if(fromLoc)doc.text(fromLoc,14,y);if(toLoc)doc.text(toLoc,110,y);y+=5;
  if(settings.phone)doc.text(settings.phone,14,y);if(rec.phone)doc.text(rec.phone,110,y);y+=5;
  if(settings.email)doc.text(settings.email,14,y);if(rec.email)doc.text(rec.email,110,y);y+=10;
  // Line items table
  doc.setFillColor(240,240,240);doc.rect(14,y,pw-28,8,'F');
  doc.setFontSize(9);doc.setFont(pf,'bold');doc.setTextColor(80);
  doc.text('Description',16,y+6);doc.text('Qty',130,y+6,{align:'right'});doc.text('Rate',155,y+6,{align:'right'});doc.text('Amount',pw-16,y+6,{align:'right'});y+=12;
  doc.setFont(pf,'normal');doc.setTextColor(30);doc.setFontSize(10);
  inv.lineItems.forEach(li=>{
    if(y>260){doc.addPage();y=20}
    const desc=li.description.length>55?li.description.substring(0,52)+'...':li.description;
    doc.text(desc,16,y);
    doc.text(String(li.qty),130,y,{align:'right'});
    doc.text(fmt(li.rate),155,y,{align:'right'});
    doc.setFont(pf,'bold');doc.text(fmt(li.amount),pw-16,y,{align:'right'});doc.setFont(pf,'normal');
    y+=7;doc.setDrawColor(230);doc.line(14,y-2,pw-14,y-2);y+=3;
  });
  // Totals
  y+=4;doc.setFontSize(10);doc.setTextColor(80);
  const rawSub=inv.lineItems.reduce((s,li)=>s+li.amount,0);
  doc.text('Subtotal:',140,y);doc.text(fmt(rawSub),pw-16,y,{align:'right'});y+=6;
  if(inv.discountAmount>0){doc.text('Discount'+(inv.discountType==='percent'?' ('+inv.discountValue+'%)':'')+':',140,y);doc.text('-'+fmt(inv.discountAmount),pw-16,y,{align:'right'});y+=6}
  if(inv.taxAmount>0){doc.text('Tax ('+inv.taxRate+'%):',140,y);doc.text(fmt(inv.taxAmount),pw-16,y,{align:'right'});y+=6}
  doc.setFillColor(ar,ag,ab);doc.rect(120,y-4,pw-134,10,'F');
  doc.setFontSize(12);doc.setFont(pf,'bold');doc.setTextColor(255,255,255);
  doc.text('TOTAL:',122,y+3);doc.text(fmt(inv.total),pw-16,y+3,{align:'right'});y+=14;
  // Payments
  if(inv.payments.length){
    doc.setFontSize(10);doc.setFont(pf,'bold');doc.setTextColor(30);doc.text('Payments Received:',14,y);y+=7;
    doc.setFont(pf,'normal');doc.setFontSize(9);
    inv.payments.forEach(p=>{doc.text(p.date+' — '+p.method+': '+fmt(p.amount)+(p.note?' ('+p.note+')':''),16,y);y+=5});
    y+=4;
  }
  // Balance due
  if(inv.balance>0){
    doc.setFillColor(30,30,30);doc.rect(120,y-4,pw-134,10,'F');
    doc.setFontSize(12);doc.setFont(pf,'bold');doc.setTextColor(ar,ag,ab);
    doc.text('BALANCE DUE:',122,y+3);doc.text(fmt(inv.balance),pw-16,y+3,{align:'right'});y+=14;
  }else{
    doc.setFontSize(11);doc.setFont(pf,'bold');doc.setTextColor(34,197,94);
    doc.text('PAID IN FULL',pw/2,y+3,{align:'center'});y+=14;
  }
  // Notes
  if(inv.notes){y+=4;doc.setTextColor(80);doc.setFontSize(9);doc.setFont(pf,'bold');doc.text('Notes:',14,y);y+=5;doc.setFont(pf,'normal');doc.setFontSize(8);doc.splitTextToSize(inv.notes,pw-28).forEach(l=>{doc.text(l,14,y);y+=4})}
  // Payment terms & Footer
  const termLabels={due_on_receipt:'Due on Receipt',net15:'Net 15',net30:'Net 30',net60:'Net 60'};
  y+=4;doc.setFontSize(9);doc.setTextColor(80);doc.setFont(pf,'normal');
  doc.text('Payment Terms: '+(termLabels[settings.paymentTerms]||'Net 30'),14,y);y+=10;
  doc.setFontSize(7);doc.setTextColor(160);
  doc.text('Generated by Coatings Estimator \u2014 '+(settings.companyName||'The Concrete Protector'),pw/2,y,{align:'center'});
  const fn='Invoice-'+inv.number+'-'+rn.replace(/\s+/g,'-')+'.pdf';
  if(returnBase64){return{base64:doc.output('datauristring').split(',')[1],filename:fn}}
  doc.save(fn);if(nav.recordId)logActivity(nav.recordId,'invoice_pdf','Invoice '+inv.number+' PDF generated');saveDB(db);toast('Invoice PDF',fn);
}
function goAllInvoices(){
  Object.assign(nav,{screen:'invoices-all',folderStatus:null,folderActive:true,recordId:null,estimateId:null,systemId:null,invoiceId:null});
  renderBreadcrumb();renderAllInvoices();showScreen('invoices-all');updateSidebarActive();closeMobileSidebar();
}
function renderAllInvoices(){
  checkOverdueInvoices();
  const all=getAllInvoices().sort((a,b)=>new Date(b.invoice.createdAt)-new Date(a.invoice.createdAt));
  const el=document.getElementById('allInvoicesList');if(!el)return;
  const unpaid=all.filter(x=>x.invoice.balance>0);
  const totalUnpaid=unpaid.reduce((s,x)=>s+x.invoice.balance,0);
  const totalPaid=all.reduce((s,x)=>s+x.invoice.amountPaid,0);
  document.getElementById('invSummary').innerHTML=
    '<div class="sx hl"><div class="sl">Total Outstanding</div><div class="sv" style="color:var(--comp)">'+fmt(totalUnpaid)+'</div></div>'+
    '<div class="sx"><div class="sl">Total Collected</div><div class="sv" style="color:var(--success)">'+fmt(totalPaid)+'</div></div>'+
    '<div class="sx"><div class="sl">Invoices</div><div class="sv">'+all.length+'</div></div>';
  if(!all.length){el.innerHTML='<div class="empty"><div class="empty-icon">&#128179;</div><div class="empty-text">No invoices created yet.</div></div>';return}
  el.innerHTML=all.map(({invoice:inv,record:r})=>{
    const name=((r.firstName||'')+' '+(r.lastName||'')).trim()||'Client';
    const statusColors={draft:'var(--t3)',sent:'var(--accent)',partial:'var(--accent)',paid:'var(--success)',overdue:'var(--comp)'};
    return'<div class="list-item" onclick="nav.recordId=\''+r.id+'\';nav.folderStatus=\''+r.status+'\';nav.folderActive='+r.active+';nav.estimateId=\''+r.estimates.find(e=>e.invoices&&e.invoices.some(i=>i.id===inv.id)).id+'\';goInvoice(\''+inv.id+'\')"><div class="li-left"><div class="li-avatar '+(inv.status==='paid'?'comp':inv.status==='overdue'?'proj':'est')+'">'+inv.number.slice(-3)+'</div><div><div class="li-name">'+inv.number+' — '+name+'</div><div class="li-meta">'+inv.type+' \u00b7 Due: '+(inv.dueDate||'N/A')+' \u00b7 <span style="color:'+(statusColors[inv.status]||'var(--t3)')+'">'+inv.status.toUpperCase()+'</span></div></div></div><div class="li-right"><div class="li-amount">'+fmt(inv.total)+'</div>'+(inv.balance>0&&inv.balance<inv.total?'<div class="li-meta">Bal: '+fmt(inv.balance)+'</div>':'')+'</div></div>'
  }).join('');
  // Update sidebar badge
  const badge=document.getElementById('invBadge');
  if(badge)badge.textContent=unpaid.length>0?'('+unpaid.length+')':'';
}
function updateInvoiceBadge(){
  const unpaid=getAllInvoices().filter(x=>x.invoice.balance>0);
  const badge=document.getElementById('invBadge');
  if(badge)badge.textContent=unpaid.length>0?'('+unpaid.length+')':'';
}