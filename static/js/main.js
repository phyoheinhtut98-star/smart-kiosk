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
  annSub:               { en:'Latest department announcements', th:'ประกาศล่าสุดของภาควิชา' },
  teachersTitle:        { en:'Teachers & Staff', th:'อาจารย์และบุคลากร' },
  teachersSub:          { en:'Meet the DBT team', th:'พบกับทีมงาน DBT' },
  outcomesTitle:        { en:'Career Outcomes', th:'เส้นทางอาชีพ' },
  outcomesSub:          { en:'Where DBT can take you', th:'เส้นทางอาชีพหลังจบ DBT' },
  feesTitle:            { en:'Tuition & Fees', th:'ค่าเล่าเรียนและค่าธรรมเนียม' },
  feesSub:              { en:'Estimated study costs', th:'ค่าใช้จ่ายโดยประมาณ' },
  helpTitle:            { en:'Help & FAQ', th:'ช่วยเหลือและคำถามที่พบบ่อย' },
  helpSub:              { en:'Common questions about DBT', th:'คำถามที่พบบ่อยเกี่ยวกับ DBT' },
  askTitle:             { en:'Ask DBT Assistant', th:'ถามผู้ช่วย DBT' },
  askSub:               { en:'Ask about the department, courses, teachers, fees and more.', th:'สอบถามเกี่ยวกับภาควิชา หลักสูตร อาจารย์ ค่าเล่าเรียน และอื่น ๆ' },

  year1:                { en:'Year 1', th:'ชั้นปีที่ 1' },
  year2:                { en:'Year 2', th:'ชั้นปีที่ 2' },
  year3:                { en:'Year 3', th:'ชั้นปีที่ 3' },
  semester1:            { en:'Semester 1', th:'ภาคเรียนที่ 1' },
  semester2:            { en:'Semester 2', th:'ภาคเรียนที่ 2' },

  vc:                   { en:'Vocational Certificate', th:'ประกาศนียบัตรวิชาชีพ (ปวช.)' },
  hv:                   { en:'Higher Vocational Certificate', th:'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)' },

  back:                 { en:'Back', th:'ย้อนกลับ' },
  home:                 { en:'Home', th:'หน้าหลัก' },
  viewAll:              { en:'View All', th:'ดูทั้งหมด' },
  learnMore:            { en:'Learn More', th:'ดูเพิ่มเติม' },
  search:               { en:'Search', th:'ค้นหา' },
  searchPlaceholder:    { en:'Search the kiosk…', th:'ค้นหาในคีออสก์…' },
  noResults:            { en:'No results found.', th:'ไม่พบผลลัพธ์' },

  askPlaceholder:       { en:'Type your question here…', th:'พิมพ์คำถามของคุณที่นี่…' },
  askSpeakInIndicator:  { en:'Speak in English or Thai', th:'พูดภาษาอังกฤษหรือภาษาไทย' },
  voiceWelcome:         { en:'Welcome to the Smart Digital Information Board Kiosk of the Digital Business Technology Department.', th:'ยินดีต้อนรับสู่ตู้คีออสก์ข้อมูลดิจิทัลอัจฉริยะของภาควิชาเทคโนโลยีธุรกิจดิจิทัล' },
  voicePanelTitle:      { en:'Ask DBT Assistant', th:'ถามผู้ช่วย DBT' },
  voiceTapToSpeak:      { en:'Tap the mic and ask a question', th:'แตะไมโครโฟนแล้วถามคำถาม' },
  voiceListening:       { en:'Listening…', th:'กำลังฟัง…' },
  voiceReviewPrompt:    { en:'Heard you — check the text below, then tap send.', th:'ได้ยินแล้ว — ตรวจสอบข้อความด้านล่างแล้วแตะส่ง' },
  voiceLowConfidence:   { en:'Not fully sure I heard that right — please check and edit before sending.', th:'ไม่แน่ใจว่าฟังถูกต้อง — กรุณาตรวจสอบและแก้ไขก่อนส่ง' },
  voiceThinking:        { en:'Thinking…', th:'กำลังคิด…' },
  voiceOffline:         { en:'Could not reach the AI assistant right now — it needs internet. Please browse the kiosk manually instead.', th:'ไม่สามารถเชื่อมต่อผู้ช่วย AI ได้ในขณะนี้ — ต้องใช้อินเทอร์เน็ต กรุณาเรียกดูข้อมูลด้วยตนเองแทน' },
  voiceLocalError:      { en:'Could not reach the kiosk’s speech service. Please try again.', th:'ไม่สามารถเชื่อมต่อบริการรู้จำเสียงของตู้คีออสก์ได้ กรุณาลองใหม่' },
  voiceNoSupport:       { en:'Voice recognition isn’t supported on this browser.', th:'เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียง' },
  voiceMicLabel:        { en:'Tap to Speak', th:'แตะเพื่อพูด' },
  voiceStopLabel:       { en:'Listening…', th:'กำลังฟัง…' },

  send:                 { en:'Send', th:'ส่ง' },
  stop:                 { en:'Stop', th:'หยุด' },
  clear:                { en:'Clear', th:'ล้าง' },
  answer:               { en:'Answer', th:'คำตอบ' },
  listening:            { en:'Listening…', th:'กำลังฟัง…' },
  thinking:             { en:'Thinking…', th:'กำลังคิด…' },

  announcements:        { en:'Announcements', th:'ประกาศ' },
  teachers:             { en:'Teachers', th:'อาจารย์' },
  outcomes:             { en:'Career Outcomes', th:'เส้นทางอาชีพ' },
  fees:                 { en:'Fees', th:'ค่าใช้จ่าย' },
  faqs:                 { en:'FAQ', th:'คำถามที่พบบ่อย' },
  courses:              { en:'Courses', th:'รายวิชา' },

  emptyAnnouncements:   { en:'No announcements available.', th:'ยังไม่มีประกาศ' },
  emptyTeachers:        { en:'No teacher information available.', th:'ยังไม่มีข้อมูลอาจารย์' },
  emptyOutcomes:        { en:'No career information available.', th:'ยังไม่มีข้อมูลอาชีพ' },
  emptyFees:            { en:'No fee information available.', th:'ยังไม่มีข้อมูลค่าใช้จ่าย' },
  emptyFaqs:            { en:'No FAQ information available.', th:'ยังไม่มีคำถามที่พบบ่อย' },
  emptyCourses:         { en:'No course information available.', th:'ยังไม่มีข้อมูลรายวิชา' },

  noAnnouncements:      { en:'No announcements found.', th:'ไม่พบประกาศ' },
  noTeachers:           { en:'No teachers found.', th:'ไม่พบข้อมูลอาจารย์' },
  noOutcomes:           { en:'No outcomes found.', th:'ไม่พบข้อมูลอาชีพ' },
  noFees:               { en:'No fees found.', th:'ไม่พบข้อมูลค่าใช้จ่าย' },
  noFaqs:               { en:'No FAQs found.', th:'ไม่พบคำถามที่พบบ่อย' },
  noCourses:            { en:'No courses found.', th:'ไม่พบรายวิชา' }
};

function t(key) {
  if (!T[key]) return key;
  return T[key][currentLang] || T[key].en || key;
}

/* ══════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════ */
function icon(name, cls) {
  cls = cls || '';
  var paths = {
    home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
    book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/><path d="M8 7h8"/><path d="M8 11h8"/>',
    megaphone:'<path d="M3 11v2h3l10 5V6L6 11z"/><path d="M6 13v6"/><path d="M19 9a3 3 0 0 1 0 6"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2"/><path d="M15 15a5 5 0 0 1 6 5"/>',
    briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2"/><path d="M3 12h18"/><path d="M10 12v2h4v-2"/>',
    wallet:'<path d="M4 6h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M4 6a2 2 0 0 0-2 2v1h17"/><path d="M16 14h3"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 0 1 5 1.5c0 2-2.5 2-2.5 4"/><path d="M12 17.5h.01"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M8 21h8"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    arrow:'<path d="m9 18 6-6-6-6"/>',
    back:'<path d="m15 18-6-6 6-6"/>',
    chevronDown:'<path d="m6 9 6 6 6-6"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    send:'<path d="m3 11 18-8-8 18-2-8z"/><path d="m3 11 8 2"/>',
    moon:'<path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    graduation:'<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/><path d="M22 9v6"/>',
    mapPin:'<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.2"/>',
    external:'<path d="M14 5h5v5"/><path d="M19 5 10 14"/><path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v6"/><path d="M12 7h.01"/>'
  };

  var body = paths[name] || paths.info;
  return '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
}

/* ══════════════════════════════════════════════
   THEME
   ══════════════════════════════════════════════ */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('dbt_theme', theme);
  } catch (e) {}

  var btn = document.getElementById('themeToggle');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? icon('sun') : icon('moon');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Light mode' : 'Dark mode');
  }
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

/* ══════════════════════════════════════════════
   LANGUAGE TOGGLE
   ══════════════════════════════════════════════ */
function setLanguage(lang) {
  currentLang = lang === 'th' ? 'th' : 'en';

  try {
    localStorage.setItem('dbt_lang', currentLang);
  } catch (e) {}

  document.documentElement.setAttribute('lang', currentLang);

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (key) el.placeholder = t(key);
  });

  updateLanguageToggle();
}

function toggleLanguage() {
  setLanguage(currentLang === 'en' ? 'th' : 'en');
  refreshCurrentView();
}

function updateLanguageToggle() {
  var btn = document.getElementById('langToggle');
  if (!btn) return;

  btn.textContent = currentLang === 'en' ? 'TH' : 'EN';
  btn.setAttribute('aria-label', currentLang === 'en' ? 'Switch to Thai' : 'Switch to English');
}

/* ══════════════════════════════════════════════
   API HELPERS
   ══════════════════════════════════════════════ */
function apiGet(url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    cache: 'no-store'
  }).then(function(response) {
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    return response.json();
  });
}

/* ══════════════════════════════════════════════
   VIEW MANAGEMENT
   ══════════════════════════════════════════════ */
function showView(view, push) {
  if (push !== false && currentView !== view) {
    viewHistory.push(currentView);
  }

  currentView = view;

  document.querySelectorAll('.view').forEach(function(el) {
    el.classList.remove('active');
  });

  var target = document.getElementById('view-' + view);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('[data-nav]').forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-nav') === view);
  });

  window.scrollTo(0, 0);

  refreshCurrentView();
}

function goBack() {
  if (currentView === 'home') return;

  var previous = viewHistory.length ? viewHistory.pop() : 'home';
  showView(previous, false);
}

function pushHistory(view) {
  if (currentView !== view) {
    viewHistory.push(currentView);
  }
}

function refreshCurrentView() {
  switch (currentView) {
    case 'home':
      initHome();
      break;
    case 'courses':
      initCourses();
      break;
    case 'teachers':
      initTeachers();
      break;
    case 'outcomes':
      initOutcomes();
      break;
    case 'fees':
      initFees();
      break;
    case 'announcements':
      initAnnouncements();
      break;
    case 'help':
      initHelp();
      break;
    case 'ask':
      resetAskPage();
      break;
    default:
      break;
  }
}

/* ══════════════════════════════════════════════
   HEADER
   ══════════════════════════════════════════════ */
function setHeader(title, subtitle) {
  var titleEl = document.getElementById('headerTitle');
  var subEl = document.getElementById('headerSubtitle');

  if (titleEl) titleEl.textContent = title || '';
  if (subEl) subEl.textContent = subtitle || '';
}

function initHeader() {
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', toggleLanguage);
  }

  var backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', goBack);
  }
}

/* ══════════════════════════════════════════════
   HOME
   ══════════════════════════════════════════════ */
function initHome() {
  setHeader(t('homeTitle'), t('homeSub'));

  var cards = [
    ['courses', 'book', t('coursesTitle'), t('coursesSub')],
    ['announcements', 'megaphone', t('annTitle'), t('annSub')],
    ['teachers', 'users', t('teachersTitle'), t('teachersSub')],
    ['outcomes', 'briefcase', t('outcomesTitle'), t('outcomesSub')],
    ['fees', 'wallet', t('feesTitle'), t('feesSub')],
    ['help', 'help', t('helpTitle'), t('helpSub')],
    ['ask', 'mic', t('askTitle'), t('askSub')]
  ];

  var container = document.getElementById('homeCards');
  if (!container) return;

  container.innerHTML = '';

  cards.forEach(function(item) {
    var card = document.createElement('button');
    card.className = 'home-card';
    card.type = 'button';
    card.innerHTML =
      '<span class="home-card-icon">' + icon(item[1]) + '</span>' +
      '<span class="home-card-body">' +
        '<span class="home-card-title">' + item[2] + '</span>' +
        '<span class="home-card-sub">' + item[3] + '</span>' +
      '</span>' +
      '<span class="home-card-arrow">' + icon('arrow') + '</span>';

    card.addEventListener('click', function() {
      showView(item[0]);
    });

    container.appendChild(card);
  });
}

/* ══════════════════════════════════════════════
   COURSES
   ══════════════════════════════════════════════ */
function initCourses() {
  setHeader(t('coursesTitle'), t('coursesSub'));

  var levelSelect = document.getElementById('courseLevel');
  var yearSelect = document.getElementById('courseYear');
  var semesterSelect = document.getElementById('courseSemester');

  if (levelSelect) {
    levelSelect.value = courseState.level;
    levelSelect.onchange = function() {
      courseState.level = this.value;
      renderCourses();
    };
  }

  if (yearSelect) {
    yearSelect.value = courseState.year;
    yearSelect.onchange = function() {
      courseState.year = Number(this.value) || 1;
      renderCourses();
    };
  }

  if (semesterSelect) {
    semesterSelect.value = courseState.semester;
    semesterSelect.onchange = function() {
      courseState.semester = Number(this.value) || 1;
      renderCourses();
    };
  }

  renderCourses();
}

function renderCourses() {
  var wrap = document.getElementById('courseResults');
  if (!wrap) return;

  apiGet('/api/courses?level=' + encodeURIComponent(courseState.level) +
         '&year=' + encodeURIComponent(courseState.year) +
         '&semester=' + encodeURIComponent(courseState.semester))
    .then(function(data) {
      var items = data.courses || data.data || [];
      if (!items.length) {
        wrap.innerHTML = '<div class="empty-state">' + t('emptyCourses') + '</div>';
        return;
      }

      wrap.innerHTML = items.map(function(c) {
        var name = c.name || c.course_name || '';
        var nameTh = c.name_th || c.course_name_th || '';
        var code = c.code || c.course_code || '';
        var credits = c.credits || c.credit || '';

        return (
          '<div class="course-card">' +
            '<div class="course-code">' + escapeHtml(code) + '</div>' +
            '<div class="course-name">' + escapeHtml(name) + '</div>' +
            (nameTh ? '<div class="course-name-th">' + escapeHtml(nameTh) + '</div>' : '') +
            (credits ? '<div class="course-meta">' + escapeHtml(String(credits)) + ' credits</div>' : '') +
          '</div>'
        );
      }).join('');
    })
    .catch(function(err) {
      console.error('Courses:', err);
      wrap.innerHTML = '<div class="empty-state">' + t('emptyCourses') + '</div>';
    });
}

/* ══════════════════════════════════════════════
   ANNOUNCEMENTS
   ══════════════════════════════════════════════ */
function initAnnouncements() {
  setHeader(t('annTitle'), t('annSub'));

  var wrap = document.getElementById('announcementsList');
  if (!wrap) return;

  apiGet('/api/announcements')
    .then(function(data) {
      var items = data.announcements || data.data || [];

      if (!items.length) {
        wrap.innerHTML = '<div class="empty-state">' + t('emptyAnnouncements') + '</div>';
        return;
      }

      wrap.innerHTML = items.map(function(a, index) {
        var title = a.title || a.name || '';
        var titleTh = a.title_th || '';
        var body = a.body || a.content || a.description || '';
        var date = a.date || a.created_at || '';

        return (
          '<button class="announcement-card" type="button" data-ann-index="' + index + '">' +
            '<div class="announcement-date">' + escapeHtml(formatDate(date)) + '</div>' +
            '<div class="announcement-title">' + escapeHtml(title) + '</div>' +
            (titleTh ? '<div class="announcement-title-th">' + escapeHtml(titleTh) + '</div>' : '') +
            '<div class="announcement-body">' + escapeHtml(truncate(body, 180)) + '</div>' +
            '<div class="announcement-arrow">' + icon('arrow') + '</div>' +
          '</button>'
        );
      }).join('');

      wrap.querySelectorAll('[data-ann-index]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = Number(btn.getAttribute('data-ann-index'));
          var item = items[idx];
          currentAnnId = item.id || item.announcement_id || null;
          showAnnouncementDetail(item);
        });
      });
    })
    .catch(function(err) {
      console.error('Announcements:', err);
      wrap.innerHTML = '<div class="empty-state">' + t('emptyAnnouncements') + '</div>';
    });
}

function showAnnouncementDetail(a) {
  var title = a.title || a.name || '';
  var titleTh = a.title_th || '';
  var body = a.body || a.content || a.description || '';
  var date = a.date || a.created_at || '';

  var wrap = document.getElementById('announcementDetail');
  if (!wrap) return;

  wrap.innerHTML =
    '<div class="detail-card">' +
      '<div class="detail-eyebrow">' + escapeHtml(formatDate(date)) + '</div>' +
      '<h2>' + escapeHtml(title) + '</h2>' +
      (titleTh ? '<div class="detail-th">' + escapeHtml(titleTh) + '</div>' : '') +
      '<div class="detail-content">' + nl2br(escapeHtml(body)) + '</div>' +
    '</div>';

  pushHistory('announcements');
  showView('announcement-detail');
  setHeader(t('annTitle'), t('annSub'));
}

/* ══════════════════════════════════════════════
   TEACHERS
   ══════════════════════════════════════════════ */
function initTeachers() {
  setHeader(t('teachersTitle'), t('teachersSub'));

  var wrap = document.getElementById('teachersList');
  if (!wrap) return;

  apiGet('/api/teachers')
    .then(function(data) {
      var items = data.teachers || data.data || [];

      if (!items.length) {
        wrap.innerHTML = '<div class="empty-state">' + t('emptyTeachers') + '</div>';
        return;
      }

      wrap.innerHTML = items.map(function(teacher, index) {
        var name = teacher.name || teacher.full_name || '';
        var nameTh = teacher.name_th || teacher.full_name_th || '';
        var role = teacher.position || teacher.role || '';
        var photo = teacher.photo || teacher.image || '';

        return (
          '<button class="teacher-card" type="button" data-teacher-index="' + index + '">' +
            '<div class="teacher-photo">' +
              (photo
                ? '<img src="' + escapeAttr(photo) + '" alt="' + escapeAttr(name) + '">' 
                : '<span class="teacher-placeholder">' + escapeHtml(getInitials(name)) + '</span>') +
            '</div>' +
            '<div class="teacher-body">' +
              '<div class="teacher-name">' + escapeHtml(name) + '</div>' +
              (nameTh ? '<div class="teacher-name-th">' + escapeHtml(nameTh) + '</div>' : '') +
              '<div class="teacher-role">' + escapeHtml(role) + '</div>' +
            '</div>' +
            '<div class="teacher-arrow">' + icon('arrow') + '</div>' +
          '</button>'
        );
      }).join('');

      wrap.querySelectorAll('[data-teacher-index]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = Number(btn.getAttribute('data-teacher-index'));
          var item = items[idx];
          currentTeacherId = item.id || item.teacher_id || null;
          showTeacherDetail(item);
        });
      });
    })
    .catch(function(err) {
      console.error('Teachers:', err);
      wrap.innerHTML = '<div class="empty-state">' + t('emptyTeachers') + '</div>';
    });
}

function showTeacherDetail(teacher) {
  var name = teacher.name || teacher.full_name || '';
  var nameTh = teacher.name_th || teacher.full_name_th || '';
  var role = teacher.position || teacher.role || '';
  var bio = teacher.bio || teacher.description || '';
  var email = teacher.email || '';
  var phone = teacher.phone || '';

  var wrap = document.getElementById('teacherDetail');
  if (!wrap) return;

  wrap.innerHTML =
    '<div class="detail-card">' +
      '<div class="detail-avatar">' + escapeHtml(getInitials(name)) + '</div>' +
      '<h2>' + escapeHtml(name) + '</h2>' +
      (nameTh ? '<div class="detail-th">' + escapeHtml(nameTh) + '</div>' : '') +
      (role ? '<div class="detail-role">' + escapeHtml(role) + '</div>' : '') +
      (bio ? '<div class="detail-content">' + nl2br(escapeHtml(bio)) + '</div>' : '') +
      (email ? '<div class="detail-meta">' + escapeHtml(email) + '</div>' : '') +
      (phone ? '<div class="detail-meta">' + escapeHtml(phone) + '</div>' : '') +
    '</div>';

  pushHistory('teachers');
  showView('teacher-detail');
  setHeader(t('teachersTitle'), t('teachersSub'));
}

/* ══════════════════════════════════════════════
   OUTCOMES
   ══════════════════════════════════════════════ */
function initOutcomes() {
  setHeader(t('outcomesTitle'), t('outcomesSub'));

  var levelSelect = document.getElementById('outcomeLevel');
  if (levelSelect) {
    levelSelect.value = outcomeLevel;
    levelSelect.onchange = function() {
      outcomeLevel = this.value;
      renderOutcomes();
    };
  }

  renderOutcomes();
}

function renderOutcomes() {
  var wrap = document.getElementById('outcomesList');
  if (!wrap) return;

  apiGet('/api/outcomes?level=' + encodeURIComponent(outcomeLevel))
    .then(function(data) {
      var items = data.outcomes || data.data || [];

      if (!items.length) {
        wrap.innerHTML = '<div class="empty-state">' + t('emptyOutcomes') + '</div>';
        return;
      }

      wrap.innerHTML = items.map(function(o, index) {
        var title = o.title || o.name || '';
        var titleTh = o.title_th || o.name_th || '';
        var description = o.description || o.body || '';

        return (
          '<button class="outcome-card" type="button" data-outcome-index="' + index + '">' +
            '<div class="outcome-icon">' + icon('briefcase') + '</div>' +
            '<div class="outcome-body">' +
              '<div class="outcome-title">' + escapeHtml(title) + '</div>' +
              (titleTh ? '<div class="outcome-title-th">' + escapeHtml(titleTh) + '</div>' : '') +
              '<div class="outcome-description">' + escapeHtml(truncate(description, 150)) + '</div>' +
            '</div>' +
            '<div class="outcome-arrow">' + icon('arrow') + '</div>' +
          '</button>'
        );
      }).join('');

      wrap.querySelectorAll('[data-outcome-index]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = Number(btn.getAttribute('data-outcome-index'));
          var item = items[idx];
          currentOutcomeId = item.id || item.outcome_id || null;
          showOutcomeDetail(item);
        });
      });
    })
    .catch(function(err) {
      console.error('Outcomes:', err);
      wrap.innerHTML = '<div class="empty-state">' + t('emptyOutcomes') + '</div>';
    });
}

function showOutcomeDetail(o) {
  var title = o.title || o.name || '';
  var titleTh = o.title_th || o.name_th || '';
  var description = o.description || o.body || '';
  var salary = o.salary || '';
  var skills = o.skills || '';

  var wrap = document.getElementById('outcomeDetail');
  if (!wrap) return;

  wrap.innerHTML =
    '<div class="detail-card">' +
      '<div class="outcome-large-icon">' + icon('briefcase') + '</div>' +
      '<h2>' + escapeHtml(title) + '</h2>' +
      (titleTh ? '<div class="detail-th">' + escapeHtml(titleTh) + '</div>' : '') +
      (description ? '<div class="detail-content">' + nl2br(escapeHtml(description)) + '</div>' : '') +
      (salary ? '<div class="detail-meta">' + escapeHtml(salary) + '</div>' : '') +
      (skills ? '<div class="detail-meta">' + escapeHtml(skills) + '</div>' : '') +
    '</div>';

  pushHistory('outcomes');
  showView('outcome-detail');
  setHeader(t('outcomesTitle'), t('outcomesSub'));
}

/* ══════════════════════════════════════════════
   FEES
   ══════════════════════════════════════════════ */
function initFees() {
  setHeader(t('feesTitle'), t('feesSub'));

  var levelSelect = document.getElementById('feeLevel');
  if (levelSelect) {
    levelSelect.value = feeLevel;
    levelSelect.onchange = function() {
      feeLevel = this.value;
      renderFees();
    };
  }

  renderFees();
}

function renderFees() {
  var wrap = document.getElementById('feesList');
  if (!wrap) return;

  apiGet('/api/fees?level=' + encodeURIComponent(feeLevel))
    .then(function(data) {
      var items = data.fees || data.data || [];

      if (!items.length) {
        wrap.innerHTML = '<div class="empty-state">' + t('emptyFees') + '</div>';
        return;
      }

      wrap.innerHTML = items.map(function(f) {
        var label = f.name || f.label || f.item || '';
        var labelTh = f.name_th || f.label_th || '';
        var amount = f.amount || f.price || f.cost || '';

        return (
          '<div class="fee-row">' +
            '<div class="fee-label">' +
              '<div>' + escapeHtml(label) + '</div>' +
              (labelTh ? '<small>' + escapeHtml(labelTh) + '</small>' : '') +
            '</div>' +
            '<div class="fee-amount">' + escapeHtml(formatCurrency(amount)) + '</div>' +
          '</div>'
        );
      }).join('');
    })
    .catch(function(err) {
      console.error('Fees:', err);
      wrap.innerHTML = '<div class="empty-state">' + t('emptyFees') + '</div>';
    });
}

/* ══════════════════════════════════════════════
   HELP / FAQ
   ══════════════════════════════════════════════ */
function initHelp() {
  setHeader(t('helpTitle'), t('helpSub'));

  var wrap = document.getElementById('faqList');
  if (!wrap) return;

  apiGet('/api/faqs')
    .then(function(data) {
      var items = data.faqs || data.data || [];

      if (!items.length) {
        wrap.innerHTML = '<div class="empty-state">' + t('emptyFaqs') + '</div>';
        return;
      }

      wrap.innerHTML = items.map(function(faq, index) {
        var question = faq.question || faq.title || '';
        var answer = faq.answer || faq.body || '';

        return (
          '<button class="faq-card" type="button" data-faq-index="' + index + '">' +
            '<div class="faq-question">' + escapeHtml(question) + '</div>' +
            '<div class="faq-arrow">' + icon('arrow') + '</div>' +
          '</button>'
        );
      }).join('');

      wrap.querySelectorAll('[data-faq-index]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = Number(btn.getAttribute('data-faq-index'));
          var item = items[idx];
          currentFaqId = item.id || item.faq_id || null;
          showFaqDetail(item);
        });
      });
    })
    .catch(function(err) {
      console.error('FAQs:', err);
      wrap.innerHTML = '<div class="empty-state">' + t('emptyFaqs') + '</div>';
    });
}

function showFaqDetail(f) {
  var question = f.question || f.title || '';
  var answer = f.answer || f.body || '';

  var wrap = document.getElementById('faqDetail');
  if (!wrap) return;

  wrap.innerHTML =
    '<div class="detail-card">' +
      '<div class="faq-single-q">' + escapeHtml(question) + '</div>' +
      '<div class="faq-single-a">' + nl2br(escapeHtml(answer)) + '</div>' +
    '</div>';

  if (!refresh) pushHistory('help');
  showView('faq-single');
  setHeader(t('helpTitle'), t('helpSub'));
}

/* ══════════════════════════════════════════════
   VOICE / TTS
   ══════════════════════════════════════════════ */

var speechVoices = [];
var speechVoicesReady = false;

function loadSpeechVoices() {
  if (!window.speechSynthesis) return;

  try {
    speechVoices = window.speechSynthesis.getVoices() || [];
    speechVoicesReady = speechVoices.length > 0;
  } catch (e) {
    speechVoices = [];
    speechVoicesReady = false;
  }
}

if (window.speechSynthesis) {
  loadSpeechVoices();

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function() {
      loadSpeechVoices();
    };
  }
}

function pickSpeechVoice(lang) {
  if (!window.speechSynthesis) return null;

  if (!speechVoices.length) {
    loadSpeechVoices();
  }

  if (!speechVoices.length) {
    return null;
  }

  var wanted = (lang || 'en-US').toLowerCase();
  var base = wanted.split('-')[0];

  /* Prefer exact locale. */
  var exact = speechVoices.find(function(v) {
    return (v.lang || '').toLowerCase() === wanted;
  });

  if (exact) return exact;

  /* Otherwise use the same language. */
  var sameLang = speechVoices.find(function(v) {
    return (v.lang || '').toLowerCase().split('-')[0] === base;
  });

  if (sameLang) return sameLang;

  return null;
}

function cleanSpeechText(text) {
  return String(text || '')
    .replace(/[*_`#]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function speak(text, lang) {
  if (!window.speechSynthesis || !text) {
    return;
  }

  var clean = cleanSpeechText(text);

  if (!clean) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
  } catch (e) {}

  var targetLang = lang || (currentLang === 'th' ? 'th-TH' : 'en-US');
  var voice = pickSpeechVoice(targetLang);

  var utterance = new SpeechSynthesisUtterance(clean);

  utterance.lang = targetLang;
  utterance.rate = 1.02;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  if (voice) {
    utterance.voice = voice;
  }

  var stopBtn = document.getElementById('askStopBtn');

  utterance.onstart = function() {
    if (stopBtn) {
      stopBtn.classList.remove('hidden');
    }
  };

  utterance.onend = function() {
    if (stopBtn) {
      stopBtn.classList.add('hidden');
    }
  };

  utterance.onerror = function(event) {
    console.warn('Speech synthesis error:', event);

    if (stopBtn) {
      stopBtn.classList.add('hidden');
    }
  };

  /*
   * Chromium on Raspberry Pi can occasionally have an empty voice list
   * during the first few moments after boot.
   */
  if (!speechVoicesReady) {
    setTimeout(function() {
      loadSpeechVoices();

      if (window.speechSynthesis.speaking) {
        return;
      }

      var retryVoice = pickSpeechVoice(targetLang);

      if (retryVoice) {
        utterance.voice = retryVoice;
      }

      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('TTS retry failed:', e);
      }
    }, 120);
  } else {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('TTS failed:', e);
    }
  }
}

function stopSpeaking() {
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  var stopBtn = document.getElementById('askStopBtn');

  if (stopBtn) {
    stopBtn.classList.add('hidden');
  }
}

/* ══════════════════════════════════════════════
   ASK AI PAGE — IMPROVED VOICE FLOW
   mic
   ↓
   automatic silence detection
   ↓
   Vosk /api/speech
   ↓
   Gemini /api/ask
   ↓
   browser TTS
   ══════════════════════════════════════════════ */

var voiceIsListening   = false;
var voiceShouldProcess = false;

var mediaRecorder = null;
var micStream = null;
var audioChunks = [];

var voiceAutoStopTimer = null;
var silenceTimer = null;

var audioContext = null;
var analyser = null;
var micSource = null;

var silenceStartedAt = 0;
var voiceSpeechStarted = false;

/*
 * Timing configuration.
 *
 * Maximum speaking time:
 *      7 seconds
 *
 * Minimum recording:
 *      0.9 seconds
 *
 * Silence needed before automatic stop:
 *      0.85 seconds
 */
var VOICE_MAX_MS = 7000;
var VOICE_MIN_MS = 900;
var SILENCE_MS = 850;

/*
 * Microphone sensitivity.
 *
 * Smaller value = more sensitive.
 * Larger value = less sensitive.
 */
var SILENCE_THRESHOLD = 0.018;

function cleanupVoiceMonitor() {
  if (silenceTimer) {
    clearInterval(silenceTimer);
    silenceTimer = null;
  }

  if (audioContext) {
    try {
      audioContext.close();
    } catch (e) {}
    audioContext = null;
  }

  analyser = null;
  micSource = null;
  silenceStartedAt = 0;
  voiceSpeechStarted = false;
}

function resetAskPage() {
  var status = document.getElementById('askStatus');
  var transcript = document.getElementById('askTranscript');
  var answer = document.getElementById('askAnswer');
  var input = document.getElementById('askTextInput');
  var langIndicator = document.getElementById('askLangIndicator');

  if (status) {
    status.textContent = t('voiceTapToSpeak');
  }

  if (transcript) {
    transcript.textContent = '';
  }

  if (answer) {
    answer.textContent = '';
  }

  if (input) {
    input.value = '';
  }

  if (langIndicator) {
    langIndicator.innerHTML = icon('mic') + ' ' + t('askSpeakInIndicator');
  }

  stopSpeaking();
  cleanupVoiceMonitor();
}

function beginSilenceDetection(stream) {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return;
  }

  try {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;

    audioContext = new AudioCtx();

    micSource = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();

    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.15;

    micSource.connect(analyser);

    var samples = new Uint8Array(analyser.fftSize);
    var startedAt = Date.now();

    silenceTimer = setInterval(function() {
      if (!voiceIsListening || !analyser) {
        return;
      }

      analyser.getByteTimeDomainData(samples);

      var sum = 0;

      for (var i = 0; i < samples.length; i++) {
        var x = (samples[i] - 128) / 128;
        sum += x * x;
      }

      var rms = Math.sqrt(sum / samples.length);
      var elapsed = Date.now() - startedAt;

      /*
       * Voice detected.
       */
      if (rms > SILENCE_THRESHOLD) {
        voiceSpeechStarted = true;
        silenceStartedAt = 0;
      }

      /*
       * Voice has started and then stopped.
       */
      else if (voiceSpeechStarted && elapsed > VOICE_MIN_MS) {

        if (!silenceStartedAt) {
          silenceStartedAt = Date.now();
        }

        if (Date.now() - silenceStartedAt >= SILENCE_MS) {
          stopVoiceListening(true);
        }
      }

    }, 120);

  } catch (e) {
    console.warn('Silence detection unavailable:', e);
  }
}

function startVoiceListening() {

  if (voiceIsListening) {
    stopVoiceListening(true);
    return;
  }

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia ||
    !window.MediaRecorder
  ) {
    var unsupported = document.getElementById('askStatus');

    if (unsupported) {
      unsupported.textContent = t('voiceNoSupport');
    }

    return;
  }

  /*
   * Stop any previous answer.
   */
  stopSpeaking();

  navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  })

  .then(function(stream) {

    micStream = stream;
    audioChunks = [];

    voiceSpeechStarted = false;
    silenceStartedAt = 0;

    var mimeType = '';

    if (window.MediaRecorder.isTypeSupported) {

      /*
       * Opus WebM gives good quality while keeping the upload small.
       */
      if (
        window.MediaRecorder.isTypeSupported(
          'audio/webm;codecs=opus'
        )
      ) {
        mimeType = 'audio/webm;codecs=opus';
      }

      else if (
        window.MediaRecorder.isTypeSupported(
          'audio/webm'
        )
      ) {
        mimeType = 'audio/webm';
      }
    }

    try {

      mediaRecorder = mimeType

        ? new MediaRecorder(stream, {
            mimeType: mimeType,
            audioBitsPerSecond: 64000
          })

        : new MediaRecorder(stream);

    } catch (e) {

      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = function(event) {

      if (
        event.data &&
        event.data.size > 0
      ) {
        audioChunks.push(event.data);
      }

    };

    mediaRecorder.onstop = function() {

      cleanupVoiceMonitor();

      if (micStream) {

        micStream
          .getTracks()
          .forEach(function(track) {
            track.stop();
          });

        micStream = null;
      }

      if (
        voiceShouldProcess &&
        audioChunks.length
      ) {

        var blob = new Blob(
          audioChunks,
          {
            type:
              mediaRecorder.mimeType ||
              'audio/webm'
          }
        );

        sendAudioForTranscription(blob);
      }

      voiceShouldProcess = false;
    };

    voiceIsListening = true;

    var orb = document.getElementById('askOrb');

    if (orb) {
      orb.classList.add('listening');
    }

    var status = document.getElementById('askStatus');

    if (status) {
      status.textContent = t('voiceListening');
    }

    var answer = document.getElementById('askAnswer');

    if (answer) {
      answer.textContent = '';
    }

    var transcript = document.getElementById('askTranscript');

    if (transcript) {
      transcript.textContent = '';
    }

    /*
     * Timeslice = 250 ms.
     *
     * This allows the browser to produce data regularly rather than
     * waiting for the entire recording to finish.
     */
    mediaRecorder.start(250);

    /*
     * Start microphone silence monitoring.
     */
    beginSilenceDetection(stream);

    /*
     * Hard maximum recording time.
     */
    voiceAutoStopTimer = setTimeout(function() {

      if (voiceIsListening) {
        stopVoiceListening(true);
      }

    }, VOICE_MAX_MS);

  })

  .catch(function(err) {

    console.error(
      'getUserMedia error:',
      err
    );

    var msgs = {
      NotAllowedError: {
        en:'Microphone permission was blocked for this page.',
        th:'ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน'
      },

      NotFoundError: {
        en:'No microphone found — check it’s connected.',
        th:'ไม่พบไมโครโฟน — ตรวจสอบการเชื่อมต่อ'
      },

      NotReadableError: {
        en:'The microphone is busy or unavailable.',
        th:'ไมโครโฟนไม่ว่างหรือใช้งานไม่ได้'
      }
    };

    var m = msgs[err.name];

    var status = document.getElementById('askStatus');

    if (status) {
      status.textContent =
        m
          ? m[currentLang]
          : (
              t('voiceNoSupport') +
              ' (' +
              err.message +
              ')'
            );
    }

  });
}

function stopVoiceListening(shouldProcess) {

  if (voiceAutoStopTimer) {

    clearTimeout(voiceAutoStopTimer);

    voiceAutoStopTimer = null;
  }

  if (!voiceIsListening) {
    return;
  }

  voiceIsListening = false;

  voiceShouldProcess = !!shouldProcess;

  var orb = document.getElementById('askOrb');

  if (orb) {
    orb.classList.remove('listening');
  }

  if (
    mediaRecorder &&
    mediaRecorder.state !== 'inactive'
  ) {

    mediaRecorder.stop();

  } else {

    cleanupVoiceMonitor();

    if (micStream) {

      micStream
        .getTracks()
        .forEach(function(track) {
          track.stop();
        });

      micStream = null;
    }
  }
}

function sendAudioForTranscription(blob) {

  var status = document.getElementById('askStatus');

  if (status) {
    status.textContent = t('voiceThinking');
  }

  var formData = new FormData();

  formData.append(
    'audio',
    blob,
    'speech.webm'
  );

  formData.append(
    'lang',
    currentLang
  );

  var startedAt = performance.now();

  fetch('/api/speech', {
    method: 'POST',
    body: formData
  })

  .then(function(response) {

    return response.json().then(function(data) {
      return {
        ok: response.ok,
        data: data
      };
    });

  })

  .then(function(res) {

    var text =
      (
        res.ok &&
        res.data &&
        res.data.text
      )
      ? res.data.text.trim()
      : '';

    console.log(
      'STT time:',
      Math.round(
        performance.now() - startedAt
      ) + 'ms'
    );

    if (!text) {

      var fallback = {
        en:'Could not hear you clearly — please try again.',
        th:'ไม่ได้ยินชัดเจน — กรุณาลองใหม่'
      };

      var msg =
        (
          res.data &&
          res.data.error
        )
          ? res.data.error
          : fallback[currentLang];

      if (status) {
        status.textContent = msg;
      }

      return;
    }

    var transcript =
      document.getElementById(
        'askTranscript'
      );

    if (transcript) {
      transcript.textContent = text;
    }

    /*
     * Immediately send the recognized text to Gemini.
     */
    askAssistant(text);

  })

  .catch(function(err) {

    console.error(
      'Speech request failed:',
      err
    );

    if (status) {
      status.textContent =
        t('voiceLocalError');
    }
  });
}

function submitTypedQuestion() {

  var input =
    document.getElementById(
      'askTextInput'
    );

  if (!input) {
    return;
  }

  var question =
    input.value.trim();

  if (!question) {
    return;
  }

  var transcript =
    document.getElementById(
      'askTranscript'
    );

  if (transcript) {
    transcript.textContent =
      question;
  }

  askAssistant(question);
}

function askAssistant(question) {

  var status =
    document.getElementById(
      'askStatus'
    );

  var answerBox =
    document.getElementById(
      'askAnswer'
    );

  if (status) {
    status.textContent =
      t('voiceThinking');
  }

  if (answerBox) {
    answerBox.textContent =
      '';
  }

  var answerLang =
    currentLang;

  var requestStartedAt =
    performance.now();

  fetch('/api/ask', {

    method:'POST',

    headers: {
      'Content-Type':
        'application/json'
    },

    body: JSON.stringify({
      question: question,
      lang: answerLang
    })
  })

  .then(function(response) {

    return response.json().then(function(data) {

      return {
        ok: response.ok,
        data: data
      };

    });
  })

  .then(function(res) {

    console.log(
      'AI response time:',
      Math.round(
        performance.now() -
        requestStartedAt
      ) + 'ms'
    );

    if (res.ok) {

      var answer =
        (
          res.data &&
          res.data.answer
        )
          ? res.data.answer
          : '';

      if (status) {
        status.textContent =
          '';
      }

      if (answerBox) {
        answerBox.textContent =
          answer;
      }

      /*
       * Immediately speak the answer after Gemini replies.
       */
      if (answer) {

        speak(
          answer,
          answerLang === 'th'
            ? 'th-TH'
            : 'en-US'
        );

      }

    } else {

      var msg =
        (
          res.data &&
          res.data.error
        )
          ? res.data.error
          : t('voiceOffline');

      if (status) {
        status.textContent = msg;
      }
    }

  })

  .catch(function(err) {

    console.error(
      'AI request failed:',
      err
    );

    if (status) {
      status.textContent =
        t('voiceOffline');
    }

  });
}

/* ══════════════════════════════════════════════
   SEARCH
   ══════════════════════════════════════════════ */

var searchCache = {
  announcements:null,
  teachers:null,
  outcomes:null,
  fees:null,
  faqs:null,
  courses:null
};

var searchDebounceTimer = null;

function injectSearchStyles() {

  if (document.getElementById('hsrStyles')) {
    return;
  }

  var style =
    document.createElement('style');

  style.id =
    'hsrStyles';

  style.textContent =

    '.header-search{position:relative;}' +

    '.hsr-panel{display:none;position:absolute;' +
    'top:calc(100% + 8px);left:0;right:0;' +
    'max-height:60vh;overflow-y:auto;' +
    'background:var(--surface2);' +
    'border:1px solid var(--border2);' +
    'border-radius:var(--radius-sm);' +
    'box-shadow:var(--shadow-md);' +
    'z-index:50;padding:8px;}' +

    '.hsr-panel.open{display:block;}' +

    '.hsr-group{margin-bottom:6px;}' +

    '.hsr-group:last-child{margin-bottom:0;}' +

    '.hsr-group-label{' +
      'font-family:var(--font-body);' +
      'font-size:11px;font-weight:700;' +
      'text-transform:uppercase;' +
      'letter-spacing:0.5px;' +
      'color:var(--text-tert);' +
      'padding:6px 10px 4px;' +
      'display:flex;align-items:center;gap:5px;' +
    '}' +

    '.hsr-item{' +
      'display:flex;' +
      'align-items:center;' +
      'gap:10px;width:100%;' +
      'background:none;border:0;' +
      'color:var(--text);' +
      'text-align:left;' +
      'padding:10px;' +
      'border-radius:8px;' +
      'cursor:pointer;' +
    '}' +

    '.hsr-item:hover{' +
      'background:var(--surface3);' +
    '}' +

    '.hsr-icon{' +
      'width:18px;height:18px;' +
      'flex:0 0 18px;color:var(--accent);' +
    '}' +

    '.hsr-body{' +
      'min-width:0;flex:1;' +
    '}' +

    '.hsr-title{' +
      'font-size:13px;font-weight:700;' +
      'white-space:nowrap;' +
      'overflow:hidden;' +
      'text-overflow:ellipsis;' +
    '}' +

    '.hsr-meta{' +
      'font-size:11px;' +
      'color:var(--text-tert);' +
      'margin-top:2px;' +
    '}' +

    '.hsr-empty{' +
      'padding:18px;text-align:center;' +
      'font-size:12px;' +
      'color:var(--text-tert);' +
    '}' +

    '.hsr-mark{' +
      'background:none;' +
      'color:inherit;font-weight:700;' +
    '}';

  document.head.appendChild(style);
}

function initSearch() {

  injectSearchStyles();

  var input =
    document.getElementById(
      'headerSearchInput'
    );

  if (!input) {
    return;
  }

  var panel =
    document.getElementById(
      'headerSearchResults'
    );

  input.addEventListener(
    'input',
    function() {

      var query =
        input.value.trim();

      if (searchDebounceTimer) {
        clearTimeout(
          searchDebounceTimer
        );
      }

      searchDebounceTimer =
        setTimeout(
          function() {

            if (!query) {
              closeSearchResults();
              return;
            }

            performGlobalSearch(query);

          },
          180
        );
    }
  );

  input.addEventListener(
    'keydown',
    function(e) {

      if (
        e.key === 'Escape'
      ) {
        closeSearchResults();
        input.blur();
      }

    }
  );

  document.addEventListener(
    'click',
    function(e) {

      if (
        !e.target.closest(
          '.header-search'
        )
      ) {
        closeSearchResults();
      }

    }
  );
}

function closeSearchResults() {

  var panel =
    document.getElementById(
      'headerSearchResults'
    );

  if (panel) {
    panel.classList.remove('open');
  }
}

function performGlobalSearch(query) {

  var panel =
    document.getElementById(
      'headerSearchResults'
    );

  if (!panel) {
    return;
  }

  var q =
    query.toLowerCase();

  var groups = [];

  function addGroup(
    label,
    iconName,
    items
  ) {

    if (!items || !items.length) {
      return;
    }

    groups.push({
      label:label,
      icon:iconName,
      items:items
    });

  }

  /*
   * Search local cached data first.
   */
  var allTypes = [
    {
      key:'announcements',
      label:t('announcements'),
      icon:'megaphone'
    },
    {
      key:'teachers',
      label:t('teachers'),
      icon:'users'
    },
    {
      key:'outcomes',
      label:t('outcomes'),
      icon:'briefcase'
    },
    {
      key:'fees',
      label:t('fees'),
      icon:'wallet'
    },
    {
      key:'faqs',
      label:t('faqs'),
      icon:'help'
    },
    {
      key:'courses',
      label:t('courses'),
      icon:'book'
    }
  ];

  allTypes.forEach(function(type) {

    var data =
      searchCache[type.key];

    if (!Array.isArray(data)) {
      return;
    }

    var matches =
      data
        .map(function(item) {

          var haystack =
            JSON.stringify(item)
              .toLowerCase();

          return {
            item:item,
            score:
              haystack.indexOf(q) >= 0
                ? 1
                : 0
          };

        })
        .filter(function(result) {
          return result.score > 0;
        })
        .slice(0, 5)
        .map(function(result) {

          var item =
            result.item;

          var title =
            item.title ||
            item.name ||
            item.question ||
            item.full_name ||
            item.course_name ||
            item.label ||
            '';

          var subtitle =
            item.title_th ||
            item.name_th ||
            item.question_th ||
            item.position ||
            item.role ||
            item.description ||
            '';

          return {
            title:title,
            subtitle:subtitle,
            run:function() {

              if (
                type.key ===
                'announcements'
              ) {
                currentAnnId =
                  item.id ||
                  item.announcement_id ||
                  null;

                showAnnouncementDetail(
                  item
                );

              } else if (
                type.key ===
                'teachers'
              ) {
                currentTeacherId =
                  item.id ||
                  item.teacher_id ||
                  null;

                showTeacherDetail(
                  item
                );

              } else if (
                type.key ===
                'outcomes'
              ) {
                currentOutcomeId =
                  item.id ||
                  item.outcome_id ||
                  null;

                showOutcomeDetail(
                  item
                );

              } else if (
                type.key ===
                'faqs'
              ) {
                currentFaqId =
                  item.id ||
                  item.faq_id ||
                  null;

                showFaqDetail(
                  item
                );

              } else if (
                type.key ===
                'courses'
              ) {
                showView(
                  'courses'
                );
              } else if (
                type.key ===
                'fees'
              ) {
                showView(
                  'fees'
                );
              }

            }
          };

        });

    addGroup(
      type.label,
      type.icon,
      matches
    );
  });

  if (!groups.length) {

    panel.innerHTML =
      '<div class="hsr-empty">' +
      escapeHtml(
        t('noResults')
      ) +
      '</div>';

    panel.classList.add(
      'open'
    );

    return;
  }

  panel.innerHTML = groups.map(
    function(group) {

      return (
        '<div class="hsr-group">' +
          '<div class="hsr-group-label">' +
            icon(group.icon, 'hsr-icon') +
            escapeHtml(group.label) +
          '</div>' +

          group.items.map(
            function(item, idx) {

              return (
                '<button class="hsr-item" type="button" ' +
                  'data-hsr-group="' +
                  groups.indexOf(group) +
                  '" ' +
                  'data-hsr-index="' +
                  idx +
                  '">' +

                  '<div class="hsr-body">' +
                    '<div class="hsr-title">' +
                      escapeHtml(
                        item.title
                      ) +
                    '</div>' +

                    (
                      item.subtitle
                        ? '<div class="hsr-meta">' +
                            escapeHtml(
                              truncate(
                                String(
                                  item.subtitle
                                ),
                                100
                              )
                            ) +
                          '</div>'
                        : ''
                    ) +

                  '</div>' +

                  icon(
                    'arrow',
                    'hsr-icon'
                  ) +

                '</button>'
              );

            }
          ).join('') +

        '</div>'
      );

    }
  ).join('');

  panel.classList.add(
    'open'
  );

  panel
    .querySelectorAll(
      '.hsr-item'
    )
    .forEach(
      function(btn) {

        btn.addEventListener(
          'click',
          function() {

            var gi =
              Number(
                btn.getAttribute(
                  'data-hsr-group'
                )
              );

            var ii =
              Number(
                btn.getAttribute(
                  'data-hsr-index'
                )
              );

            var item =
              groups[gi].items[ii];

            closeSearchResults();

            var input =
              document.getElementById(
                'headerSearchInput'
              );

            if (input) {
              input.value = '';
            }

            if (
              item &&
              item.run
            ) {
              item.run();
            }

          }
        );

      }
    );
}

/* ══════════════════════════════════════════════
   ASK PAGE INITIALIZATION
   ══════════════════════════════════════════════ */

function initAskPage() {

  var input =
    document.getElementById(
      'askTextInput'
    );

  if (!input) {
    return;
  }

  input.placeholder =
    t('askPlaceholder');

  /*
   * Prevent duplicate keydown listeners.
   */
  if (!input.dataset.bound) {

    input.dataset.bound =
      '1';

    input.addEventListener(
      'keydown',
      function(e) {

        if (
          e.key === 'Enter'
        ) {

          e.preventDefault();

          submitTypedQuestion();

        }

      }
    );
  }
}

/* ══════════════════════════════════════════════
   GENERIC UI HELPERS
   ══════════════════════════════════════════════ */

function escapeHtml(value) {

  return String(
    value == null
      ? ''
      : value
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function nl2br(value) {
  return String(value || '')
    .replace(/\n/g, '<br>');
}

function truncate(value, max) {

  var str =
    String(value || '');

  if (str.length <= max) {
    return str;
  }

  return (
    str.substring(
      0,
      max - 1
    ) +
    '…'
  );
}

function getInitials(name) {

  var parts =
    String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!parts.length) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function formatDate(value) {

  if (!value) {
    return '';
  }

  var date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    currentLang === 'th'
      ? 'th-TH'
      : 'en-US',
    {
      year:'numeric',
      month:'short',
      day:'numeric'
    }
  );
}

function formatCurrency(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '';
  }

  var number =
    Number(
      String(value)
        .replace(/,/g, '')
        .replace(/[^\d.-]/g, '')
    );

  if (isNaN(number)) {
    return String(value);
  }

  return number.toLocaleString(
    'en-US'
  ) + ' THB';
}

/* ══════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════ */

function initNavigation() {

  document
    .querySelectorAll(
      '[data-nav]'
    )
    .forEach(
      function(btn) {

        btn.addEventListener(
          'click',
          function() {

            var view =
              btn.getAttribute(
                'data-nav'
              );

            if (view) {
              showView(view);
            }

          }
        );

      }
    );
}

/* ══════════════════════════════════════════════
   APP INIT
   ══════════════════════════════════════════════ */

function initApp() {

  var savedTheme =
    (function() {

      try {
        return localStorage.getItem(
          'dbt_theme'
        );
      } catch (e) {
        return null;
      }

    })();

  setTheme(
    savedTheme === 'light'
      ? 'light'
      : 'dark'
  );

  var savedLang =
    (function() {

      try {
        return localStorage.getItem(
          'dbt_lang'
        );
      } catch (e) {
        return null;
      }

    })();

  setLanguage(
    savedLang === 'th'
      ? 'th'
      : 'en'
  );

  initHeader();
  initNavigation();
  initSearch();
  initAskPage();

  /*
   * Start at home.
   */
  showView(
    'home',
    false
  );

  /*
   * Preload browser speech voices.
   */
  if (
    window.speechSynthesis
  ) {
    loadSpeechVoices();

    setTimeout(
      loadSpeechVoices,
      500
    );

    setTimeout(
      loadSpeechVoices,
      1500
    );
  }

  /*
   * Welcome message.
   *
   * Slight delay allows Chromium audio services to initialize.
   */
  setTimeout(
    function() {
      speak(
        t('voiceWelcome'),
        currentLang === 'th'
          ? 'th-TH'
          : 'en-US'
      );
    },
    800
  );
}

/* ══════════════════════════════════════════════
   DOM READY
   ══════════════════════════════════════════════ */

if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    initApp
  );

} else {

  initApp();

}