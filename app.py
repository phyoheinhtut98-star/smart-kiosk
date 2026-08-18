"""
Smart Digital Information Board Kiosk
Department of Computer and Digital Business — IRPC Technological College
Project Team: Mr. Phyo Hein Htut (6832041051) & Mr. Aung Pyae Phyo Linn (6832041037)
Advisor: Mr. Chenjop Mapech | Co-advisor: Mr. Banphot Ninpanit
"""

from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from database import db, Course, Announcement, Teacher, FAQ, StudyOutcome, ProgramFee, KnowledgeEntry
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv
from google import genai

# Text extraction for admin-fed AI knowledge attachments
from pypdf import PdfReader
from docx import Document as DocxDocument
import fitz  # PyMuPDF — used to rasterize scanned/image-only PDF pages for OCR
from PIL import Image
import pytesseract

load_dotenv()  # reads GEMINI_API_KEY from a local .env file (not committed to git)

app = Flask(__name__)
app.secret_key = 'dbt-kiosk-irpc-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Knowledge attachments live OUTSIDE static/ on purpose — static/ is
# served directly by Flask (publicly fetchable if someone guesses a
# URL), and these files may contain internal info that shouldn't be
# shown on the kiosk. This folder is never registered as a static
# route, so there's no public URL that reaches it at all.
app.config['KNOWLEDGE_FOLDER'] = 'knowledge_files'
os.makedirs(app.config['KNOWLEDGE_FOLDER'], exist_ok=True)

# Tesseract needs a language pack per script. Thai docs need
# tesseract-ocr-tha installed on the system (see setup notes) —
# we ask for both so mixed Thai/English scans OCR correctly.
OCR_LANGS = 'eng+tha'
MAX_OCR_PAGES = 20  # cap so a huge scanned PDF can't stall a 1GB-RAM Pi

db.init_app(app)

ADMIN_PASSWORD = 'dbt2026'
# In-memory shared state — lets the control panel (phone) tell the
# main display (laptop) what to do, polled every second.
remote_command = {'type': None, 'cmd': None, 'val': None, 'command': None, 'dx': 0, 'dy': 0, 'ts': 0}

# ── Voice assistant (Google Gemini, free tier) ──────────────
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
# ─────────────────────────────────────────────
#  PUBLIC ROUTES — 7" MAIN DISPLAY
# ─────────────────────────────────────────────

@app.route('/')
def main():
    """7-inch primary display — full information board."""
    return render_template('main.html')


@app.route('/control')
def control():
    """2.4-inch SPI touchscreen — navigation control panel."""
    return render_template('control.html')


# ─────────────────────────────────────────────
#  API ROUTES — JSON data endpoints
# ─────────────────────────────────────────────

@app.route('/api/courses')
def api_courses():
    level = request.args.get('level')
    year  = request.args.get('year', type=int)
    sem   = request.args.get('semester', type=int)

    query = Course.query
    if level:
        query = query.filter_by(level=level)
    if year:
        query = query.filter_by(year=year)
    if sem:
        query = query.filter_by(semester=sem)

    courses = query.order_by(Course.level, Course.year, Course.semester, Course.code).all()
    return jsonify([c.to_dict() for c in courses])


@app.route('/api/announcements')
def api_announcements():
    announcements = Announcement.query.filter_by(active=1)\
                    .order_by(Announcement.date_posted.desc()).all()
    return jsonify([a.to_dict() for a in announcements])


@app.route('/api/teachers')
def api_teachers():
    teachers = Teacher.query.order_by(Teacher.name_en).all()
    return jsonify([t.to_dict() for t in teachers])


@app.route('/api/faqs')
def api_faqs():
    category = request.args.get('category')
    query = FAQ.query
    if category:
        query = query.filter_by(category=category)
    faqs = query.order_by(FAQ.category, FAQ.id).all()
    return jsonify([f.to_dict() for f in faqs])

@app.route('/api/faqs/<int:faq_id>')
def api_faq_single(faq_id):
    faq = FAQ.query.get_or_404(faq_id)
    return jsonify(faq.to_dict())

@app.route('/api/voice', methods=['POST'])
def api_voice():
    """Receive a voice command string and return the appropriate response."""
    data = request.get_json()
    cmd  = data.get('command', '').lower()
    response = process_voice_command(cmd)
    return jsonify(response)

@app.route('/api/remote/send', methods=['POST'])
def api_remote_send():
    import time
    data = request.get_json()
    remote_command['type']    = data.get('type')
    remote_command['cmd']     = data.get('cmd')
    remote_command['val']     = data.get('val')
    remote_command['command'] = data.get('command')
    remote_command['action']  = data.get('action')
    remote_command['dx']      = data.get('dx', 0)
    remote_command['dy']      = data.get('dy', 0)
    remote_command['ts']      = time.time()
    return jsonify({'status': 'ok'})

@app.route('/api/remote/poll')
def api_remote_poll():
    since = request.args.get('since', 0, type=float)
    if remote_command['ts'] > since:
        return jsonify(remote_command)
    return jsonify({'type': None, 'ts': remote_command['ts']})


@app.route('/api/stats')
def api_stats():
    return jsonify({
        'total_courses':        Course.query.count(),
        'total_teachers':       Teacher.query.count(),
        'active_announcements': Announcement.query.filter_by(active=1).count(),
        'total_faqs':           FAQ.query.count(),
    })


def extract_text_from_file(filepath, ext):
    """Turn an uploaded attachment into plain text for the AI to read.
    Returns '' (never raises) so a bad/corrupt file just results in an
    entry with no extracted text instead of crashing the upload."""
    ext = ext.lower()
    try:
        if ext == 'txt':
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()

        if ext == 'docx':
            doc = DocxDocument(filepath)
            return '\n'.join(p.text for p in doc.paragraphs if p.text.strip())

        if ext in ('jpg', 'jpeg', 'png', 'webp', 'bmp'):
            img = Image.open(filepath)
            return pytesseract.image_to_string(img, lang=OCR_LANGS)

        if ext == 'pdf':
            # First try: pull embedded text directly (fast, works for
            # any normal digitally-created PDF).
            reader = PdfReader(filepath)
            text_parts = [page.extract_text() or '' for page in reader.pages]
            direct_text = '\n'.join(text_parts).strip()

            # If that got almost nothing back, it's very likely a
            # scanned/photographed PDF with no real text layer — fall
            # back to rendering each page as an image and OCR-ing it.
            if len(direct_text) >= 40:
                return direct_text

            ocr_parts = []
            pdf_doc = fitz.open(filepath)
            page_count = min(len(pdf_doc), MAX_OCR_PAGES)
            for i in range(page_count):
                page = pdf_doc[i]
                pix = page.get_pixmap(dpi=200)
                img = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
                ocr_parts.append(pytesseract.image_to_string(img, lang=OCR_LANGS))
            pdf_doc.close()
            return '\n'.join(ocr_parts)

    except Exception as e:
        app.logger.error('Text extraction failed for %s: %s', filepath, e)

    return ''


def build_kiosk_context():
    """Pull a fresh snapshot of the department's real data from kiosk.db
    so Gemini answers from what's actually there right now — including
    anything just added or edited through the admin panel."""
    lines = []

    courses = Course.query.order_by(Course.level, Course.year, Course.semester, Course.code).all()
    lines.append('COURSES (%d total):' % len(courses))
    for c in courses:
        lines.append('- [%s / Year %s / Sem %s] %s — %s (%s)' % (
            c.level, c.year, c.semester, c.code, c.name, c.name_th or ''
        ))

    announcements = Announcement.query.filter_by(active=1)\
        .order_by(Announcement.date_posted.desc()).all()
    lines.append('\nANNOUNCEMENTS (%d active):' % len(announcements))
    for a in announcements:
        lines.append('- [%s, %s] %s: %s' % (a.tag, a.date_posted, a.title, a.body))

    teachers = Teacher.query.order_by(Teacher.name_en).all()
    lines.append('\nTEACHERS:')
    for t in teachers:
        contact = (' Email: %s.' % t.email) if t.show_contact and t.email else ''
        lines.append('- %s (%s), %s. Room %s. Office hours: %s. Teaches: %s.%s' % (
            t.name_en, t.name_th or '', t.position, t.room, t.office_hours, t.subjects, contact
        ))

    outcomes = StudyOutcome.query.order_by(StudyOutcome.level).all()
    lines.append('\nCAREER OUTCOMES:')
    for o in outcomes:
        lines.append('- [%s] %s (%s): %s' % (o.level, o.career, o.career_th or '', o.description))

    fees = ProgramFee.query.order_by(ProgramFee.level).all()
    lines.append('\nPROGRAM FEES:')
    for f in fees:
        lines.append('- [%s] %s (%s): ฿%s %s' % (f.level, f.item, f.item_th or '', f.amount, f.period))

    faqs = FAQ.query.order_by(FAQ.category).all()
    lines.append('\nFAQS:')
    for f in faqs:
        lines.append('- Q: %s (%s) | A: %s' % (f.question, f.question_th or '', f.answer))

    # Admin-only knowledge — never shown on the kiosk itself, only used
    # here to give the AI extra context beyond the visible sections above.
    knowledge = KnowledgeEntry.query.order_by(KnowledgeEntry.added_at.desc()).all()
    if knowledge:
        lines.append('\nADDITIONAL DEPARTMENT KNOWLEDGE (internal notes, not shown on the kiosk display):')
        for k in knowledge:
            text = k.combined_text()
            if text:
                lines.append('--- %s ---\n%s' % (k.title, text))

    return '\n'.join(lines)


@app.route('/api/ask', methods=['POST'])
def api_ask():
    """Voice assistant — takes a spoken question (already transcribed by
    the browser), answers using Claude/Gemini grounded in kiosk.db, and
    returns text for the frontend to display + speak aloud."""
    if gemini_client is None:
        return jsonify({'error': 'Voice assistant is not configured (missing GEMINI_API_KEY).'}), 503

    data = request.get_json(silent=True) or {}
    question = (data.get('question') or '').strip()
    lang = data.get('lang') or 'en'

    if not question:
        return jsonify({'error': 'No question provided.'}), 400

    context = build_kiosk_context()
    answer_lang = 'Thai' if lang == 'th' else 'English'

    system_prompt = (
        "You are the voice assistant for a touch-screen kiosk at the Digital Business "
        "Technology (DBT) department, IRPC Technological College, Rayong, Thailand. "
        "Answer ONLY using the department data provided below — do not invent courses, "
        "fees, names, or facts that aren't in it. If the answer isn't in the data, say so "
        "politely and suggest the person browse the kiosk menu or ask staff directly. "
        "Keep answers short and spoken-friendly (2-4 sentences) since this will be read "
        "aloud by text-to-speech. Respond in %s, regardless of what language the question "
        "was asked in.\n\n"
        "=== DEPARTMENT DATA ===\n%s"
    ) % (answer_lang, context)

    try:
        response = gemini_client.models.generate_content(
            model='gemini-3.6-flash',
            contents=[
                {'role': 'user', 'parts': [{'text': system_prompt + '\n\n=== QUESTION ===\n' + question}]}
            ],
        )
        answer_text = (response.text or '').strip()
        if not answer_text:
            answer_text = (
                'ขออภัย ไม่พบคำตอบสำหรับคำถามนี้' if lang == 'th'
                else "Sorry, I couldn't find an answer to that."
            )
        return jsonify({'answer': answer_text})

    except Exception as e:
        app.logger.error('Gemini call failed: %s', e)
        return jsonify({'error': 'The voice assistant is temporarily unavailable.'}), 502

@app.route('/api/menu')
def api_menu():
    """
    Returns the menu options available at a given navigation path.
    path is a dot-separated string like 'courses' or 'courses.vc' or 'courses.vc.1'
    """
    path = request.args.get('path', '')
    parts = path.split('.') if path else []

    # ── TOP LEVEL: 6 main buttons ──
    if len(parts) == 0:
        return jsonify({
            'title': 'Home',
            'type': 'menu',
            'options': [
                {'id': 'home',          'icon': '🏠', 'label': 'Home'},
                {'id': 'courses',       'icon': '📚', 'label': 'Courses'},
                {'id': 'announcements', 'icon': '📢', 'label': 'Notices'},
                {'id': 'profile',       'icon': '🏛️', 'label': 'Profile'},
                {'id': 'help',          'icon': '❓', 'label': 'Help'},
                {'id': 'settings',      'icon': '⚙️', 'label': 'Settings'},
            ]
        })

    # ── COURSES > [VC / HVC] ──
    if parts[0] == 'courses' and len(parts) == 1:
        return jsonify({
            'title': 'Courses — Select Program',
            'type': 'menu',
            'parent': '',
            'options': [
                {'id': 'vc',  'icon': '🎓', 'label': 'Vocational Certificate (VC)'},
                {'id': 'hvc', 'icon': '🏅', 'label': 'High Vocational Certificate (HVC)'},
            ]
        })

    # ── COURSES > VC/HVC > [Year 1, 2, 3] ──
    if parts[0] == 'courses' and len(parts) == 2:
        level = parts[1]
        years = [1, 2, 3] if level == 'vc' else [1, 2]
        label_prefix = 'VC' if level == 'vc' else 'HVC'
        return jsonify({
            'title': label_prefix + ' — Select Year',
            'type': 'menu',
            'parent': 'courses',
            'options': [{'id': str(y), 'icon': '📅', 'label': 'Year ' + str(y)} for y in years]
        })

    # ── COURSES > VC/HVC > Year > [Semester 1, 2] ──
    if parts[0] == 'courses' and len(parts) == 3:
        level = parts[1]
        year  = parts[2]
        return jsonify({
            'title': level.upper() + ' Year ' + year + ' — Select Semester',
            'type': 'menu',
            'parent': 'courses.' + level,
            'options': [
                {'id': '1', 'icon': '1️⃣', 'label': 'Semester 1'},
                {'id': '2', 'icon': '2️⃣', 'label': 'Semester 2'},
            ]
        })

    # ── COURSES > VC/HVC > Year > Semester > SHOW RESULT ──
    if parts[0] == 'courses' and len(parts) == 4:
        level = parts[1]
        year  = int(parts[2])
        sem   = int(parts[3])
        return jsonify({
            'title': level.upper() + ' Year ' + str(year) + ' Semester ' + str(sem),
            'type': 'result',
            'resultType': 'courses',
            'parent': 'courses.' + level + '.' + str(year),
            'filter': {'level': level, 'year': year, 'semester': sem}
        })

    # ── ANNOUNCEMENTS — direct result, no sub-menu ──
    if parts[0] == 'announcements':
        return jsonify({
            'title': 'Announcements',
            'type': 'result',
            'resultType': 'announcements',
            'parent': ''
        })

    # ── PROFILE > [Department Info / Study Outcomes / Fees / Teachers] ──
    if parts[0] == 'profile' and len(parts) == 1:
        return jsonify({
            'title': 'Profile — Select Section',
            'type': 'menu',
            'parent': '',
            'options': [
                {'id': 'dept',     'icon': '🏛️', 'label': 'Department Info'},
                {'id': 'outcomes', 'icon': '🎯', 'label': 'Study Outcomes'},
                {'id': 'fees',     'icon': '💰', 'label': 'Program Fees'},
                {'id': 'teachers', 'icon': '👨‍🏫', 'label': 'Teachers & Staff'},
            ]
        })

    # ── PROFILE > outcomes/fees > [VC / HVC] ──
    if parts[0] == 'profile' and len(parts) == 2 and parts[1] in ('outcomes', 'fees'):
        return jsonify({
            'title': ('Study Outcomes' if parts[1] == 'outcomes' else 'Program Fees') + ' — Select Program',
            'type': 'menu',
            'parent': 'profile',
            'options': [
                {'id': 'vc',  'icon': '🎓', 'label': 'Vocational Certificate (VC)'},
                {'id': 'hvc', 'icon': '🏅', 'label': 'High Vocational Certificate (HVC)'},
            ]
        })

    # ── PROFILE > outcomes/fees > VC/HVC > SHOW RESULT ──
    if parts[0] == 'profile' and len(parts) == 3 and parts[1] in ('outcomes', 'fees'):
        return jsonify({
            'title': ('Study Outcomes' if parts[1] == 'outcomes' else 'Program Fees') + ' — ' + parts[2].upper(),
            'type': 'result',
            'resultType': parts[1],
            'parent': 'profile.' + parts[1],
            'filter': {'level': parts[2]}
        })

    # ── PROFILE > dept / teachers — direct result ──
    if parts[0] == 'profile' and len(parts) == 2 and parts[1] in ('dept', 'teachers'):
        return jsonify({
            'title': 'Department Info' if parts[1] == 'dept' else 'Teachers & Staff',
            'type': 'result',
            'resultType': parts[1],
            'parent': 'profile'
        })

    # ── HELP — direct result ──
    if parts[0] == 'help':
        return jsonify({
            'title': 'Help & FAQs',
            'type': 'result',
            'resultType': 'help',
            'parent': ''
        })

    # ── HOME — direct result ──
    if parts[0] == 'home':
        return jsonify({
            'title': 'Home',
            'type': 'result',
            'resultType': 'home',
            'parent': ''
        })

    # ── SETTINGS — direct result ──
    if parts[0] == 'settings':
        return jsonify({
            'title': 'Settings',
            'type': 'result',
            'resultType': 'settings',
            'parent': ''
        })

    return jsonify({'title': 'Not Found', 'type': 'menu', 'options': []})

@app.route('/api/outcomes')
def api_outcomes():
    level = request.args.get('level')
    query = StudyOutcome.query
    if level:
        query = query.filter_by(level=level)
    return jsonify([o.to_dict() for o in query.order_by(StudyOutcome.level, StudyOutcome.id).all()])


@app.route('/api/fees')
def api_fees():
    level = request.args.get('level')
    query = ProgramFee.query
    if level:
        query = query.filter_by(level=level)
    return jsonify([f.to_dict() for f in query.order_by(ProgramFee.level, ProgramFee.id).all()])

# ─────────────────────────────────────────────
#  ADMIN ROUTES — password protected
# ─────────────────────────────────────────────

@app.route('/admin')
def admin():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    stats = {
        'courses':       Course.query.count(),
        'announcements': Announcement.query.filter_by(active=1).count(),
        'teachers':      Teacher.query.count(),
        'faqs':          FAQ.query.count(),
        'knowledge':     KnowledgeEntry.query.count(),
    }
    return render_template('admin.html', stats=stats)


@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    error = None
    if request.method == 'POST':
        if request.form.get('password') == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin'))
        error = 'Incorrect password. Please try again.'
    return render_template('admin_login.html', error=error)


@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('main'))


# --- Announcements CRUD ---

@app.route('/admin/announcements/add', methods=['POST'])
def admin_add_announcement():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    ann = Announcement(
        title       = data.get('title', ''),
        title_th    = data.get('title_th', ''),
        body        = data.get('body', ''),
        body_th     = data.get('body_th', ''),
        tag         = data.get('tag', 'GENERAL'),
        image_path  = data.get('image_path', ''),
        date_posted = datetime.now().strftime('%B %d, %Y'),
        active      = 1
    )
    db.session.add(ann)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': ann.id})

@app.route('/admin/announcements/delete/<int:ann_id>', methods=['POST'])
def admin_delete_announcement(ann_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    ann = Announcement.query.get_or_404(ann_id)
    ann.active = 0
    db.session.commit()
    return jsonify({'status': 'ok'})

@app.route('/admin/announcements/edit/<int:ann_id>', methods=['POST'])
def admin_edit_announcement(ann_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    ann  = Announcement.query.get_or_404(ann_id)
    data = request.get_json()
    ann.title      = data.get('title',      ann.title)
    ann.title_th   = data.get('title_th',   ann.title_th)
    ann.body       = data.get('body',        ann.body)
    ann.body_th    = data.get('body_th',     ann.body_th)
    ann.tag        = data.get('tag',         ann.tag)
    ann.image_path = data.get('image_path',  ann.image_path)
    db.session.commit()
    return jsonify({'status': 'ok'})

@app.route('/admin/announcements/upload-image', methods=['POST'])
def admin_upload_image():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    if 'image' not in request.files:
        return jsonify({'error': 'No file'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    allowed = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({'error': 'Invalid file type'}), 400
    filename = str(uuid.uuid4()) + '.' + ext
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    return jsonify({'status': 'ok', 'path': '/static/uploads/' + filename})


# --- Study Outcomes CRUD ---

@app.route('/admin/outcomes/add', methods=['POST'])
def admin_add_outcome():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    outcome = StudyOutcome(
        level       = data.get('level', 'vc'),
        career      = data.get('career', ''),
        career_th   = data.get('career_th', ''),
        description = data.get('description', ''),
        desc_th     = data.get('desc_th', '')
    )
    db.session.add(outcome)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': outcome.id})


@app.route('/admin/outcomes/delete/<int:oid>', methods=['POST'])
def admin_delete_outcome(oid):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    outcome = StudyOutcome.query.get_or_404(oid)
    db.session.delete(outcome)
    db.session.commit()
    return jsonify({'status': 'ok'})

@app.route('/admin/outcomes/edit/<int:oid>', methods=['POST'])
def admin_edit_outcome(oid):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    o    = StudyOutcome.query.get_or_404(oid)
    data = request.get_json()
    o.level       = data.get('level',       o.level)
    o.career      = data.get('career',      o.career)
    o.career_th   = data.get('career_th',   o.career_th)
    o.description = data.get('description', o.description)
    o.desc_th     = data.get('desc_th',     o.desc_th)
    db.session.commit()
    return jsonify({'status': 'ok'})

# --- Program Fees CRUD ---

@app.route('/admin/fees/add', methods=['POST'])
def admin_add_fee():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    fee = ProgramFee(
        level   = data.get('level', 'vc'),
        item    = data.get('item', ''),
        item_th = data.get('item_th', ''),
        amount  = data.get('amount', 0),
        period  = data.get('period', 'per semester'),
        note    = data.get('note', '')
    )
    db.session.add(fee)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': fee.id})

@app.route('/admin/fees/edit/<int:fid>', methods=['POST'])
def admin_edit_fee(fid):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    f    = ProgramFee.query.get_or_404(fid)
    data = request.get_json()
    f.level   = data.get('level',   f.level)
    f.item    = data.get('item',    f.item)
    f.item_th = data.get('item_th', f.item_th)
    f.amount  = data.get('amount',  f.amount)
    f.period  = data.get('period',  f.period)
    f.note    = data.get('note',    f.note)
    db.session.commit()
    return jsonify({'status': 'ok'})

@app.route('/admin/fees/delete/<int:fid>', methods=['POST'])
def admin_delete_fee(fid):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    fee = ProgramFee.query.get_or_404(fid)
    db.session.delete(fee)
    db.session.commit()
    return jsonify({'status': 'ok'})

# --- Teachers CRUD ---

@app.route('/admin/teachers/add', methods=['POST'])
def admin_add_teacher():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    teacher = Teacher(
        name_en      = data.get('name_en', ''),
        name_th      = data.get('name_th', ''),
        position     = data.get('position', ''),
        room         = data.get('room', ''),
        email        = data.get('email', ''),
        office_hours = data.get('office_hours', ''),
        subjects     = data.get('subjects', ''),
        languages    = data.get('languages', ''),
        message      = data.get('message', ''),
        show_contact = data.get('show_contact', 1)
    )
    db.session.add(teacher)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': teacher.id})


@app.route('/admin/teachers/delete/<int:teacher_id>', methods=['POST'])
def admin_delete_teacher(teacher_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    teacher = Teacher.query.get_or_404(teacher_id)
    db.session.delete(teacher)
    db.session.commit()
    return jsonify({'status': 'ok'})

@app.route('/admin/teachers/edit/<int:teacher_id>', methods=['POST'])
def admin_edit_teacher(teacher_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    t    = Teacher.query.get_or_404(teacher_id)
    data = request.get_json()
    t.name_en      = data.get('name_en',      t.name_en)
    t.name_th      = data.get('name_th',      t.name_th)
    t.position     = data.get('position',     t.position)
    t.room         = data.get('room',         t.room)
    t.email        = data.get('email',        t.email)
    t.office_hours = data.get('office_hours', t.office_hours)
    t.subjects     = data.get('subjects',     t.subjects)
    t.languages    = data.get('languages',    t.languages)
    t.message      = data.get('message',      t.message)
    t.show_contact = data.get('show_contact', t.show_contact)
    db.session.commit()
    return jsonify({'status': 'ok'})

# --- Courses CRUD ---

@app.route('/admin/courses/add', methods=['POST'])
def admin_add_course():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    course = Course(
        code       = data.get('code', ''),
        name       = data.get('name', ''),
        name_th    = data.get('name_th', ''),
        level      = data.get('level', 'vc'),
        year       = data.get('year', 1),
        semester   = data.get('semester', 1),
        group_type = data.get('group_type', 'core'),
        group_name = data.get('group_name', '')
    )
    db.session.add(course)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': course.id})


@app.route('/admin/courses/delete/<int:course_id>', methods=['POST'])
def admin_delete_course(course_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({'status': 'ok'})

@app.route('/admin/courses/edit/<int:course_id>', methods=['POST'])
def admin_edit_course(course_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    course = Course.query.get_or_404(course_id)
    data   = request.get_json()
    course.code       = data.get('code',       course.code)
    course.name       = data.get('name',       course.name)
    course.name_th    = data.get('name_th',    course.name_th)
    course.level      = data.get('level',      course.level)
    course.year       = data.get('year',       course.year)
    course.semester   = data.get('semester',   course.semester)
    course.group_type = data.get('group_type', course.group_type)
    course.group_name = data.get('group_name', course.group_name)
    db.session.commit()
    return jsonify({'status': 'ok'})

# --- FAQs CRUD ---

@app.route('/admin/faqs/add', methods=['POST'])
def admin_add_faq():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    faq = FAQ(
        question    = data.get('question', ''),
        question_th = data.get('question_th', ''),
        answer      = data.get('answer', ''),
        answer_th   = data.get('answer_th', ''),
        category    = data.get('category', 'General')
    )
    db.session.add(faq)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': faq.id})


@app.route('/admin/faqs/delete/<int:faq_id>', methods=['POST'])
def admin_delete_faq(faq_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    faq = FAQ.query.get_or_404(faq_id)
    db.session.delete(faq)
    db.session.commit()
    return jsonify({'status': 'ok'})

@app.route('/admin/faqs/edit/<int:faq_id>', methods=['POST'])
def admin_edit_faq(faq_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    faq  = FAQ.query.get_or_404(faq_id)
    data = request.get_json()
    faq.question    = data.get('question',    faq.question)
    faq.question_th = data.get('question_th', faq.question_th)
    faq.answer      = data.get('answer',      faq.answer)
    faq.answer_th   = data.get('answer_th',   faq.answer_th)
    faq.category    = data.get('category',    faq.category)
    db.session.commit()
    return jsonify({'status': 'ok'})


# ─────────────────────────────────────────────
#  AI KNOWLEDGE — admin-only, feeds /api/ask context.
#  Lives as a tab inside admin.html (not a separate page). Never exposed
#  on any public /api/ route, never rendered in main.html.
# ─────────────────────────────────────────────

KNOWLEDGE_ALLOWED_EXT = {'txt', 'pdf', 'docx', 'jpg', 'jpeg', 'png', 'webp', 'bmp'}

@app.route('/admin/knowledge/list')
def admin_knowledge_list():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    entries = KnowledgeEntry.query.order_by(KnowledgeEntry.added_at.desc()).all()
    return jsonify([e.to_dict() for e in entries])


@app.route('/admin/knowledge/add', methods=['POST'])
def admin_add_knowledge():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401

    title   = (request.form.get('title') or '').strip()
    content = (request.form.get('content') or '').strip()
    if not title:
        return jsonify({'error': 'Title is required.'}), 400
    if not content and 'file' not in request.files:
        return jsonify({'error': 'Add some text or attach a file.'}), 400

    file_path = ''
    file_name = ''
    extracted_text = ''

    file = request.files.get('file')
    if file and file.filename:
        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
        if ext not in KNOWLEDGE_ALLOWED_EXT:
            return jsonify({'error': 'Unsupported file type: .%s' % ext}), 400

        saved_name = str(uuid.uuid4()) + '.' + ext
        saved_path = os.path.join(app.config['KNOWLEDGE_FOLDER'], saved_name)
        file.save(saved_path)

        file_path = saved_path
        file_name = file.filename
        extracted_text = extract_text_from_file(saved_path, ext)

    entry = KnowledgeEntry(
        title          = title,
        content        = content,
        file_path      = file_path,
        file_name      = file_name,
        extracted_text = extracted_text,
        added_at       = datetime.now().strftime('%B %d, %Y %H:%M'),
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({
        'status': 'ok',
        'id': entry.id,
        'extracted_chars': len(extracted_text),
        'warning': 'No text could be read from this file — it was saved, but the AI has nothing to learn from it yet.' if (file and file.filename and not extracted_text) else None
    })


@app.route('/admin/knowledge/delete/<int:entry_id>', methods=['POST'])
def admin_delete_knowledge(entry_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    entry = KnowledgeEntry.query.get_or_404(entry_id)
    if entry.file_path and os.path.exists(entry.file_path):
        try:
            os.remove(entry.file_path)
        except OSError:
            pass
    db.session.delete(entry)
    db.session.commit()
    return jsonify({'status': 'ok'})


# ─────────────────────────────────────────────
#  VOICE COMMAND PROCESSOR
# ─────────────────────────────────────────────

def process_voice_command(cmd):
    cmd = cmd.lower().strip()

    if any(w in cmd for w in ['home', 'main', 'start', 'หน้าหลัก']):
        return {'action': 'navigate', 'page': 'home', 'speak': 'Going to the Home page.'}

    if any(w in cmd for w in ['course', 'curriculum', 'subject', 'class', 'รายวิชา', 'หลักสูตร']):
        if any(w in cmd for w in ['year 1', 'first year', 'ปีที่ 1', 'ปวช 1']):
            return {'action': 'navigate', 'page': 'courses', 'filter': {'year': 1},
                    'speak': 'Showing Year 1 curriculum.'}
        if any(w in cmd for w in ['year 2', 'second year', 'ปีที่ 2', 'ปวช 2']):
            return {'action': 'navigate', 'page': 'courses', 'filter': {'year': 2},
                    'speak': 'Showing Year 2 curriculum.'}
        if any(w in cmd for w in ['year 3', 'third year', 'ปีที่ 3', 'ปวช 3']):
            return {'action': 'navigate', 'page': 'courses', 'filter': {'year': 3},
                    'speak': 'Showing Year 3 curriculum.'}
        if any(w in cmd for w in ['hvc', 'high voc', 'diploma', 'ปวส']):
            return {'action': 'navigate', 'page': 'courses', 'filter': {'level': 'hvc'},
                    'speak': 'Showing High Vocational Certificate curriculum.'}
        if any(w in cmd for w in ['vc', 'voc cert', 'certificate', 'ปวช']):
            return {'action': 'navigate', 'page': 'courses', 'filter': {'level': 'vc'},
                    'speak': 'Showing Vocational Certificate curriculum.'}
        return {'action': 'navigate', 'page': 'courses', 'speak': 'Showing the full curriculum map.'}

    if any(w in cmd for w in ['announce', 'notice', 'news', 'update', 'ประกาศ', 'ข่าว']):
        return {'action': 'navigate', 'page': 'announcements', 'speak': 'Showing department announcements.'}

    if any(w in cmd for w in ['teacher', 'staff', 'profile', 'department', 'ครู', 'อาจารย์', 'แผนก']):
        return {'action': 'navigate', 'page': 'profile', 'speak': 'Showing department profile and teacher information.'}

    if any(w in cmd for w in ['help', 'faq', 'question', 'ช่วย', 'คำถาม']):
        return {'action': 'navigate', 'page': 'help', 'speak': 'Showing frequently asked questions.'}

    if any(w in cmd for w in ['setting', 'config', 'ตั้งค่า']):
        return {'action': 'navigate', 'page': 'settings', 'speak': 'Opening settings.'}

    faqs = FAQ.query.all()
    for faq in faqs:
        keywords = faq.question.lower().split()
        if any(k in cmd for k in keywords if len(k) > 3):
            return {'action': 'answer', 'page': 'help', 'speak': faq.answer}

    return {
        'action': 'unknown',
        'speak':  'Sorry, I did not understand. Please try saying: Courses, Announcements, Teachers, or Help.'
    }


# ─────────────────────────────────────────────
#  STARTUP
# ─────────────────────────────────────────────

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        from seed import seed_database
        if Course.query.count() == 0:
            seed_database()
            print('✅ Database seeded with curriculum data.')
        else:
            print('✅ Database already has data, skipping seed.')

    print('🚀 Smart Kiosk starting on http://0.0.0.0:5000')
    print('   Main display  → http://localhost:5000/')
    print('   Control panel → http://localhost:5000/control')
    print('   Admin panel   → http://localhost:5000/admin')
    app.run(host='0.0.0.0', port=5000, debug=False)