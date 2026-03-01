// ═══════════════════════════════════════════════════════════
// CALENDAR / WEEK VIEW / DISPATCH BOARD
// ═══════════════════════════════════════════════════════════
let calYear=new Date().getFullYear();let calMonth=new Date().getMonth();let calSelectedDay=null;
let calView='month'; // 'month' | 'week' | 'dispatch'

// ── Navigation ──────────────────────────────────────────
function goCalendar(){
  Object.assign(nav,{screen:'calendar',folderStatus:null,folderActive:true,recordId:null,estimateId:null,systemId:null,invoiceId:null});
  showScreen('calendar');renderBreadcrumb();
  renderCalendarView();
  updateSidebarActive();closeMobileSidebar();
}

function setCalView(v){
  calView=v;
  renderCalendarView();
}

function renderCalendarView(){
  if(calView==='week') renderWeekView();
  else if(calView==='dispatch') renderDispatch();
  else renderCalendar();
}

function calNav(dir){
  if(calView==='month'){
    calMonth+=dir;
    if(calMonth>11){calMonth=0;calYear++}
    if(calMonth<0){calMonth=11;calYear--}
    calSelectedDay=null;
    renderCalendar();
  } else {
    // Week and dispatch: navigate by week
    const base=calSelectedDay
      ? new Date(calYear,calMonth,calSelectedDay)
      : new Date();
    base.setDate(base.getDate()+(dir*7));
    calYear=base.getFullYear();
    calMonth=base.getMonth();
    calSelectedDay=base.getDate();
    if(calView==='week') renderWeekView();
    else renderDispatch();
  }
}

// ── Helpers ─────────────────────────────────────────────
function getProjectsForDate(dateStr){
  return db.records.filter(r=>r.active&&(r.status==='project'||r.status==='completed')&&r.projectStartDate&&(
    (r.projectStartDate<=dateStr&&(r.projectEndDate||r.projectStartDate)>=dateStr)||
    (!r.projectEndDate&&r.projectStartDate===dateStr)
  ));
}
function getFollowUpsForDate(dateStr){return db.records.filter(r=>r.active&&r.followUpDate===dateStr&&!r.followUpCompleted)}

function getWeekDates(baseDate){
  const d=new Date(baseDate);
  const day=d.getDay(); // 0=Sun
  const sun=new Date(d);
  sun.setDate(d.getDate()-day);
  const dates=[];
  for(let i=0;i<7;i++){
    const dd=new Date(sun);
    dd.setDate(sun.getDate()+i);
    dates.push(dd.getFullYear()+'-'+String(dd.getMonth()+1).padStart(2,'0')+'-'+String(dd.getDate()).padStart(2,'0'));
  }
  return dates;
}

function getCrewColor(crewId){
  const crew=(settings.crewMembers||[]).find(c=>c.id===crewId);
  return crew?crew.color:'#6b7280';
}
function getCrewName(crewId){
  const crew=(settings.crewMembers||[]).find(c=>c.id===crewId);
  return crew?crew.name:'Unassigned';
}
function getCrewInitials(crewId){
  const name=getCrewName(crewId);
  if(name==='Unassigned') return '?';
  const parts=name.trim().split(/\s+/);
  return (parts[0][0]+(parts.length>1?parts[parts.length-1][0]:'')).toUpperCase();
}

function formatTimeLabel(hour){
  const h=hour%12||12;
  const ampm=hour<12?'AM':'PM';
  return h+' '+ampm;
}

function recName(r){
  return ((r.firstName||'')+' '+(r.lastName||'')).trim()||'Unnamed';
}

// ═══════════════════════════════════════════════════════════
// MONTH VIEW (original renderCalendar — unchanged logic)
// ═══════════════════════════════════════════════════════════
function renderCalendar(){
  const label=new Date(calYear,calMonth).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const labelEl=document.getElementById('calMonthLabel');if(labelEl)labelEl.textContent=label;
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const todayStr=new Date().toISOString().slice(0,10);
  // Day headers
  let html=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>'<div class="cal-hdr">'+d+'</div>').join('');
  // Empty cells before month starts
  for(let i=0;i<firstDay;i++)html+='<div class="cal-cell other-month"></div>';
  // Day cells
  for(let d=1;d<=daysInMonth;d++){
    const ds=calYear+'-'+String(calMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const projs=getProjectsForDate(ds);
    const fups=getFollowUpsForDate(ds);
    const isToday=ds===todayStr;
    const isSel=calSelectedDay===d;
    const cls='cal-cell'+(isToday?' today':'')+(isSel?' selected':'');
    let dots='';
    if(projs.length) dots+='<span class="cal-dot project"></span>';
    if(fups.length) dots+='<span class="cal-dot followup"></span>';
    html+='<div class="'+cls+'" onclick="calSelectDay('+d+')">'+
      '<div class="cal-day">'+d+'</div>'+
      (dots?'<div class="cal-dots">'+dots+'</div>':'')+
      (projs.length?'<div style="font-size:9px;color:var(--t3);margin-top:2px">'+projs.length+'</div>':'')+
    '</div>';
  }
  document.getElementById('calGrid').innerHTML=html;
  if(calSelectedDay)calShowDay(calSelectedDay);
  else document.getElementById('calDayDetail').innerHTML='';
}

function calSelectDay(d){calSelectedDay=d;renderCalendarView()}
function calShowDay(d){
  const ds=calYear+'-'+String(calMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
  const dateLabel=new Date(ds+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const projs=getProjectsForDate(ds);
  const fups=getFollowUpsForDate(ds);
  let html='<div class="cd"><div class="ct"><span class="ic ig">&#128197;</span> '+dateLabel+'</div>';
  if(projs.length){
    html+='<div style="font-size:12px;font-weight:600;color:var(--t3);margin-bottom:6px">PROJECTS</div>';
    html+=projs.map(r=>{
      const name=recName(r);
      return'<div class="list-item" onclick="goFolder(\''+r.status+'\',true);setTimeout(()=>goRecord(\''+r.id+'\'),50)" style="margin-bottom:4px;padding:10px 14px;cursor:pointer"><div class="li-left"><div class="li-avatar '+r.status+'" style="width:28px;height:28px;font-size:10px;border-radius:6px">'+((r.firstName||'?')[0]+(r.lastName||'?')[0]).toUpperCase()+'</div><div><div class="li-name" style="font-size:13px">'+esc(name)+'</div><div class="li-meta">'+(r.company||'')+' \u00b7 '+fmt(calcRecCosts(r).totalWithTax)+'</div></div></div></div>'
    }).join('');
  }
  if(fups.length){
    html+='<div style="font-size:12px;font-weight:600;color:var(--t3);margin:12px 0 6px">FOLLOW-UPS</div>';
    html+=fups.map(r=>{
      const name=recName(r);
      return'<div class="list-item" onclick="goFolder(\''+r.status+'\',true);setTimeout(()=>goRecord(\''+r.id+'\'),50)" style="margin-bottom:4px;padding:10px 14px;cursor:pointer"><div class="li-left"><div style="font-size:16px;width:28px;text-align:center">&#128276;</div><div><div class="li-name" style="font-size:13px">'+esc(name)+'</div><div class="li-meta">'+(r.followUpNote||'Follow-up')+'</div></div></div></div>'
    }).join('');
  }
  if(!projs.length&&!fups.length)html+='<div style="font-size:13px;color:var(--t4);padding:8px 0">Nothing scheduled for this day.</div>';
  html+='</div>';
  document.getElementById('calDayDetail').innerHTML=html;
}

// ═══════════════════════════════════════════════════════════
// WEEK VIEW
// ═══════════════════════════════════════════════════════════
function renderWeekView(){
  const baseDate=calSelectedDay
    ? new Date(calYear,calMonth,calSelectedDay)
    : new Date();
  const dates=getWeekDates(baseDate);
  const todayStr=new Date().toISOString().slice(0,10);

  // Update label — show week range
  const startD=new Date(dates[0]+'T12:00');
  const endD=new Date(dates[6]+'T12:00');
  const startLabel=startD.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const endLabel=endD.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const labelEl=document.getElementById('calMonthLabel');if(labelEl)labelEl.textContent=startLabel+' \u2013 '+endLabel;

  const weekEl=document.getElementById('weekGrid');if(!weekEl)return;
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Build header
  let html='';
  for(let i=0;i<7;i++){
    const d=new Date(dates[i]+'T12:00');
    const dayNum=d.getDate();
    const isToday=dates[i]===todayStr;
    html+='<div class="cal-hdr" style="padding:10px 4px">'+
      '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px">'+dayNames[i]+'</div>'+
      '<div style="font-size:18px;font-weight:'+(isToday?'700':'500')+';color:'+(isToday?'var(--accent)':'var(--t1)')+';margin-top:2px">'+dayNum+'</div>'+
    '</div>';
  }

  // Build day columns
  for(let i=0;i<7;i++){
    const ds=dates[i];
    const isToday=ds===todayStr;
    const projs=getProjectsForDate(ds);
    const fups=getFollowUpsForDate(ds);

    html+='<div class="cal-cell'+(isToday?' today':'')+'" style="min-height:120px;padding:8px;vertical-align:top" onclick="calSelectedDay='+new Date(ds+'T12:00').getDate()+'">';

    // Project cards
    projs.forEach(r=>{
      const name=recName(r);
      const crewColor=r.assignedCrew?getCrewColor(r.assignedCrew):'var(--proj)';
      const crewInit=r.assignedCrew?getCrewInitials(r.assignedCrew):'';
      const timeStr=r.scheduledTime||'';
      html+='<div class="dispatch-item" onclick="event.stopPropagation();goFolder(\''+r.status+'\',true);setTimeout(()=>goRecord(\''+r.id+'\'),50)" style="background:'+crewColor+'22;border-left:3px solid '+crewColor+';color:var(--t1);margin-bottom:4px;padding:6px 8px">'+
        (timeStr?'<div style="font-size:9px;color:var(--t3);font-weight:600">'+timeStr+'</div>':'')+
        '<div style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(name)+'</div>'+
        '<div style="font-size:10px;color:var(--t3);display:flex;justify-content:space-between;align-items:center">'+
          '<span>'+(r.company?esc(r.company):'')+'</span>'+
          (crewInit?'<span style="background:'+crewColor+';color:#fff;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:700">'+crewInit+'</span>':'')+
        '</div>'+
      '</div>';
    });

    // Follow-up badges
    fups.forEach(r=>{
      const name=recName(r);
      html+='<div onclick="event.stopPropagation();goFolder(\''+r.status+'\',true);setTimeout(()=>goRecord(\''+r.id+'\'),50)" style="font-size:10px;padding:4px 6px;background:#fef3c7;border-left:3px solid #f59e0b;border-radius:4px;margin-bottom:3px;cursor:pointer;color:var(--t1)">'+
        '<span style="font-size:10px">&#128276;</span> '+esc(name)+
      '</div>';
    });

    if(!projs.length&&!fups.length){
      html+='<div style="font-size:10px;color:var(--t4);padding:8px 0;text-align:center">-</div>';
    }
    html+='</div>';
  }

  weekEl.innerHTML=html;
}

// ═══════════════════════════════════════════════════════════
// DISPATCH BOARD
// ═══════════════════════════════════════════════════════════
function renderDispatch(){
  const baseDate=calSelectedDay
    ? new Date(calYear,calMonth,calSelectedDay)
    : new Date();
  const dates=getWeekDates(baseDate);
  const todayStr=new Date().toISOString().slice(0,10);

  // Update label
  const startD=new Date(dates[0]+'T12:00');
  const endD=new Date(dates[6]+'T12:00');
  const startLabel=startD.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const endLabel=endD.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const dLabelEl=document.getElementById('calMonthLabel');if(dLabelEl)dLabelEl.textContent=startLabel+' \u2013 '+endLabel;

  const dispGrid=document.getElementById('dispatchGrid');if(!dispGrid)return;

  // ── Crew legend ──
  const crew=settings.crewMembers||[];
  let legendHtml='<span style="font-size:11px;font-weight:600;color:var(--t3);margin-right:4px">CREW:</span>';
  if(crew.length){
    legendHtml+=crew.map(c=>
      '<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--t2);padding:3px 8px;background:var(--s2);border-radius:20px">'+
        '<span style="width:10px;height:10px;border-radius:50%;background:'+c.color+'"></span>'+
        esc(c.name||'Unnamed')+
      '</span>'
    ).join('');
  } else {
    legendHtml+='<span style="font-size:11px;color:var(--t4)">No crew members. Add them in Settings &rarr; Team.</span>';
  }
  document.getElementById('dispatchCrewLegend').innerHTML=legendHtml;

  // ── Dispatch time grid ──
  const startHour=settings.workHoursStart||6;
  const endHour=settings.workHoursEnd||18;
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  let html='';

  // Header row: empty corner + 7 day headers
  html+='<div class="dispatch-time" style="font-weight:700;font-size:11px;color:var(--t3)"></div>';
  for(let i=0;i<7;i++){
    const d=new Date(dates[i]+'T12:00');
    const dayNum=d.getDate();
    const isToday=dates[i]===todayStr;
    html+='<div class="dispatch-time" style="padding:8px 4px;font-weight:600;font-size:11px">'+
      '<div style="text-transform:uppercase;letter-spacing:.5px;font-size:9px">'+dayNames[i]+'</div>'+
      '<div style="font-size:16px;font-weight:'+(isToday?'700':'500')+';color:'+(isToday?'var(--accent)':'var(--t1)')+';margin-top:1px">'+dayNum+'</div>'+
    '</div>';
  }

  // Build a lookup: dateStr -> hour -> [records]
  const slotMap={};
  dates.forEach(ds=>{
    slotMap[ds]={};
    const projs=getProjectsForDate(ds);
    projs.forEach(r=>{
      const time=r.scheduledTime||'';
      const hour=time?parseInt(time.split(':')[0],10):-1;
      if(hour>=startHour&&hour<endHour){
        if(!slotMap[ds][hour]) slotMap[ds][hour]=[];
        slotMap[ds][hour].push(r);
      } else {
        // No scheduled time or outside range — place at top (startHour)
        if(!slotMap[ds][startHour]) slotMap[ds][startHour]=[];
        slotMap[ds][startHour].push(r);
      }
    });
  });

  // Time rows
  for(let h=startHour;h<endHour;h++){
    const timeStr=String(h).padStart(2,'0')+':00';
    // Time label
    html+='<div class="dispatch-time">'+formatTimeLabel(h)+'</div>';
    // 7 day slots
    for(let i=0;i<7;i++){
      const ds=dates[i];
      const recs=slotMap[ds]&&slotMap[ds][h]?slotMap[ds][h]:[];
      html+='<div class="dispatch-slot" '+
        'ondragover="event.preventDefault();this.classList.add(\'dragover\')" '+
        'ondragleave="this.classList.remove(\'dragover\')" '+
        'ondrop="dispatchDrop(event,\''+ds+'\',\''+timeStr+'\')" '+
        'data-date="'+ds+'" data-time="'+timeStr+'">';

      recs.forEach(r=>{
        const name=recName(r);
        const crewColor=r.assignedCrew?getCrewColor(r.assignedCrew):'#6b7280';
        const crewInit=r.assignedCrew?getCrewInitials(r.assignedCrew):'?';
        const dur=r.scheduledDuration||1;
        const heightPx=Math.max(dur*40-4, 36); // scale height by duration

        html+='<div class="dispatch-item" '+
          'draggable="true" '+
          'ondragstart="dispatchDragStart(event,\''+r.id+'\')" '+
          'onclick="goFolder(\''+r.status+'\',true);setTimeout(()=>goRecord(\''+r.id+'\'),50)" '+
          'style="background:'+crewColor+'20;border-left:3px solid '+crewColor+';color:var(--t1);min-height:'+heightPx+'px;display:flex;flex-direction:column;justify-content:center" '+
          'title="'+esc(name)+' \u2014 '+getCrewName(r.assignedCrew||'')+' \u2014 '+dur+'h">'+
          '<div style="display:flex;justify-content:space-between;align-items:center">'+
            '<span style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(name)+'</span>'+
            '<span style="background:'+crewColor+';color:#fff;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;flex-shrink:0;margin-left:4px">'+crewInit+'</span>'+
          '</div>'+
          (r.company?'<div style="font-size:9px;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(r.company)+'</div>':'')+
          '<div style="font-size:9px;color:var(--t4)">'+dur+'h'+
            (r.assignedCrew?' \u00b7 '+esc(getCrewName(r.assignedCrew)):'')+
          '</div>'+
        '</div>';
      });

      html+='</div>';
    }
  }

  dispGrid.innerHTML=html;

  // ── Unscheduled projects ──
  renderUnscheduled();
}

// ═══════════════════════════════════════════════════════════
// UNSCHEDULED BUCKET
// ═══════════════════════════════════════════════════════════
function renderUnscheduled(){
  const unscheduled=db.records.filter(r=>r.active&&r.status==='project'&&!r.projectStartDate);
  const el=document.getElementById('dispatchUnscheduled');
  if(!el) return;

  if(!unscheduled.length){
    el.innerHTML='<div style="font-size:12px;color:var(--t4);padding:8px 0;width:100%">All projects are scheduled.</div>';
    return;
  }

  let html='';
  unscheduled.forEach(r=>{
    const name=recName(r);
    const crewColor=r.assignedCrew?getCrewColor(r.assignedCrew):'#6b7280';
    const crewInit=r.assignedCrew?getCrewInitials(r.assignedCrew):'?';
    html+='<div class="dispatch-item" '+
      'draggable="true" '+
      'ondragstart="dispatchDragStart(event,\''+r.id+'\')" '+
      'onclick="goFolder(\''+r.status+'\',true);setTimeout(()=>goRecord(\''+r.id+'\'),50)" '+
      'style="background:'+crewColor+'15;border-left:3px solid '+crewColor+';color:var(--t1);padding:8px 12px;cursor:grab;min-width:140px" '+
      'title="'+esc(name)+'">'+
      '<div style="display:flex;align-items:center;gap:6px">'+
        '<span style="background:'+crewColor+';color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0">'+crewInit+'</span>'+
        '<div>'+
          '<div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px">'+esc(name)+'</div>'+
          (r.company?'<div style="font-size:10px;color:var(--t3)">'+esc(r.company)+'</div>':'')+
        '</div>'+
      '</div>'+
    '</div>';
  });

  el.innerHTML=html;
}

// ═══════════════════════════════════════════════════════════
// DRAG & DROP
// ═══════════════════════════════════════════════════════════
function dispatchDragStart(event,recId){
  event.dataTransfer.setData('text/plain',recId);
  event.dataTransfer.effectAllowed='move';
  // Add a subtle opacity to the dragged element
  if(event.target&&event.target.classList) event.target.style.opacity='0.5';
  // Restore opacity after drag ends
  event.target.addEventListener('dragend',function(){this.style.opacity='1'},{once:true});
}

function dispatchDrop(event,dateStr,timeStr){
  event.preventDefault();
  event.stopPropagation();
  // Remove dragover highlight
  if(event.currentTarget) event.currentTarget.classList.remove('dragover');

  const recId=event.dataTransfer.getData('text/plain');
  if(!recId) return;

  const rec=db.records.find(r=>r.id===recId);
  if(!rec) return;

  // Update record scheduling
  rec.projectStartDate=dateStr;
  rec.scheduledTime=timeStr;

  // If not already a project, change status
  if(rec.status!=='project'&&rec.status!=='completed'){
    rec.status='project';
  }

  autoSave();
  toast('Scheduled',recName(rec)+' moved to '+new Date(dateStr+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})+' at '+timeStr);
  renderDispatch();
}

function dispatchUnschedule(event){
  event.preventDefault();
  event.stopPropagation();
  if(event.currentTarget) event.currentTarget.classList.remove('dragover');

  const recId=event.dataTransfer.getData('text/plain');
  if(!recId) return;

  const rec=db.records.find(r=>r.id===recId);
  if(!rec) return;

  // Remove scheduling
  rec.projectStartDate='';
  rec.scheduledTime='';

  autoSave();
  toast('Unscheduled',recName(rec)+' moved to unscheduled.');
  renderDispatch();
}

// ═══════════════════════════════════════════════════════════
// CREW ASSIGNMENT
// ═══════════════════════════════════════════════════════════
function assignCrew(recId,crewId){
  const rec=db.records.find(r=>r.id===recId);
  if(!rec) return;
  rec.assignedCrew=crewId;
  autoSave();
  // Re-render the active view
  renderCalendarView();
}
