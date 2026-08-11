"""
Seed file — populates kiosk.db with all real curriculum data
from the DBT department curriculum posters (VC Year 1-3, HVC Year 1-2).
Runs automatically on first launch via app.py.
"""

from database import db, Course, Announcement, Teacher, FAQ, StudyOutcome, ProgramFee

def seed_database():

    # ─────────────────────────────────────────────
    #  COURSES — Vocational Certificate (VC)
    # ─────────────────────────────────────────────

    vc_courses = [

        # ── VC Year 1 Semester 1 ──────────────────
        ('20000-1101', 'Thai Language for Communication',          'ภาษาไทยเพื่อการสื่อสาร',                    'vc', 1, 1, 'core',     'Language & Communication'),
        ('20000-1201', 'English for Communication',                'ภาษาอังกฤษเพื่อการสื่อสาร',                 'vc', 1, 1, 'core',     'Language & Communication'),
        ('20000-1301', 'Basic Science for Careers',                'วิทยาศาสตร์พื้นฐานเพื่องานอาชีพ',           'vc', 1, 1, 'core',     'Thinking & Problem-Solving'),
        ('20000-1401', 'Basic Mathematics for Careers',            'คณิตศาสตร์พื้นฐานเพื่องานอาชีพ',           'vc', 1, 1, 'core',     'Thinking & Problem-Solving'),
        ('20000-1501', 'Civic Duties and Morality',                'หน้าที่พลเมืองและศีลธรรม',                  'vc', 1, 1, 'core',     'Social and Life'),
        ('20001-1003', 'Introduction to Business',                 'ธุรกิจเบื้องต้น',                            'vc', 1, 1, 'core',     'Basic Vocational'),
        ('20001-1004', 'Labor Law',                                'กฎหมายแรงงาน',                              'vc', 1, 1, 'core',     'Basic Vocational'),
        ('20001-1005', 'Using Digital Technology for Careers',     'การใช้เทคโนโลยีดิจิทัลในงานอาชีพ',         'vc', 1, 1, 'core',     'Basic Vocational'),
        ('21910-2001', 'Computer Operating Systems',               'ระบบปฏิบัติการคอมพิวเตอร์',                 'vc', 1, 1, 'core',     'Specific Vocational'),
        ('21910-2004', 'Word Processing Programs',                 'โปรแกรมประมวลผลคำ',                         'vc', 1, 1, 'core',     'Specific Vocational'),
        ('21910-2006', 'Presentation Programs',                    'โปรแกรมนำเสนองาน',                          'vc', 1, 1, 'core',     'Specific Vocational'),
        ('20000-2001', 'Rover Scout Activities 1',                 'กิจกรรมลูกเสือวิสามัญ 1',                   'vc', 1, 1, 'extra',    'Extra-Curricular'),

        # ── VC Year 1 Semester 2 ──────────────────
        ('20000-1102', 'Thai Language for Careers',                'ภาษาไทยเพื่อสัมฤทธิผลทางอาชีพ',            'vc', 1, 2, 'core',     'Language & Communication'),
        ('20000-1203', 'English Listening and Speaking',           'ภาษาอังกฤษฟัง-พูด',                        'vc', 1, 2, 'core',     'Language & Communication'),
        ('20000-1303', 'Science for Business and Service Careers', 'วิทยาศาสตร์เพื่องานธุรกิจและบริการ',       'vc', 1, 2, 'core',     'Thinking & Problem-Solving'),
        ('20001-1002', 'Sustainable Development',                  'การพัฒนาที่ยั่งยืน',                        'vc', 1, 2, 'core',     'Basic Vocational'),
        ('21910-1003', 'Introduction to Computer Programming',     'การเขียนโปรแกรมคอมพิวเตอร์เบื้องต้น',      'vc', 1, 2, 'core',     'Basic Vocational'),
        ('21910-2002', 'Internet in Digital Business',             'อินเทอร์เน็ตในธุรกิจดิจิทัล',              'vc', 1, 2, 'core',     'Specific Vocational'),
        ('21910-2008', 'Digital Media Production',                 'การผลิตสื่อดิจิทัล',                        'vc', 1, 2, 'core',     'Specific Vocational'),
        ('21910-2013', 'Computer Network Systems',                 'ระบบเครือข่ายคอมพิวเตอร์',                  'vc', 1, 2, 'core',     'Specific Vocational'),
        ('21910-2014', 'Animation Creation Programs',              'โปรแกรมสร้างงานแอนิเมชัน',                 'vc', 1, 2, 'core',     'Specific Vocational'),
        ('20000-1404', 'Business and Service Mathematics',         'คณิตศาสตร์ธุรกิจและบริการ',                'vc', 1, 2, 'elective', 'Elective'),
        ('20000-2002', 'Rover Scout Activities 2',                 'กิจกรรมลูกเสือวิสามัญ 2',                   'vc', 1, 2, 'extra',    'Extra-Curricular'),

        # ── VC Year 2 Semester 1 ──────────────────
        ('20000-1104', 'Using Thai Language in the Digital Age',   'การใช้ภาษาไทยในยุคดิจิทัล',                'vc', 2, 1, 'core',     'Language & Communication'),
        ('20000-1219', 'English for Business',                     'ภาษาอังกฤษธุรกิจ',                         'vc', 2, 1, 'core',     'Language & Communication'),
        ('20001-1001', 'Health, Safety and Environment',           'อาชีวอนามัยและความปลอดภัย',                'vc', 2, 1, 'core',     'Basic Vocational'),
        ('21900-2301', 'Digital Business Fundamentals',            'ธุรกิจดิจิทัลเบื้องต้น',                   'vc', 2, 1, 'core',     'Basic Vocational'),
        ('21910-2003', 'Art Elements for Graphic Work',            'องค์ประกอบศิลป์สำหรับงานกราฟิก',           'vc', 2, 1, 'core',     'Specific Vocational'),
        ('21910-2010', 'Computer Language Programming',            'การเขียนโปรแกรมภาษาคอมพิวเตอร์',           'vc', 2, 1, 'core',     'Specific Vocational'),
        ('21910-2012', 'Database Programs',                        'โปรแกรมฐานข้อมูล',                         'vc', 2, 1, 'core',     'Specific Vocational'),
        ('21910-2015', 'Multimedia Programs',                      'โปรแกรมมัลติมีเดีย',                        'vc', 2, 1, 'core',     'Specific Vocational'),
        ('21910-2020', 'Statistical Software Programs',            'โปรแกรมสถิติ',                              'vc', 2, 1, 'elective', 'Elective'),
        ('20000-2003', 'Integrity Building and Volunteer Activities','กิจกรรมเสริมสร้างคุณธรรม',               'vc', 2, 1, 'extra',    'Extra-Curricular'),

        # ── VC Year 2 Semester 2 ──────────────────
        ('20000-1204', 'English for Workplace',                    'ภาษาอังกฤษในสถานประกอบการ',                'vc', 2, 2, 'core',     'Language & Communication'),
        ('20000-1502', 'Thai History',                             'ประวัติศาสตร์ชาติไทย',                      'vc', 2, 2, 'core',     'Social and Life'),
        ('21900-2305', 'Electronic Transaction Law',               'กฎหมายธุรกรรมอิเล็กทรอนิกส์',              'vc', 2, 2, 'core',     'Basic Vocational'),
        ('21910-2005', 'Spreadsheet Programs',                     'โปรแกรมตารางคำนวณ',                        'vc', 2, 2, 'core',     'Specific Vocational'),
        ('21910-2007', 'Graphic Programs for Digital Media Creation','โปรแกรมกราฟิกสร้างสื่อดิจิทัล',         'vc', 2, 2, 'core',     'Specific Vocational'),
        ('21910-2011', 'Introduction to Object-Oriented Programming','การเขียนโปรแกรมเชิงวัตถุเบื้องต้น',     'vc', 2, 2, 'core',     'Specific Vocational'),
        ('21910-2016', 'Website Creation for Digital Business',    'การสร้างเว็บไซต์เพื่อธุรกิจดิจิทัล',      'vc', 2, 2, 'core',     'Specific Vocational'),
        ('21910-2019', 'Computer Installation and Service',        'การติดตั้งและบำรุงรักษาคอมพิวเตอร์',       'vc', 2, 2, 'elective', 'Elective'),
        ('21910-2021', 'Motion Graphics Media',                    'สื่อโมชันกราฟิก',                          'vc', 2, 2, 'elective', 'Elective'),
        ('20000-2004', 'Vocational Organization Activities 1',     'กิจกรรมองค์การวิชาชีพ 1',                  'vc', 2, 2, 'extra',    'Extra-Curricular'),

        # ── VC Year 3 Semester 1 ──────────────────
        ('21910-2018', 'Computer and Maintenance',                 'คอมพิวเตอร์และการบำรุงรักษา',              'vc', 3, 1, 'core',     'Specific Vocational'),
        ('20000-2007', 'Workplace Activities 1 (Internship)',      'กิจกรรมในสถานประกอบการ 1',                 'vc', 3, 1, 'extra',    'Extra-Curricular'),

        # ── VC Year 3 Semester 2 ──────────────────
        ('20000-1202', 'English for Integrated Vocational Projects','ภาษาอังกฤษเพื่อโครงงานวิชาชีพ',          'vc', 3, 2, 'core',     'Language & Communication'),
        ('20000-1221', 'English for Work Readiness Preparation',   'ภาษาอังกฤษเพื่อเตรียมความพร้อม',          'vc', 3, 2, 'core',     'Language & Communication'),
        ('20000-1601', 'Life Skills for Well-Being Development',   'ทักษะชีวิตเพื่อพัฒนาความเป็นอยู่ที่ดี',  'vc', 3, 2, 'core',     'Social and Life'),
        ('21910-1002', 'Business Requirements Analysis',           'การวิเคราะห์ความต้องการทางธุรกิจ',        'vc', 3, 2, 'core',     'Basic Vocational'),
        ('21910-1004', 'Introduction to E-Commerce',               'พาณิชย์อิเล็กทรอนิกส์เบื้องต้น',          'vc', 3, 2, 'core',     'Basic Vocational'),
        ('21910-2017', 'Introduction to Mobile Application Development','การพัฒนาแอปพลิเคชันมือถือเบื้องต้น', 'vc', 3, 2, 'core',     'Specific Vocational'),
        ('21910-2022', 'Digital Business Technology Projects',     'โครงงานเทคโนโลยีธุรกิจดิจิทัล',           'vc', 3, 2, 'core',     'Specific Vocational'),
        ('20000-2005', 'Vocational Organization Activities 2',     'กิจกรรมองค์การวิชาชีพ 2',                  'vc', 3, 2, 'extra',    'Extra-Curricular'),
    ]

    # ─────────────────────────────────────────────
    #  COURSES — High Vocational Certificate (HVC)
    # ─────────────────────────────────────────────

    hvc_courses = [

        # ── HVC Year 1 Semester 1 ─────────────────
        ('30000-1101', 'Thai Language Skills for Career Communication', 'ทักษะภาษาไทยเพื่อการสื่อสารงานอาชีพ',  'hvc', 1, 1, 'core',     'Language & Communication'),
        ('30000-1201', 'English for Careers',                          'ภาษาอังกฤษเพื่องานอาชีพ',               'hvc', 1, 1, 'core',     'Language & Communication'),
        ('30000-1301', 'Science for Business and Service Careers',     'วิทยาศาสตร์เพื่องานธุรกิจและบริการ',   'hvc', 1, 1, 'core',     'Thinking & Problem-Solving'),
        ('31910-1003', 'Data Analysis',                                'การวิเคราะห์ข้อมูล',                    'hvc', 1, 1, 'core',     'Basic Vocational'),
        ('31910-2002', 'Database Management Systems',                  'ระบบการจัดการฐานข้อมูล',               'hvc', 1, 1, 'core',     'Specific Vocational'),
        ('31910-2003', 'Object-Oriented System Analysis and Design',   'การวิเคราะห์และออกแบบระบบเชิงวัตถุ',  'hvc', 1, 1, 'core',     'Specific Vocational'),
        ('31910-2005', 'Object-Oriented Programming',                  'การเขียนโปรแกรมเชิงวัตถุ',              'hvc', 1, 1, 'core',     'Specific Vocational'),
        ('31910-2024', 'Software Testing',                             'การทดสอบซอฟต์แวร์',                     'hvc', 1, 1, 'core',     'Specific Vocational'),
        ('31910-2008', 'AI Applications for Business',                 'การประยุกต์ใช้ AI ในธุรกิจ',           'hvc', 1, 1, 'elective', 'Elective'),
        ('31910-2013', 'Cloud Computing',                              'การประมวลผลแบบคลาวด์',                  'hvc', 1, 1, 'elective', 'Elective'),
        ('30000-2001', 'Integrity Building and Volunteer Activities',  'กิจกรรมเสริมสร้างคุณธรรม',             'hvc', 1, 1, 'extra',    'Extra-Curricular'),

        # ── HVC Year 1 Semester 2 ─────────────────
        ('30000-1202', 'English Project Writing and Presentation',     'การเขียนโครงงานและนำเสนอภาษาอังกฤษ', 'hvc', 1, 2, 'core',     'Language & Communication'),
        ('30000-1206', 'English for Digital Business Technology',      'ภาษาอังกฤษเพื่อเทคโนโลยีธุรกิจดิจิทัล','hvc', 1, 2, 'core',   'Language & Communication'),
        ('30000-1404', 'Calculus 1',                                   'แคลคูลัส 1',                            'hvc', 1, 2, 'core',     'Thinking & Problem-Solving'),
        ('30000-1601', 'Health Development',                           'การพัฒนาสุขภาพ',                        'hvc', 1, 2, 'core',     'Social and Life'),
        ('30000-1503', 'Sufficiency Economy Philosophy for Living',    'ปรัชญาเศรษฐกิจพอเพียง',               'hvc', 1, 2, 'core',     'Social and Life'),
        ('30001-1001', 'Entrepreneurship',                             'การเป็นผู้ประกอบการ',                   'hvc', 1, 2, 'core',     'Basic Vocational'),
        ('31910-1001', 'Law in Digital Business and E-Commerce',       'กฎหมายธุรกิจดิจิทัลและพาณิชย์อิเล็กทรอนิกส์','hvc', 1, 2, 'core','Basic Vocational'),
        ('31910-1002', 'Digital Business',                             'ธุรกิจดิจิทัล',                         'hvc', 1, 2, 'core',     'Basic Vocational'),
        ('31910-2004', 'Design Thinking and Digital Business Innovation','หลักการคิดเชิงออกแบบและนวัตกรรม',   'hvc', 1, 2, 'core',     'Specific Vocational'),
        ('31910-2015', 'Digital Media Design',                         'การออกแบบสื่อดิจิทัล',                 'hvc', 1, 2, 'core',     'Specific Vocational'),
        ('31910-2022', 'Mobile Application Development',               'การพัฒนาแอปพลิเคชันมือถือ',            'hvc', 1, 2, 'core',     'Specific Vocational'),
        ('31910-2012', 'Internet of Things',                           'อินเทอร์เน็ตของสรรพสิ่ง',               'hvc', 1, 2, 'core',     'Specific Vocational'),
        ('30000-2002', 'Vocational Organization Activities 1',         'กิจกรรมองค์การวิชาชีพ 1',              'hvc', 1, 2, 'extra',    'Extra-Curricular'),

        # ── HVC Year 2 Semester 1 ─────────────────
        ('30001-1003', 'Digital Technology Applications for Careers',  'การประยุกต์ใช้เทคโนโลยีดิจิทัลในงานอาชีพ','hvc', 2, 1, 'core', 'Basic Vocational'),
        ('31910-2011', 'Business Website Development',                 'การพัฒนาเว็บไซต์ธุรกิจ',               'hvc', 2, 1, 'core',     'Specific Vocational'),
        ('31910-2026', 'Graphic Programs for Website Design',          'โปรแกรมกราฟิกสำหรับออกแบบเว็บไซต์',   'hvc', 2, 1, 'core',     'Specific Vocational'),
        ('31910-2027', 'E-Commerce System Development',                'การพัฒนาระบบพาณิชย์อิเล็กทรอนิกส์',   'hvc', 2, 1, 'core',     'Specific Vocational'),
        ('31910-2030', 'Digital Business Technology Project 1',        'โครงงานเทคโนโลยีธุรกิจดิจิทัล 1',     'hvc', 2, 1, 'core',     'Specific Vocational'),
        ('30000-2005', 'Workplace Activities 1',                       'กิจกรรมในสถานประกอบการ 1',             'hvc', 2, 1, 'extra',    'Extra-Curricular'),

        # ── HVC Year 2 Semester 2 ─────────────────
        ('30001-1002', 'Organization and Quality Service',             'การจัดองค์การและการบริการคุณภาพ',      'hvc', 2, 2, 'core',     'Basic Vocational'),
        ('31910-2018', 'Multimedia Production for Digital Business',   'การผลิตมัลติมีเดียเพื่อธุรกิจดิจิทัล','hvc', 2, 2, 'core',     'Specific Vocational'),
        ('31910-2020', 'Content Management for Digital Business',      'การจัดการเนื้อหาเพื่อธุรกิจดิจิทัล', 'hvc', 2, 2, 'core',     'Specific Vocational'),
        ('31910-2014', 'Digital Media Public Relations Management',    'การจัดการประชาสัมพันธ์สื่อดิจิทัล',  'hvc', 2, 2, 'core',     'Specific Vocational'),
        ('31910-2031', 'Digital Business Technology Project 2',        'โครงงานเทคโนโลยีธุรกิจดิจิทัล 2',    'hvc', 2, 2, 'core',     'Specific Vocational'),
        ('30000-2006', 'Workplace Activities 2',                       'กิจกรรมในสถานประกอบการ 2',            'hvc', 2, 2, 'extra',    'Extra-Curricular'),
    ]

    for row in vc_courses + hvc_courses:
        course = Course(
            code=row[0], name=row[1], name_th=row[2],
            level=row[3], year=row[4], semester=row[5],
            group_type=row[6], group_name=row[7]
        )
        db.session.add(course)

    # ─────────────────────────────────────────────
    #  ANNOUNCEMENTS
    # ─────────────────────────────────────────────

    announcements = [
        Announcement(
            title='Semester 1/2026 Registration Open',
            title_th='เปิดลงทะเบียนภาคเรียนที่ 1/2569',
            body='All DBT students must complete online subject registration by June 20, 2026. Visit the student affairs office for assistance.',
            body_th='นักเรียน-นักศึกษา DBT ทุกคนต้องลงทะเบียนออนไลน์ให้เสร็จสิ้นภายในวันที่ 20 มิถุนายน 2569',
            tag='URGENT',
            date_posted='June 5, 2026',
            active=1
        ),
        Announcement(
            title='Project Prototype Submission Deadline',
            title_th='กำหนดส่งต้นแบบโครงงาน',
            body='All Innovation/Invention project proposals must be submitted to the department coordinator by June 15, 2026.',
            body_th='ต้องส่งข้อเสนอโครงงานนวัตกรรมภายในวันที่ 15 มิถุนายน 2569',
            tag='ACADEMIC',
            date_posted='June 3, 2026',
            active=1
        ),
        Announcement(
            title='Department Open House — July 12, 2026',
            title_th='งานเปิดบ้านแผนก — 12 กรกฎาคม 2569',
            body='The DBT department is hosting an open house showcasing student projects and innovations.',
            body_th='แผนก DBT จะจัดงานเปิดบ้านเพื่อแสดงโครงงานและนวัตกรรมของนักเรียน',
            tag='EVENT',
            date_posted='May 28, 2026',
            active=1
        ),
    ]
    for ann in announcements:
        db.session.add(ann)

    # ─────────────────────────────────────────────
    #  TEACHERS
    # ─────────────────────────────────────────────

    teachers = [
        Teacher(
            name_en='Mr. Chenjop Mapech',
            name_th='อ.เฉินจบ มาเพชร',
            position='Project Course Instructor',
            room='DBT.68-23',
            email='',
            office_hours='Monday–Friday 08:00–16:30',
            subjects='31910-2030 Digital Business Technology Project 1',
            languages='Thai, English',
            message='Welcome to DBT. Come to my room any time during office hours.',
            show_contact=1
        ),
        Teacher(
            name_en='Mr. Banphot Ninpanit',
            name_th='อ.บรรพต นินพานิช',
            position='Co-Advisor',
            room='DBT.68-23',
            email='',
            office_hours='Monday–Friday 08:00–16:30',
            subjects='',
            languages='Thai',
            message='',
            show_contact=1
        ),
    ]
    for t in teachers:
        db.session.add(t)

    # ─────────────────────────────────────────────
    #  FAQs
    # ─────────────────────────────────────────────

    faqs = [
        FAQ(
            question='How do I register for subjects?',
            question_th='ลงทะเบียนรายวิชาได้อย่างไร?',
            answer='Log in to the Student Affairs Portal, select your subjects, and obtain your academic advisor signature before the deadline. You can also visit the office in Room DBT.68-23.',
            answer_th='เข้าสู่ระบบพอร์ทัลงานทะเบียน เลือกรายวิชา และขอลายเซ็นอาจารย์ที่ปรึกษาก่อนกำหนด หรือมาที่สำนักงาน ห้อง DBT.68-23',
            category='Registration'
        ),
        FAQ(
            question='Where is the DBT department office?',
            question_th='สำนักงานแผนก DBT อยู่ที่ไหน?',
            answer='The DBT department office is in Room DBT.68-23. Open Monday to Friday, 8:00 AM to 4:30 PM.',
            answer_th='สำนักงานแผนก DBT อยู่ที่ห้อง DBT.68-23 เปิดทำการจันทร์-ศุกร์ เวลา 08:00-16:30 น.',
            category='General'
        ),
        FAQ(
            question='What is the difference between VC and HVC?',
            question_th='ปวช. และ ปวส. ต่างกันอย่างไร?',
            answer='Vocational Certificate (VC) is a 3-year program. High Vocational Certificate (HVC) is a 2-year advanced program that builds on the VC level with deeper technical subjects.',
            answer_th='ปวช. เป็นหลักสูตร 3 ปี ส่วน ปวส. เป็นหลักสูตร 2 ปีระดับสูง ที่ต่อยอดจาก ปวช.',
            category='Curriculum'
        ),
        FAQ(
            question='Who is the project advisor?',
            question_th='ครูที่ปรึกษาโครงงานคือใคร?',
            answer='The project course instructor is Mr. Chenjop Mapech, and the co-advisor is Mr. Banphot Ninpanit. Room DBT.68-23.',
            answer_th='ครูผู้สอนวิชาโครงงานคืออ.เฉินจบ มาเพชร และที่ปรึกษาร่วมคืออ.บรรพต นินพานิช ห้อง DBT.68-23',
            category='Staff'
        ),
        FAQ(
            question='What subjects are in HVC Year 2?',
            question_th='ปวส. ปีที่ 2 เรียนวิชาอะไรบ้าง?',
            answer='HVC Year 2 Semester 1 includes Business Website Development, Graphic Programs for Website Design, E-Commerce System Development, and Digital Business Technology Project 1. Semester 2 includes Multimedia Production, Content Management, Digital Media PR Management, and Project 2.',
            answer_th='ปวส. ปีที่ 2 เทอม 1: การพัฒนาเว็บไซต์ธุรกิจ กราฟิก E-Commerce และโครงงาน 1 เทอม 2: มัลติมีเดีย การจัดการเนื้อหา PR ดิจิทัล และโครงงาน 2',
            category='Curriculum'
        ),
        FAQ(
            question='How does the voice feature work?',
            question_th='ฟีเจอร์เสียงทำงานอย่างไร?',
            answer='Tap the microphone button on the control panel and speak your question. Try saying: Courses, Year 1, VC, HVC, Announcements, or Help.',
            answer_th='แตะปุ่มไมโครโฟนบนแผงควบคุมแล้วพูดคำถาม ลองพูดว่า รายวิชา ปีที่ 1 ปวช ปวส ประกาศ หรือ ช่วยเหลือ',
            category='Help'
        ),
        FAQ(
            question='What time does the library open?',
            question_th='ห้องสมุดเปิดกี่โมง?',
            answer='The college library is open Monday to Friday from 8:00 AM to 4:30 PM.',
            answer_th='ห้องสมุดวิทยาลัยเปิดวันจันทร์-ศุกร์ เวลา 08:00-16:30 น.',
            category='General'
        ),
        FAQ(
            question='How do I change my elective subject?',
            question_th='เปลี่ยนวิชาเลือกได้อย่างไร?',
            answer='Visit the student affairs office in Room DBT.68-23. You will need your advisor approval before any subject change is processed.',
            answer_th='ไปที่สำนักงานแผนก DBT ห้อง DBT.68-23 โดยต้องได้รับอนุมัติจากอาจารย์ที่ปรึกษาก่อน',
            category='Registration'
        ),
    ]
    for faq in faqs:
        db.session.add(faq)

# ─────────────────────────────────────────────
    #  STUDY OUTCOMES
    # ─────────────────────────────────────────────

    outcomes = [
        StudyOutcome(level='vc', career='Digital Content Creator',
            career_th='นักสร้างคอนเทนต์ดิจิทัล',
            description='Create and manage digital content for social media, websites, and e-commerce platforms.',
            desc_th='สร้างและจัดการคอนเทนต์ดิจิทัลสำหรับโซเชียลมีเดีย เว็บไซต์ และแพลตฟอร์มอีคอมเมิร์ซ'),
        StudyOutcome(level='vc', career='E-Commerce Operator',
            career_th='ผู้ประกอบการพาณิชย์อิเล็กทรอนิกส์',
            description='Run online stores and digital marketplaces on platforms like Shopee, Lazada, and TikTok Shop.',
            desc_th='ดำเนินร้านค้าออนไลน์บนแพลตฟอร์มต่างๆ เช่น Shopee, Lazada และ TikTok Shop'),
        StudyOutcome(level='vc', career='Graphic Designer',
            career_th='นักออกแบบกราฟิก',
            description='Design visual content for print, digital media, and branding using industry-standard software.',
            desc_th='ออกแบบสื่อภาพสำหรับสิ่งพิมพ์ สื่อดิจิทัล และงานแบรนด์ด้วยซอฟต์แวร์มาตรฐาน'),
        StudyOutcome(level='vc', career='Computer Technician',
            career_th='ช่างเทคนิคคอมพิวเตอร์',
            description='Install, maintain, and troubleshoot computer hardware and software systems.',
            desc_th='ติดตั้ง บำรุงรักษา และแก้ไขปัญหาระบบฮาร์ดแวร์และซอฟต์แวร์คอมพิวเตอร์'),
        StudyOutcome(level='vc', career='Office Administrator',
            career_th='เจ้าหน้าที่ธุรการสำนักงาน',
            description='Handle office operations, documentation, and digital business correspondence.',
            desc_th='จัดการงานสำนักงาน เอกสาร และการติดต่อธุรกิจดิจิทัล'),
        StudyOutcome(level='hvc', career='Web Developer',
            career_th='นักพัฒนาเว็บไซต์',
            description='Design and develop full-stack web applications and business websites using modern frameworks.',
            desc_th='ออกแบบและพัฒนาเว็บแอปพลิเคชันและเว็บไซต์ธุรกิจด้วยเฟรมเวิร์กทันสมัย'),
        StudyOutcome(level='hvc', career='Mobile App Developer',
            career_th='นักพัฒนาแอปพลิเคชันมือถือ',
            description='Build iOS and Android mobile applications for business and consumer use.',
            desc_th='พัฒนาแอปพลิเคชันมือถือ iOS และ Android สำหรับธุรกิจและผู้บริโภค'),
        StudyOutcome(level='hvc', career='Digital Business Analyst',
            career_th='นักวิเคราะห์ธุรกิจดิจิทัล',
            description='Analyze business requirements and design digital systems to solve organizational problems.',
            desc_th='วิเคราะห์ความต้องการทางธุรกิจและออกแบบระบบดิจิทัลเพื่อแก้ปัญหาองค์กร'),
        StudyOutcome(level='hvc', career='IoT Systems Engineer',
            career_th='วิศวกรระบบ IoT',
            description='Design and implement Internet of Things solutions for smart systems and automation.',
            desc_th='ออกแบบและพัฒนาระบบ IoT สำหรับระบบอัจฉริยะและระบบอัตโนมัติ'),
        StudyOutcome(level='hvc', career='Digital Entrepreneur',
            career_th='ผู้ประกอบการดิจิทัล',
            description='Launch and manage digital businesses, startups, and technology ventures.',
            desc_th='ก่อตั้งและบริหารธุรกิจดิจิทัล สตาร์ทอัพ และกิจการเทคโนโลยี'),
    ]
    for o in outcomes:
        db.session.add(o)

    # ─────────────────────────────────────────────
    #  PROGRAM FEES
    # ─────────────────────────────────────────────

    fees = [
        ProgramFee(level='vc', item='Tuition Fee',
            item_th='ค่าเล่าเรียน', amount=3500, period='per semester',
            note='Thai students'),
        ProgramFee(level='vc', item='Registration Fee',
            item_th='ค่าลงทะเบียน', amount=500, period='once',
            note='First year only'),
        ProgramFee(level='vc', item='Student Activities Fee',
            item_th='ค่ากิจกรรมนักเรียน', amount=300, period='per year',
            note=''),
        ProgramFee(level='vc', item='Uniform & Materials',
            item_th='ค่าชุดนักเรียนและอุปกรณ์', amount=2500, period='per year',
            note='Estimated cost'),
        ProgramFee(level='vc', item='Computer Lab Fee',
            item_th='ค่าห้องปฏิบัติการคอมพิวเตอร์', amount=800, period='per semester',
            note=''),
        ProgramFee(level='hvc', item='Tuition Fee',
            item_th='ค่าเล่าเรียน', amount=4500, period='per semester',
            note='Thai students'),
        ProgramFee(level='hvc', item='Registration Fee',
            item_th='ค่าลงทะเบียน', amount=500, period='once',
            note='First year only'),
        ProgramFee(level='hvc', item='Student Activities Fee',
            item_th='ค่ากิจกรรมนักศึกษา', amount=400, period='per year',
            note=''),
        ProgramFee(level='hvc', item='Project Materials Fee',
            item_th='ค่าวัสดุโครงงาน', amount=1500, period='per year',
            note='For Project 1 & 2'),
        ProgramFee(level='hvc', item='Computer Lab Fee',
            item_th='ค่าห้องปฏิบัติการคอมพิวเตอร์', amount=1000, period='per semester',
            note=''),
    ]
    for f in fees:
        db.session.add(f)

    db.session.commit()

    print('   Seeded: ' + str(len(vc_courses)) + ' VC courses')
    print('   Seeded: ' + str(len(hvc_courses)) + ' HVC courses')
    print('   Seeded: ' + str(len(announcements)) + ' announcements')
    print('   Seeded: ' + str(len(teachers)) + ' teachers')
    print('   Seeded: ' + str(len(faqs)) + ' FAQs')