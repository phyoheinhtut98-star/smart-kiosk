"""
Database models for Smart Digital Information Board Kiosk
All tables stored locally in kiosk.db (SQLite) on the SD card.
Department of Computer and Digital Business — IRPC Technological College
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Course(db.Model):
    __tablename__ = 'courses'

    id          = db.Column(db.Integer, primary_key=True)
    code        = db.Column(db.String(20), nullable=False)
    name        = db.Column(db.String(200), nullable=False)
    name_th     = db.Column(db.String(200), default='')
    level       = db.Column(db.String(10), nullable=False)   # 'vc' or 'hvc'
    year        = db.Column(db.Integer, nullable=False)       # 1, 2, or 3
    semester    = db.Column(db.Integer, nullable=False)       # 1 or 2
    group_type  = db.Column(db.String(20), default='core')   # core, elective, extra
    group_name  = db.Column(db.String(100), default='')

    def to_dict(self):
        return {
            'id':         self.id,
            'code':       self.code,
            'name':       self.name,
            'name_th':    self.name_th,
            'level':      self.level,
            'year':       self.year,
            'semester':   self.semester,
            'group_type': self.group_type,
            'group_name': self.group_name,
        }


class Announcement(db.Model):
    __tablename__ = 'announcements'

    id          = db.Column(db.Integer, primary_key=True)
    title       = db.Column(db.String(200), nullable=False)
    title_th    = db.Column(db.String(200), default='')
    body        = db.Column(db.Text, nullable=False)
    body_th     = db.Column(db.Text, default='')
    tag         = db.Column(db.String(20), default='GENERAL')
    date_posted = db.Column(db.String(50), default='')
    active      = db.Column(db.Integer, default=1)
    image_path  = db.Column(db.String(300), default='')

    def to_dict(self):
        return {
            'id':          self.id,
            'title':       self.title,
            'title_th':    self.title_th,
            'body':        self.body,
            'body_th':     self.body_th,
            'tag':         self.tag,
            'date_posted': self.date_posted,
            'image_path':  self.image_path,
        }


class Teacher(db.Model):
    __tablename__ = 'teachers'

    id           = db.Column(db.Integer, primary_key=True)
    name_en      = db.Column(db.String(100), nullable=False)
    name_th      = db.Column(db.String(100), default='')
    position     = db.Column(db.String(100), default='')
    room         = db.Column(db.String(50), default='')
    email        = db.Column(db.String(100), default='')
    office_hours = db.Column(db.String(200), default='')
    subjects     = db.Column(db.Text, default='')
    languages    = db.Column(db.String(100), default='')
    message      = db.Column(db.Text, default='')
    photo_path   = db.Column(db.String(200), default='')
    show_contact = db.Column(db.Integer, default=1)

    def to_dict(self):
        return {
            'id':           self.id,
            'name_en':      self.name_en,
            'name_th':      self.name_th,
            'position':     self.position,
            'room':         self.room,
            'email':        self.email if self.show_contact else '',
            'office_hours': self.office_hours,
            'subjects':     self.subjects,
            'languages':    self.languages,
            'message':      self.message,
            'photo_path':   self.photo_path,
        }


class FAQ(db.Model):
    __tablename__ = 'faqs'

    id          = db.Column(db.Integer, primary_key=True)
    question    = db.Column(db.String(300), nullable=False)
    question_th = db.Column(db.String(300), default='')
    answer      = db.Column(db.Text, nullable=False)
    answer_th   = db.Column(db.Text, default='')
    category    = db.Column(db.String(50), default='General')

    def to_dict(self):
        return {
            'id':          self.id,
            'question':    self.question,
            'question_th': self.question_th,
            'answer':      self.answer,
            'answer_th':   self.answer_th,
            'category':    self.category,
        }
    
class StudyOutcome(db.Model):
    __tablename__ = 'study_outcomes'

    id          = db.Column(db.Integer, primary_key=True)
    level       = db.Column(db.String(10), nullable=False)  # 'vc' or 'hvc'
    career      = db.Column(db.String(200), nullable=False)
    career_th   = db.Column(db.String(200), default='')
    description = db.Column(db.Text, default='')
    desc_th     = db.Column(db.Text, default='')

    def to_dict(self):
        return {
            'id':          self.id,
            'level':       self.level,
            'career':      self.career,
            'career_th':   self.career_th,
            'description': self.description,
            'desc_th':     self.desc_th,
        }


class ProgramFee(db.Model):
    __tablename__ = 'program_fees'

    id          = db.Column(db.Integer, primary_key=True)
    level       = db.Column(db.String(10), nullable=False)  # 'vc' or 'hvc'
    item        = db.Column(db.String(200), nullable=False)
    item_th     = db.Column(db.String(200), default='')
    amount      = db.Column(db.Float, nullable=False)
    period      = db.Column(db.String(50), default='per semester')
    note        = db.Column(db.String(200), default='')

    def to_dict(self):
        return {
            'id':      self.id,
            'level':   self.level,
            'item':    self.item,
            'item_th': self.item_th,
            'amount':  self.amount,
            'period':  self.period,
            'note':    self.note,
        }


class KnowledgeEntry(db.Model):
    """Admin-only knowledge fed to the AI voice/text assistant.
    NEVER exposed through a public /api/ route and NEVER rendered in
    main.html — this exists purely to give /api/ask extra context that
    isn't part of the kiosk's visible courses/fees/FAQs/etc."""
    __tablename__ = 'knowledge_entries'

    id            = db.Column(db.Integer, primary_key=True)
    title         = db.Column(db.String(200), nullable=False)
    content       = db.Column(db.Text, default='')       # typed directly by admin
    file_path     = db.Column(db.String(300), default='')  # original file, kept for reference/re-download
    file_name     = db.Column(db.String(200), default='')  # original filename shown in admin UI
    extracted_text= db.Column(db.Text, default='')       # text pulled from the attachment (typed or OCR'd)
    added_at      = db.Column(db.String(50), default='')

    def to_dict(self):
        return {
            'id':         self.id,
            'title':      self.title,
            'content':    self.content,
            'file_name':  self.file_name,
            'has_file':   bool(self.file_path),
            'added_at':   self.added_at,
        }

    def combined_text(self):
        """What actually gets fed to the AI: typed notes + extracted file text."""
        parts = []
        if self.content:
            parts.append(self.content.strip())
        if self.extracted_text:
            parts.append(self.extracted_text.strip())
        return '\n\n'.join(parts)