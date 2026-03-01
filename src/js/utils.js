// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
const fmt=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function timeAgo(d){
  const s=Math.floor((Date.now()-d)/1e3);
  if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+'m ago';
  if(s<86400)return Math.floor(s/3600)+'h ago';if(s<604800)return Math.floor(s/86400)+'d ago';
  return d.toLocaleDateString();
}
function rgbToHex(r,g,b){return'#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')}
function hexToRgb(hex){const m=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:{r:37,g:99,b:235}}
// Double-click protection — prevents rapid duplicate calls
const _btnLocks={};
function guardClick(key,fn,delay){
  delay=delay||1500;
  if(_btnLocks[key])return;
  _btnLocks[key]=true;
  try{fn()}catch(e){console.error(e)}
  setTimeout(()=>{_btnLocks[key]=false},delay);
}
// Save feedback flash on any button by ID
function flashSaveBtn(btnId){
  const btn=document.getElementById(btnId);if(!btn)return;
  const orig=btn.innerHTML;const origBg=btn.style.background;const origColor=btn.style.color;
  btn.innerHTML='&#10003; Saved!';btn.style.background='#22c55e';btn.style.color='#fff';
  setTimeout(()=>{btn.innerHTML=orig;btn.style.background=origBg;btn.style.color=origColor},1500);
}
