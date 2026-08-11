/* ─── DBT Smart Kiosk — Touch Screen JS ─── */

var viewHistory  = [];
var currentView  = 'home';
var activeNavTab = 'home';
var courseState  = { level:'vc', year:1, semester:1 };
var outcomeLevel = 'vc';
var feeLevel     = 'vc';

/* ids of whatever single item is currently open, so a language switch
   can re-render the same record instead of losing your place */
var currentTeacherId = null;
var currentOutcomeId = null;
var currentFaqId     = null;
var currentAnnId     = null;

/* ══════════════════════════════════════════════
   LANGUAGE — state, dictionary, translate + toggle
   ══════════════════════════════════════════════ */
var currentLang = 'en';

/* Rule of thumb used throughout this file:
   - Content fields that already ship a `_th` counterpart (course names,
     teacher names, career names, fee items, FAQ answers) are shown
     bilingually at all times — that's a deliberate design choice already
     baked into the markup, so the toggle leaves them alone.
   - Everything else (nav, section titles, buttons, empty states, field
     labels) is pure interface chrome and switches with the toggle.       */
var T = {
  homeTitle:            { en:'Digital Business Technology', th:'เทคโนโลยีธุรกิจดิจิทัล' },
  homeSub:              { en:'IRPC Technological College · Rayong', th:'วิทยาลัยเทคโนโลยี IRPC · ระยอง' },
  coursesTitle:         { en:'Curriculum Map', th:'แผนที่หลักสูตร' },
  coursesSub:           { en:'Select your program level', th:'เลือกระดับการศึกษาของคุณ' },
  selectYear:           { en:'Select Year', th:'เลือกชั้นปี' },
  selectYearSub:        { en:'Select year of study', th:'เลือกชั้นปีที่ต้องการศึกษา' },
  selectSemester:       { en:'Select Semester', th:'เลือกภาคเรียน' },
  selectSemesterSub:    { en:'Select semester', th:'เลือกภาคเรียนที่ต้องการศึกษา' },
  curriculum:           { en:'Curriculum', th:'หลักสูตร' },
  subjectsForSemester:  { en:'Subjects for this semester', th:'รายวิชาในภาคเรียนนี้' },
  annTitle:             { en:'Announcements', th:'ประกาศ' },
  departmentNotices:    { en:'Department notices', th:'ประกาศจากภาควิชา' },
  announcement:         { en:'Announcement', th:'ประกาศ' },
  profileTitle:         { en:'Department Profile', th:'โปรไฟล์ภาควิชา' },
  selectSection:        { en:'Select a section', th:'เลือกหัวข้อ' },
  deptTitle:            { en:'Department Information', th:'ข้อมูลภาควิชา' },
  deptSub:              { en:'Computer and Digital Business', th:'คอมพิวเตอร์และธุรกิจดิจิทัล' },
  profileCardDept:      { en:'Department Info', th:'ข้อมูลภาควิชา' },
  teachersTitle:        { en:'Teachers & Staff', th:'อาจารย์และบุคลากร' },
  teachersSub:          { en:'Tap a name to view details', th:'แตะชื่อเพื่อดูรายละเอียด' },
  tapToViewProfile:     { en:'Tap to view profile', th:'แตะเพื่อดูประวัติ' },
  teacherProfile:       { en:'Teacher Profile', th:'ประวัติอาจารย์' },
  outcomesTitle:        { en:'Study Outcomes', th:'แนวทางหลังสำเร็จการศึกษา' },
  outcomesSub:          { en:'Career paths after graduation', th:'เส้นทางอาชีพหลังสำเร็จการศึกษา' },
  tapToLearnMore:       { en:'Tap a career to learn more', th:'แตะอาชีพเพื่อดูข้อมูลเพิ่มเติม' },
  careerPaths:          { en:'Career Paths', th:'เส้นทางอาชีพ' },
  careerPath:           { en:'Career Path', th:'เส้นทางอาชีพ' },
  afterVC:              { en:'After Vocational Certificate', th:'หลังจบประกาศนียบัตรวิชาชีพ (ปวช.)' },
  afterHVC:             { en:'After High Vocational Certificate', th:'หลังจบประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)' },
  feesTitle:            { en:'Program Fees', th:'ค่าเล่าเรียน' },
  feesSub:              { en:'Select your program', th:'เลือกโปรแกรมของคุณ' },
  vcFeesTitle:          { en:'Vocational Certificate Fees', th:'ค่าเล่าเรียน ปวช.' },
  hvcFeesTitle:         { en:'High Vocational Certificate Fees', th:'ค่าเล่าเรียน ปวส.' },
  estimatedCosts:       { en:'Estimated costs per period', th:'ค่าใช้จ่ายโดยประมาณต่อภาคเรียน' },
  estimatedTotal:       { en:'Estimated Total', th:'รวมโดยประมาณ' },
  helpTitle:            { en:'Help & FAQs', th:'ช่วยเหลือและคำถามที่พบบ่อย' },
  helpSub:              { en:'Tap a question to see the answer', th:'แตะคำถามเพื่อดูคำตอบ' },
  faqAnswerTitle:       { en:'FAQ Answer', th:'คำตอบ' },
  question:             { en:'Question', th:'คำถามที่' },
  tapToView:            { en:'Tap to view ›', th:'แตะเพื่อดู ›' },
  vc:                   { en:'Vocational Certificate (ปวช.)', th:'ประกาศนียบัตรวิชาชีพ (ปวช.)' },
  hvc:                  { en:'High Vocational Certificate (ปวส.)', th:'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)' },
  vcPlain:              { en:'Vocational Certificate', th:'ประกาศนียบัตรวิชาชีพ' },
  hvcPlain:             { en:'High Vocational Certificate', th:'ประกาศนียบัตรวิชาชีพชั้นสูง' },
  yearLbl:              { en:'Year', th:'ชั้นปีที่' },
  semesterLbl:          { en:'Semester', th:'ภาคเรียนที่' },
  coreVocational:       { en:'Core / Vocational', th:'วิชาแกน / วิชาชีพ' },
  elective:             { en:'Elective', th:'วิชาเลือก' },
  extraCurricular:      { en:'Extra-Curricular', th:'กิจกรรมเสริม' },
  subjectsLbl:          { en:'Subjects', th:'รายวิชา' },
  semestersLbl:         { en:'Semesters', th:'ภาคเรียน' },
  yearsLbl:             { en:'Years', th:'ปี' },
  programsLbl:          { en:'Programs', th:'โปรแกรม' },
  noticesLbl:           { en:'Notices', th:'ประกาศ' },
  noAnnouncements:      { en:'No announcements right now.', th:'ยังไม่มีประกาศในขณะนี้' },
  activeNotice:         { en:'active notice', th:'ประกาศที่แสดงอยู่' },
  activeNotices:        { en:'active notices', th:'ประกาศที่แสดงอยู่' },
  noTeachers:           { en:'No teacher profiles added yet.', th:'ยังไม่มีข้อมูลอาจารย์' },
  room:                 { en:'Room', th:'ห้อง' },
  officeHours:          { en:'Office Hours', th:'เวลาให้คำปรึกษา' },
  email:                { en:'Email', th:'อีเมล' },
  languages:            { en:'Languages', th:'ภาษา' },
  subjectsField:        { en:'Subjects', th:'วิชาที่สอน' },
  noOutcomes:           { en:'No outcomes added yet.', th:'ยังไม่มีข้อมูลแนวทางอาชีพ' },
  noDescription:        { en:'No description available.', th:'ยังไม่มีคำอธิบาย' },
  noFees:               { en:'No fees added yet.', th:'ยังไม่มีข้อมูลค่าเล่าเรียน' },
  noFaqs:               { en:'No FAQs added yet.', th:'ยังไม่มีคำถามที่พบบ่อย' },
  navHome:              { en:'Home', th:'หน้าแรก' },
  navCourses:           { en:'Courses', th:'หลักสูตร' },
  navNotices:           { en:'Notices', th:'ประกาศ' },
  navProfile:           { en:'Profile', th:'โปรไฟล์' },
  navHelp:              { en:'Help', th:'ช่วยเหลือ' },
  navAsk:               { en:'Ask AI', th:'ถาม AI' },
  askTitle:             { en:'Ask AI Assistant', th:'ถามผู้ช่วย AI' },
  askSub:               { en:'Type or tap the mic to ask a question', th:'พิมพ์หรือแตะไมโครโฟนเพื่อถามคำถาม' },
  askPlaceholder:       { en:'Or type your question here...', th:'หรือพิมพ์คำถามของคุณที่นี่...' },
  kioskDefault:         { en:'DBT Kiosk', th:'คีออสก์ DBT' },
  welcomeTickerFallback:{ en:'🎓 Welcome to the Digital Business Technology Department · IRPC Technological College · Rayong', th:'🎓 ยินดีต้อนรับสู่ภาควิชาเทคโนโลยีธุรกิจดิจิทัล · วิทยาลัยเทคโนโลยี IRPC · ระยอง' },
  welcomeTickerTail:    { en:'🎓 Welcome to DBT Department · IRPC Technological College', th:'🎓 ยินดีต้อนรับสู่ภาควิชา DBT · วิทยาลัยเทคโนโลยี IRPC' },
  voiceWelcome:         { en:'Welcome to the Smart Digital Information Board Kiosk of the Digital Business Technology Department.', th:'ยินดีต้อนรับสู่ตู้คีออสก์ข้อมูลดิจิทัลอัจฉริยะของภาควิชาเทคโนโลยีธุรกิจดิจิทัล' },
  voicePanelTitle:      { en:'Ask DBT Assistant', th:'ถามผู้ช่วย DBT' },
  voiceTapToSpeak:      { en:'Tap the mic and ask a question', th:'แตะไมโครโฟนแล้วถามคำถาม' },
  voiceListening:       { en:'Listening…', th:'กำลังฟัง…' },
  voiceThinking:        { en:'Thinking…', th:'กำลังคิด…' },
  voiceOffline:         { en:'The voice assistant needs internet. Please browse the kiosk manually instead.', th:'ผู้ช่วยเสียงต้องใช้อินเทอร์เน็ต กรุณาเรียกดูข้อมูลด้วยตนเองแทน' },
  voiceNoSupport:       { en:'Voice recognition isn\u2019t supported on this browser.', th:'เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียง' },
  voiceMicLabel:        { en:'Tap to Speak', th:'แตะเพื่อพูด' },
  voiceStopLabel:       { en:'Listening…', th:'กำลังฟัง…' },
  searchPlaceholder:    { en:'Search anything...', th:'ค้นหาทุกอย่าง...' },
  searchingLabel:       { en:'Searching…', th:'กำลังค้นหา…' },
  searchNoResults:      { en:'No results for', th:'ไม่พบผลลัพธ์สำหรับ' },
  searchCourses:        { en:'Courses', th:'รายวิชา' },
  searchAnnouncements:  { en:'Announcements', th:'ประกาศ' },
  searchTeachers:       { en:'Teachers', th:'อาจารย์' },
  searchOutcomes:       { en:'Career Outcomes', th:'แนวทางอาชีพ' },
  searchFees:           { en:'Fees', th:'ค่าเล่าเรียน' },
  searchFaqs:           { en:'FAQs', th:'คำถามที่พบบ่อย' }
};

function t(key) {
  var e = T[key];
  if (!e) return key;
  return e[currentLang] || e.en || key;
}

/* Static markup groups: elements with no id, whose text never gets
   overwritten by JS, translated by fixed position/selector. */
var STATIC_GROUPS = [
  { sel:'.nav-tab-lbl', keys:['navHome','navCourses','navNotices','navProfile','navHelp','navAsk'] },

  { sel:'#view-courses .section-title-text',        keys:['coursesTitle'] },
  { sel:'#view-courses .section-title-sub',         keys:['coursesSub'] },
  { sel:'#view-dept .section-title-text',           keys:['deptTitle'] },
  { sel:'#view-teachers .section-title-text',       keys:['teachersTitle'] },
  { sel:'#view-teachers .section-title-sub',        keys:['teachersSub'] },
  { sel:'#view-outcomes .section-title-text',       keys:['outcomesTitle'] },
  { sel:'#view-outcomes .section-title-sub',        keys:['outcomesSub'] },
  { sel:'#view-fees .section-title-text',           keys:['feesTitle'] },
  { sel:'#view-fees .section-title-sub',            keys:['feesSub'] },
  { sel:'#view-help .section-title-text',           keys:['helpTitle'] },
  { sel:'#view-help .section-title-sub',            keys:['helpSub'] },
  { sel:'#view-ask .section-title-text',            keys:['askTitle'] },
  { sel:'#view-ask .section-title-sub',             keys:['askSub'] },
  { sel:'#view-announcements .section-title-text',  keys:['annTitle'] },
  { sel:'#view-profile .section-title-text',        keys:['profileTitle'] },
  { sel:'#view-profile .section-title-sub',         keys:['selectSection'] },
  { sel:'#view-outcomes-result .section-title-sub', keys:['tapToLearnMore'] },

  { sel:'#view-profile .touch-card-title', keys:['profileCardDept','teachersTitle','outcomesTitle','feesTitle'] },
  { sel:'.touch-card-arrow, .clc-tap',     keys:['tapToView'] },

  { sel:'#view-courses .clc-desc',
    en:[
      'Foundation program covering digital business, computer systems, graphic design, web development and workplace skills for the modern digital economy.',
      'Advanced program in web development, e-commerce systems, mobile applications, IoT, multimedia production and digital business project management.'
    ],
    th:[
      'หลักสูตรพื้นฐานที่ครอบคลุมธุรกิจดิจิทัล ระบบคอมพิวเตอร์ การออกแบบกราฟิก การพัฒนาเว็บไซต์ และทักษะการทำงานสำหรับเศรษฐกิจดิจิทัลยุคใหม่',
      'หลักสูตรขั้นสูงด้านการพัฒนาเว็บไซต์ ระบบอีคอมเมิร์ซ แอปพลิเคชันมือถือ IoT การผลิตมัลติมีเดีย และการบริหารโครงงานธุรกิจดิจิทัล'
    ]
  },
  { sel:'.clc-stat-lbl', keys:['yearsLbl','semestersLbl','subjectsLbl','yearsLbl','semestersLbl','subjectsLbl'] },
  { sel:'.home-hl-text',
    en:[
      'Hands-on computer labs every semester',
      'Real e-commerce and web projects',
      'AI and IoT integrated curriculum',
      'Internship at leading Thai companies',
      'Nationally recognized certification'
    ],
    th:[
      'ปฏิบัติจริงในห้องแล็บคอมพิวเตอร์ทุกภาคเรียน',
      'โปรเจกต์อีคอมเมิร์ซและเว็บไซต์จริง',
      'หลักสูตรผสานเทคโนโลยี AI และ IoT',
      'ฝึกงานกับบริษัทชั้นนำของไทย',
      'วุฒิการศึกษาที่ได้รับการรับรองระดับประเทศ'
    ]
  },
  { sel:'.hero-welcome',    en:['Welcome to DBT'], th:['ยินดีต้อนรับสู่ DBT'] },
  { sel:'.hero-cert-label', en:['Your Certificates'], th:['วุฒิการศึกษาของคุณ'] },
  { sel:'.hero-cert-name',  keys:['vcPlain','hvcPlain'] },
  { sel:'.info-lbl',
    en:['Department','Major','Room','Academic Year','Project Advisor','Co-Advisor','Website','Location'],
    th:['ภาควิชา','สาขาวิชา','ห้อง','ปีการศึกษา','อาจารย์ที่ปรึกษาโครงงาน','อาจารย์ที่ปรึกษาร่วม','เว็บไซต์','ที่ตั้ง']
  },
  { sel:'#view-courses-sem .sem-touch-desc',
    en:['First half of the academic year','Second half of the academic year'],
    th:['ครึ่งแรกของปีการศึกษา','ครึ่งหลังของปีการศึกษา']
  }
];

var TICKER_EN = ['Submission Deadline', 'Time Table for 68-23', 'Welcome to DBT Department - IRPC Technological College'];
var TICKER_TH = ['กำหนดส่งงาน', 'ตารางเรียนห้อง 68-23', 'ยินดีต้อนรับสู่ภาควิชา DBT วิทยาลัยเทคโนโลยี IRPC'];

function applyStaticTranslations() {
  STATIC_GROUPS.forEach(function(g) {
    var els = document.querySelectorAll(g.sel);
    if (!els.length) return;
    var values = g.keys ? g.keys.map(function(k){ return t(k); }) : (g[currentLang] || g.en);
    if (values.length === 1 && els.length > 1) {
      els.forEach(function(el){ el.textContent = values[0]; });
    } else {
      els.forEach(function(el, i){ if (values[i] !== undefined) el.textContent = values[i]; });
    }
  });

  /* ticker items are "<icon span>Text" — only swap the trailing text node */
  var tickerTexts = currentLang === 'th' ? TICKER_TH : TICKER_EN;
  document.querySelectorAll('.ticker-item').forEach(function(el, i) {
    var last = el.lastChild;
    if (last && last.nodeType === 3 && tickerTexts[i] !== undefined) last.nodeValue = tickerTexts[i];
  });

  var input = document.getElementById('headerSearchInput');
  if (input) input.placeholder = t('searchPlaceholder');

  var askInput = document.getElementById('askTextInput');
  if (askInput) askInput.placeholder = t('askPlaceholder');
}

function setTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') theme = 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('dbt_theme', theme); } catch (e) {}
  var btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'th') lang = 'en';
  currentLang = lang;
  try { localStorage.setItem('dbt_lang', lang); } catch (e) {}

  document.documentElement.lang = lang;
  var enBtn = document.getElementById('langOptionEn');
  var thBtn = document.getElementById('langOptionTh');
  if (enBtn) enBtn.classList.toggle('active', lang === 'en');
  if (thBtn) thBtn.classList.toggle('active', lang === 'th');

  applyStaticTranslations();
  updateHeader(currentView);
  updateBreadcrumb();
  refreshDynamicView();
}

function toggleLanguage() {
  setLanguage(currentLang === 'en' ? 'th' : 'en');
}

/* Re-render whatever is currently on screen so language-dependent
   dynamic content (fetched from the API) updates immediately, without
   disturbing view-history / back-button state. */
function refreshDynamicView() {
  switch (currentView) {
    case 'home':             loadStats(); loadTicker(); break;
    case 'courses-year':     showCourseYearSelect(courseState.level, true); break;
    case 'courses-sem':      showCourseSemSelect(courseState.year, true); break;
    case 'courses-result':   showCourseResult(courseState.semester, true); break;
    case 'announcements':    loadAnnouncements(); break;
    case 'ann-single':       if (currentAnnId != null) showAnnouncement(currentAnnId, true); break;
    case 'teachers':         showTeachers(true); break;
    case 'teacher-single':   if (currentTeacherId != null) showTeacher(currentTeacherId, true); break;
    case 'outcomes-result':  showOutcomes(outcomeLevel, true); break;
    case 'outcome-single':   if (currentOutcomeId != null) showOutcome(currentOutcomeId, true); break;
    case 'fees-result':      showFees(feeLevel, true); break;
    case 'help':             loadFAQs(); break;
    case 'faq-single':       if (currentFaqId != null) showFAQ(currentFaqId, true); break;
    default: break; /* static views are already covered by applyStaticTranslations() */
  }
}

// ─── CLOCK ───────────────────────────────────
function updateClock() {
  var now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ─── VIEW NAVIGATION ──────────────────────────
var suppressViewAnimation = false;

function showView(viewId) {
  /* Track the outgoing view via our own state, not a DOM query — during
     a fade, the outgoing view still carries the "active" class for up
     to 240ms, and if a second navigation lands in that window (easy
     with FAQ/announcements' back-to-back fetches), querySelector can
     return the wrong, already-stale view and orphan the real one on
     screen. currentView is always accurate the instant a call starts. */
  var previousViewId = currentView;

  /* already showing this view (e.g. a language-refresh re-call) —
     just update state/header, skip the fade so nothing flickers */
  if (previousViewId === viewId) {
    updateHeader(viewId);
    return;
  }

  /* multi-hop chained navigation (e.g. jumping straight to a search
     result through several views) — switch instantly with no fade so
     the rapid-fire timers from each hop can't overlap and show two
     views active at once */
  if (suppressViewAnimation) {
    document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active', 'exit'); });
    currentView = viewId;
    var instantNext = document.getElementById('view-' + viewId);
    if (instantNext) instantNext.classList.add('active');
    updateHeader(viewId);
    return;
  }

  var prevEl = document.getElementById('view-' + previousViewId);
  if (prevEl) {
    prevEl.classList.add('exit');
    setTimeout(function(){ prevEl.classList.remove('active','exit'); }, 240);
  }
  currentView = viewId;
  setTimeout(function() {
    var next = document.getElementById('view-' + viewId);
    if (next) next.classList.add('active');
  }, 20);
  updateHeader(viewId);
}

function pushHistory(viewId) {
  viewHistory.push(viewId);
  updateBackBtn();
  updateBreadcrumb();
}

function navTo(section, tabEl) {
  closeSearchResults();
  stopVoiceListening();
  viewHistory = [];
  document.querySelectorAll('.nav-tab').forEach(function(t){ t.classList.remove('active'); });
  tabEl.classList.add('active');
  activeNavTab = section;

  document.querySelectorAll('.view').forEach(function(v){
    v.classList.remove('active','exit');
  });

  if (section === 'home')          { showView('home'); loadStats(); loadTicker(); }
  if (section === 'courses')       { showView('courses'); }
  if (section === 'announcements') { showView('announcements'); loadAnnouncements(); }
  if (section === 'profile')       { showView('profile'); }
  if (section === 'help')          { showView('help'); loadFAQs(); }
  if (section === 'ask')           { showView('ask'); resetAskPage(); }

  updateBackBtn();
  updateBreadcrumb();
}

function goBack() {
  if (viewHistory.length === 0) return;
  var prev = viewHistory.pop();
  document.querySelectorAll('.view').forEach(function(v){
    v.classList.remove('active','exit');
  });
  var prevEl = document.getElementById('view-' + prev);
  if (prevEl) prevEl.classList.add('active');
  currentView = prev;
  updateBackBtn();
  updateBreadcrumb();
  updateHeader(prev);
}

function updateBackBtn() {
  var btn = document.getElementById('headerBack');
  if (viewHistory.length > 0) {
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
}

function updateHeader(viewId) {
  var titles = {
    'home':              { title:t('homeTitle'),        sub:t('homeSub') },
    'courses':           { title:t('coursesTitle'),      sub:t('coursesSub') },
    'courses-year':      { title:t('selectYear'),        sub:t('selectYearSub') },
    'courses-sem':       { title:t('selectSemester'),    sub:t('selectSemesterSub') },
    'courses-result':    { title:t('curriculum'),        sub:t('subjectsForSemester') },
    'announcements':     { title:t('annTitle'),          sub:t('departmentNotices') },
    'ann-single':        { title:t('announcement'),      sub:'' },
    'profile':           { title:t('profileTitle'),      sub:t('selectSection') },
    'dept':              { title:t('deptTitle'),         sub:t('deptSub') },
    'teachers':          { title:t('teachersTitle'),     sub:t('tapToViewProfile') },
    'teacher-single':    { title:t('teacherProfile'),    sub:'' },
    'outcomes':          { title:t('outcomesTitle'),     sub:t('outcomesSub') },
    'outcomes-result':   { title:t('careerPaths'),       sub:t('tapToLearnMore') },
    'outcome-single':    { title:t('careerPath'),        sub:'' },
    'fees':              { title:t('feesTitle'),         sub:t('feesSub') },
    'fees-result':       { title:t('feesTitle'),         sub:t('estimatedCosts') },
    'help':              { title:t('helpTitle'),         sub:t('helpSub') },
    'ask':               { title:t('askTitle'),          sub:t('askSub') },
    'faq-single':        { title:t('faqAnswerTitle'),    sub:'' }
  };
  var info = titles[viewId] || { title:t('kioskDefault'), sub:'' };
  document.getElementById('headerTitle').textContent = info.title;
  document.getElementById('headerSub').textContent   = info.sub;
}

function setHeader(title, sub) {
  document.getElementById('headerTitle').textContent = title;
  document.getElementById('headerSub').textContent   = sub;
}

function updateBreadcrumb() {
  var bc = document.getElementById('breadcrumb');
  if (viewHistory.length === 0) {
    bc.classList.add('hidden');
    return;
  }
  bc.classList.remove('hidden');
  var labels = {
    'home':t('navHome'), 'courses':t('navCourses'), 'courses-year':t('selectYear'),
    'courses-sem':t('selectSemester'), 'announcements':t('navNotices'),
    'profile':t('navProfile'), 'teachers':t('teachersTitle'), 'outcomes':t('outcomesTitle'),
    'fees':t('feesTitle'), 'help':t('navHelp'), 'ask':t('navAsk')
  };
  var path = viewHistory.map(function(v){ return labels[v] || v; });
  path.push('...');
  document.getElementById('breadcrumbText').textContent = path.join(' › ');
}

// ─── HOME ────────────────────────────────────
function loadStats() {
  fetch('/api/stats').then(function(r){return r.json();}).then(function(d) {
    var el = document.getElementById('homeStats');
    if (!el) return;
    el.innerHTML =
      '<div class="home-stat-card"><div class="home-stat-num">' + d.total_courses + '</div><div class="home-stat-lbl">' + t('subjectsLbl') + '</div></div>' +
      '<div class="home-stat-card"><div class="home-stat-num">2</div><div class="home-stat-lbl">' + t('programsLbl') + '</div></div>' +
      '<div class="home-stat-card"><div class="home-stat-num">6</div><div class="home-stat-lbl">' + t('yearsLbl') + '</div></div>' +
      '<div class="home-stat-card"><div class="home-stat-num">' + d.active_announcements + '</div><div class="home-stat-lbl">' + t('noticesLbl') + '</div></div>';
  });
}

function loadTicker() {
  fetch('/api/announcements').then(function(r){return r.json();}).then(function(data) {
    var el = document.getElementById('promoTickerInner');
    if (!el) return;
    if (!data.length) {
      el.textContent = t('welcomeTickerFallback');
      return;
    }
    var items = data.map(function(a){ return '📢 ' + a.title + '  ·  '; });
    el.textContent = items.join('') + items.join('') + t('welcomeTickerTail');
  });
}

// ─── COURSES ─────────────────────────────────
function showCourseYearSelect(level, refresh) {
  courseState.level = level;
  var isVC  = level === 'vc';
  document.getElementById('yearSelectIcon').textContent  = isVC ? '🎓' : '🏅';
  document.getElementById('yearSelectTitle').textContent = t(isVC ? 'vc' : 'hvc');

  var years  = isVC ? [1,2,3] : [1,2];
  var vcDesc = {
    1: { th:'ปีที่ 1', desc:{ en:'Core foundations — Thai, English, mathematics, basic computer and digital skills', th:'พื้นฐานหลัก — ภาษาไทย ภาษาอังกฤษ คณิตศาสตร์ และทักษะคอมพิวเตอร์ดิจิทัลเบื้องต้น' } },
    2: { th:'ปีที่ 2', desc:{ en:'Intermediate skills — graphic design, database, multimedia, web creation', th:'ทักษะระดับกลาง — การออกแบบกราฟิก ฐานข้อมูล มัลติมีเดีย และการสร้างเว็บไซต์' } },
    3: { th:'ปีที่ 3', desc:{ en:'Advanced — e-commerce, mobile apps, maintenance, internship', th:'ขั้นสูง — อีคอมเมิร์ซ แอปพลิเคชันมือถือ งานบำรุงรักษา และการฝึกงาน' } }
  };
  var hvcDesc = {
    1: { th:'ปีที่ 1', desc:{ en:'Advanced foundations — OOP, database systems, AI applications, IoT', th:'พื้นฐานขั้นสูง — OOP ระบบฐานข้อมูล แอปพลิเคชัน AI และ IoT' } },
    2: { th:'ปีที่ 2', desc:{ en:'Professional applications — website, e-commerce systems, digital projects', th:'การประยุกต์ใช้งานระดับมืออาชีพ — เว็บไซต์ ระบบอีคอมเมิร์ซ และโปรเจกต์ดิจิทัล' } }
  };
  var descMap = isVC ? vcDesc : hvcDesc;
  var grid = document.getElementById('yearChoiceGrid');
  grid.innerHTML = years.map(function(y) {
    var d = descMap[y] || { th:'', desc:{ en:'', th:'' } };
    return '<div class="year-touch-card" onclick="showCourseSemSelect(' + y + ')">' +
             '<div class="ytc-num">' + y + '</div>' +
             '<div class="ytc-body">' +
               '<div class="ytc-title">' + t('yearLbl') + ' ' + y + '</div>' +
               '<div class="ytc-sub">' + d.th + '</div>' +
               '<div class="ytc-desc">' + (d.desc[currentLang] || d.desc.en) + '</div>' +
             '</div>' +
             '<div class="ytc-arrow">›</div>' +
           '</div>';
  }).join('');

  if (!refresh) pushHistory('courses');
  showView('courses-year');
}

function showCourseSemSelect(year, refresh) {
  courseState.year = year;
  var levelLabel = t(courseState.level === 'vc' ? 'vc' : 'hvc');
  document.getElementById('semSelectTitle').textContent = levelLabel + ' · ' + t('yearLbl') + ' ' + year;
  if (!refresh) pushHistory('courses-year');
  showView('courses-sem');
}

function showCourseResult(semester, refresh) {
  courseState.semester = semester;
  var levelLabel = t(courseState.level === 'vc' ? 'vcPlain' : 'hvcPlain');
  var isHVC      = courseState.level === 'hvc';

  document.getElementById('courseResultHeader').innerHTML =
    '<div class="cr-title">' +
      '<span>' + levelLabel + '</span>' +
      '<span class="cr-badge' + (isHVC ? ' hvc' : '') + '">' + (isHVC ? 'ปวส.' : 'ปวช.') + '</span>' +
    '</div>' +
    '<div class="cr-sub">' +
      '<span>' + t('yearLbl') + ' ' + courseState.year + '</span>' +
      '<span class="cr-sub-divider">·</span>' +
      '<span>' + t('semesterLbl') + ' ' + semester + '</span>' +
    '</div>';

  return fetch('/api/courses?level=' + courseState.level + '&year=' + courseState.year + '&semester=' + semester)
    .then(function(r){return r.json();})
    .then(function(courses) {
      var typeColors = { core:'var(--orange)', elective:'var(--blue)', extra:'var(--green)' };
      var html = '<div class="course-flat-list">';
      courses.forEach(function(c, i) {
        html += '<div class="course-flat-row">' +
                  '<div class="course-flat-num">' + (i+1) + '</div>' +
                  '<div class="course-flat-code">' + c.code + '</div>' +
                  '<div class="course-flat-name">' +
                    '<div class="course-flat-en">' + c.name + '</div>' +
                    (c.name_th ? '<div class="course-flat-th">' + c.name_th + '</div>' : '') +
                  '</div>' +
                  '<div class="course-flat-dot" style="background:' + (typeColors[c.group_type]||'var(--orange)') + '"></div>' +
                '</div>';
      });
      html += '</div>';
      html += '<div class="course-flat-legend">' +
                '<div class="cfl-item"><div class="cfl-dot" style="background:var(--orange)"></div>' + t('coreVocational') + '</div>' +
                '<div class="cfl-item"><div class="cfl-dot" style="background:var(--blue)"></div>' + t('elective') + '</div>' +
                '<div class="cfl-item"><div class="cfl-dot" style="background:var(--green)"></div>' + t('extraCurricular') + '</div>' +
              '</div>';
      document.getElementById('courseResultGrid').innerHTML = html;
      if (!refresh) pushHistory('courses-sem');
      showView('courses-result');
    });
}

// ─── ANNOUNCEMENTS ───────────────────────────
function loadAnnouncements() {
  fetch('/api/announcements').then(function(r){return r.json();}).then(function(data) {
    var sub = document.getElementById('annCountSub');
    if (sub) sub.textContent = data.length + ' ' + t(data.length !== 1 ? 'activeNotices' : 'activeNotice');
    var list = document.getElementById('annSelectList');
    if (!list) return;
    list.innerHTML = data.map(function(a, i) {
      var tag = (a.tag||'GENERAL').toLowerCase();
      return '<div class="ann-touch-item ' + tag + '" onclick="showAnnouncement(' + a.id + ')">' +
               '<div class="ann-touch-num">' + (i+1) + '</div>' +
               '<div class="ann-touch-title">' + a.title + '</div>' +
               '<div class="ann-touch-tag">' + a.tag + '</div>' +
               '<div class="ann-touch-arrow">›</div>' +
             '</div>';
    }).join('') || '<div class="sr-empty">' + t('noAnnouncements') + '</div>';
  });
}

function showAnnouncement(annId, refresh) {
  currentAnnId = annId;
  fetch('/api/announcements').then(function(r){return r.json();}).then(function(data) {
    var a = data.find(function(x){ return x.id === annId; });
    if (!a) return;
    document.getElementById('annSingleWrap').innerHTML =
      '<div class="ann-single-tag-row">' +
        '<span class="ann-single-tag">' + a.tag + '</span>' +
        '<span class="ann-single-date">' + a.date_posted + '</span>' +
      '</div>' +
      '<div class="ann-single-title">' + a.title + '</div>' +
      '<div class="ann-single-body">'  + a.body  + '</div>' +
      (a.body_th ? '<div class="ann-single-body-th">' + a.body_th + '</div>' : '') +
      (a.image_path ? '<img class="ann-single-img" src="' + a.image_path + '">' : '');
    if (!refresh) pushHistory('announcements');
    showView('ann-single');
    setHeader(a.title, a.date_posted);
  });
}

// ─── PROFILE ─────────────────────────────────
function showTeachers(refresh) {
  return fetch('/api/teachers').then(function(r){return r.json();}).then(function(data) {
    var grid = document.getElementById('teacherSelectGrid');
    if (!data.length) { grid.innerHTML = '<div class="sr-empty">' + t('noTeachers') + '</div>'; }
    else {
      grid.innerHTML = data.map(function(t2, i) {
        var label = (currentLang === 'th' && t2.name_th) ? t2.name_th : t2.name_en;
        return '<div class="touch-num-btn" onclick="showTeacher(' + t2.id + ')">' +
                 '<div class="num-circle">' + (i+1) + '</div>' +
                 '<div class="num-label">' + label + '</div>' +
               '</div>';
      }).join('');
    }
    showView('teachers');
    setHeader(t('teachersTitle'), t('tapToViewProfile'));
  });
}

function showTeacher(id, refresh) {
  currentTeacherId = id;
  return fetch('/api/teachers').then(function(r){return r.json();}).then(function(data) {
    var t2 = data.find(function(x){ return x.id === id; });
    if (!t2) return;
    var initials = t2.name_en.split(' ').filter(function(w){ return w.length>1; }).slice(-2).map(function(w){ return w[0]; }).join('');
    document.getElementById('teacherSingleCard').innerHTML =
      '<div class="teacher-single-top">' +
        '<div class="teacher-avatar-lg">' + initials + '</div>' +
        '<div>' +
          '<div class="teacher-single-name">' + t2.name_en + '</div>' +
          (t2.name_th ? '<div class="teacher-single-th">' + t2.name_th + '</div>' : '') +
          '<div class="teacher-single-pos">' + t2.position + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="teacher-detail-grid">' +
        '<div class="teacher-detail-item"><div class="teacher-detail-lbl">' + t('room') + '</div><div class="teacher-detail-val">' + (t2.room||'–') + '</div></div>' +
        '<div class="teacher-detail-item"><div class="teacher-detail-lbl">' + t('officeHours') + '</div><div class="teacher-detail-val">' + (t2.office_hours||'–') + '</div></div>' +
        (t2.email ? '<div class="teacher-detail-item"><div class="teacher-detail-lbl">' + t('email') + '</div><div class="teacher-detail-val">' + t2.email + '</div></div>' : '') +
        '<div class="teacher-detail-item"><div class="teacher-detail-lbl">' + t('languages') + '</div><div class="teacher-detail-val">' + (t2.languages||'–') + '</div></div>' +
        (t2.subjects ? '<div class="teacher-detail-item" style="grid-column:span 2"><div class="teacher-detail-lbl">' + t('subjectsField') + '</div><div class="teacher-detail-val">' + t2.subjects.replace(/\n/g,', ') + '</div></div>' : '') +
      '</div>' +
      (t2.message ? '<div class="teacher-msg-box">"' + t2.message + '"</div>' : '');
    if (!refresh) pushHistory('teachers');
    showView('teacher-single');
    setHeader(t2.name_en, t2.position);
  });
}

// ─── OUTCOMES ────────────────────────────────
function showOutcomeLevelSelect() {
  showView('outcomes');
  setHeader(t('outcomesTitle'), t('outcomesSub'));
}

function showOutcomes(level, refresh) {
  outcomeLevel = level;
  var icons = ['💻','📱','🌐','📊','🎨','🔧','🚀','💡','🏢','📈'];
  var title = t(level === 'vc' ? 'afterVC' : 'afterHVC');
  document.getElementById('outcomeResultTitle').textContent = title;
  return fetch('/api/outcomes?level=' + level).then(function(r){return r.json();}).then(function(data) {
    var grid = document.getElementById('outcomeSelectGrid');
    if (!data.length) { grid.innerHTML = '<div class="sr-empty">' + t('noOutcomes') + '</div>'; }
    else {
      grid.innerHTML = data.map(function(o, i) {
        var label = (currentLang === 'th' && o.career_th) ? o.career_th : o.career;
        return '<div class="touch-num-btn" onclick="showOutcome(' + o.id + ')">' +
                 '<div class="num-circle">' + icons[i%icons.length] + '</div>' +
                 '<div class="num-label">' + label + '</div>' +
               '</div>';
      }).join('');
    }
    showView('outcomes-result');
    setHeader(title, t('tapToLearnMore'));
  });
}

function showOutcome(id, refresh) {
  currentOutcomeId = id;
  var icons = ['💻','📱','🌐','📊','🎨','🔧','🚀','💡','🏢','📈'];
  return fetch('/api/outcomes').then(function(r){return r.json();}).then(function(data) {
    var o = data.find(function(x){ return x.id === id; });
    if (!o) return;
    var idx = data.indexOf(o);
    document.getElementById('outcomeSingleCard').innerHTML =
      '<div class="outcome-single-wrap">' +
        '<div class="outcome-single-top">' +
          '<div class="outcome-single-icon">' + icons[idx%icons.length] + '</div>' +
          '<div>' +
            '<div class="outcome-single-name">' + o.career + '</div>' +
            (o.career_th ? '<div class="outcome-single-th">' + o.career_th + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="outcome-single-desc">' + (o.description||t('noDescription')) + '</div>' +
        (o.desc_th ? '<div style="font-size:14px;color:var(--text-tert);line-height:1.7;font-style:italic;">' + o.desc_th + '</div>' : '') +
        '<div><span class="outcome-single-badge">' + t(o.level==='vc'?'vc':'hvc') + '</span></div>' +
      '</div>';
    if (!refresh) pushHistory('outcomes-result');
    showView('outcome-single');
    setHeader(o.career, o.career_th||'');
  });
}

// ─── FEES ────────────────────────────────────
function showFeeLevelSelect() {
  showView('fees');
  setHeader(t('feesTitle'), t('feesSub'));
}

function showFees(level, refresh) {
  feeLevel = level;
  var title = t(level === 'vc' ? 'vcFeesTitle' : 'hvcFeesTitle');
  document.getElementById('feeResultTitle').textContent = title;
  return fetch('/api/fees?level=' + level).then(function(r){return r.json();}).then(function(data) {
    var total = data.reduce(function(s,f){ return s+f.amount; }, 0);
    var grid  = document.getElementById('feeDisplayGrid');
    if (!data.length) { grid.innerHTML = '<div class="sr-empty">' + t('noFees') + '</div>'; showView('fees-result'); return; }
    grid.innerHTML = data.map(function(f) {
      return '<div class="fee-touch-row">' +
               '<div>' +
                 '<div class="fee-touch-item">'    + f.item    + '</div>' +
                 (f.item_th ? '<div class="fee-touch-item-th">' + f.item_th + '</div>' : '') +
               '</div>' +
               '<div class="fee-touch-right">' +
                 '<div class="fee-touch-amount">฿' + f.amount.toLocaleString() + '</div>' +
                 '<div class="fee-touch-period">'  + f.period  + '</div>' +
               '</div>' +
             '</div>';
    }).join('') +
    '<div class="fee-touch-row fee-total">' +
      '<div class="fee-touch-item">' + t('estimatedTotal') + '</div>' +
      '<div class="fee-touch-amount">฿' + total.toLocaleString() + '</div>' +
    '</div>';
    showView('fees-result');
    setHeader(title, t('estimatedCosts'));
  });
}

// ─── FAQS ─────────────────────────────────────
function loadFAQs() {
  fetch('/api/faqs').then(function(r){return r.json();}).then(function(data) {
    var grid = document.getElementById('faqSelectGrid');
    if (!data.length) { grid.innerHTML = '<div class="sr-empty">' + t('noFaqs') + '</div>'; return; }
    grid.innerHTML = data.map(function(f, i) {
      var q = (currentLang === 'th' && f.question_th) ? f.question_th : f.question;
      return '<div class="touch-num-btn" onclick="showFAQ(' + f.id + ')">' +
               '<div class="num-circle">' + (i+1) + '</div>' +
               '<div class="num-label">' + q.substring(0,50) + (q.length>50?'…':'') + '</div>' +
             '</div>';
    }).join('');
  });
}

function showFAQ(id, refresh) {
  currentFaqId = id;
  fetch('/api/faqs/' + id).then(function(r){return r.json();}).then(function(f) {
    fetch('/api/faqs').then(function(r2){return r2.json();}).then(function(all) {
      var num = all.findIndex(function(x){ return x.id===id; }) + 1;
      document.getElementById('faqSingleWrap').innerHTML =
        '<div class="faq-single-num">' + t('question') + ' ' + num + ' · ' + f.category + '</div>' +
        '<div class="faq-single-head">' +
          '<div class="faq-single-q">'    + f.question + '</div>' +
          (f.question_th ? '<div class="faq-single-q-th">' + f.question_th + '</div>' : '') +
        '</div>' +
        '<div class="faq-single-a">'    + f.answer   + '</div>' +
        (f.answer_th ? '<div class="faq-single-a-th">' + f.answer_th + '</div>' : '') +
        '<div><span class="faq-single-cat">' + f.category + '</span></div>';
      if (!refresh) pushHistory('help');
      showView('faq-single');
      setHeader(t('faqAnswerTitle'), f.category);
    });
  });
}

// ─── VOICE BAR (kept for voice commands) ──────
function setVoiceBar(mode, icon, text) {}
function speak(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = lang || (currentLang === 'th' ? 'th-TH' : 'en-US');
  u.rate = 0.92; u.pitch = 1;
  window.speechSynthesis.speak(u);
}

/* ══════════════════════════════════════════════
   ASK AI PAGE — speech-to-text / typed → /api/ask → speak
   ══════════════════════════════════════════════ */
var voiceRecognition = null;
var voiceIsListening  = false;

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function resetAskPage() {
  var status = document.getElementById('askStatus');
  var transcript = document.getElementById('askTranscript');
  var answer = document.getElementById('askAnswer');
  var input = document.getElementById('askTextInput');
  if (status) status.textContent = t('voiceTapToSpeak');
  if (transcript) transcript.textContent = '';
  if (answer) answer.textContent = '';
  if (input) input.value = '';
}

function startVoiceListening() {
  if (voiceIsListening) return;

  var SR = getSpeechRecognitionCtor();
  if (!SR) {
    document.getElementById('askStatus').textContent = t('voiceNoSupport');
    return;
  }

  voiceRecognition = new SR();
  voiceRecognition.lang = currentLang === 'th' ? 'th-TH' : 'en-US';
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = true;
  voiceRecognition.maxAlternatives = 1;

  voiceIsListening = true;
  document.getElementById('askOrb').classList.add('listening');
  document.getElementById('askStatus').textContent = t('voiceListening');
  document.getElementById('askAnswer').textContent = '';

  voiceRecognition.onresult = function(e) {
    var transcript = '';
    for (var i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
    document.getElementById('askTranscript').textContent = transcript;
    if (e.results[e.results.length - 1].isFinal) {
      stopVoiceListening();
      var q = transcript.trim();
      if (q) askAssistant(q);
    }
  };
  voiceRecognition.onerror = function() {
    stopVoiceListening();
    document.getElementById('askStatus').textContent = t('voiceNoSupport');
  };
  voiceRecognition.onend = function() { stopVoiceListening(); };

  try { voiceRecognition.start(); }
  catch (e) { stopVoiceListening(); }
}

function stopVoiceListening() {
  voiceIsListening = false;
  var orb = document.getElementById('askOrb');
  if (orb) orb.classList.remove('listening');
  if (voiceRecognition) { try { voiceRecognition.stop(); } catch (e) {} }
}

function submitTypedQuestion() {
  var input = document.getElementById('askTextInput');
  if (!input) return;
  var q = input.value.trim();
  if (!q) return;
  document.getElementById('askTranscript').textContent = q;
  askAssistant(q);
}

function askAssistant(question) {
  document.getElementById('askStatus').textContent = t('voiceThinking');
  document.getElementById('askAnswer').textContent = '';

  fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: question, lang: currentLang })
  })
    .then(function(r) {
      return r.json().then(function(data) { return { ok: r.ok, data: data }; });
    })
    .then(function(res) {
      if (res.ok) {
        var answer = (res.data && res.data.answer) ? res.data.answer : '';
        document.getElementById('askStatus').textContent = '';
        document.getElementById('askAnswer').textContent = answer;
        if (answer) speak(answer);
      } else {
        // The server responded — this is NOT a "no internet" situation.
        // Show whatever real reason app.py gave us.
        var msg = (res.data && res.data.error) ? res.data.error : t('voiceOffline');
        document.getElementById('askStatus').textContent = msg;
      }
    })
    .catch(function() {
      // fetch() itself threw — the browser genuinely couldn't reach the server at all.
      document.getElementById('askStatus').textContent = t('voiceOffline');
    });
}

/* ══════════════════════════════════════════════
   SEARCH — debounced, multi-source, click-to-navigate
   ══════════════════════════════════════════════ */
var searchCache = { announcements:null, teachers:null, outcomes:null, fees:null, faqs:null, courses:null };
var searchDebounceTimer = null;

function injectSearchStyles() {
  if (document.getElementById('hsrStyles')) return;
  var style = document.createElement('style');
  style.id = 'hsrStyles';
  style.textContent =
    '.header-search{position:relative;}' +
    '.hsr-panel{display:none;position:absolute;top:calc(100% + 8px);left:0;right:0;max-height:60vh;overflow-y:auto;' +
      'background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius-sm);' +
      'box-shadow:var(--shadow-md);z-index:50;padding:8px;}' +
    '.hsr-panel.open{display:block;}' +
    '.hsr-group{margin-bottom:6px;} .hsr-group:last-child{margin-bottom:0;}' +
    '.hsr-group-label{font-family:var(--font-body);font-size:11px;font-weight:700;text-transform:uppercase;' +
      'letter-spacing:0.5px;color:var(--text-tert);padding:6px 10px 4px;}' +
    '.hsr-item{width:100%;display:flex;flex-direction:column;align-items:flex-start;gap:2px;background:transparent;' +
      'border:none;border-radius:12px;padding:9px 10px;cursor:pointer;text-align:left;' +
      'font-family:var(--font-body);color:var(--text);transition:background .15s;}' +
    '.hsr-item:hover,.hsr-item:active{background:rgba(var(--orange-rgb),0.12);}' +
    '.hsr-item-title{font-size:14px;font-weight:600;color:var(--text);}' +
    '.hsr-item-sub{font-size:12px;color:var(--text-sec);}' +
    '.hsr-hl{background:rgba(var(--orange-rgb),0.35);color:inherit;border-radius:3px;padding:0 1px;}' +
    '.hsr-empty{padding:16px 10px;font-size:13px;color:var(--text-tert);text-align:center;font-family:var(--font-body);}';
  document.head.appendChild(style);
}

function ensureSearchPanel() {
  var panel = document.getElementById('headerSearchResults');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'headerSearchResults';
    panel.className = 'hsr-panel';
    var host = document.querySelector('.header-search');
    if (host) host.appendChild(panel);
  }
  return panel;
}

function closeSearchResults() {
  var panel = document.getElementById('headerSearchResults');
  if (panel) panel.classList.remove('open');
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}

function highlightMatch(text, query) {
  var esc = escapeHtml(text);
  if (!query) return esc;
  var idx = esc.toLowerCase().indexOf(escapeHtml(query).toLowerCase());
  if (idx === -1) return esc;
  return esc.slice(0, idx) + '<mark class="hsr-hl">' + esc.slice(idx, idx + query.length) + '</mark>' + esc.slice(idx + query.length);
}

function loadSearchSource(key, url) {
  if (searchCache[key]) return Promise.resolve(searchCache[key]);
  return fetch(url)
    .then(function(r){ return r.ok ? r.json() : []; })
    .then(function(data){ searchCache[key] = Array.isArray(data) ? data : []; return searchCache[key]; })
    .catch(function(){ searchCache[key] = []; return []; });
}

function initSearch() {
  var input = document.getElementById('headerSearchInput');
  if (!input) return;
  injectSearchStyles();
  input.placeholder = t('searchPlaceholder');

  input.addEventListener('input', function() {
    clearTimeout(searchDebounceTimer);
    var q = input.value.trim();
    if (!q) { closeSearchResults(); return; }
    searchDebounceTimer = setTimeout(function(){ runSearch(q); }, 220);
  });
  input.addEventListener('focus', function() {
    var q = input.value.trim();
    if (q) runSearch(q);
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { input.blur(); closeSearchResults(); }
  });
  document.addEventListener('click', function(e) {
    var panel = document.getElementById('headerSearchResults');
    if (!panel) return;
    if (e.target === input || panel.contains(e.target)) return;
    closeSearchResults();
  });
}

function runSearch(query) {
  var panel = ensureSearchPanel();
  panel.innerHTML = '<div class="hsr-empty">' + escapeHtml(t('searchingLabel')) + '</div>';
  panel.classList.add('open');

  Promise.all([
    loadSearchSource('announcements', '/api/announcements'),
    loadSearchSource('teachers',      '/api/teachers'),
    loadSearchSource('outcomes',      '/api/outcomes'),
    loadSearchSource('fees',          '/api/fees'),
    loadSearchSource('faqs',          '/api/faqs'),
    loadSearchSource('courses',       '/api/courses')
  ]).then(function() { renderSearchResults(query); });
}

function renderSearchResults(query) {
  var panel = ensureSearchPanel();
  var q = query.toLowerCase();
  var groups = [];

  var ann = (searchCache.announcements || []).filter(function(a) {
    return ((a.title||'') + ' ' + (a.body||'')).toLowerCase().indexOf(q) > -1;
  }).slice(0, 5);
  if (ann.length) groups.push({ label:t('searchAnnouncements'), icon:'📢', items:ann.map(function(a) {
    return { title:a.title, sub:a.date_posted || '', run:function(){
      navTo('announcements', document.getElementById('tab-announcements'));
      showAnnouncement(a.id);
    }};
  })});

  var tea = (searchCache.teachers || []).filter(function(x) {
    return ((x.name_en||'') + ' ' + (x.name_th||'') + ' ' + (x.position||'')).toLowerCase().indexOf(q) > -1;
  }).slice(0, 5);
  if (tea.length) groups.push({ label:t('searchTeachers'), icon:'👨‍🏫', items:tea.map(function(x) {
    return { title:(currentLang==='th' && x.name_th) ? x.name_th : x.name_en, sub:x.position || '', run:function(){
      suppressViewAnimation = true;
      navTo('profile', document.getElementById('tab-profile'));
      showTeachers().then(function(){
        pushHistory('profile');
        suppressViewAnimation = false;
        showTeacher(x.id);
      });
    }};
  })});

  var out = (searchCache.outcomes || []).filter(function(x) {
    return ((x.career||'') + ' ' + (x.career_th||'')).toLowerCase().indexOf(q) > -1;
  }).slice(0, 5);
  if (out.length) groups.push({ label:t('searchOutcomes'), icon:'🎯', items:out.map(function(x) {
    return { title:(currentLang==='th' && x.career_th) ? x.career_th : x.career, sub:t(x.level==='vc'?'vcPlain':'hvcPlain'), run:function(){
      suppressViewAnimation = true;
      navTo('profile', document.getElementById('tab-profile'));
      showOutcomeLevelSelect();
      pushHistory('profile');
      showOutcomes(x.level || 'vc').then(function(){
        pushHistory('outcomes');
        suppressViewAnimation = false;
        showOutcome(x.id);
      });
    }};
  })});

  var fee = (searchCache.fees || []).filter(function(x) {
    return ((x.item||'') + ' ' + (x.item_th||'')).toLowerCase().indexOf(q) > -1;
  }).slice(0, 5);
  if (fee.length) groups.push({ label:t('searchFees'), icon:'💰', items:fee.map(function(x) {
    return { title:x.item, sub:(x.amount != null ? '฿' + x.amount.toLocaleString() : ''), run:function(){
      suppressViewAnimation = true;
      navTo('profile', document.getElementById('tab-profile'));
      showFeeLevelSelect();
      pushHistory('profile');
      suppressViewAnimation = false;
      showFees(x.level || 'vc').then(function(){
        pushHistory('fees');
      });
    }};
  })});

  var faq = (searchCache.faqs || []).filter(function(x) {
    return ((x.question||'') + ' ' + (x.question_th||'') + ' ' + (x.answer||'') + ' ' + (x.answer_th||'')).toLowerCase().indexOf(q) > -1;
  }).slice(0, 5);
  if (faq.length) groups.push({ label:t('searchFaqs'), icon:'❓', items:faq.map(function(x) {
    return { title:(currentLang==='th' && x.question_th) ? x.question_th : x.question, sub:x.category || '', run:function(){
      navTo('help', document.getElementById('tab-help'));
      showFAQ(x.id);
    }};
  })});

  var crs = (searchCache.courses || []).filter(function(x) {
    return ((x.name||'') + ' ' + (x.name_th||'') + ' ' + (x.code||'')).toLowerCase().indexOf(q) > -1;
  }).slice(0, 5);
  if (crs.length) groups.push({ label:t('searchCourses'), icon:'📚', items:crs.map(function(x) {
    return { title:(x.code ? x.code + ' · ' : '') + x.name, sub:(currentLang==='th' && x.name_th) ? x.name_th : '', run:function(){
      suppressViewAnimation = true;
      navTo('courses', document.getElementById('tab-courses'));
      showCourseYearSelect(x.level || 'vc');
      showCourseSemSelect(x.year || 1);
      suppressViewAnimation = false;
      showCourseResult(x.semester || 1);
    }};
  })});

  if (!groups.length) {
    panel.innerHTML = '<div class="hsr-empty">' + escapeHtml(t('searchNoResults')) + ' "' + escapeHtml(query) + '"</div>';
    panel.classList.add('open');
    return;
  }

  var html = '';
  groups.forEach(function(g, gi) {
    html += '<div class="hsr-group"><div class="hsr-group-label">' + g.icon + ' ' + escapeHtml(g.label) + '</div>';
    g.items.forEach(function(it, ii) {
      html += '<button type="button" class="hsr-item" data-g="' + gi + '" data-i="' + ii + '">' +
                '<span class="hsr-item-title">' + highlightMatch(it.title || '', query) + '</span>' +
                (it.sub ? '<span class="hsr-item-sub">' + escapeHtml(it.sub) + '</span>' : '') +
              '</button>';
    });
    html += '</div>';
  });
  panel.innerHTML = html;
  panel.classList.add('open');

  panel.querySelectorAll('.hsr-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var gi = +btn.getAttribute('data-g'), ii = +btn.getAttribute('data-i');
      var item = groups[gi].items[ii];
      closeSearchResults();
      var input = document.getElementById('headerSearchInput');
      if (input) input.value = '';
      if (item && item.run) item.run();
    });
  });
}

function initAskPage() {
  var input = document.getElementById('askTextInput');
  if (!input) return;
  input.placeholder = t('askPlaceholder');
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') submitTypedQuestion();
  });
}

// ─── INIT ─────────────────────────────────────
var savedTheme = (function() { try { return localStorage.getItem('dbt_theme'); } catch (e) { return null; } })();
setTheme(savedTheme === 'light' ? 'light' : 'dark');

var savedLang = (function() { try { return localStorage.getItem('dbt_lang'); } catch (e) { return null; } })();
setLanguage(savedLang === 'th' ? 'th' : 'en');
showView('home');
initSearch();
initAskPage();
setTimeout(function() {
  speak(t('voiceWelcome'));
}, 800);