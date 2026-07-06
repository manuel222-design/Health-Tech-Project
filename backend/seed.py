
from database import SessionLocal
from models import User, UserRole, Category, Article, ArticleStatus, Tag, ArticleTag
import uuid
import hashlib

def seed():
    db = SessionLocal()

    try:
        print("Starting seed...")

        admin = db.query(User).filter(User.email == "admin@healthtech.co.ke").first()
        if not admin:
            admin = User(
                id=uuid.uuid4(),
                username="Dr. Emmanuel Admin",
                email="admin@healthtech.co.ke",
                password_hash=hashlib.sha256("Admin@1234".encode()).hexdigest(),
                role=UserRole.admin,
                is_active=True
            )
            db.add(admin)
            db.flush()
            print(" Admin user created")
        else:
            print(" Admin user already exists")

        def get_or_create_category(name, slug, description, sort_order):
            cat = db.query(Category).filter(Category.slug == slug).first()
            if not cat:
                cat = Category(
                    id=uuid.uuid4(),
                    name=name,
                    slug=slug,
                    description=description,
                    sort_order=sort_order
                )
                db.add(cat)
                db.flush()
                print(f" Category created — {name}")
            return cat

        cat_patient    = get_or_create_category("Patient Management",  "patient-management",  "Guides for registering and managing patients in Taifa Care HMIS", 1)
        cat_clinical   = get_or_create_category("Clinical Workflows",  "clinical-workflows",  "Step-by-step guides for clinical staff including vitals and consultations", 2)
        cat_scheduling = get_or_create_category("Scheduling",          "scheduling",          "How to book and manage patient appointments", 3)
        cat_screening  = get_or_create_category("Screening & Triage",  "screening-triage",    "TB screening, triage workflows and TEWS scoring", 4)

        def get_or_create_tag(name, slug, color):
            tag = db.query(Tag).filter(Tag.slug == slug).first()
            if not tag:
                tag = Tag(id=uuid.uuid4(), name=name, slug=slug, color_hex=color)
                db.add(tag)
                db.flush()
            return tag

        tag_registration = get_or_create_tag("Registration",  "registration",  "#3B82F6")
        tag_nurse        = get_or_create_tag("Nurse",         "nurse",         "#10B981")
        tag_doctor       = get_or_create_tag("Doctor",        "doctor",        "#6366F1")
        tag_vitals       = get_or_create_tag("Vitals",        "vitals",        "#F59E0B")
        tag_appointment  = get_or_create_tag("Appointments",  "appointments",  "#EC4899")
        tag_tb           = get_or_create_tag("TB Screening",  "tb-screening",  "#EF4444")
        tag_hmis         = get_or_create_tag("HMIS",          "hmis",          "#8B5CF6")
        print(" Tags created")

        def get_or_create_article(title, slug, markdown, category, tags):
            art = db.query(Article).filter(Article.slug == slug).first()
            if not art:
                art = Article(
                    id=uuid.uuid4(),
                    title=title,
                    slug=slug,
                    body_markdown=markdown,
                    body_html="",
                    status=ArticleStatus.published,
                    category_id=category.id,
                    author_id=admin.id,
                    view_count=0
                )
                db.add(art)
                db.flush()
                for tag in tags:
                    link = ArticleTag(article_id=art.id, tag_id=tag.id)
                    db.add(link)
                print(f" Article created — {title}")
            else:
                print(f" Article already exists — {title}")
            return art

        get_or_create_article(
            title="How to Register a New Patient in Taifa Care HMIS",
            slug="how-to-register-a-patient",
            markdown="""
 Overview
This guide walks healthcare workers through registering a new patient in the Taifa Care HMIS system.

Who: Doctor, Clinical Officer, Nurse, Health Records Officer, Data Clerk
System: Taifa Care HMIS (https://hmis-uat.tiberbu.app)
Last Updated: July 2025

 Prerequisites
- You must have a valid username and password for Taifa Care HMIS
- The patient must have a valid national ID or birth certificate
- Ensure you are on the correct facility URL

 Step-by-Step Guide

 Step 1 — Log In
1. Open your browser and go to the Taifa Care HMIS URL
2. Enter your username and password
3. Click Login to access the dashboard

 Step 2 — Navigate to Patient Registration
1. From the main dashboard, locate the Patient module
2. Click on New Patient Registration

 Step 3 — Fill in Patient Demographics
Enter the following mandatory fields:
- Full name (as per national ID)
- Date of birth
- Gender
- National ID number or birth certificate number
- Phone number
- Next of kin name and contact
- County and sub-county of residence

 Step 4 — Assign a Facility Number
The system will automatically generate a unique CR Number (Client Registration Number) for the patient. Record this number on the patient's physical file — it is used to identify the patient in all future visits.

 Step 5 — Save and Confirm
1. Review all entered details carefully
2. Click Save Patient
3. A confirmation message will appear
4. An SMS confirmation is sent to the patient's registered phone number

 Important Notes
- If the patient has been registered at another facility, use the Patient Transfer module instead
- Duplicate registration is prevented by the system using national ID matching
- All registration data is encrypted and stored securely

 Common Errors
| Error                       | Solution                                                   |
                                                            
| National ID already exists  | Patient is already registered — search for existing record |
| Required field missing      | Check all mandatory fields are filled                      |
| Session expired             | Log in again and repeat the process |
""",
            category=cat_patient,
            tags=[tag_registration, tag_hmis, tag_nurse]
        )

        get_or_create_article(
            title="How to Book a Patient Appointment in Taifa Care HMIS",
            slug="how-to-book-appointments",
            markdown="""
 Overview
This guide explains how to book, view, and manage patient appointments in Taifa Care HMIS.

Who: Doctor, Clinical Officer, Nurse, Health Records Officer, Data Clerk
Last Updated: February 2026

 Prerequisites
- Patient must already be registered in the system
- You must know the patient's CR Number or full name
- Confirm the clinician's availability before booking

 Step-by-Step Guide

 Step 1 — Log In
1. Open Taifa Care HMIS and log in with your credentials
2. Navigate to the Appointments module from the main menu

 Step 2 — Search for the Patient
1. Click on New Appointment
2. In the search field, type the patient's name or CR number
3. Select the correct patient from the dropdown list

 Step 3 — Select Appointment Details
Fill in the following:
- Date — select the appointment date from the calendar
- Time — select the preferred time slot
- Service Unit — choose the clinic or department (e.g., General OPD, MCH)
- Clinician — select the doctor or clinical officer

 Step 4 — Confirm and Save
1. Review the appointment details
2. Click Book Appointment
3. The system will confirm the booking and show the appointment reference number
4. The patient receives an SMS reminder automatically

 Rescheduling an Appointment
1. Search for the patient and open their appointment record
2. Click Reschedule
3. Select a new date and time
4. Click Save Changes

 Cancelling an Appointment
1. Open the appointment record
2. Click Cancel Appointment
3. Select a cancellation reason from the dropdown
4. Click Confirm Cancellation

---
 Important Notes
- Appointments can only be booked for registered patients
- Double-booking is prevented by the system automatically
- Cancelled appointments free the slot for other patients
""",
            category=cat_scheduling,
            tags=[tag_appointment, tag_hmis, tag_nurse]
        )

        get_or_create_article(
            title="How to Capture Patient Vitals in Taifa Care HMIS",
            slug="how-to-capture-patient-vitals",
            markdown="""
 Overview
This guide covers how to record patient vitals in the Taifa Care HMIS triage module.

Who: Nurse, Clinical Officer
Equipment needed: Thermometer, weighing scale, height measure, sphygmomanometer, pulse oximeter
Last Updated: July 2025

 Prerequisites
- Patient must be registered and have an active visit
- You must have triage/nursing access in the system

 Step-by-Step Guide

 Step 1 — Locate the Patient
1. Log in to Taifa Care HMIS
2. Go to the Triage or Nursing module
3. Search for the patient by name or CR number
4. Click on the patient to open their visit record

 Step 2 — Open the Vitals Form
1. Click on Capture Vitals or Vitals Form
2. The patient's information is displayed at the top including name, CR number, gender, and age

 Step 3 — Enter Vitals
Record the following measurements:

| Vital                    | Unit                 | Notes                         |

| Temperature              | °C                   | Normal: 36.5–37.5°C           |
| Heart Rate               | bpm                  | Normal adult: 60–100 bpm      |
| Systolic Blood Pressure  | mmHg                 | Normal: below 120 mmHg        |
| Diastolic Blood Pressure | mmHg                 | Normal: below 80 mmHg         |
| Oxygen Saturation        | %                    | Normal: 95–100%               |
| Respiratory Rate         | breaths/min          | Normal adult: 12–20           |
| Level of Consciousness   | AVPU Scale           | Alert/Voice/Pain/Unresponsive |
| MUAC                     | cm                   | Mid-Upper Arm Circumference   |
| Height                   | cm                   |                               |
| Weight                   | kg                   |                               |

> Note: BMI, TEW Score, and Weight Gain are automatically calculated by the system once height and weight are entered.

 Step 4 — Add Notes
- Enter any relevant clinical observations in the description box
- Note any allergies or special conditions

 Step 5 — Submit Vitals
1. Review all entered values
2. Click Submit Vitals
3. The system saves the vitals to the patient's record

 Step 6 — Assign Clinician
After submitting vitals:
1. Select the Clinic from the dropdown
2. Choose the Target Room
3. Click Assign Clinician to complete triage

 Additional Options
- Vitals Form button — for detailed vitals entry
- Transfer button — for moving the patient to another facility
- Close Visit button — ends the current patient encounter
- Right panel gives access to Patient Timeline, Allergies and Patient History

 Understanding TEW Score
The Total Early Warning (TEW) Score is automatically calculated from vitals. A high TEW score indicates a deteriorating patient who needs urgent attention.
""",
            category=cat_clinical,
            tags=[tag_vitals, tag_nurse, tag_hmis]
        )

        get_or_create_article(
            title="How to Conduct a Patient Consultation in Taifa Care HMIS",
            slug="how-to-do-a-consultation",
            markdown="""
 Overview
This guide walks doctors and clinical officers through the full consultation workflow in Taifa Care HMIS.

Who: Doctor, Clinical Officer, Nurse
Last Updated: July 2025

 Prerequisites
- Patient must be registered and triaged (vitals captured)
- You must have consultation/doctor access in the system
- Patient must have been assigned to your clinic/room

 Step-by-Step Guide

 Step 1 — Access the Consultation Module
1. Log in to Taifa Care HMIS
2. Click on Consultation from the left-side menu
3. Select the appropriate Service Unit (e.g., General OPD, Paediatrics)

 Step 2 — Check In to Your Room
1. Click Check In to select your consultation room
2. A confirmation pop-up will appear
3. Click Confirm to proceed

 Step 3 — Search for Your Patient
1. Click on the Search Patient field
2. Type the patient's name or part of it
3. The system filters and displays matching records
4. Select the correct patient from the list

 Step 4 — Start the Consultation
1. Click Start next to the patient's name
2. A pop-up asks if you are ready to start
3. Click Start Consultation to proceed
4. The full consultation screen opens

 Step 5 — Review Patient Timeline
1. Navigate to the Timeline section
2. Set the date range to view historical records
3. Use filters to view: Patient Medical Records, Form Data Repository
4. Review previous visits, vitals and diagnoses

 Step 6 — Complete the Consultation
Record the following:
- Chief complaint — main reason for the visit
- History of present illness
- Physical examination findings
- Diagnosis — use ICD-10 codes where applicable
- Treatment plan — medications, procedures, referrals
- Follow-up instructions

 Step 7 — Save and Close
1. Review all entries
2. Click Save Consultation
3. Issue prescriptions through the Pharmacy module if needed
4. Click Close Visit to end the encounter

 Important Notes
- Always verify patient identity before starting consultation
- ICD-10 diagnosis codes are required for NHIF/SHIF claims
- Consultation notes are visible to all authorised clinical staff
- Use the Referral button to refer patients to specialists
""",
            category=cat_clinical,
            tags=[tag_doctor, tag_hmis]
        )

        get_or_create_article(
            title="How to Conduct TB Screening in Taifa Care HMIS",
            slug="how-to-do-tb-screening",
            markdown="""
 Overview
This guide explains how to conduct and record TB screening for patients during triage in Taifa Care HMIS.

Who: Nurse, Clinical Officer, Doctor
Last Updated: July 2025

 Prerequisites
- Patient must be registered and have an active visit
- TB screening is typically done during triage after vitals

 Why TB Screening Matters
Tuberculosis (TB) remains a major public health concern in Kenya. Early screening at every patient visit helps identify undiagnosed TB cases and prevents community transmission.

 Step-by-Step Guide

 Step 1 — Access TB Screening
1. After capturing patient vitals in the triage screen
2. Click on the TB Screening button at the top-right of the screen

 Step 2 — Fill in the TB Assessment
Enter the following details:
- Date of the assessment (auto-filled with today's date)
- Check all relevant symptoms under TB Assessment:

| Symptom                         | Notes                        |

| Cough lasting more than 2 weeks | Most common TB symptom       |
| Night sweats                    | Unexplained drenching sweats |
| Unexplained weight loss         | Significant loss over weeks  |
| Fever                           | Low-grade persistent fever   |
| Haemoptysis                     | Coughing up blood            |
| Chest pain                      | Especially on breathing      |
| Fatigue                         | Persistent tiredness         |

 Step 3 — Submit the Assessment
1. Review the checked symptoms
2. Click Submit to save the TB screening record
3. The data appears in the Previous Screenings section below for future reference

 Step 4 — Assign Clinician Based on Risk
After submission:
1. In the Assign Clinician section, select the appropriate clinic
   - High risk patients → TB Clinic
   - Low risk → General OPD
2. Choose the target room
3. Click Assign Clinician

 Interpreting Results
- 0 symptoms — Low risk. Proceed with normal consultation
- 1–2 symptoms — Medium risk. Flag for clinical review
- 3+ symptoms — High risk. Refer immediately to TB clinic for sputum test

 Important Notes
- TB screening must be done for every patient regardless of their visit reason
- Results are stored permanently in the patient's record
- Positive screenings trigger automatic alerts to the TB focal person
- All TB data is reported to the national TB programme (TIBU system)
""",
            category=cat_screening,
            tags=[tag_tb, tag_nurse, tag_hmis]
        )

        db.commit()
        print("")
        print(" All done! Your database now has:")
        print(" 1 Admin user      — admin@healthtech.co.ke / Admin@1234")
        print(" 4 Categories      — Patient Management, Clinical Workflows, Scheduling, Screening")
        print(" 7 Tags            — Registration, Nurse, Doctor, Vitals, Appointments, TB, HMIS")
        print(" 5 Real Articles   — from the official Taifa Care HMIS User Guide")
        print("")
        print("   Open Swagger UI: http://127.0.0.1:8000/docs")

    except Exception as e:
        db.rollback()
        print(f" Error: {e}")
        raise

    finally:
        db.close()

if __name__ == "__main__":
    seed()