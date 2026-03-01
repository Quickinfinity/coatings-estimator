// ═══════════════════════════════════════════════════════════
// STATE & PROFILES
// ═══════════════════════════════════════════════════════════

// Profile system
const PROFILES_KEY='ce_profiles';
const ACTIVE_PROFILE_KEY='ce_active_profile';
function getProfiles(){try{return JSON.parse(localStorage.getItem(PROFILES_KEY))||[]}catch{return[]}}
function saveProfiles(p){localStorage.setItem(PROFILES_KEY,JSON.stringify(p))}
function getActiveProfileId(){return localStorage.getItem(ACTIVE_PROFILE_KEY)||'default'}
function setActiveProfileId(id){localStorage.setItem(ACTIVE_PROFILE_KEY,id)}
function getActiveProfile(){return getProfiles().find(p=>p.id===getActiveProfileId())||null}

// Data migration: old keys → profile-scoped keys
function migrateData(){
  const profiles=getProfiles();
  if(profiles.length>0)return;
  const oldDB=localStorage.getItem('ce_database');
  const oldSettings=localStorage.getItem('ce_settings');
  if(!oldDB&&!oldSettings)return;
  const pid=uid();
  let name='Default User',email='',phone='',company='The Concrete Protector';
  try{const s=JSON.parse(oldSettings);name=s.contactName||name;email=s.email||'';phone=s.phone||'';company=s.companyName||company}catch{}
  const profile={id:pid,name,email,phone,company,city:'',state:'',pin:'',createdAt:new Date().toISOString()};
  saveProfiles([profile]);
  setActiveProfileId(pid);
  if(oldDB)localStorage.setItem('ce_database_'+pid,oldDB);
  if(oldSettings)localStorage.setItem('ce_settings_'+pid,oldSettings);
  localStorage.removeItem('ce_database');
  localStorage.removeItem('ce_settings');
}
migrateData();

// Dynamic DB/Settings keys scoped to active profile
function getDBKey(){return'ce_database_'+getActiveProfileId()}
function getSettingsKey(){return'ce_settings_'+getActiveProfileId()}
function loadDB(){try{return JSON.parse(localStorage.getItem(getDBKey()))||{records:[]}}catch{return{records:[]}}}
function saveDB(d){localStorage.setItem(getDBKey(),JSON.stringify(d))}
let db=loadDB();
let nav={screen:'home',folderStatus:null,folderActive:true,recordId:null,estimateId:null,systemId:null,invoiceId:null};
let seriesFilter='All';

// ── Profile Management Functions ─────────────────────────
function goProfileSetup(){
  document.getElementById('sidebar').style.display='none';
  document.querySelector('.hdr').style.display='none';
  showScreen('profile-setup');
}
function goProfileSelect(){
  document.getElementById('sidebar').style.display='none';
  document.querySelector('.hdr').style.display='none';
  renderProfileCards();
  showScreen('profile-select');
}
function showAppChrome(){
  document.getElementById('sidebar').style.display='';
  document.querySelector('.hdr').style.display='';
}
function createProfile(){
  const name=document.getElementById('setupName').value.trim();
  const company=document.getElementById('setupCompany').value.trim();
  if(!name||!company){toast('Required','Name and Company are required.');return}
  const profile={
    id:uid(),name,
    email:document.getElementById('setupEmail').value.trim(),
    phone:document.getElementById('setupPhone').value.trim(),
    company,
    city:document.getElementById('setupCity').value.trim(),
    state:document.getElementById('setupState').value.trim(),
    pin:document.getElementById('setupPin').value.trim(),
    createdAt:new Date().toISOString()
  };
  const profiles=getProfiles();profiles.push(profile);saveProfiles(profiles);
  setActiveProfileId(profile.id);
  const s={...SETTINGS_DEFAULTS,companyName:company,contactName:name,email:profile.email,phone:profile.phone,city:profile.city,state:profile.state};
  saveSettingsData(s);settings=s;
  db={records:[]};saveDB(db);
  showAppChrome();updateProfileBadge();goHome();toast('Welcome','Profile created. Start adding leads!');
}
function switchProfile(pid){
  const profiles=getProfiles();
  const p=profiles.find(x=>x.id===pid);
  if(!p)return;
  if(p.pin){
    const entered=prompt('Enter PIN for '+p.name+':');
    if(entered!==p.pin){toast('Denied','Incorrect PIN.');return}
  }
  setActiveProfileId(pid);
  db=loadDB();settings=loadSettings();initEmailJS();
  showAppChrome();updateProfileBadge();goHome();toast('Switched','Loaded '+p.name+'\'s workspace.');
}
function renderProfileCards(){
  const profiles=getProfiles();
  document.getElementById('profileCards').innerHTML=profiles.map(p=>{
    const ini=(p.name||'??').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    const active=p.id===getActiveProfileId();
    return'<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid '+(active?'var(--accent)':'var(--brd)')+';border-radius:12px;margin-bottom:10px;cursor:pointer;background:var(--card);transition:border-color .2s" onclick="switchProfile(\''+p.id+'\')" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\''+(active?'var(--accent)':'var(--brd)')+'\'">'+
      '<div style="width:44px;height:44px;border-radius:10px;background:var(--accent);color:#000;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0">'+ini+'</div>'+
      '<div style="text-align:left;flex:1"><div style="font-weight:600;font-size:14px">'+p.name+'</div><div style="font-size:12px;color:var(--t3)">'+p.company+(active?' \u2022 Active':'')+'</div></div>'+
      (active?'<div style="width:8px;height:8px;border-radius:50%;background:var(--success);flex-shrink:0"></div>':'')+
    '</div>'
  }).join('');
}
function updateProfileBadge(){
  const p=getActiveProfile();
  const el=document.getElementById('profileBadge');
  if(!el||!p)return;
  const ini=(p.name||'??').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  el.innerHTML='<div style="width:32px;height:32px;border-radius:8px;background:var(--accent);color:#000;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;cursor:pointer" onclick="goProfileSelect()" title="Switch Profile ('+p.name+')">'+ini+'</div>';
  const sbTitle=document.querySelector('.sb-title .sub');
  if(sbTitle)sbTitle.textContent=p.company||'Coatings Estimator';
}
function deleteProfile(pid){
  const profiles=getProfiles();
  if(profiles.length<=1){toast('Error','Cannot delete the only profile.');return}
  openConfirm('Delete Profile','Delete this profile and ALL its data? This cannot be undone.',()=>{
    localStorage.removeItem('ce_database_'+pid);
    localStorage.removeItem('ce_settings_'+pid);
    const remaining=profiles.filter(p=>p.id!==pid);
    saveProfiles(remaining);
    if(getActiveProfileId()===pid){
      setActiveProfileId(remaining[0].id);
      db=loadDB();settings=loadSettings();initEmailJS();
    }
    updateProfileBadge();goProfileSelect();toast('Deleted','Profile removed.');
  });
}
