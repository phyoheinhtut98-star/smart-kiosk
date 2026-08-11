/* ─── DBT Smart Kiosk — Control Panel JS ─── */

var pathStack   = [];   // history stack
var currentStep = 'home';
var isListening = false;
var recognition = null;
var repeatTimer = null;

// ─── SEND KIOSK COMMAND TO MAIN DISPLAY ──────
function kiosk(cmd, val) {
  return fetch('/api/remote/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type:'kiosk', cmd:cmd, val: val !== undefined ? val : null })
  }).catch(function(){});
}

// ─── STEP NAVIGATION ─────────────────────────
function goTo(stepId, renderFn) {
  pathStack.push(currentStep);
  currentStep = stepId;
  document.getElementById('backBtn').classList.remove('hidden');
  renderFn();
}

function goBack() {
  if (pathStack.length === 0) return;
  var prev = pathStack.pop();
  currentStep = prev;
  document.getElementById('backBtn').classList.toggle('hidden', pathStack.length === 0);
  renderStep(prev);
  kiosk('back');
}

function renderStep(stepId) {
  var steps = {
    'home':             renderHome,
    'courses':          renderCourses,
    'courses.vc':       function(){ renderCourseYears('vc'); },
    'courses.hvc':      function(){ renderCourseYears('hvc'); },
    'announcements':    renderAnnouncements,
    'profile':          renderProfile,
    'profile.teachers': renderTeachers,
    'profile.outcomes': renderOutcomeLevels,
    'outcomes.vc':      function(){ renderOutcomes('vc'); },
    'outcomes.hvc':     function(){ renderOutcomes('hvc'); },
    'profile.fees':     renderFeeLevels,
    'fees.vc':          function(){ renderFeeResult('vc'); },
    'fees.hvc':         function(){ renderFeeResult('hvc'); },
    'help':             renderHelp,
  };
  var fn = steps[stepId];
  if (fn) fn();
}

// ─── RENDER FUNCTIONS ─────────────────────────

function renderHome() {
  setTitle('DBT KIOSK');
  setButtons([
    { icon:'🏠', label:'Home',         action: function(){ kiosk('home'); } },
    { icon:'📚', label:'Courses',       action: function(){ goTo('courses', renderCourses); kiosk('courses'); } },
    { icon:'📢', label:'Notices',       action: function(){ goTo('announcements', renderAnnouncements); kiosk('announcements'); } },
    { icon:'🏛️', label:'Profile',      action: function(){ goTo('profile', renderProfile); kiosk('profile'); } },
    { icon:'❓', label:'Help & FAQs',   action: function(){ goTo('help', renderHelp); kiosk('help'); } },
    { icon:'⚙️', label:'Settings',     action: function(){ kiosk('settings'); } },
  ]);
}

function renderCourses() {
  setTitle('Courses');
  setButtons([
    {
      icon: '🎓',
      label: 'Vocational\nCertificate\nVC · ปวช. · 3 Years',
      action: function() {
        goTo('courses.vc', function(){ renderCourseYears('vc'); });
        kiosk('courses.level', 'vc');
      }
    },
    {
      icon: '🏅',
      label: 'High Vocational\nCertificate\nHVC · ปวส. · 2 Years',
      action: function() {
        goTo('courses.hvc', function(){ renderCourseYears('hvc'); });
        kiosk('courses.level', 'hvc');
      }
    },
  ]);
}

function renderCourseYears(level) {
  var years  = level === 'vc' ? [1,2,3] : [1,2];
  var label  = level.toUpperCase();
  var vcSubs = { 1:'Core foundations', 2:'Intermediate skills', 3:'Advanced & internship' };
  var hvcSubs= { 1:'Advanced foundations', 2:'Professional applications' };
  var subs   = level === 'vc' ? vcSubs : hvcSubs;

  setTitle(label + ' — Select Year');
  setButtons(years.map(function(y) {
    return {
      icon: '📅',
      label: 'Year ' + y + '\n' + (subs[y] || ''),
      action: function() {
        goTo('courses.' + level + '.year' + y, function(){ renderCourseSems(level, y); });
        kiosk('courses.year', y);
      }
    };
  }));
}

function renderCourseSems(level, year) {
  setTitle(level.toUpperCase() + ' · Year ' + year);
  setButtons([
    {
      icon: '1️⃣',
      label: 'Semester 1\nภาคเรียนที่ 1\nFirst half of the year',
      action: function() {
        goTo('courses.result', function(){ showResultText('Showing ' + level.toUpperCase() + ' Year ' + year + ' Semester 1'); });
        kiosk('courses.semester', 1);
      }
    },
    {
      icon: '2️⃣',
      label: 'Semester 2\nภาคเรียนที่ 2\nSecond half of the year',
      action: function() {
        goTo('courses.result', function(){ showResultText('Showing ' + level.toUpperCase() + ' Year ' + year + ' Semester 2'); });
        kiosk('courses.semester', 2);
      }
    },
  ]);
}

function renderAnnouncements() {
  setTitle('Notices');
  fetch('/api/announcements').then(function(r){return r.json();}).then(function(data) {
    if (!data.length) { showResultText('No announcements right now.'); return; }
    setButtons(data.map(function(a, i) {
      var tagColors = { urgent:'#FF453A', academic:'#0A84FF', event:'#30D158', general:'#F28500' };
      var color = tagColors[(a.tag||'').toLowerCase()] || '#F28500';
      return { icon: (i+1).toString(), label: a.title, color: color, action: function(){
        goTo('ann.' + a.id, function(){ showResultText('Showing notice ' + (i+1)); });
        kiosk('ann.select', a.id);
      }};
    }));
  });
}

function renderProfile() {
  setTitle('Profile');
  setButtons([
    { icon:'🏛️', label:'Department Info',    action: function(){ goTo('profile.dept', function(){ showResultText('Showing on main'); }); kiosk('profile.dept'); } },
    { icon:'👨‍🏫', label:'Teachers & Staff',  action: function(){ goTo('profile.teachers', renderTeachers); kiosk('profile.teachers'); } },
    { icon:'🎯', label:'Study Outcomes',     action: function(){ goTo('profile.outcomes', renderOutcomeLevels); kiosk('profile.outcomes'); } },
    { icon:'💰', label:'Program Fees',       action: function(){ goTo('profile.fees', renderFeeLevels); kiosk('profile.fees'); } },
  ]);
}

function renderTeachers() {
  setTitle('Teachers');
  fetch('/api/teachers').then(function(r){return r.json();}).then(function(data) {
    if (!data.length) { showResultText('No teachers added yet.'); return; }
    setButtons(data.map(function(t, i) {
      return { icon: (i+1).toString(), label: t.name_en + '\n' + t.position, action: function(){
        goTo('teacher.' + t.id, function(){ showResultText('Showing teacher ' + (i+1)); });
        kiosk('profile.teacher', t.id);
      }};
    }));
  });
}

function renderOutcomeLevels() {
  setTitle('Study Outcomes');
  setButtons([
    { icon:'🎓', label:'After VC (ปวช.)', action: function(){
        goTo('outcomes.vc', function(){ renderOutcomes('vc'); });
        kiosk('outcomes.level', 'vc');
    }},
    { icon:'🏅', label:'After HVC (ปวส.)', action: function(){
        goTo('outcomes.hvc', function(){ renderOutcomes('hvc'); });
        kiosk('outcomes.level', 'hvc');
    }},
  ]);
}

function renderOutcomes(level) {
  var icons = ['💻','📱','🌐','📊','🎨','🔧','🚀','💡','🏢','📈'];
  setTitle((level === 'vc' ? 'VC' : 'HVC') + ' Careers');
  fetch('/api/outcomes?level=' + level).then(function(r){return r.json();}).then(function(data) {
    if (!data.length) { showResultText('No outcomes added yet.'); return; }
    setButtons(data.map(function(o, i) {
      return { icon: icons[i % icons.length], label: o.career, action: function(){
        goTo('outcome.' + o.id, function(){ showResultText('Showing career ' + (i+1)); });
        kiosk('outcomes.select', o.id);
      }};
    }));
  });
}

function renderFeeLevels() {
  setTitle('Program Fees');
  setButtons([
    { icon:'🎓', label:'VC Fees (ปวช.)', action: function(){
        goTo('fees.vc', function(){ renderFeeResult('vc'); });
        kiosk('fees.level', 'vc');
    }},
    { icon:'🏅', label:'HVC Fees (ปวส.)', action: function(){
        goTo('fees.hvc', function(){ renderFeeResult('hvc'); });
        kiosk('fees.level', 'hvc');
    }},
  ]);
}

function renderFeeResult(level) {
  setTitle((level === 'vc' ? 'VC' : 'HVC') + ' Fees');
  fetch('/api/fees?level=' + level).then(function(r){return r.json();}).then(function(data) {
    var total = data.reduce(function(s,f){ return s+f.amount; }, 0);
    var area = document.getElementById('menuArea');
    area.className = 'result-view';
    area.innerHTML =
      data.map(function(f) {
        return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center;">' +
                 '<div><div style="font-size:13px;font-weight:600;color:var(--text);">' + f.item + '</div>' +
                 '<div style="font-size:11px;color:var(--text-tert);">' + f.period + '</div></div>' +
                 '<div style="font-family:var(--font-head);font-size:18px;font-weight:700;color:var(--orange);">฿' + f.amount.toLocaleString() + '</div>' +
               '</div>';
      }).join('') +
      '<div style="background:var(--orange-glow);border:1px solid var(--orange);border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;margin-top:4px;">' +
        '<div style="font-size:14px;font-weight:700;color:var(--orange);">Total (estimated)</div>' +
        '<div style="font-family:var(--font-head);font-size:22px;font-weight:700;color:var(--orange);">฿' + total.toLocaleString() + '</div>' +
      '</div>';
  });
}

function renderHelp() {
  setTitle('Help & FAQs');
  fetch('/api/faqs').then(function(r){return r.json();}).then(function(data) {
    if (!data.length) { showResultText('No FAQs added yet.'); return; }
    setButtons(data.map(function(f, i) {
      return { icon: (i+1).toString(), label: f.question.substring(0,45) + (f.question.length>45?'…':''), action: function(){
        goTo('faq.' + f.id, function(){ showResultText('Showing Q' + (i+1) + ' on main'); });
        kiosk('faq.select', f.id);
      }};
    }));
  });
}

function showResultText(text) {
  var area = document.getElementById('menuArea');
  area.className = 'result-view';
  area.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;text-align:center;">' +
    '<div style="font-size:32px;">📺</div>' +
    '<div style="font-size:14px;color:var(--text-sec);font-weight:500;">' + text + '</div>' +
    '<div style="font-size:12px;color:var(--text-tert);">Check the main 7" display</div>' +
  '</div>';
}

// ─── BUTTON RENDERER ──────────────────────────
function setTitle(title) {
  document.getElementById('menuTitle').textContent = title;
}

function setButtons(buttons) {
  var area = document.getElementById('menuArea');
  var single = buttons.length <= 2;
  area.className = 'menu-area' + (single ? ' single-col' : '');
  area.innerHTML = buttons.map(function(b, i) {
    var isNum = /^\d+$/.test(b.icon);
    var iconHtml = isNum
      ? '<div class="menu-btn-num">' + b.icon + '</div>'
      : '<span class="menu-btn-icon">' + b.icon + '</span>';
    var labelLines = b.label.split('\n');
    var labelHtml  = labelLines.map(function(l){ return '<span>' + l + '</span>'; }).join('<br>');
    return '<button class="menu-btn" style="' + (b.color ? '--btn-accent:'+b.color : '') + '" data-index="' + i + '">' +
             iconHtml +
             '<span class="menu-btn-label">' + labelHtml + '</span>' +
           '</button>';
  }).join('');

  // Bind actions
  var btns = area.querySelectorAll('.menu-btn');
  btns.forEach(function(btn, i) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b){ b.classList.remove('btn-selected'); });
      btn.classList.add('btn-selected');
      if (buttons[i] && buttons[i].action) buttons[i].action();
    });
  });
}

// ─── TRACKPAD ────────────────────────────────
var trackpad, tpStatus, tpIcon, rippleEl;
var tState = { active:false, moved:false, startX:0, startY:0, lastX:0, lastY:0, tapCount:0, tapTime:0, tapTimer:null, lastSent:0 };
var SENSITIVITY=4.0, MOVE_THRESH=6, DOUBLE_TAP_MS=300, THROTTLE_MS=30;

function initTrackpad() {
  trackpad = document.getElementById('trackpad');
  tpStatus = document.getElementById('tpStatus');
  tpIcon   = document.getElementById('tpIcon');
  rippleEl = document.getElementById('ripple');
  if (!trackpad) return;
  trackpad.addEventListener('touchstart',  onTouchStart,  { passive:false });
  trackpad.addEventListener('touchmove',   onTouchMove,   { passive:false });
  trackpad.addEventListener('touchend',    onTouchEnd,    { passive:false });
  trackpad.addEventListener('touchcancel', onTouchCancel, { passive:false });
  trackpad.addEventListener('mousedown',   onMouseDown);
  document.addEventListener('mousemove',   onMouseMove);
  document.addEventListener('mouseup',     onMouseUp);
  trackpad.addEventListener('dblclick',    function(e){ fireClick(e.clientX, e.clientY); });
}
function onTouchStart(e) { e.preventDefault(); var t=e.touches[0]; tState.active=true; tState.moved=false; tState.startX=tState.lastX=t.clientX; tState.startY=tState.lastY=t.clientY; trackpad.classList.add('active'); tpStatus.textContent='Touching...'; }
function onTouchMove(e) { e.preventDefault(); if(!tState.active||!e.touches.length) return; var t=e.touches[0]; var dx=(t.clientX-tState.lastX)*SENSITIVITY; var dy=(t.clientY-tState.lastY)*SENSITIVITY; tState.lastX=t.clientX; tState.lastY=t.clientY; if(Math.abs(t.clientX-tState.startX)+Math.abs(t.clientY-tState.startY)>MOVE_THRESH) tState.moved=true; var now=Date.now(); if(now-tState.lastSent<THROTTLE_MS) return; tState.lastSent=now; dx=Math.round(Math.max(-100,Math.min(100,dx))); dy=Math.round(Math.max(-100,Math.min(100,dy))); if(Math.abs(dx)>1||Math.abs(dy)>1){ sendTrackpad('scroll',dx,dy); tpStatus.textContent=dy>0?'▼ Scrolling':'▲ Scrolling'; } }
function onTouchEnd(e) { e.preventDefault(); if(!tState.active) return; tState.active=false; trackpad.classList.remove('active'); var t=e.changedTouches[0]; if(!tState.moved){ var now=Date.now(); tState.tapCount++; if(tState.tapCount>=2&&(now-tState.tapTime)<DOUBLE_TAP_MS){ clearTimeout(tState.tapTimer); tState.tapCount=0; fireClick(t.clientX,t.clientY); } else { tState.tapTime=now; clearTimeout(tState.tapTimer); tState.tapTimer=setTimeout(function(){ tState.tapCount=0; tpStatus.textContent='Ready'; tpIcon.textContent='👆'; },DOUBLE_TAP_MS+100); } } else { tpStatus.textContent='Ready'; tpIcon.textContent='👆'; } }
function onTouchCancel(e) { e.preventDefault(); tState.active=false; trackpad.classList.remove('active'); tpStatus.textContent='Ready'; tpIcon.textContent='👆'; }
var mouseDown=false,mouseLast={x:0,y:0},mouseLastSent=0;
function onMouseDown(e){ mouseDown=true; mouseLast.x=e.clientX; mouseLast.y=e.clientY; trackpad.classList.add('active'); }
function onMouseMove(e){ if(!mouseDown) return; var dx=(e.clientX-mouseLast.x)*SENSITIVITY; var dy=(e.clientY-mouseLast.y)*SENSITIVITY; mouseLast.x=e.clientX; mouseLast.y=e.clientY; var now=Date.now(); if(now-mouseLastSent<THROTTLE_MS) return; mouseLastSent=now; dx=Math.round(Math.max(-100,Math.min(100,dx))); dy=Math.round(Math.max(-100,Math.min(100,dy))); if(Math.abs(dx)>1||Math.abs(dy)>1) sendTrackpad('scroll',dx,dy); }
function onMouseUp(){ mouseDown=false; trackpad.classList.remove('active'); tpStatus.textContent='Ready'; tpIcon.textContent='👆'; }
function fireClick(cx,cy){ var rect=trackpad.getBoundingClientRect(); var rx=(cx||rect.left+rect.width/2)-rect.left; var ry=(cy||rect.top+rect.height/2)-rect.top; rippleEl.style.left=rx+'px'; rippleEl.style.top=ry+'px'; rippleEl.classList.remove('hidden'); rippleEl.style.animation='none'; void rippleEl.offsetWidth; rippleEl.style.animation=''; setTimeout(function(){ rippleEl.classList.add('hidden'); },500); trackpad.classList.add('clicked'); tpStatus.textContent='✅ Click!'; tpIcon.textContent='👇'; setTimeout(function(){ trackpad.classList.remove('clicked'); tpStatus.textContent='Ready'; tpIcon.textContent='👆'; },600); sendTrackpad('click',0,0); }
function sendTrackpad(action,dx,dy){ fetch('/api/remote/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'trackpad',action:action,dx:dx,dy:dy})}).catch(function(){}); }
function startRepeat(dir){ sendArrow(dir); repeatTimer=setInterval(function(){ sendArrow(dir); },80); }
function stopRepeat(){ clearInterval(repeatTimer); repeatTimer=null; }
function sendArrow(dir){ sendTrackpad('scroll',0,dir==='down'?60:-60); if(tpStatus) tpStatus.textContent=dir==='down'?'▼ Scrolling':'▲ Scrolling'; }

// ─── VOICE ────────────────────────────────────
function toggleVoice() { if(isListening){ stopListening(); } else { startListening(); } }
function startListening() {
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ document.getElementById('transcript').textContent='Voice not supported. Try Chrome/Safari.'; return; }
  recognition=new SR(); recognition.lang='en-US'; recognition.continuous=false; recognition.interimResults=true;
  recognition.onstart=function(){ isListening=true; document.getElementById('micBtn').classList.add('listening'); document.getElementById('micLbl').textContent='Listening...'; document.getElementById('waveRow').classList.remove('hidden'); var t=document.getElementById('transcript'); t.textContent='...'; t.classList.add('active'); };
  recognition.onresult=function(e){ var final='',interim=''; for(var i=e.resultIndex;i<e.results.length;i++){ if(e.results[i].isFinal) final+=e.results[i][0].transcript; else interim+=e.results[i][0].transcript; } document.getElementById('transcript').textContent=final||interim; if(final){ fetch('/api/remote/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'voice',command:final})}).catch(function(){}); } };
  recognition.onerror=function(e){ var msg='Error: '+e.error; if(e.error==='not-allowed') msg='🚫 Allow mic permission.'; document.getElementById('transcript').textContent=msg; stopListening(); };
  recognition.onend=function(){ stopListening(); };
  try{ recognition.start(); } catch(err){ document.getElementById('transcript').textContent='Mic error.'; }
}
function stopListening(){ isListening=false; if(recognition){ try{recognition.stop();}catch(e){} } document.getElementById('micBtn').classList.remove('listening'); document.getElementById('micLbl').textContent='Tap to Speak'; document.getElementById('waveRow').classList.add('hidden'); var t=document.getElementById('transcript'); t.classList.remove('active'); setTimeout(function(){ if(!isListening) t.textContent='Say a command...'; },4000); }

// ─── CONNECTION ───────────────────────────────
function checkConn() {
  fetch('/api/stats').then(function(r){return r.json();}).then(function(){
    document.getElementById('connDot').classList.add('connected');
    document.getElementById('connText').textContent='Connected';
  }).catch(function(){
    document.getElementById('connDot').classList.remove('connected');
    document.getElementById('connText').textContent='Offline';
  });
}
checkConn();
setInterval(checkConn, 5000);

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initTrackpad();
  renderHome();
});
if (document.readyState==='complete'||document.readyState==='interactive') {
  setTimeout(function(){ initTrackpad(); renderHome(); }, 100);
}