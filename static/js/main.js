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
  askSpeakInIndicator:  { en:'Speak in English', th:'พูดเป็นภาษาไทย' },
  kioskDefault:         { en:'DBT Kiosk', th:'คีออสก์ DBT' },
  welcomeTickerFallback:{ en:'🎓 Welcome to the Digital Business Technology Department · IRPC Technological College · Rayong', th:'🎓 ยินดีต้อนรับสู่ภาควิชาเทคโนโลยีธุรกิจดิจิทัล · วิทยาลัยเทคโนโลยี IRPC · ระยอง' },
  welcomeTickerTail:    { en:'🎓 Welcome to DBT Department · IRPC Technological College', th:'🎓 ยินดีต้อนรับสู่ภาควิชา DBT · วิทยาลัยเทคโนโลยี IRPC' },
  voiceWelcome:         { en:'Welcome to the Smart Digital Information Board Kiosk of the Digital Business Technology Department.', th:'ยินดีต้อนรับสู่ตู้คีออสก์ข้อมูลดิจิทัลอัจฉริยะของภาควิชาเทคโนโลยีธุรกิจดิจิทัล' },
  voicePanelTitle:      { en:'Ask DBT Assistant', th:'ถามผู้ช่วย DBT' },
  voiceTapToSpeak:      { en:'Tap the mic and ask a question', th:'แตะไมโครโฟนแล้วถามคำถาม' },
  voiceListening:       { en:'Listening…', th:'กำลังฟัง…' },
  voiceReviewPrompt:    { en:'Heard you — check the text below, then tap send.', th:'ได้ยินแล้ว — ตรวจสอบข้อความด้านล่างแล้วแตะส่ง' },
  voiceLowConfidence:   { en:'Not fully sure I heard that right — please check and edit before sending.', th:'ไม่แน่ใจว่าฟังถูกต้อง — กรุณาตรวจสอบและแก้ไขก่อนส่ง' },
  voiceThinking:        { en:'Thinking…', th:'กำลังคิด…' },
  voiceOffline:         { en:'Could not reach the AI assistant right now — it needs internet. Please browse the kiosk manually instead.', th:'ไม่สามารถเชื่อมต่อผู้ช่วย AI ได้ในขณะนี้ — ต้องใช้อินเทอร์เน็ต กรุณาเรียกดูข้อมูลด้วยตนเองแทน' },
  voiceLocalError:      { en:'Could not reach the kiosk\u2019s speech service. Please try again.', th:'ไม่สามารถเชื่อมต่อบริการรู้จำเสียงของตู้คีออสก์ได้ กรุณาลองใหม่' },
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

var ICONS = {
  'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /> <path d="M22 10v6" /> <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />',
  'award': '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /> <circle cx="12" cy="8" r="6" />',
  'megaphone': '<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" /> <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" /> <path d="M8 6v8" />',
  'landmark': '<path d="M10 18v-7" /> <path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z" /> <path d="M14 18v-7" /> <path d="M18 18v-7" /> <path d="M3 22h18" /> <path d="M6 18v-7" />',
  'target': '<circle cx="12" cy="12" r="10" /> <circle cx="12" cy="12" r="6" /> <circle cx="12" cy="12" r="2" />',
  'circle-dollar-sign': '<circle cx="12" cy="12" r="10" /> <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /> <path d="M12 18V6" />',
  'mic': '<path d="M12 19v3" /> <path d="M19 10v2a7 7 0 0 1-14 0v-2" /> <rect x="9" y="2" width="6" height="13" rx="3" />',
  'laptop': '<path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z" /> <path d="M20.054 15.987H3.946" />',
  'globe': '<circle cx="12" cy="12" r="10" /> <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /> <path d="M2 12h20" />',
  'bot': '<path d="M12 8V4H8" /> <rect width="16" height="12" x="4" y="8" rx="2" /> <path d="M2 14h2" /> <path d="M20 14h2" /> <path d="M15 13v2" /> <path d="M9 13v2" />',
  'building-2': '<path d="M10 12h4" /> <path d="M10 8h4" /> <path d="M14 21v-3a2 2 0 0 0-4 0v3" /> <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" /> <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />',
  'book-open': '<path d="M12 5v16" /> <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <path d="M16 3.128a4 4 0 0 1 0 7.744" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <circle cx="9" cy="7" r="4" />',
  'circle-help': '<circle cx="12" cy="12" r="10" /> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /> <path d="M12 17h.01" />',
  'sun': '<circle cx="12" cy="12" r="4" /> <path d="M12 2v2" /> <path d="M12 20v2" /> <path d="m4.93 4.93 1.41 1.41" /> <path d="m17.66 17.66 1.41 1.41" /> <path d="M2 12h2" /> <path d="M20 12h2" /> <path d="m6.34 17.66-1.41 1.41" /> <path d="m19.07 4.93-1.41 1.41" />',
  'moon': '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />',
  'smartphone': '<rect width="14" height="20" x="5" y="2" rx="2" ry="2" /> <path d="M12 18h.01" />',
  'bar-chart-3': '<path d="M3 3v16a2 2 0 0 0 2 2h16" /> <path d="M18 17V9" /> <path d="M13 17V5" /> <path d="M8 17v-3" />',
  'palette': '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /> <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /> <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /> <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /> <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />',
  'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />',
  'rocket': '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /> <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09" /> <path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z" /> <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05" />',
  'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /> <path d="M9 18h6" /> <path d="M10 22h4" />',
  'trending-up': '<path d="M16 7h6v6" /> <path d="m22 7-8.5 8.5-5-5L2 17" />',
  'search': '<path d="m21 21-4.34-4.34" /> <circle cx="11" cy="11" r="8" />',
  'bell': '<path d="M10.268 21a2 2 0 0 0 3.464 0" /> <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />',
  'scroll-text': '<path d="M15 12h-5" /> <path d="M15 8h-5" /> <path d="M19 17V5a2 2 0 0 0-2-2H4" /> <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />',
  'calendar': '<path d="M8 2v3" /> <path d="M16 2v3" /> <rect x="3" y="3" width="18" height="18" rx="2" /> <path d="M3 9h18" />',
  'clock': '<circle cx="12" cy="12" r="10" /> <path d="M12 6v6l4 2" />',
  'house': '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /> <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',
  'send': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /> <path d="m21.854 2.147-10.94 10.939" />',
  'x': '<path d="M18 6 6 18" /> <path d="m6 6 12 12" />',
};

function icon(name, size) {
  var paths = ICONS[name];
  if (!paths) return '';
  var s = size || '1em';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" style="width:' + s + ';height:' + s +
    ';vertical-align:-0.125em;flex-shrink:0;display:inline-block;">' + paths + '</svg>';
}

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

  var askLangIndicator = document.getElementById('askLangIndicator');
  if (askLangIndicator) askLangIndicator.innerHTML = icon('mic') + ' ' + t('askSpeakInIndicator');
}

function setTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') theme = 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('dbt_theme', theme); } catch (e) {}
  var btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = theme === 'dark' ? icon('sun') : icon('moon');
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
  stopSpeaking();
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
  document.getElementById('yearSelectIcon').innerHTML  = isVC ? icon('graduation-cap') : icon('award');
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
        var courseName = (currentLang === 'th' && c.name_th) ? c.name_th : c.name;
        html += '<div class="course-flat-row">' +
                  '<div class="course-flat-num">' + (i+1) + '</div>' +
                  '<div class="course-flat-code">' + c.code + '</div>' +
                  '<div class="course-flat-name">' +
                    '<div class="course-flat-en">' + courseName + '</div>' +
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
      var title = (currentLang === 'th' && a.title_th) ? a.title_th : a.title;
      return '<div class="ann-touch-item ' + tag + '" onclick="showAnnouncement(' + a.id + ')">' +
               '<div class="ann-touch-num">' + (i+1) + '</div>' +
               '<div class="ann-touch-title">' + title + '</div>' +
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
    var title = (currentLang === 'th' && a.title_th) ? a.title_th : a.title;
    var body  = (currentLang === 'th' && a.body_th)  ? a.body_th  : a.body;
    document.getElementById('annSingleWrap').innerHTML =
      '<div class="ann-single-tag-row">' +
        '<span class="ann-single-tag">' + a.tag + '</span>' +
        '<span class="ann-single-date">' + a.date_posted + '</span>' +
      '</div>' +
      '<div class="ann-single-title">' + title + '</div>' +
      '<div class="ann-single-body">'  + body  + '</div>' +
      (a.image_path ? '<img class="ann-single-img" src="' + a.image_path + '">' : '');
    if (!refresh) pushHistory('announcements');
    showView('ann-single');
    setHeader(title, a.date_posted);
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
    var displayName = (currentLang === 'th' && t2.name_th) ? t2.name_th : t2.name_en;
    document.getElementById('teacherSingleCard').innerHTML =
      '<div class="teacher-single-top">' +
        '<div class="teacher-avatar-lg">' + initials + '</div>' +
        '<div>' +
          '<div class="teacher-single-name">' + displayName + '</div>' +
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
    setHeader(displayName, t2.position);
  });
}

// ─── OUTCOMES ────────────────────────────────
function showOutcomeLevelSelect() {
  showView('outcomes');
  setHeader(t('outcomesTitle'), t('outcomesSub'));
}

function showOutcomes(level, refresh) {
  outcomeLevel = level;
  var icons = ['laptop','smartphone','globe','bar-chart-3','palette','wrench','rocket','lightbulb','building-2','trending-up'];
  var title = t(level === 'vc' ? 'afterVC' : 'afterHVC');
  document.getElementById('outcomeResultTitle').textContent = title;
  return fetch('/api/outcomes?level=' + level).then(function(r){return r.json();}).then(function(data) {
    var grid = document.getElementById('outcomeSelectGrid');
    if (!data.length) { grid.innerHTML = '<div class="sr-empty">' + t('noOutcomes') + '</div>'; }
    else {
      grid.innerHTML = data.map(function(o, i) {
        var label = (currentLang === 'th' && o.career_th) ? o.career_th : o.career;
        return '<div class="touch-num-btn" onclick="showOutcome(' + o.id + ')">' +
                 '<div class="num-circle">' + icon(icons[i%icons.length]) + '</div>' +
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
  var icons = ['laptop','smartphone','globe','bar-chart-3','palette','wrench','rocket','lightbulb','building-2','trending-up'];
  return fetch('/api/outcomes').then(function(r){return r.json();}).then(function(data) {
    var o = data.find(function(x){ return x.id === id; });
    if (!o) return;
    var idx = data.indexOf(o);
    var career = (currentLang === 'th' && o.career_th) ? o.career_th : o.career;
    var desc   = (currentLang === 'th' && o.desc_th)   ? o.desc_th   : (o.description || t('noDescription'));
    document.getElementById('outcomeSingleCard').innerHTML =
      '<div class="outcome-single-wrap">' +
        '<div class="outcome-single-top">' +
          '<div class="outcome-single-icon">' + icon(icons[idx%icons.length], '28px') + '</div>' +
          '<div>' +
            '<div class="outcome-single-name">' + career + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="outcome-single-desc">' + desc + '</div>' +
        '<div><span class="outcome-single-badge">' + t(o.level==='vc'?'vc':'hvc') + '</span></div>' +
      '</div>';
    if (!refresh) pushHistory('outcomes-result');
    showView('outcome-single');
    setHeader(career, '');
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
      var itemName = (currentLang === 'th' && f.item_th) ? f.item_th : f.item;
      return '<div class="fee-touch-row">' +
               '<div>' +
                 '<div class="fee-touch-item">'    + itemName    + '</div>' +
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
      var question = (currentLang === 'th' && f.question_th) ? f.question_th : f.question;
      var answer   = (currentLang === 'th' && f.answer_th)   ? f.answer_th   : f.answer;
      document.getElementById('faqSingleWrap').innerHTML =
        '<div class="faq-single-num">' + t('question') + ' ' + num + ' · ' + f.category + '</div>' +
        '<div class="faq-single-head">' +
          '<div class="faq-single-q">'    + question + '</div>' +
        '</div>' +
        '<div class="faq-single-a">'    + answer   + '</div>' +
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

  var stopBtn = document.getElementById('askStopBtn');
  if (stopBtn) {
    u.onstart = function() { stopBtn.classList.remove('hidden'); };
    u.onend   = function() { stopBtn.classList.add('hidden'); };
    u.onerror = function() { stopBtn.classList.add('hidden'); };
  }

  window.speechSynthesis.speak(u);
}

function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  var stopBtn = document.getElementById('askStopBtn');
  if (stopBtn) stopBtn.classList.add('hidden');
}

/* ══════════════════════════════════════════════
   ASK AI PAGE — offline speech-to-text (Vosk via /api/speech) /
   typed → /api/ask → speak
   ══════════════════════════════════════════════ */
var voiceIsListening   = false;
var voiceShouldProcess = false;
var mediaRecorder      = null;
var micStream          = null;
var audioChunks        = [];
var voiceAutoStopTimer = null;

function resetAskPage() {
  var status = document.getElementById('askStatus');
  var transcript = document.getElementById('askTranscript');
  var answer = document.getElementById('askAnswer');
  var input = document.getElementById('askTextInput');
  var langIndicator = document.getElementById('askLangIndicator');
  if (status) status.textContent = t('voiceTapToSpeak');
  if (transcript) transcript.textContent = '';
  if (answer) answer.textContent = '';
  if (input) input.value = '';
  if (langIndicator) langIndicator.innerHTML = icon('mic') + ' ' + t('askSpeakInIndicator');
  stopSpeaking();
}

function startVoiceListening() {
  // Tapping the orb again while listening stops early and sends what
  // was captured so far, instead of waiting for the auto-stop timer.
  if (voiceIsListening) {
    stopVoiceListening(true);
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
    document.getElementById('askStatus').textContent = t('voiceNoSupport');
    return;
  }

  stopSpeaking(); // don't let a previous answer keep talking over the new question

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      micStream   = stream;
      audioChunks = [];

      var mimeType = (window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported('audio/webm'))
        ? 'audio/webm' : '';
      mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType: mimeType }) : new MediaRecorder(stream);

      mediaRecorder.ondataavailable = function(e) {
        if (e.data && e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = function() {
        if (micStream) { micStream.getTracks().forEach(function(track) { track.stop(); }); micStream = null; }
        if (voiceShouldProcess && audioChunks.length) {
          var blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
          sendAudioForTranscription(blob);
        }
        voiceShouldProcess = false;
      };

      voiceIsListening = true;
      document.getElementById('askOrb').classList.add('listening');
      document.getElementById('askStatus').textContent = t('voiceListening');
      document.getElementById('askAnswer').textContent = '';
      document.getElementById('askTranscript').textContent = '';

      mediaRecorder.start();

      // Auto-stop after 6 seconds of recording (a kiosk mic has no
      // built-in silence detection like the old browser API did).
      voiceAutoStopTimer = setTimeout(function() {
        if (voiceIsListening) stopVoiceListening(true);
      }, 6000);
    })
    .catch(function(err) {
      console.error('getUserMedia error:', err);
      var msgs = {
        NotAllowedError:  { en:'Microphone permission was blocked for this page.', th:'ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน' },
        NotFoundError:    { en:'No microphone found — check it\u2019s connected.', th:'ไม่พบไมโครโฟน — ตรวจสอบการเชื่อมต่อ' },
        NotReadableError: { en:'The microphone is busy or unavailable.', th:'ไมโครโฟนไม่ว่างหรือใช้งานไม่ได้' }
      };
      var m = msgs[err.name];
      document.getElementById('askStatus').textContent = m ? m[currentLang] : (t('voiceNoSupport') + ' (' + err.message + ')');
    });
}

function stopVoiceListening(shouldProcess) {
  if (voiceAutoStopTimer) { clearTimeout(voiceAutoStopTimer); voiceAutoStopTimer = null; }
  if (!voiceIsListening) return;
  voiceIsListening = false;
  voiceShouldProcess = !!shouldProcess;

  var orb = document.getElementById('askOrb');
  if (orb) orb.classList.remove('listening');

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop(); // fires onstop above, which sends audio if needed
  } else if (micStream) {
    micStream.getTracks().forEach(function(track) { track.stop(); });
    micStream = null;
  }
}

function sendAudioForTranscription(blob) {
  document.getElementById('askStatus').textContent = t('voiceThinking');

  var formData = new FormData();
  formData.append('audio', blob, 'speech.webm');
  formData.append('lang', currentLang);

  fetch('/api/speech', { method: 'POST', body: formData })
    .then(function(r) {
      return r.json().then(function(data) { return { ok: r.ok, data: data }; });
    })
    .then(function(res) {
      var text = (res.ok && res.data && res.data.text) ? res.data.text.trim() : '';
      if (!text) {
        var fallback = {
          en: 'Could not hear you clearly — please try again.',
          th: 'ไม่ได้ยินชัดเจน — กรุณาลองใหม่'
        };
        var msg = (res.data && res.data.error) ? res.data.error : fallback[currentLang];
        document.getElementById('askStatus').textContent = msg;
        return;
      }
      document.getElementById('askTranscript').textContent = text;
      askAssistant(text);
    })
    .catch(function() {
      document.getElementById('askStatus').textContent = t('voiceLocalError');
    });
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

  // Answer in whichever language the top-right kiosk toggle is
  // currently set to — same single source of truth as recognition.
  var answerLang = currentLang;

  fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: question, lang: answerLang })
  })
    .then(function(r) {
      return r.json().then(function(data) { return { ok: r.ok, data: data }; });
    })
    .then(function(res) {
      if (res.ok) {
        var answer = (res.data && res.data.answer) ? res.data.answer : '';
        document.getElementById('askStatus').textContent = '';
        document.getElementById('askAnswer').textContent = answer;
        if (answer) speak(answer, answerLang === 'th' ? 'th-TH' : 'en-US');
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
      'letter-spacing:0.5px;color:var(--text-tert);padding:6px 10px 4px;display:flex;align-items:center;gap:5px;}' +
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
  if (ann.length) groups.push({ label:t('searchAnnouncements'), icon:'megaphone', items:ann.map(function(a) {
    return { title:a.title, sub:a.date_posted || '', run:function(){
      navTo('announcements', document.getElementById('tab-announcements'));
      showAnnouncement(a.id);
    }};
  })});

  var tea = (searchCache.teachers || []).filter(function(x) {
    return ((x.name_en||'') + ' ' + (x.name_th||'') + ' ' + (x.position||'')).toLowerCase().indexOf(q) > -1;
  }).slice(0, 5);
  if (tea.length) groups.push({ label:t('searchTeachers'), icon:'users', items:tea.map(function(x) {
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
  if (out.length) groups.push({ label:t('searchOutcomes'), icon:'target', items:out.map(function(x) {
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
  if (fee.length) groups.push({ label:t('searchFees'), icon:'circle-dollar-sign', items:fee.map(function(x) {
    return { title:(currentLang==='th' && x.item_th) ? x.item_th : x.item, sub:(x.amount != null ? '฿' + x.amount.toLocaleString() : ''), run:function(){
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
  if (faq.length) groups.push({ label:t('searchFaqs'), icon:'circle-help', items:faq.map(function(x) {
    return { title:(currentLang==='th' && x.question_th) ? x.question_th : x.question, sub:x.category || '', run:function(){
      navTo('help', document.getElementById('tab-help'));
      showFAQ(x.id);
    }};
  })});

  var crs = (searchCache.courses || []).filter(function(x) {
    return ((x.name||'') + ' ' + (x.name_th||'') + ' ' + (x.code||'')).toLowerCase().indexOf(q) > -1;
  }).slice(0, 5);
  if (crs.length) groups.push({ label:t('searchCourses'), icon:'book-open', items:crs.map(function(x) {
    return { title:(x.code ? x.code + ' · ' : '') + ((currentLang==='th' && x.name_th) ? x.name_th : x.name), sub:'', run:function(){
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
    html += '<div class="hsr-group"><div class="hsr-group-label">' + icon(g.icon, '14px') + ' ' + escapeHtml(g.label) + '</div>';
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