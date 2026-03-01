// ═══════════════════════════════════════════════════════════
// OFFLINE INDICATOR
// ═══════════════════════════════════════════════════════════
function updateOnlineStatus(){
  const dot=document.getElementById('offlineDot');if(!dot)return;
  if(navigator.onLine){dot.style.display='none'}
  else{dot.style.display='flex'}
}
window.addEventListener('online',()=>{updateOnlineStatus();toast('Online','Connection restored.')});
window.addEventListener('offline',()=>{updateOnlineStatus();toast('Offline','No internet. Data saves locally.')});

// ═══════════════════════════════════════════════════════════
// MOUNT VUE APP
// ═══════════════════════════════════════════════════════════
const vm = ceApp.mount('#app');

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
initSidebar();initEmailJS();updateOnlineStatus();
if(getProfiles().length===0){
  goProfileSetup();
}else{
  updateProfileBadge();checkOverdueInvoices();saveDB(db);updateInvoiceBadge();renderHome();renderBreadcrumb();updateSidebarActive();
}
