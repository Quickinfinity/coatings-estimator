// ═══════════════════════════════════════════════════════════
// VUE 3 APP — Bootstrap
// ═══════════════════════════════════════════════════════════
// Phase 1: Wrap global state in Vue.reactive() so existing
// vanilla functions continue to work while state becomes
// reactive. Mount happens during screen conversion (Task 5).
// Auto-save stays with the existing debounced autoSave().

// Make global state reactive — existing code keeps working
// because reactive proxies are transparent to reads/writes
db = Vue.reactive(db);
nav = Vue.reactive(nav);
settings = Vue.reactive(settings);

// Create the Vue app instance (not mounted yet)
// Components will be registered via ceApp.component() in Tasks 4-5
// Mount via ceApp.mount('#app') when templates are converted
const ceApp = Vue.createApp({
  data(){
    return {
      db,
      nav,
      settings,
      seriesFilter,
      estTab,
      calYear,
      calMonth,
      calSelectedDay,
      calView,
      settingsTab:'company',
      batchMode:false,
      batchSelected:new Set(),
      invFilter:'all'
    }
  },
  computed:{
    currentProfile(){return getActiveProfile()},
    isOnline(){return navigator.onLine},
    currentScreen(){return this.nav.screen},
    activeRecords(){return this.db.records.filter(r=>r.active)},
    monthRevenue(){
      return this.db.records.filter(r=>r.active&&r.status==='completed')
        .reduce((sum,r)=>sum+calcRecCosts(r).totalWithTax,0)
    },
    followUpsDue(){
      const today=new Date().toISOString().slice(0,10);
      return this.db.records.filter(r=>r.active&&r.followUpDate&&!r.followUpCompleted&&r.followUpDate<=today)
    },
    pipelineByStatus(){
      const out={};
      STATUSES.forEach(s=>{out[s.id]=this.db.records.filter(r=>r.active&&r.status===s.id)});
      return out
    }
  },
  methods:{
    // Bridge to existing global functions — allows Vue templates to call them
    goHome,goFolder,goRecord,goEstimate,goSystem,goInvoice,goReporting,goSettings,goCalendar,
    goProfileSetup,goProfileSelect,openPinModal,closePinModal,submitPin,
    showScreen,toggleSidebar,toggleMobileSidebar,closeMobileSidebar,
    newRecord,newRecordFromHeader,createRecord,openQuickAdd,closeQuickAdd,submitQuickAdd,saveRecord,saveRecordWithFeedback,confirmDeleteRecord,
    newEstimate,saveEstimate,saveEstimateWithFeedback,confirmDeleteEstimate,
    newSystem,saveSystem,saveSystemWithFeedback,confirmDeleteSystem,duplicateSystem,duplicateEstimate,
    changeStatus,toggleActive,
    generateProposal,generateContract,emailProposal,emailInvoice,textProposal,
    openConfirm,closeConfirm,openExport,closeExport,openImport,closeImport,
    toast,fmt,esc,uid,timeAgo,
    calcSysCosts,calcEstCosts,calcRecCosts,
    renderBreadcrumb,renderHome,renderList,renderRecord,renderEstimate,renderSystem,renderInvoice,
    renderSettings,saveSettings,renderReporting,exportReportCSV,exportReportPDF,renderCalendar,
    renderCalendarView,renderWeekView,renderDispatch,renderUnscheduled,
    setCalView,calNav,dispatchDrop,dispatchUnschedule,dispatchDragStart,assignCrew,
    renderActivityLog,addActivityNote,goAllInvoices,
    updateProfileBadge,filterList,
    // Settings tab switching (needs Vue reactivity for v-show)
    switchSettingsTab(tab){
      this.settingsTab=tab;
      this.$nextTick(()=>{
        if(tab==='products'){renderCustomCatTabs();renderCustomItems()}
        else if(tab==='templates'){renderTemplateList()}
        else if(tab==='integrations'){renderEmailjsStatus()}
        else if(tab==='data'){renderSettingsStats()}
        else if(tab==='leadsources'){renderLeadSources()}
        else if(tab==='team'){renderCrewList()}
        else if(tab==='pdf'){
          const ci=document.getElementById('setPdfAccentColor');
          if(ci)ci.value=rgbToHex(settings.pdfAccentR||37,settings.pdfAccentG||99,settings.pdfAccentB||235);
          const pe=document.getElementById('pdfColorPreview');
          if(pe)pe.style.background='rgb('+(settings.pdfAccentR||37)+','+(settings.pdfAccentG||99)+','+(settings.pdfAccentB||235)+')';
        }
      });
    },
    addLeadSource,removeLeadSource,addCrewMember,updateCrewMember,removeCrewMember,
    handleLogoUpload,clearLogo,updateColorPreview,generateBookingWidget,
    // New features: custom line items, signatures, approval, portal, integrations
    addSysLineItem,updateSysLineItem,removeSysLineItem,renderLineItems,
    generateApprovalPage,generateClientPortal,saveApprovalSignature,
    renderStripePayButton,getStripePaymentLink
  }
});
