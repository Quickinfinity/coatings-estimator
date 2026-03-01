// ═══════════════════════════════════════════════════════════
// SIGNATURES — helpers for estimate approval flow
// ═══════════════════════════════════════════════════════════
// The <signature-pad> Vue component is in components.js.
// The contract signature pads (canvas-based) are in pdf.js.
// This file contains the approval signature storage helpers.

function saveApprovalSignature(estId,sigDataURL){
  const est=db.records.reduce((found,r)=>{if(found)return found;return r.estimates.find(e=>e.id===estId)},null);
  if(!est)return;
  est.approvalSignature=sigDataURL;
  est.approvalDate=new Date().toISOString();
  est.quoteStatus='approved';
  autoSave();
}
