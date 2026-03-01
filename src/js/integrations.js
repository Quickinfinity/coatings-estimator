// ═══════════════════════════════════════════════════════════
// INTEGRATIONS — Stripe, Mailchimp, Booking
// ═══════════════════════════════════════════════════════════

// ── Stripe Payment Link ──────────────────────────────────
function getStripePaymentLink(inv,rec){
  if(!settings.stripeEnabled||!settings.stripePaymentLinkBase)return'';
  const base=settings.stripePaymentLinkBase;
  const params=[];
  if(rec&&rec.email)params.push('prefilled_email='+encodeURIComponent(rec.email));
  if(inv&&inv.number)params.push('client_reference_id='+encodeURIComponent(inv.number));
  return base+(params.length?'?'+params.join('&'):'');
}

function renderStripePayButton(){
  const el=document.getElementById('stripePayBtn');if(!el)return;
  if(!settings.stripeEnabled||!settings.stripePaymentLinkBase){el.innerHTML='';return}
  const inv=getInvoiceById(nav.invoiceId);if(!inv||inv.status==='paid'){el.innerHTML='';return}
  const rec=getRecord();
  const link=getStripePaymentLink(inv,rec);
  el.innerHTML='<a href="'+esc(link)+'" target="_blank" class="btn btn-primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px">&#128179; Pay Online</a>';
}
