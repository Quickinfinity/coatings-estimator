// ═══════════════════════════════════════════════════════════
// EMAIL / TEXT COMMUNICATION
// ═══════════════════════════════════════════════════════════
function emailProposal(){
  const rec=getRecord();const est=getEstimate();if(!rec||!est)return;
  const to=rec.email||'';
  const rn=((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'Client';
  const subj='Proposal from '+(settings.companyName||'The Concrete Protector')+' - '+(est.name||'Estimate');
  const ec=calcEstCosts(est);
  const body='Hi '+(rec.firstName||'')+',\n\nHere is our proposal for '+(est.name||'your project')+'.\n\nEstimate Total: '+fmt(ec.totalWithTax)+'\n\nPlease let us know if you have any questions!\n\nThank you,\n'+(settings.contactName||settings.companyName||'');
  // EmailJS: send with PDF attachment
  if(isEmailJSReady()){
    if(!to){toast('No Email','Add an email address to this record first.');return}
    const pdf=generateProposal(true);
    if(!pdf)return;
    toast('Sending...','Emailing proposal to '+to);
    emailjs.send(settings.emailjsServiceId,settings.emailjsTemplateId,{
      to_email:to,to_name:rn,from_name:settings.contactName||settings.companyName||'The Concrete Protector',
      reply_to:settings.email||'',subject:subj,message:body,
      attachment:pdf.base64,attachment_name:pdf.filename
    }).then(function(){
      toast('Email Sent','Proposal sent to '+to+' with PDF.');
      logActivity(rec.id,'email_sent','Proposal emailed to '+to+' via EmailJS');
      if(!est.quoteStatus||est.quoteStatus==='draft'){est.quoteStatus='sent';est.quoteSentAt=new Date().toISOString()}
      saveDB(db);if(nav.screen==='estimate')renderEstimate();if(nav.screen==='record')renderRecord();
    },function(err){
      toast('Email Failed',(err&&err.text)||'Could not send. Check EmailJS settings.');
    });
  }else{
    // Fallback: download PDF + mailto
    generateProposal();
    setTimeout(function(){window.open('mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body))},300);
    logActivity(rec.id,'email_sent','Proposal email opened for '+(to||'(no email)'));
    if(!est.quoteStatus||est.quoteStatus==='draft'){est.quoteStatus='sent';est.quoteSentAt=new Date().toISOString()}
    saveDB(db);toast('PDF Downloaded','Attach the downloaded PDF to your email.');
  }
}
function textProposal(){
  const rec=getRecord();const est=getEstimate();if(!rec||!est)return;
  const ec=calcEstCosts(est);
  const body='Hi '+(rec.firstName||'')+', here is your quote from '+(settings.companyName||'The Concrete Protector')+' for '+(est.name||'your project')+': '+fmt(ec.totalWithTax)+'. Let me know if you have any questions! - '+(settings.contactName||'');
  window.open('sms:'+(rec.phone||'')+'?body='+encodeURIComponent(body));
  logActivity(rec.id,'text_sent','Proposal texted to '+(rec.phone||'(no phone)'));
  if(!est.quoteStatus||est.quoteStatus==='draft'){est.quoteStatus='sent';est.quoteSentAt=new Date().toISOString()}
  saveDB(db);
  if(rec.status==='estimate')toast('Quote Sent','Move to Project when approved.');
}
function emailInvoice(){
  const inv=getInvoiceById(nav.invoiceId);const rec=getRecord();if(!inv||!rec)return;
  const to=rec.email||'';
  const rn=((rec.firstName||'')+' '+(rec.lastName||'')).trim()||'Client';
  const subj='Invoice '+inv.number+' from '+(settings.companyName||'The Concrete Protector');
  const body='Hi '+(rec.firstName||'')+',\n\nHere are the details for Invoice '+inv.number+'.\n\nAmount: '+fmt(inv.total)+'\nDue Date: '+(inv.dueDate?new Date(inv.dueDate+'T12:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'N/A')+'\nBalance Due: '+fmt(inv.balance)+'\n\nPlease let us know if you have any questions.\n\nThank you,\n'+(settings.contactName||settings.companyName||'');
  if(isEmailJSReady()){
    if(!to){toast('No Email','Add an email address to this record first.');return}
    const pdf=generateInvoicePDF(true);
    if(!pdf)return;
    toast('Sending...','Emailing invoice to '+to);
    emailjs.send(settings.emailjsServiceId,settings.emailjsTemplateId,{
      to_email:to,to_name:rn,from_name:settings.contactName||settings.companyName||'The Concrete Protector',
      reply_to:settings.email||'',subject:subj,message:body,
      attachment:pdf.base64,attachment_name:pdf.filename
    }).then(function(){
      toast('Email Sent','Invoice sent to '+to+' with PDF.');
      logActivity(rec.id,'email_sent','Invoice '+inv.number+' emailed to '+to+' via EmailJS');saveDB(db);
    },function(err){
      toast('Email Failed',(err&&err.text)||'Could not send. Check EmailJS settings.');
    });
  }else{
    generateInvoicePDF();
    setTimeout(function(){window.open('mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body))},300);
    logActivity(rec.id,'email_sent','Invoice '+inv.number+' email opened for '+(to||'(no email)'));saveDB(db);
    toast('PDF Downloaded','Attach the downloaded PDF to your email.');
  }
}
function textInvoice(){
  const inv=getInvoiceById(nav.invoiceId);const rec=getRecord();if(!inv||!rec)return;
  const body='Invoice '+inv.number+' \u2014 '+fmt(inv.balance)+' due '+(inv.dueDate||'N/A')+'. From '+(settings.companyName||'The Concrete Protector');
  window.open('sms:'+(rec.phone||'')+'?body='+encodeURIComponent(body));
  logActivity(rec.id,'invoice_texted','Invoice '+inv.number+' texted to '+(rec.phone||'(no phone)'));saveDB(db);
}
function sendInvoiceReminder(){
  const inv=getInvoiceById(nav.invoiceId);const rec=getRecord();if(!inv||!rec)return;
  const to=rec.email||'';
  const subj='Reminder: Invoice '+inv.number+' \u2014 '+fmt(inv.balance)+' due '+(inv.dueDate||'N/A');
  const body='Hi '+(rec.firstName||'')+',\n\nThis is a friendly reminder that Invoice '+inv.number+' for '+fmt(inv.total)+' has a remaining balance of '+fmt(inv.balance)+'.\n\nDue Date: '+(inv.dueDate||'N/A')+'\n\nPlease let us know if you have any questions.\n\nThank you,\n'+(settings.contactName||settings.companyName||'');
  window.open('mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body));
  logActivity(rec.id,'reminder_sent','Reminder sent for '+inv.number+' to '+(rec.email||'(no email)'));saveDB(db);
  toast('Reminder','Reminder email opened.');
}
function quickEmail(){
  const rec=getRecord();if(!rec)return;
  window.open('mailto:'+(rec.email||''));
}
function quickText(){
  const rec=getRecord();if(!rec)return;
  window.open('sms:'+(rec.phone||''));
}
function quickCall(){
  const rec=getRecord();if(!rec)return;
  window.open('tel:'+(rec.phone||''));
}
function renderQuickContactBtns(){
  const rec=getRecord();if(!rec)return;
  const el=document.getElementById('quickContactBtns');if(!el)return;
  let btns='';
  if(rec.email)btns+='<button class="btn btn-ghost" onclick="quickEmail()" style="font-size:12px">&#9993; Email</button>';
  if(rec.phone)btns+='<button class="btn btn-ghost" onclick="quickText()" style="font-size:12px">&#128172; Text</button>';
  if(rec.phone)btns+='<button class="btn btn-ghost" onclick="quickCall()" style="font-size:12px">&#128222; Call</button>';
  el.innerHTML=btns;
}