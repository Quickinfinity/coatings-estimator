// ═══════════════════════════════════════════════════════════
// VUE COMPONENTS — Reusable UI Building Blocks
// ═══════════════════════════════════════════════════════════

// ── Card Section ────────────────────────────────────────────
// Usage: <card-section title="Company" subtitle="Your info">...content...</card-section>
ceApp.component('card-section',{
  props:{title:String,subtitle:String,icon:String,collapsible:{type:Boolean,default:false}},
  data(){return{collapsed:false}},
  template:`
    <div class="cd">
      <div class="ct" :style="collapsible?'cursor:pointer':''" @click="collapsible&&(collapsed=!collapsed)">
        <span v-if="icon" class="ic ig">{{icon}}</span>
        <span>{{title}}</span>
        <span v-if="subtitle" style="font-size:12px;color:var(--t3);font-weight:400;margin-left:8px">{{subtitle}}</span>
        <span v-if="collapsible" style="margin-left:auto;font-size:14px;color:var(--t4)">{{collapsed?'&#9654;':'&#9660;'}}</span>
      </div>
      <div v-show="!collapsed" class="cb"><slot></slot></div>
    </div>
  `
});

// ── Stat Card ───────────────────────────────────────────────
// Usage: <stat-card label="Revenue" :value="'$12,500'" trend="up" />
ceApp.component('stat-card',{
  props:{label:String,value:[String,Number],trend:String,color:String},
  template:`
    <div class="kpi-card" :style="color?'border-left:3px solid '+color:''">
      <div class="kl">{{label}}</div>
      <div class="kv" :style="color?'color:'+color:''">{{value}}</div>
      <div v-if="trend" class="kt" :class="trend">
        {{trend==='up'?'&#9650;':trend==='down'?'&#9660;':'&#9679;'}}
      </div>
    </div>
  `
});

// ── Status Badge ────────────────────────────────────────────
// Usage: <status-badge status="lead" /> or <status-badge status="project" :active="true" @click="..." />
ceApp.component('status-badge',{
  props:{status:String,active:{type:Boolean,default:false},clickable:{type:Boolean,default:false}},
  computed:{
    statusObj(){return STATUSES.find(s=>s.id===this.status)||{label:this.status,color:''}},
  },
  template:`
    <button v-if="clickable" class="status-pill" :class="[statusObj.color,{active}]" @click="$emit('click')">
      {{statusObj.label}}
    </button>
    <span v-else class="li-badge" :class="status">{{statusObj.label}}</span>
  `
});

// ── Tag Chip ────────────────────────────────────────────────
// Usage: <tag-chip label="Residential" @remove="removeTag('Residential')" />
ceApp.component('tag-chip',{
  props:{label:String,removable:{type:Boolean,default:true}},
  template:`
    <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:var(--accent);color:#000;border-radius:6px;font-size:11px;font-weight:600">
      {{label}}
      <span v-if="removable" @click.stop="$emit('remove')" style="cursor:pointer;font-size:13px;line-height:1;opacity:.7">&times;</span>
    </span>
  `
});

// ── Form Field ──────────────────────────────────────────────
// Usage: <form-field label="First Name" help="Required">
//          <input v-model="rec.firstName">
//        </form-field>
ceApp.component('form-field',{
  props:{label:String,help:String,required:{type:Boolean,default:false}},
  template:`
    <div class="fg">
      <label>{{label}}<span v-if="required" style="color:var(--danger);margin-left:2px">*</span></label>
      <slot></slot>
      <div v-if="help" style="font-size:11px;color:var(--t4);margin-top:2px">{{help}}</div>
    </div>
  `
});

// ── Action Bar ──────────────────────────────────────────────
// Usage: <action-bar><button class="btn btn-primary">Save</button></action-bar>
ceApp.component('action-bar',{
  template:`
    <div class="btn-row" style="display:flex;gap:8px;flex-wrap:wrap;padding:12px 0">
      <slot></slot>
    </div>
  `
});

// ── Empty State ─────────────────────────────────────────────
// Usage: <empty-state icon="📋" message="No estimates yet." action="Create Estimate" @action="newEstimate()" />
ceApp.component('empty-state',{
  props:{icon:{type:String,default:'📂'},message:String,action:String},
  template:`
    <div class="empty">
      <div class="empty-icon">{{icon}}</div>
      <div class="empty-text">{{message}}</div>
      <button v-if="action" class="btn btn-primary" @click="$emit('action')" style="margin-top:10px">{{action}}</button>
    </div>
  `
});

// ── Signature Pad ───────────────────────────────────────────
// Usage: <signature-pad ref="sig" width="400" height="150" label="Customer Signature" />
ceApp.component('signature-pad',{
  props:{width:{type:Number,default:400},height:{type:Number,default:150},label:{type:String,default:'Signature'}},
  data(){return{drawing:false,ctx:null,hasSignature:false}},
  mounted(){
    const c=this.$refs.canvas;
    this.ctx=c.getContext('2d');
    this.ctx.strokeStyle='#000';this.ctx.lineWidth=2;this.ctx.lineCap='round';
  },
  methods:{
    start(e){
      this.drawing=true;
      const r=this.$refs.canvas.getBoundingClientRect();
      const x=(e.clientX||e.touches[0].clientX)-r.left;
      const y=(e.clientY||e.touches[0].clientY)-r.top;
      this.ctx.beginPath();this.ctx.moveTo(x,y);
    },
    draw(e){
      if(!this.drawing)return;
      e.preventDefault();
      const r=this.$refs.canvas.getBoundingClientRect();
      const x=(e.clientX||(e.touches&&e.touches[0].clientX))-r.left;
      const y=(e.clientY||(e.touches&&e.touches[0].clientY))-r.top;
      this.ctx.lineTo(x,y);this.ctx.stroke();this.hasSignature=true;
    },
    stop(){this.drawing=false},
    clear(){this.ctx.clearRect(0,0,this.width,this.height);this.hasSignature=false;this.$emit('clear')},
    toDataURL(){return this.hasSignature?this.$refs.canvas.toDataURL('image/png'):null}
  },
  template:`
    <div style="margin-bottom:12px">
      <div style="font-size:12px;font-weight:600;color:var(--t3);margin-bottom:4px">{{label}}</div>
      <canvas ref="canvas" :width="width" :height="height"
        @mousedown="start" @mousemove="draw" @mouseup="stop" @mouseleave="stop"
        @touchstart.prevent="start" @touchmove.prevent="draw" @touchend="stop"
        style="border:1px solid var(--brd);border-radius:8px;background:#fff;cursor:crosshair;touch-action:none;max-width:100%">
      </canvas>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <span style="font-size:11px;color:var(--t4)">Draw your signature above</span>
        <button class="btn btn-ghost" @click="clear" style="font-size:11px;padding:3px 10px">Clear</button>
      </div>
    </div>
  `
});

// ── Confirm Modal ───────────────────────────────────────────
// Usage: <confirm-modal ref="confirm" />
// Call: this.$refs.confirm.show('Title','Message',callback)
ceApp.component('confirm-modal',{
  data(){return{active:false,title:'',message:'',onConfirm:null}},
  methods:{
    show(t,m,fn){this.title=t;this.message=m;this.onConfirm=fn;this.active=true},
    confirm(){this.active=false;if(this.onConfirm)this.onConfirm()},
    cancel(){this.active=false}
  },
  template:`
    <div class="modal-overlay" :class="{active}" @click.self="cancel">
      <div class="modal-card">
        <div class="modal-body">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:8px">{{title}}</h3>
          <p style="font-size:14px;color:var(--t2);line-height:1.5">{{message}}</p>
          <div class="btn-row" style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
            <button class="btn btn-ghost" @click="cancel">Cancel</button>
            <button class="btn btn-danger" @click="confirm">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  `
});

// ── Toast Notification ──────────────────────────────────────
// Usage: <toast-notification ref="toast" />
// Call: this.$refs.toast.show('Title','Message')
ceApp.component('toast-notification',{
  data(){return{visible:false,title:'',message:'',timer:null,undoFn:null}},
  methods:{
    show(t,m,undoOpt){
      this.title=t;this.message=m;
      this.undoFn=undoOpt&&undoOpt.fn?undoOpt.fn:null;
      this.visible=true;
      clearTimeout(this.timer);
      this.timer=setTimeout(()=>{this.visible=false},undoOpt?8000:3000);
    },
    undo(){if(this.undoFn){this.undoFn();this.visible=false}}
  },
  template:`
    <div class="toast" :class="{show:visible}">
      <div class="tt">{{title}}</div>
      <div class="tm">
        {{message}}
        <a v-if="undoFn" href="#" @click.prevent="undo" style="color:var(--accent);font-weight:600;text-decoration:underline;margin-left:8px">Undo</a>
      </div>
    </div>
  `
});

// ── Date Picker ─────────────────────────────────────────────
// Usage: <date-picker v-model="rec.followUpDate" label="Follow-up Date" />
ceApp.component('date-picker',{
  props:{modelValue:String,label:String,clearable:{type:Boolean,default:true}},
  emits:['update:modelValue'],
  template:`
    <div class="fg">
      <label v-if="label">{{label}}</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="date" :value="modelValue" @input="$emit('update:modelValue',$event.target.value)" style="flex:1">
        <button v-if="clearable&&modelValue" class="btn btn-ghost" @click="$emit('update:modelValue','')" style="font-size:11px;padding:4px 8px">&times;</button>
      </div>
    </div>
  `
});
