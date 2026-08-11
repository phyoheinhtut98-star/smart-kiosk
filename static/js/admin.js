/* ─── DBT Smart Kiosk — Admin Panel JS ─── */

/* ─── LANGUAGE ─────────────────────────────────
   Shares the same localStorage key as the kiosk (main.js), so if an admin
   also has the kiosk open in another tab on the same browser, the language
   preference stays in sync. Only the FAQ list currently switches with this
   toggle — see loadFAQsAdmin() below. */
var currentLang = localStorage.getItem('dbtLang') || 'en';

function setAdminLanguage(lang) {
  if (lang !== 'en' && lang !== 'th') return;
  currentLang = lang;
  localStorage.setItem('dbtLang', lang);

  var enOpt = document.getElementById('adminLangOptionEn');
  var thOpt = document.getElementById('adminLangOptionTh');
  if (enOpt) enOpt.classList.toggle('active', lang === 'en');
  if (thOpt) thOpt.classList.toggle('active', lang === 'th');

  // Re-render the FAQ list immediately if that's the tab currently open
  var faqTab = document.getElementById('tab-faqs');
  if (faqTab && !faqTab.classList.contains('hidden')) {
    loadFAQsAdmin();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var enOpt = document.getElementById('adminLangOptionEn');
  var thOpt = document.getElementById('adminLangOptionTh');
  if (enOpt) enOpt.classList.toggle('active', currentLang === 'en');
  if (thOpt) thOpt.classList.toggle('active', currentLang === 'th');

  var toggleBtn = document.getElementById('adminLangToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      setAdminLanguage(currentLang === 'en' ? 'th' : 'en');
    });
  }
});

// ─── TAB SWITCHING ───────────────────────────
function showTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.add('hidden'); });
  document.getElementById('tab-' + name).classList.remove('hidden');
  document.querySelectorAll('.atab').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');

  if (name === 'announcements') loadAnnouncementsAdmin();
  if (name === 'teachers')      loadTeachersAdmin();
  if (name === 'faqs')          loadFAQsAdmin();
  if (name === 'courses')       loadCoursesAdmin();
  if (name === 'outcomes')      loadOutcomesAdmin();
  if (name === 'fees')          loadFeesAdmin();
}

// ─── HELPER ──────────────────────────────────
function showSuccess(id) {
  var el = document.getElementById(id);
  el.classList.remove('hidden');
  setTimeout(function() { el.classList.add('hidden'); }, 3000);
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── IMAGE UPLOAD ─────────────────────────────
function previewImage(input) {
  var preview = document.getElementById('imagePreview');
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = '<img src="' + e.target.result +
        '" style="max-width:100%;max-height:160px;border-radius:6px;margin-top:4px;">';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function uploadThenSave() {
  var fileInput = document.getElementById('ann-image');
  var file = fileInput.files[0];
  if (file) {
    var formData = new FormData();
    formData.append('image', file);
    fetch('/admin/announcements/upload-image', { method: 'POST', body: formData })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.path) document.getElementById('ann-image-path').value = res.path;
        saveAnnouncement();
      });
  } else {
    saveAnnouncement();
  }
}

function uploadEditImage(inputEl, callback) {
  var file = inputEl.files[0];
  if (!file) { callback(''); return; }
  var formData = new FormData();
  formData.append('image', file);
  fetch('/admin/announcements/upload-image', { method: 'POST', body: formData })
    .then(function(r) { return r.json(); })
    .then(function(res) { callback(res.path || ''); });
}

// ─── ANNOUNCEMENTS ───────────────────────────
function saveAnnouncement() {
  var title   = document.getElementById('ann-title').value.trim();
  var titleTh = document.getElementById('ann-title-th').value.trim();
  var body    = document.getElementById('ann-body').value.trim();
  var bodyTh  = document.getElementById('ann-body-th').value.trim();
  var tag     = document.getElementById('ann-tag').value;
  var imgPath = document.getElementById('ann-image-path').value;

  if (!title || !body) { alert('Please fill in at least the English title and content.'); return; }

  fetch('/admin/announcements/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title:title, title_th:titleTh, body:body, body_th:bodyTh, tag:tag, image_path:imgPath })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.status === 'ok') {
      ['ann-title','ann-title-th','ann-body','ann-body-th','ann-image-path'].forEach(function(id){ document.getElementById(id).value=''; });
      document.getElementById('ann-image').value = '';
      document.getElementById('imagePreview').innerHTML = '';
      showSuccess('ann-ok');
      loadAnnouncementsAdmin();
    }
  });
}

function loadAnnouncementsAdmin() {
  fetch('/api/announcements').then(function(r) { return r.json(); }).then(function(data) {
    var el = document.getElementById('ann-list-admin');
    if (!data.length) { el.innerHTML = '<div class="list-loading">No announcements yet.</div>'; return; }
    el.innerHTML = data.map(function(a) {
      return '<div class="list-item" id="ann-item-' + a.id + '">' +
               '<div class="list-item-body">' +
                 '<div class="list-item-title">[' + a.tag + '] ' + escHtml(a.title) + '</div>' +
                 '<div class="list-item-sub">' + a.date_posted +
                   (a.image_path ? ' · 🖼️ Has image' : '') + '</div>' +
               '</div>' +
               '<div style="display:flex;gap:4px;flex-shrink:0">' +
                 '<button class="btn-edit" onclick="editAnnouncement(' + a.id + ')">Edit</button>' +
                 '<button class="btn-danger" onclick="deleteAnnouncement(' + a.id + ')">Delete</button>' +
               '</div>' +
             '</div>';
    }).join('');
  });
}

function editAnnouncement(id) {
  fetch('/api/announcements').then(function(r){ return r.json(); }).then(function(data) {
    var a = data.find(function(x){ return x.id === id; });
    if (!a) return;
    var el = document.getElementById('ann-item-' + id);
    el.outerHTML =
      '<div class="edit-form" id="ann-item-' + id + '">' +
        '<div class="edit-form-title">✏️ Editing: ' + escHtml(a.title) + '</div>' +
        '<div class="form-row"><label>Title (EN)</label><input id="ea-title-' + id + '" value="' + escHtml(a.title) + '"></div>' +
        '<div class="form-row"><label>Title (TH)</label><input id="ea-title-th-' + id + '" value="' + escHtml(a.title_th) + '"></div>' +
        '<div class="form-row"><label>Content (EN)</label><textarea id="ea-body-' + id + '">' + escHtml(a.body) + '</textarea></div>' +
        '<div class="form-row"><label>Content (TH)</label><textarea id="ea-body-th-' + id + '">' + escHtml(a.body_th) + '</textarea></div>' +
        '<div class="form-row"><label>Tag</label>' +
          '<select id="ea-tag-' + id + '">' +
            '<option' + (a.tag==='URGENT'?   ' selected':'') + '>URGENT</option>' +
            '<option' + (a.tag==='ACADEMIC'? ' selected':'') + '>ACADEMIC</option>' +
            '<option' + (a.tag==='EVENT'?    ' selected':'') + '>EVENT</option>' +
            '<option' + (a.tag==='GENERAL'?  ' selected':'') + '>GENERAL</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-row"><label>Replace Image (optional)</label>' +
          '<input type="file" id="ea-img-' + id + '" accept="image/*">' +
          (a.image_path ? '<div style="margin-top:6px;font-size:11px;color:var(--muted)">Current: <a href="' + a.image_path + '" target="_blank" style="color:var(--blue)">View image</a></div>' : '') +
        '</div>' +
        '<div class="edit-btns">' +
          '<button class="btn-save"   onclick="saveAnnEdit(' + id + ')">Save</button>' +
          '<button class="btn-cancel" onclick="loadAnnouncementsAdmin()">Cancel</button>' +
        '</div>' +
      '</div>';
  });
}

function saveAnnEdit(id) {
  var imgInput = document.getElementById('ea-img-' + id);
  uploadEditImage(imgInput, function(newPath) {
    var payload = {
      title:      document.getElementById('ea-title-'    + id).value.trim(),
      title_th:   document.getElementById('ea-title-th-' + id).value.trim(),
      body:       document.getElementById('ea-body-'     + id).value.trim(),
      body_th:    document.getElementById('ea-body-th-'  + id).value.trim(),
      tag:        document.getElementById('ea-tag-'      + id).value,
    };
    if (newPath) payload.image_path = newPath;

    fetch('/admin/announcements/edit/' + id, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r){ return r.json(); }).then(function(){ loadAnnouncementsAdmin(); });
  });
}

function deleteAnnouncement(id) {
  if (!confirm('Remove this announcement?')) return;
  fetch('/admin/announcements/delete/' + id, { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function() { loadAnnouncementsAdmin(); });
}

// ─── TEACHERS ────────────────────────────────
function addTeacher() {
  var nameEn = document.getElementById('t-name-en').value.trim();
  var nameTh = document.getElementById('t-name-th').value.trim();
  var pos    = document.getElementById('t-pos').value.trim();
  var room   = document.getElementById('t-room').value.trim();
  var email  = document.getElementById('t-email').value.trim();
  var hours  = document.getElementById('t-hours').value.trim();
  var subj   = document.getElementById('t-subjects').value.trim();
  var lang   = document.getElementById('t-lang').value.trim();
  var msg    = document.getElementById('t-msg').value.trim();
  var contact= document.getElementById('t-contact').value;

  if (!nameEn || !pos) { alert('Please fill in at least the name and position.'); return; }

  fetch('/admin/teachers/add', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name_en:nameEn, name_th:nameTh, position:pos, room:room,
      email:email, office_hours:hours, subjects:subj, languages:lang,
      message:msg, show_contact:parseInt(contact) })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.status === 'ok') {
      ['t-name-en','t-name-th','t-pos','t-room','t-email','t-hours','t-subjects','t-lang','t-msg']
        .forEach(function(id){ document.getElementById(id).value=''; });
      showSuccess('t-ok');
      loadTeachersAdmin();
    }
  });
}

function loadTeachersAdmin() {
  fetch('/api/teachers').then(function(r) { return r.json(); }).then(function(data) {
    var el = document.getElementById('teacher-list-admin');
    if (!data.length) { el.innerHTML = '<div class="list-loading">No teacher profiles yet.</div>'; return; }
    el.innerHTML = data.map(function(t) {
      return '<div class="list-item" id="t-item-' + t.id + '">' +
               '<div class="list-item-body">' +
                 '<div class="list-item-title">' + escHtml(t.name_en) + ' — ' + escHtml(t.position) + '</div>' +
                 '<div class="list-item-sub">Room ' + (t.room||'–') + ' · ' + (t.office_hours||'–') + '</div>' +
               '</div>' +
               '<div style="display:flex;gap:4px;flex-shrink:0">' +
                 '<button class="btn-edit" onclick="editTeacher(' + t.id + ')">Edit</button>' +
                 '<button class="btn-danger" onclick="deleteTeacher(' + t.id + ')">Delete</button>' +
               '</div>' +
             '</div>';
    }).join('');
  });
}

function editTeacher(id) {
  fetch('/api/teachers').then(function(r){ return r.json(); }).then(function(data) {
    var t = data.find(function(x){ return x.id === id; });
    if (!t) return;
    var el = document.getElementById('t-item-' + id);
    el.outerHTML =
      '<div class="edit-form" id="t-item-' + id + '">' +
        '<div class="edit-form-title">✏️ Editing: ' + escHtml(t.name_en) + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 14px">' +
          '<div class="form-row"><label>Name (EN)</label><input id="et-name-en-' + id + '" value="' + escHtml(t.name_en) + '"></div>' +
          '<div class="form-row"><label>ชื่อ (TH)</label><input id="et-name-th-' + id + '" value="' + escHtml(t.name_th) + '"></div>' +
          '<div class="form-row"><label>Position</label><input id="et-pos-' + id + '" value="' + escHtml(t.position) + '"></div>' +
          '<div class="form-row"><label>Room</label><input id="et-room-' + id + '" value="' + escHtml(t.room) + '"></div>' +
          '<div class="form-row"><label>Email</label><input id="et-email-' + id + '" value="' + escHtml(t.email) + '"></div>' +
          '<div class="form-row"><label>Office Hours</label><input id="et-hours-' + id + '" value="' + escHtml(t.office_hours) + '"></div>' +
          '<div class="form-row"><label>Languages</label><input id="et-lang-' + id + '" value="' + escHtml(t.languages) + '"></div>' +
          '<div class="form-row"><label>Show Contact</label>' +
            '<select id="et-contact-' + id + '">' +
              '<option value="1"' + (t.show_contact===1?' selected':'') + '>Yes — all</option>' +
              '<option value="2"' + (t.show_contact===2?' selected':'') + '>Name & room only</option>' +
              '<option value="0"' + (t.show_contact===0?' selected':'') + '>Private</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="form-row"><label>Subjects</label><textarea id="et-subj-' + id + '">' + escHtml(t.subjects) + '</textarea></div>' +
        '<div class="form-row"><label>Message to Students</label><textarea id="et-msg-' + id + '">' + escHtml(t.message) + '</textarea></div>' +
        '<div class="edit-btns">' +
          '<button class="btn-save"   onclick="saveTeacherEdit(' + id + ')">Save</button>' +
          '<button class="btn-cancel" onclick="loadTeachersAdmin()">Cancel</button>' +
        '</div>' +
      '</div>';
  });
}

function saveTeacherEdit(id) {
  fetch('/admin/teachers/edit/' + id, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name_en:      document.getElementById('et-name-en-'  + id).value.trim(),
      name_th:      document.getElementById('et-name-th-'  + id).value.trim(),
      position:     document.getElementById('et-pos-'      + id).value.trim(),
      room:         document.getElementById('et-room-'     + id).value.trim(),
      email:        document.getElementById('et-email-'    + id).value.trim(),
      office_hours: document.getElementById('et-hours-'    + id).value.trim(),
      languages:    document.getElementById('et-lang-'     + id).value.trim(),
      show_contact: parseInt(document.getElementById('et-contact-' + id).value),
      subjects:     document.getElementById('et-subj-'    + id).value.trim(),
      message:      document.getElementById('et-msg-'     + id).value.trim(),
    })
  }).then(function(r){ return r.json(); }).then(function(){ loadTeachersAdmin(); });
}

function deleteTeacher(id) {
  if (!confirm('Remove this teacher profile?')) return;
  fetch('/admin/teachers/delete/' + id, { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function() { loadTeachersAdmin(); });
}

// ─── FAQS ─────────────────────────────────────
function addFAQ() {
  var q    = document.getElementById('faq-q').value.trim();
  var qTh  = document.getElementById('faq-q-th').value.trim();
  var a    = document.getElementById('faq-a').value.trim();
  var aTh  = document.getElementById('faq-a-th').value.trim();
  var cat  = document.getElementById('faq-cat').value;
  if (!q || !a) { alert('Please fill in at least the English question and answer.'); return; }
  fetch('/admin/faqs/add', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question:q, question_th:qTh, answer:a, answer_th:aTh, category:cat })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.status === 'ok') {
      ['faq-q','faq-q-th','faq-a','faq-a-th'].forEach(function(id){ document.getElementById(id).value=''; });
      showSuccess('faq-ok');
      loadFAQsAdmin();
    }
  });
}

// loadFAQsAdmin() now shows question/answer in whichever language the
// admin toggle (top-right of the header) is currently set to. Falls back
// to the English field if a Thai translation hasn't been entered yet.
function loadFAQsAdmin() {
  fetch('/api/faqs').then(function(r) { return r.json(); }).then(function(data) {
    var el = document.getElementById('faq-list-admin');
    if (!data.length) { el.innerHTML = '<div class="list-loading">No FAQs yet.</div>'; return; }
    el.innerHTML = data.map(function(f) {
      var displayQ = (currentLang === 'th' && f.question_th) ? f.question_th : f.question;
      var displayA = (currentLang === 'th' && f.answer_th)   ? f.answer_th   : f.answer;
      var langBadge = (currentLang === 'th')
        ? (f.question_th ? '' : ' <span style="color:var(--text-tert);font-weight:400;">(no TH translation yet)</span>')
        : '';
      return '<div class="list-item" id="faq-item-' + f.id + '">' +
               '<div class="list-item-body">' +
                 '<div class="list-item-title">[' + f.category + '] ' + escHtml(displayQ) + langBadge + '</div>' +
                 '<div class="list-item-sub">' + escHtml(displayA).substring(0,80) + '...</div>' +
               '</div>' +
               '<div style="display:flex;gap:4px;flex-shrink:0">' +
                 '<button class="btn-edit" onclick="editFAQ(' + f.id + ')">Edit</button>' +
                 '<button class="btn-danger" onclick="deleteFAQ(' + f.id + ')">Delete</button>' +
               '</div>' +
             '</div>';
    }).join('');
  });
}

function editFAQ(id) {
  fetch('/api/faqs').then(function(r){ return r.json(); }).then(function(data) {
    var f = data.find(function(x){ return x.id === id; });
    if (!f) return;
    var el = document.getElementById('faq-item-' + id);
    el.outerHTML =
      '<div class="edit-form" id="faq-item-' + id + '">' +
        '<div class="edit-form-title">✏️ Editing FAQ</div>' +
        '<div class="form-row"><label>Question (EN)</label><input id="ef-q-' + id + '" value="' + escHtml(f.question) + '"></div>' +
        '<div class="form-row"><label>Question (TH)</label><input id="ef-q-th-' + id + '" value="' + escHtml(f.question_th) + '"></div>' +
        '<div class="form-row"><label>Answer (EN)</label><textarea id="ef-a-' + id + '">' + escHtml(f.answer) + '</textarea></div>' +
        '<div class="form-row"><label>Answer (TH)</label><textarea id="ef-a-th-' + id + '">' + escHtml(f.answer_th) + '</textarea></div>' +
        '<div class="form-row"><label>Category</label>' +
          '<select id="ef-cat-' + id + '">' +
            ['General','Registration','Curriculum','Staff','Help'].map(function(c){
              return '<option' + (f.category===c?' selected':'') + '>' + c + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="edit-btns">' +
          '<button class="btn-save"   onclick="saveFAQEdit(' + id + ')">Save</button>' +
          '<button class="btn-cancel" onclick="loadFAQsAdmin()">Cancel</button>' +
        '</div>' +
      '</div>';
  });
}

function saveFAQEdit(id) {
  fetch('/admin/faqs/edit/' + id, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question:    document.getElementById('ef-q-'    + id).value.trim(),
      question_th: document.getElementById('ef-q-th-' + id).value.trim(),
      answer:      document.getElementById('ef-a-'    + id).value.trim(),
      answer_th:   document.getElementById('ef-a-th-' + id).value.trim(),
      category:    document.getElementById('ef-cat-'  + id).value,
    })
  }).then(function(r){ return r.json(); }).then(function(){ loadFAQsAdmin(); });
}

function deleteFAQ(id) {
  if (!confirm('Delete this FAQ?')) return;
  fetch('/admin/faqs/delete/' + id, { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function() { loadFAQsAdmin(); });
}

// ─── COURSES ─────────────────────────────────
function addCourse() {
  var code  = document.getElementById('c-code').value.trim();
  var name  = document.getElementById('c-name').value.trim();
  var nameTh= document.getElementById('c-name-th').value.trim();
  var level = document.getElementById('c-level').value;
  var year  = parseInt(document.getElementById('c-year').value);
  var sem   = parseInt(document.getElementById('c-semester').value);
  var type  = document.getElementById('c-type').value;
  var group = document.getElementById('c-group').value.trim();
  if (!code || !name) { alert('Please fill in at least the course code and English name.'); return; }
  fetch('/admin/courses/add', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code:code, name:name, name_th:nameTh, level:level,
      year:year, semester:sem, group_type:type, group_name:group })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.status === 'ok') {
      ['c-code','c-name','c-name-th','c-group'].forEach(function(id){ document.getElementById(id).value=''; });
      showSuccess('c-ok');
      loadCoursesAdmin();
    }
  });
}

function loadCoursesAdmin() {
  var level = document.getElementById('filter-level').value;
  var year  = document.getElementById('filter-year').value;
  var sem   = document.getElementById('filter-sem').value;
  var url   = '/api/courses?';
  if (level) url += 'level=' + level + '&';
  if (year)  url += 'year='  + year  + '&';
  if (sem)   url += 'semester=' + sem + '&';
  fetch(url).then(function(r) { return r.json(); }).then(function(data) {
    var el = document.getElementById('course-list-admin');
    if (!data.length) { el.innerHTML = '<div class="list-loading">No courses found.</div>'; return; }
    el.innerHTML = data.map(function(c) {
      return '<div class="list-item" id="c-item-' + c.id + '">' +
               '<div class="list-item-body">' +
                 '<div class="list-item-title">' + escHtml(c.code) + ' — ' + escHtml(c.name) + '</div>' +
                 '<div class="list-item-sub">' + c.level.toUpperCase() + ' · Year ' + c.year + ' Sem ' + c.semester + ' · ' + c.group_type + '</div>' +
               '</div>' +
               '<div style="display:flex;gap:4px;flex-shrink:0">' +
                 '<button class="btn-edit" onclick="editCourse(' + c.id + ')">Edit</button>' +
                 '<button class="btn-danger" onclick="deleteCourse(' + c.id + ')">Delete</button>' +
               '</div>' +
             '</div>';
    }).join('');
  });
}

function editCourse(id) {
  fetch('/api/courses').then(function(r){ return r.json(); }).then(function(data) {
    var c = data.find(function(x){ return x.id === id; });
    if (!c) return;
    var el = document.getElementById('c-item-' + id);
    el.outerHTML =
      '<div class="edit-form" id="c-item-' + id + '">' +
        '<div class="edit-form-title">✏️ Editing: ' + escHtml(c.code) + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 14px">' +
          '<div class="form-row"><label>Course Code</label><input id="ec-code-' + id + '" value="' + escHtml(c.code) + '"></div>' +
          '<div class="form-row"><label>Level</label>' +
            '<select id="ec-level-' + id + '">' +
              '<option value="vc"'  + (c.level==='vc' ?' selected':'') + '>VC</option>' +
              '<option value="hvc"' + (c.level==='hvc'?' selected':'') + '>HVC</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-row"><label>Year</label>' +
            '<select id="ec-year-' + id + '">' +
              [1,2,3].map(function(y){ return '<option' + (c.year===y?' selected':'') + '>' + y + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-row"><label>Semester</label>' +
            '<select id="ec-sem-' + id + '">' +
              [1,2].map(function(s){ return '<option' + (c.semester===s?' selected':'') + '>' + s + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-row"><label>Type</label>' +
            '<select id="ec-type-' + id + '">' +
              ['core','elective','extra'].map(function(t){ return '<option' + (c.group_type===t?' selected':'') + '>' + t + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-row"><label>Group Name</label><input id="ec-group-' + id + '" value="' + escHtml(c.group_name) + '"></div>' +
        '</div>' +
        '<div class="form-row"><label>Subject Name (EN)</label><input id="ec-name-' + id + '" value="' + escHtml(c.name) + '"></div>' +
        '<div class="form-row"><label>Subject Name (TH)</label><input id="ec-name-th-' + id + '" value="' + escHtml(c.name_th) + '"></div>' +
        '<div class="edit-btns">' +
          '<button class="btn-save"   onclick="saveCourseEdit(' + id + ')">Save</button>' +
          '<button class="btn-cancel" onclick="loadCoursesAdmin()">Cancel</button>' +
        '</div>' +
      '</div>';
  });
}

function saveCourseEdit(id) {
  fetch('/admin/courses/edit/' + id, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code:       document.getElementById('ec-code-'    + id).value.trim(),
      name:       document.getElementById('ec-name-'    + id).value.trim(),
      name_th:    document.getElementById('ec-name-th-' + id).value.trim(),
      level:      document.getElementById('ec-level-'   + id).value,
      year:       parseInt(document.getElementById('ec-year-'  + id).value),
      semester:   parseInt(document.getElementById('ec-sem-'   + id).value),
      group_type: document.getElementById('ec-type-'   + id).value,
      group_name: document.getElementById('ec-group-'  + id).value.trim(),
    })
  }).then(function(r){ return r.json(); }).then(function(){ loadCoursesAdmin(); });
}

function deleteCourse(id) {
  if (!confirm('Delete this course from the database?')) return;
  fetch('/admin/courses/delete/' + id, { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function() { loadCoursesAdmin(); });
}

// ─── OUTCOMES ─────────────────────────────────
function addOutcome() {
  var level  = document.getElementById('o-level').value;
  var career = document.getElementById('o-career').value.trim();
  var carTh  = document.getElementById('o-career-th').value.trim();
  var desc   = document.getElementById('o-desc').value.trim();
  var descTh = document.getElementById('o-desc-th').value.trim();
  if (!career) { alert('Please enter the career title.'); return; }
  fetch('/admin/outcomes/add', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level:level, career:career, career_th:carTh, description:desc, desc_th:descTh })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.status === 'ok') {
      ['o-career','o-career-th','o-desc','o-desc-th'].forEach(function(id){ document.getElementById(id).value=''; });
      showSuccess('o-ok');
      loadOutcomesAdmin();
    }
  });
}

function loadOutcomesAdmin() {
  fetch('/api/outcomes').then(function(r) { return r.json(); }).then(function(data) {
    var el = document.getElementById('outcome-list-admin');
    if (!data.length) { el.innerHTML = '<div class="list-loading">No outcomes yet.</div>'; return; }
    el.innerHTML = data.map(function(o) {
      return '<div class="list-item" id="o-item-' + o.id + '">' +
               '<div class="list-item-body">' +
                 '<div class="list-item-title">[' + o.level.toUpperCase() + '] ' + escHtml(o.career) + '</div>' +
                 '<div class="list-item-sub">' + (o.career_th||'') + '</div>' +
               '</div>' +
               '<div style="display:flex;gap:4px;flex-shrink:0">' +
                 '<button class="btn-edit" onclick="editOutcome(' + o.id + ')">Edit</button>' +
                 '<button class="btn-danger" onclick="deleteOutcome(' + o.id + ')">Delete</button>' +
               '</div>' +
             '</div>';
    }).join('');
  });
}

function editOutcome(id) {
  fetch('/api/outcomes').then(function(r){ return r.json(); }).then(function(data) {
    var o = data.find(function(x){ return x.id === id; });
    if (!o) return;
    var el = document.getElementById('o-item-' + id);
    el.outerHTML =
      '<div class="edit-form" id="o-item-' + id + '">' +
        '<div class="edit-form-title">✏️ Editing: ' + escHtml(o.career) + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 14px">' +
          '<div class="form-row"><label>Level</label>' +
            '<select id="eo-level-' + id + '">' +
              '<option value="vc"'  + (o.level==='vc' ?' selected':'') + '>VC</option>' +
              '<option value="hvc"' + (o.level==='hvc'?' selected':'') + '>HVC</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-row"><label>Career (EN)</label><input id="eo-career-' + id + '" value="' + escHtml(o.career) + '"></div>' +
          '<div class="form-row" style="grid-column:span 2"><label>อาชีพ (TH)</label><input id="eo-career-th-' + id + '" value="' + escHtml(o.career_th) + '"></div>' +
        '</div>' +
        '<div class="form-row"><label>Description (EN)</label><textarea id="eo-desc-' + id + '">' + escHtml(o.description) + '</textarea></div>' +
        '<div class="form-row"><label>คำอธิบาย (TH)</label><textarea id="eo-desc-th-' + id + '">' + escHtml(o.desc_th) + '</textarea></div>' +
        '<div class="edit-btns">' +
          '<button class="btn-save"   onclick="saveOutcomeEdit(' + id + ')">Save</button>' +
          '<button class="btn-cancel" onclick="loadOutcomesAdmin()">Cancel</button>' +
        '</div>' +
      '</div>';
  });
}

function saveOutcomeEdit(id) {
  fetch('/admin/outcomes/edit/' + id, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level:       document.getElementById('eo-level-'     + id).value,
      career:      document.getElementById('eo-career-'    + id).value.trim(),
      career_th:   document.getElementById('eo-career-th-' + id).value.trim(),
      description: document.getElementById('eo-desc-'      + id).value.trim(),
      desc_th:     document.getElementById('eo-desc-th-'   + id).value.trim(),
    })
  }).then(function(r){ return r.json(); }).then(function(){ loadOutcomesAdmin(); });
}

function deleteOutcome(id) {
  if (!confirm('Delete this career outcome?')) return;
  fetch('/admin/outcomes/delete/' + id, { method: 'POST' })
    .then(function(r){ return r.json(); })
    .then(function(){ loadOutcomesAdmin(); });
}

// ─── FEES ─────────────────────────────────────
function addFee() {
  var level  = document.getElementById('f-level').value;
  var item   = document.getElementById('f-item').value.trim();
  var itemTh = document.getElementById('f-item-th').value.trim();
  var amount = parseFloat(document.getElementById('f-amount').value);
  var period = document.getElementById('f-period').value;
  var note   = document.getElementById('f-note').value.trim();
  if (!item || isNaN(amount)) { alert('Please enter the fee item and amount.'); return; }
  fetch('/admin/fees/add', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level:level, item:item, item_th:itemTh, amount:amount, period:period, note:note })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.status === 'ok') {
      ['f-item','f-item-th','f-amount','f-note'].forEach(function(id){ document.getElementById(id).value=''; });
      showSuccess('f-ok');
      loadFeesAdmin();
    }
  });
}

function loadFeesAdmin() {
  fetch('/api/fees').then(function(r) { return r.json(); }).then(function(data) {
    var el = document.getElementById('fee-list-admin');
    if (!data.length) { el.innerHTML = '<div class="list-loading">No fees yet.</div>'; return; }
    el.innerHTML = data.map(function(f) {
      return '<div class="list-item" id="f-item-' + f.id + '">' +
               '<div class="list-item-body">' +
                 '<div class="list-item-title">[' + f.level.toUpperCase() + '] ' + escHtml(f.item) + ' — ฿' + f.amount.toLocaleString() + '</div>' +
                 '<div class="list-item-sub">' + f.period + (f.note ? ' · ' + f.note : '') + '</div>' +
               '</div>' +
               '<div style="display:flex;gap:4px;flex-shrink:0">' +
                 '<button class="btn-edit" onclick="editFee(' + f.id + ')">Edit</button>' +
                 '<button class="btn-danger" onclick="deleteFee(' + f.id + ')">Delete</button>' +
               '</div>' +
             '</div>';
    }).join('');
  });
}

function editFee(id) {
  fetch('/api/fees').then(function(r){ return r.json(); }).then(function(data) {
    var f = data.find(function(x){ return x.id === id; });
    if (!f) return;
    var el = document.getElementById('f-item-' + id);
    el.outerHTML =
      '<div class="edit-form" id="f-item-' + id + '">' +
        '<div class="edit-form-title">✏️ Editing: ' + escHtml(f.item) + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 14px">' +
          '<div class="form-row"><label>Level</label>' +
            '<select id="ef2-level-' + id + '">' +
              '<option value="vc"'  + (f.level==='vc' ?' selected':'') + '>VC</option>' +
              '<option value="hvc"' + (f.level==='hvc'?' selected':'') + '>HVC</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-row"><label>Amount (฿)</label><input type="number" id="ef2-amount-' + id + '" value="' + f.amount + '"></div>' +
          '<div class="form-row"><label>Fee Item (EN)</label><input id="ef2-item-' + id + '" value="' + escHtml(f.item) + '"></div>' +
          '<div class="form-row"><label>รายการ (TH)</label><input id="ef2-item-th-' + id + '" value="' + escHtml(f.item_th) + '"></div>' +
          '<div class="form-row"><label>Period</label>' +
            '<select id="ef2-period-' + id + '">' +
              ['per semester','per year','once'].map(function(p){ return '<option' + (f.period===p?' selected':'') + '>' + p + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-row"><label>Note</label><input id="ef2-note-' + id + '" value="' + escHtml(f.note) + '"></div>' +
        '</div>' +
        '<div class="edit-btns">' +
          '<button class="btn-save"   onclick="saveFeeEdit(' + id + ')">Save</button>' +
          '<button class="btn-cancel" onclick="loadFeesAdmin()">Cancel</button>' +
        '</div>' +
      '</div>';
  });
}

function saveFeeEdit(id) {
  fetch('/admin/fees/edit/' + id, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level:   document.getElementById('ef2-level-'   + id).value,
      item:    document.getElementById('ef2-item-'    + id).value.trim(),
      item_th: document.getElementById('ef2-item-th-' + id).value.trim(),
      amount:  parseFloat(document.getElementById('ef2-amount-' + id).value),
      period:  document.getElementById('ef2-period-'  + id).value,
      note:    document.getElementById('ef2-note-'    + id).value.trim(),
    })
  }).then(function(r){ return r.json(); }).then(function(){ loadFeesAdmin(); });
}

function deleteFee(id) {
  if (!confirm('Delete this fee item?')) return;
  fetch('/admin/fees/delete/' + id, { method: 'POST' })
    .then(function(r){ return r.json(); })
    .then(function(){ loadFeesAdmin(); });
}

// ─── INIT ─────────────────────────────────────
loadAnnouncementsAdmin();