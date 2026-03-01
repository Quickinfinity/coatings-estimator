// ═══════════════════════════════════════════════════════════
// REPORTING (Phase 5)
// ═══════════════════════════════════════════════════════════
function renderReporting(){
  const active=db.records.filter(r=>r.active);
  const completed=active.filter(r=>r.status==='completed');
  const projects=active.filter(r=>r.status==='project');
  const estimates=active.filter(r=>r.status==='estimate');
  const leads=active.filter(r=>r.status==='lead');
  let totalRevenue=0,totalPipeline=0,totalSqft=0,jobCount=completed.length;
  completed.forEach(r=>{const c=calcRecCosts(r);totalRevenue+=c.totalWithTax});
  active.forEach(r=>{const c=calcRecCosts(r);totalPipeline+=c.totalWithTax;r.estimates.forEach(e=>e.systems.forEach(s=>totalSqft+=s.sqft||0))});
  const avgJob=jobCount>0?totalRevenue/jobCount:0;
  document.getElementById('rptCards').innerHTML=
    '<div class="rpt-card"><div class="rl">Completed Revenue</div><div class="rv">'+fmt(totalRevenue)+'</div><div class="rs">'+jobCount+' completed job'+(jobCount!==1?'s':'')+'</div></div>'+
    '<div class="rpt-card"><div class="rl">Active Pipeline</div><div class="rv">'+fmt(totalPipeline)+'</div><div class="rs">'+active.length+' active record'+(active.length!==1?'s':'')+'</div></div>'+
    '<div class="rpt-card"><div class="rl">Avg Job Size</div><div class="rv">'+fmt(avgJob)+'</div><div class="rs">based on completed</div></div>'+
    '<div class="rpt-card"><div class="rl">Total Sqft Quoted</div><div class="rv">'+totalSqft.toLocaleString()+'</div><div class="rs">across all estimates</div></div>';
  // Top systems
  const sysCounts={};
  db.records.forEach(r=>r.estimates.forEach(e=>e.systems.forEach(s=>{if(s.productId){const p=getAllProducts().find(p=>p.id===s.productId);if(p){if(!sysCounts[p.name])sysCounts[p.name]={count:0,sqft:0,revenue:0};sysCounts[p.name].count++;sysCounts[p.name].sqft+=s.sqft||0;sysCounts[p.name].revenue+=(s.sqft||0)*(s.sellRate||0)}}})));
  const topSys=Object.entries(sysCounts).sort((a,b)=>b[1].count-a[1].count).slice(0,8);
  const maxCount=topSys.length?topSys[0][1].count:1;
  if(topSys.length){
    document.getElementById('rptTopSystems').innerHTML='<div class="bar-chart">'+topSys.map(([name,d])=>
      '<div class="bar-row"><div class="bar-label">'+name+'</div><div class="bar-track"><div class="bar-fill" style="width:'+((d.count/maxCount)*100)+'%"></div></div><div class="bar-val">'+d.count+'x</div></div>'
    ).join('')+'</div>';
  }else{document.getElementById('rptTopSystems').innerHTML='<div class="empty"><div class="empty-text">No systems used yet.</div></div>'}
  // Pipeline breakdown
  const stages=[{label:'Leads',items:leads,color:'var(--lead)'},{label:'Estimates',items:estimates,color:'var(--est)'},{label:'Projects',items:projects,color:'var(--proj)'},{label:'Completed',items:completed,color:'var(--comp)'}];
  const maxStage=Math.max(...stages.map(s=>s.items.length),1);
  document.getElementById('rptPipelineBreakdown').innerHTML='<div class="bar-chart">'+stages.map(s=>{
    const val=s.items.reduce((sum,r)=>sum+calcRecCosts(r).totalWithTax,0);
    return'<div class="bar-row"><div class="bar-label">'+s.label+' ('+s.items.length+')</div><div class="bar-track"><div class="bar-fill" style="width:'+((s.items.length/maxStage)*100)+'%;background:'+s.color+'"></div></div><div class="bar-val">'+fmt(val)+'</div></div>'
  }).join('')+'</div>';
  // Accounts Receivable & Aging
  checkOverdueInvoices();
  const allInv=getAllInvoices();
  const totalOutstanding=allInv.reduce((s,x)=>s+x.invoice.balance,0);
  const totalOverdue=allInv.filter(x=>x.invoice.status==='overdue').reduce((s,x)=>s+x.invoice.balance,0);
  const totalCollected=allInv.reduce((s,x)=>s+x.invoice.amountPaid,0);
  document.getElementById('rptAR').innerHTML=
    '<div class="sx hl"><div class="sl">Total Outstanding</div><div class="sv" style="color:var(--comp)">'+fmt(totalOutstanding)+'</div></div>'+
    '<div class="sx"><div class="sl">Overdue</div><div class="sv" style="color:var(--comp)">'+fmt(totalOverdue)+'</div></div>'+
    '<div class="sx"><div class="sl">Total Collected</div><div class="sv" style="color:var(--success)">'+fmt(totalCollected)+'</div></div>';
  // Aging table
  const unpaidInv=allInv.filter(x=>x.invoice.balance>0).sort((a,b)=>new Date(a.invoice.dueDate||0)-new Date(b.invoice.dueDate||0));
  const buckets={current:0,d30:0,d60:0,d90:0,d90plus:0};
  const now=new Date();
  unpaidInv.forEach(x=>{const due=new Date(x.invoice.dueDate);const days=Math.floor((now-due)/86400000);if(days<0)buckets.current+=x.invoice.balance;else if(days<=30)buckets.d30+=x.invoice.balance;else if(days<=60)buckets.d60+=x.invoice.balance;else if(days<=90)buckets.d90+=x.invoice.balance;else buckets.d90plus+=x.invoice.balance});
  if(unpaidInv.length){
    let agHtml='<div class="sg" style="margin-bottom:12px"><div class="sx"><div class="sl">Current</div><div class="sv">'+fmt(buckets.current)+'</div></div><div class="sx"><div class="sl">1-30 Days</div><div class="sv">'+fmt(buckets.d30)+'</div></div><div class="sx"><div class="sl">31-60 Days</div><div class="sv">'+fmt(buckets.d60)+'</div></div><div class="sx"><div class="sl">61-90 Days</div><div class="sv" style="color:var(--accent)">'+fmt(buckets.d90)+'</div></div><div class="sx"><div class="sl">90+ Days</div><div class="sv" style="color:var(--comp)">'+fmt(buckets.d90plus)+'</div></div></div>';
    agHtml+='<table style="width:100%;font-size:12px;border-collapse:collapse"><tr style="border-bottom:1px solid var(--brd)"><th style="text-align:left;padding:6px 4px;color:var(--t3);font-weight:500">Client</th><th style="text-align:left;padding:6px 4px;color:var(--t3);font-weight:500">Invoice</th><th style="text-align:right;padding:6px 4px;color:var(--t3);font-weight:500">Balance</th><th style="text-align:left;padding:6px 4px;color:var(--t3);font-weight:500">Due</th><th style="text-align:right;padding:6px 4px;color:var(--t3);font-weight:500">Days</th><th style="text-align:left;padding:6px 4px;color:var(--t3);font-weight:500">Status</th></tr>';
    unpaidInv.forEach(({invoice:inv,record:r})=>{
      const name=((r.firstName||'')+' '+(r.lastName||'')).trim()||'Client';
      const days=Math.max(0,Math.floor((now-new Date(inv.dueDate))/86400000));
      const color=inv.status==='overdue'?'var(--comp)':days>30?'var(--accent)':'var(--t1)';
      agHtml+='<tr style="border-bottom:1px solid var(--brd)"><td style="padding:8px 4px">'+name+'</td><td style="padding:8px 4px">'+inv.number+'</td><td style="text-align:right;padding:8px 4px;font-family:monospace;color:var(--comp)">'+fmt(inv.balance)+'</td><td style="padding:8px 4px">'+(inv.dueDate||'N/A')+'</td><td style="text-align:right;padding:8px 4px;color:'+color+'">'+days+'</td><td style="padding:8px 4px"><span style="color:'+color+'">'+inv.status.toUpperCase()+'</span></td></tr>';
    });
    agHtml+='</table>';
    document.getElementById('rptAging').innerHTML=agHtml;
  }else{document.getElementById('rptAging').innerHTML='<div class="empty"><div class="empty-text">No outstanding invoices.</div></div>'}
  // Recent activity
  const recent=db.records.slice().sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6);
  if(recent.length){
    document.getElementById('rptRecent').innerHTML=recent.map(r=>{
      const name=((r.firstName||'')+' '+(r.lastName||'')).trim()||'Unnamed';
      const ago=timeAgo(new Date(r.updatedAt));
      return'<div class="list-item" onclick="goFolder(\''+r.status+'\','+r.active+');setTimeout(()=>goRecord(\''+r.id+'\'),50)" style="margin-bottom:4px"><div class="li-left"><div class="li-avatar '+r.status+'">'+((r.firstName||'?')[0]+(r.lastName||'?')[0]).toUpperCase()+'</div><div><div class="li-name">'+name+'</div><div class="li-meta">'+ago+'</div></div></div><div class="li-right"><div class="li-badge '+r.status+'">'+r.status+'</div></div></div>'
    }).join('');
  }else{document.getElementById('rptRecent').innerHTML='<div class="empty"><div class="empty-text">No activity yet.</div></div>'}
}
// timeAgo() defined in utils.js

// ═══════════════════════════════════════════════════════════
// REPORTING EXPORTS
// ═══════════════════════════════════════════════════════════

function exportReportCSV(){
  const active=db.records.filter(r=>r.active);
  if(!active.length){toast('No Data','No active records to export.');return}
  const headers=['Name','Company','Status','Lead Source','Created Date','Estimate Total','Tags','Follow-Up Date','Scheduled Date','Assigned Crew'];
  const csvQ=v=>{
    if(v==null)v='';
    v=String(v);
    if(v.indexOf('"')!==-1)v=v.replace(/"/g,'""');
    if(v.indexOf(',')!==-1||v.indexOf('"')!==-1||v.indexOf('\n')!==-1)v='"'+v+'"';
    return v;
  };
  const rows=[headers.map(csvQ).join(',')];
  active.forEach(r=>{
    const name=((r.firstName||'')+' '+(r.lastName||'')).trim();
    const company=r.company||'';
    const status=r.status||'';
    const leadSource=r.leadSource||'';
    const created=r.createdAt?r.createdAt.slice(0,10):'';
    const costs=calcRecCosts(r);
    const total=costs.totalWithTax||0;
    const tags=(r.tags||[]).join('; ');
    const followUp=r.followUpDate||'';
    const scheduled=r.scheduledDate||'';
    const crewId=r.assignedCrew||'';
    let crewName='';
    if(crewId&&settings.crewMembers){
      const cm=settings.crewMembers.find(c=>c.id===crewId);
      if(cm)crewName=cm.name;
    }
    rows.push([name,company,status,leadSource,created,total.toFixed(2),tags,followUp,scheduled,crewName].map(csvQ).join(','));
  });
  const csv=rows.join('\r\n');
  const today=new Date().toISOString().slice(0,10);
  const filename='pipeline-export-'+today+'.csv';
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=filename;a.click();
  URL.revokeObjectURL(url);
  toast('Exported','CSV downloaded with '+active.length+' records.');
}

function exportReportPDF(){
  const active=db.records.filter(r=>r.active);
  if(!active.length){toast('No Data','No active records to export.');return}
  const doc=new jspdf.jsPDF();
  const acR=settings.pdfAccentR||37,acG=settings.pdfAccentG||99,acB=settings.pdfAccentB||235;
  const today=new Date().toISOString().slice(0,10);
  const companyName=settings.companyName||'Company';
  const prefix=settings.pdfFilePrefix||'CE';
  // Title bar
  doc.setFillColor(acR,acG,acB);
  doc.rect(0,0,210,28,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(18);
  doc.setFont(undefined,'bold');
  doc.text(companyName+' Pipeline Report',14,14);
  doc.setFontSize(10);
  doc.setFont(undefined,'normal');
  doc.text('Generated: '+today,14,22);
  // Summary section
  let y=38;
  doc.setTextColor(40,40,40);
  doc.setFontSize(14);
  doc.setFont(undefined,'bold');
  doc.text('Summary',14,y);y+=8;
  const completed=active.filter(r=>r.status==='completed');
  let totalRevenue=0;completed.forEach(r=>{totalRevenue+=calcRecCosts(r).totalWithTax});
  let totalPipeline=0;active.forEach(r=>{totalPipeline+=calcRecCosts(r).totalWithTax});
  const avgJob=completed.length>0?totalRevenue/completed.length:0;
  doc.setFontSize(10);
  doc.setFont(undefined,'normal');
  const summaryLines=[
    'Total Active Records: '+active.length,
    'Completed Revenue: '+fmt(totalRevenue),
    'Pipeline Value: '+fmt(totalPipeline),
    'Average Job Size: '+fmt(avgJob)
  ];
  summaryLines.forEach(line=>{doc.text(line,14,y);y+=6});
  // Pipeline breakdown table
  y+=6;
  doc.setFontSize(14);
  doc.setFont(undefined,'bold');
  doc.text('Pipeline Breakdown',14,y);y+=8;
  const leads=active.filter(r=>r.status==='lead');
  const estimates=active.filter(r=>r.status==='estimate');
  const projects=active.filter(r=>r.status==='project');
  const stages=[
    {label:'Leads',items:leads},
    {label:'Estimates',items:estimates},
    {label:'Projects',items:projects},
    {label:'Completed',items:completed}
  ];
  // Table header
  doc.setFillColor(acR,acG,acB);
  doc.setTextColor(255,255,255);
  doc.setFontSize(9);
  doc.setFont(undefined,'bold');
  doc.rect(14,y-4,180,7,'F');
  doc.text('Status',16,y);
  doc.text('Count',90,y);
  doc.text('Value',140,y);
  y+=7;
  doc.setTextColor(40,40,40);
  doc.setFont(undefined,'normal');
  stages.forEach((s,i)=>{
    const val=s.items.reduce((sum,r)=>sum+calcRecCosts(r).totalWithTax,0);
    if(i%2===0){doc.setFillColor(245,247,250);doc.rect(14,y-4,180,7,'F')}
    doc.text(s.label,16,y);
    doc.text(String(s.items.length),90,y);
    doc.text(fmt(val),140,y);
    y+=7;
  });
  // Top systems table
  y+=6;
  if(y>250){doc.addPage();y=20}
  doc.setFontSize(14);
  doc.setFont(undefined,'bold');
  doc.text('Top Systems',14,y);y+=8;
  const sysCounts={};
  db.records.forEach(r=>r.estimates.forEach(e=>e.systems.forEach(s=>{
    if(s.productId){
      const p=getAllProducts().find(p=>p.id===s.productId);
      if(p){
        if(!sysCounts[p.name])sysCounts[p.name]={count:0,sqft:0,revenue:0};
        sysCounts[p.name].count++;
        sysCounts[p.name].sqft+=s.sqft||0;
        sysCounts[p.name].revenue+=(s.sqft||0)*(s.sellRate||0);
      }
    }
  })));
  const topSys=Object.entries(sysCounts).sort((a,b)=>b[1].count-a[1].count).slice(0,10);
  if(topSys.length){
    doc.setFillColor(acR,acG,acB);
    doc.setTextColor(255,255,255);
    doc.setFontSize(9);
    doc.setFont(undefined,'bold');
    doc.rect(14,y-4,180,7,'F');
    doc.text('System Name',16,y);
    doc.text('Count',100,y);
    doc.text('Sqft',125,y);
    doc.text('Revenue',155,y);
    y+=7;
    doc.setTextColor(40,40,40);
    doc.setFont(undefined,'normal');
    topSys.forEach(([name,d],i)=>{
      if(y>280){doc.addPage();y=20}
      if(i%2===0){doc.setFillColor(245,247,250);doc.rect(14,y-4,180,7,'F')}
      const displayName=name.length>35?name.slice(0,33)+'...':name;
      doc.text(displayName,16,y);
      doc.text(String(d.count),100,y);
      doc.text(d.sqft.toLocaleString(),125,y);
      doc.text(fmt(d.revenue),155,y);
      y+=7;
    });
  }else{
    doc.setFontSize(10);doc.setFont(undefined,'normal');
    doc.text('No systems data yet.',14,y);
  }
  const filename=prefix+'-Report-'+today+'.pdf';
  doc.save(filename);
  toast('Exported','PDF report downloaded.');
}