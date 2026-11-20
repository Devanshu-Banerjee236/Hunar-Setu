"""
In-memory and persistent database state for Hunar Setu.
Includes pre-populated real-world rural jobs, workers, skill assessments, and follow-ups.
"""

from typing import List, Dict, Optional
from datetime import datetime
from app.models import (
    EmployerListing, WorkerProfile, SkillAssessment, RubricBreakdown,
    BiasControlMetrics, VerificationReport, JobMatch, FollowUpRecord, AgentLog
)

class Database:
    def __init__(self):
        self.listings: Dict[str, EmployerListing] = {}
        self.workers: Dict[str, WorkerProfile] = {}
        self.matches: Dict[str, JobMatch] = {}
        self.follow_ups: Dict[str, FollowUpRecord] = {}
        self.human_review_queue: List[Dict] = []
        self.logs: List[AgentLog] = []
        self._seed_data()

    def add_log(self, agent_name: str, action: str, details: str, status: str = "SUCCESS"):
        log_entry = AgentLog(
            id=f"log-{len(self.logs) + 1:04d}",
            agent_name=agent_name,
            action=action,
            details=details,
            status=status
        )
        self.logs.insert(0, log_entry)
        if len(self.logs) > 200:
            self.logs.pop()

    def _seed_data(self):
        # 1. Pre-seeded verified employer listings
        job1 = EmployerListing(
            id="job-101",
            employer_name="Ramesh Pal",
            business_name="Kisan Agro Engineering Workshop",
            phone="+91 98321 44510",
            district="Purba Bardhaman",
            state="West Bengal",
            trade_category="Tractor & Agri-Machinery Hydraulics",
            job_title="Lead Tractor Hydraulics Mechanic",
            wage_offered=18500.0,
            wage_type="monthly",
            experience_months_required=12,
            job_description="Urgent requirement for skilled mechanic to overhaul Mahindra & Sonalika hydraulic pumps, spool valves, and rotary tillers before harvest season. Lodging provided on premise.",
            lodging_provided=True,
            food_provided=False,
            verification_status="VERIFIED",
            verification_report=VerificationReport(
                scam_risk_score=2.0,
                is_safe=True,
                wage_compliance="COMPLIANT (+₹4,000 above statutory minimum ₹14,500)",
                statutory_benchmark_wage=14500.0,
                identity_verified=True,
                verification_type="MSME Udyam Verified (UDYAM-WB-04-0019283)",
                red_flags=[],
                confidence=98.5,
                requires_human_review=False,
                ai_rationale="Employer verified via Udyam registry. Wage is ₹18,500/mo, exceeding district skilled minimum by 27.5%. Zero registration fees requested."
            )
        )

        job2 = EmployerListing(
            id="job-102",
            employer_name="Sunil Kumar Mahato",
            business_name="Gramin Solar Solutions & Micro-Grid",
            phone="+91 94340 77129",
            district="Bankura",
            state="West Bengal",
            trade_category="Solar PV & Inverter Grid-Tie Wiring",
            job_title="Solar Inverter & Micro-Grid Field Electrician",
            wage_offered=16000.0,
            wage_type="monthly",
            experience_months_required=6,
            job_description="Installation of 5kW to 15kW rooftop solar panels and battery inverter bank across rural health centres and schools in Bankura. Travel allowance provided.",
            lodging_provided=False,
            food_provided=False,
            verification_status="VERIFIED",
            verification_report=VerificationReport(
                scam_risk_score=3.5,
                is_safe=True,
                wage_compliance="COMPLIANT (+₹2,200 above statutory minimum ₹13,800)",
                statutory_benchmark_wage=13800.0,
                identity_verified=True,
                verification_type="GSTIN Active (19AAACG7712Q1ZX)",
                red_flags=[],
                confidence=96.0,
                requires_human_review=False,
                ai_rationale="Active GSTIN entity verified with DISCOM empanelment. Transparent wage with direct bank transfer guarantee."
            )
        )

        job3 = EmployerListing(
            id="job-103",
            employer_name="Anisur Rahman",
            business_name="Bengal Fabrication & Steel Works",
            phone="+91 97335 88201",
            district="Purba Bardhaman",
            state="West Bengal",
            trade_category="Precision MIG/ARC Welding",
            job_title="Fabrication Welder (Gates, Trusses & Trailers)",
            wage_offered=17000.0,
            wage_type="monthly",
            experience_months_required=12,
            job_description="MIG and ARC welding for agricultural trolleys and warehouse roof trusses. Safety helmet, gloves and welding glasses supplied by employer.",
            lodging_provided=True,
            food_provided=True,
            verification_status="VERIFIED",
            verification_report=VerificationReport(
                scam_risk_score=1.5,
                is_safe=True,
                wage_compliance="COMPLIANT (+₹2,500 above statutory minimum ₹14,500)",
                statutory_benchmark_wage=14500.0,
                identity_verified=True,
                verification_type="Trade License #TR-881204 / Shop Act",
                red_flags=[],
                confidence=99.0,
                requires_human_review=False,
                ai_rationale="Reputable local fabrication unit. Free lodging and meals provided. Zero worker deposit."
            )
        )

        # Job 4: Suspicious Scam Listing (for testing / pre-screening demonstration)
        job_scam = EmployerListing(
            id="job-999",
            employer_name="Vikram Singh",
            business_name="Apex Global Rural Agency",
            phone="+91 88990 01122",
            district="Purba Bardhaman",
            state="West Bengal",
            trade_category="Mobile & Hardware Chip-Level Repair",
            job_title="Data Entry / Mobile Repair Assistant",
            wage_offered=45000.0,
            wage_type="monthly",
            experience_months_required=0,
            job_description="Earn 45,000 monthly! No experience needed. Candidate must pay a refundable registration fee of Rs. 1,200 for security deposit and tool kit activation.",
            lodging_provided=True,
            food_provided=True,
            verification_status="REJECTED",
            verification_report=VerificationReport(
                scam_risk_score=94.5,
                is_safe=False,
                wage_compliance="SUSPICIOUS_HIGH (Unrealistic ₹45,000 for 0-exp entry level)",
                statutory_benchmark_wage=14500.0,
                identity_verified=False,
                verification_type="Unverified Phone / Fraud Blacklist Match",
                red_flags=[
                    "Explicit fee demand: 'registration fee of Rs. 1,200'",
                    "Unrealistic wage promise: ₹45,000/mo vs benchmark ₹14,500/mo",
                    "Fake business identity: No GSTIN or MSME found"
                ],
                confidence=99.2,
                requires_human_review=False,
                ai_rationale="BLOCKED BY LISTING AGENT: Classic advance-fee fraud pattern. Zero workers will ever be shown this listing."
            )
        )

        self.listings[job1.id] = job1
        self.listings[job2.id] = job2
        self.listings[job3.id] = job3
        self.listings[job_scam.id] = job_scam

        # 2. Pre-seeded Workers with Skill Video Assessments
        worker1 = WorkerProfile(
            id="w-01",
            name="Subhashish Soren",
            phone_masked="+91 98321 •••••",
            phone_real="+91 98321 84920",
            district="Purba Bardhaman",
            state="West Bengal",
            primary_trade="Tractor & Agri-Machinery Hydraulics",
            experience_months=18,
            minimum_wage_expected=15000.0,
            max_commute_km=25.0,
            preferred_language="bn",
            trust_score=98.0,
            retention_rating=4.9,
            skill_assessment=SkillAssessment(
                id="skill-01",
                worker_id="w-01",
                trade="Tractor & Agri-Machinery Hydraulics",
                task_name="Hydraulic Spool Valve Overhaul & High-Pressure Pressure Test",
                video_url="/static/media/tractor_demo.mp4",
                video_thumbnail="🚜",
                overall_score=94.0,
                confidence_score=96.5,
                rubric_breakdown=RubricBreakdown(
                    technical_execution=24.5,
                    safety_and_ppe=23.5,
                    tool_handling=24.0,
                    efficiency_precision=22.0
                ),
                bias_control=BiasControlMetrics(
                    appearance_agnostic=True,
                    accent_dialect_neutral=True,
                    fixed_rubric_adherence=99.7,
                    bias_audit_notes="Scored strictly on mechanical sequence, torque wrench technique, and hydraulic bleeding. Appearance and accent weighted 0%."
                ),
                badge_title="Certified Agri-Hydraulics Master",
                badge_level="Gold Tier 1",
                verified_competencies=[
                    "Spool valve seal replacement without scuffing",
                    "Hydraulic pump circuit bleeding under 3 minutes",
                    "Correct PPE usage (cut-resistant gloves & eye shield)"
                ],
                improvement_feedback=[
                    "Ensure secondary lock washer is checked twice before closing pump casing."
                ],
                human_review_status="AUTO_PASSED"
            )
        )

        worker2 = WorkerProfile(
            id="w-02",
            name="Rahul Roy",
            phone_masked="+91 94340 •••••",
            phone_real="+91 94340 33819",
            district="Bankura",
            state="West Bengal",
            primary_trade="Solar PV & Inverter Grid-Tie Wiring",
            experience_months=14,
            minimum_wage_expected=14000.0,
            max_commute_km=30.0,
            preferred_language="hi",
            trust_score=95.0,
            retention_rating=4.7,
            skill_assessment=SkillAssessment(
                id="skill-02",
                worker_id="w-02",
                trade="Solar PV & Inverter Grid-Tie Wiring",
                task_name="5kW Solar Inverter DC-to-AC Termination & Earthing Check",
                video_url="/static/media/solar_demo.mp4",
                video_thumbnail="☀️",
                overall_score=91.0,
                confidence_score=95.0,
                rubric_breakdown=RubricBreakdown(
                    technical_execution=23.0,
                    safety_and_ppe=24.0,
                    tool_handling=22.5,
                    efficiency_precision=21.5
                ),
                bias_control=BiasControlMetrics(
                    appearance_agnostic=True,
                    accent_dialect_neutral=True,
                    fixed_rubric_adherence=99.2,
                    bias_audit_notes="Scored solely on MC4 crimping strength, lock-out tag-out verification, and insulation measurement."
                ),
                badge_title="Certified Solar Field Electrician",
                badge_level="Silver Level A",
                verified_competencies=[
                    "MC4 connector crimping with pull test pass",
                    "Earthing pit resistance testing (<4.2 ohms)",
                    "1000V rated safety glove compliance"
                ],
                improvement_feedback=[
                    "Label string wires before bundling to speed up inverter panel troubleshooting."
                ],
                human_review_status="AUTO_PASSED"
            )
        )

        self.workers[worker1.id] = worker1
        self.workers[worker2.id] = worker2

        # 3. Pre-seeded Matched Jobs with Explainable Rationale
        match1 = JobMatch(
            id="match-01",
            job_id=job1.id,
            worker_id=worker1.id,
            job=job1,
            worker=worker1,
            overall_match_score=96.0,
            skill_fit_score=98.0,
            distance_km=8.5,
            distance_fit_score=95.0,
            wage_fit_score=96.0,
            wage_differential=3500.0,
            explanation_en="Top fit! Subhashish's verified hydraulic score (94%) directly matches the tractor pump overhaul needs. Distance is only 8.5 km, and wage of ₹18,500 exceeds his ₹15,000 expectation by ₹3,500 with free lodging.",
            explanation_hi="सर्वोत्तम मिलान! सुभाशीष का सत्यापित हाइड्रोलिक्स स्कोर (94%) सीधे ट्रैक्टर पंप कार्य से मेल खाता है। दूरी केवल 8.5 किमी है, और ₹18,500 वेतन उनकी अपेक्षा से ₹3,500 अधिक है, साथ में आवास भी उपलब्ध है।",
            explanation_bn="অনবদ্য মিল! শুভাশীষের যাচাইকৃত হাইড্রলিক্স দক্ষতা (৯৪%) ট্রাক্টর পাম্প মেরামতের কাজের সাথে শতভাগ মিলেছে। দূরত্ব মাত্র ৮.৫ কিমি এবং ₹১৮,৫০০ বেতন প্রত্যাশার চেয়ে ₹৩,৫০০ বেশি সাথে বিনামূল্যে থাকার সুবিধা।",
            consent_status="PENDING",
            consent_timestamp=None,
            contact_unlocked=False
        )

        match2 = JobMatch(
            id="match-02",
            job_id=job2.id,
            worker_id=worker2.id,
            job=job2,
            worker=worker2,
            overall_match_score=92.0,
            skill_fit_score=93.0,
            distance_km=14.0,
            distance_fit_score=90.0,
            wage_fit_score=93.0,
            wage_differential=2000.0,
            explanation_en="Strong match! Rahul's Solar PV certified score (91%) fits Bankura micro-grid installation. 14 km radius easily accessible by bike. Wage of ₹16,000 meets expectations.",
            explanation_hi="उत्तम मिलान! राहुल का सोलर पीवी स्कोर (91%) बांकुड़ा माइक्रोग्रिड कार्य के लिए उपयुक्त है। 14 किमी दूरी बाइक से सुगम है। ₹16,000 का वेतन उनकी अपेक्षाओं के अनुरूप है।",
            explanation_bn="চমৎকার মিল! রাহুলের সোলার পিভি স্কোর (৯১%) বাঁকুড়া মাইক্রো-গ্রিড কাজের উপযোগী। ১৪ কিমি দূরত্ব সহজে যাতায়াতযোগ্য এবং ₹১৬,০০০ বেতন উপযুক্ত।",
            consent_status="GRANTED",
            consent_timestamp="2026-11-18 11:20",
            contact_unlocked=True
        )

        self.matches[match1.id] = match1
        self.matches[match2.id] = match2

        # 4. Pre-seeded Follow-Up Retention Records (30, 60, 90 Days)
        fup1 = FollowUpRecord(
            id="fup-01",
            match_id=match2.id,
            worker_name=worker2.name,
            employer_name=job2.employer_name,
            trade="Solar PV & Inverter Grid-Tie Wiring",
            day_milestone=30,
            due_date="2026-12-18",
            status="COMPLETED",
            wage_paid_on_time=True,
            actual_wage_received=16000.0,
            work_environment_rating=5,
            early_exit_risk="LOW",
            worker_notes="Salary received via direct UPI on 1st of month. Employer provided safety harness and helmet as promised.",
            employer_notes="Rahul completed 3 rooftop installations cleanly without any redo. Highly punctual.",
            retention_confirmed=True,
            trust_score_impact=3.0
        )

        fup2 = FollowUpRecord(
            id="fup-02",
            match_id=match2.id,
            worker_name=worker2.name,
            employer_name=job2.employer_name,
            trade="Solar PV & Inverter Grid-Tie Wiring",
            day_milestone=60,
            due_date="2027-01-18",
            status="SCHEDULED",
            early_exit_risk="LOW",
            retention_confirmed=True,
            trust_score_impact=2.0
        )

        fup3 = FollowUpRecord(
            id="fup-03",
            match_id="match-historical-03",
            worker_name="Manoj Karmakar",
            employer_name="Maa Tara Metal Works",
            trade="Precision MIG/ARC Welding",
            day_milestone=90,
            due_date="2026-11-15",
            status="COMPLETED",
            wage_paid_on_time=True,
            actual_wage_received=17500.0,
            work_environment_rating=5,
            early_exit_risk="LOW",
            worker_notes="Completed 90 days successfully! Promoted to senior fabricator with ₹1,000 raise.",
            employer_notes="Reliable craftsperson verified through video. Early exit risk avoided completely.",
            retention_confirmed=True,
            trust_score_impact=5.0
        )

        self.follow_ups[fup1.id] = fup1
        self.follow_ups[fup2.id] = fup2
        self.follow_ups[fup3.id] = fup3

        # Initial Agent Activity Logs
        self.add_log("Orchestrator", "SYSTEM_BOOT", "Orchestrator initialized with 4 specialized agents + 1 follow-up retention monitor", "INFO")
        self.add_log("ListingAgent", "VERIFICATION_SUCCESS", "Verified listing job-101 (Kisan Agro Engineering) - MSME authenticated", "SUCCESS")
        self.add_log("ListingAgent", "SCAM_BLOCKED", "Pre-screened & blocked malicious posting job-999 (Advance fee detected)", "WARNING")
        self.add_log("SkillAgent", "VIDEO_ASSESSED", "Subhashish Soren scored 94/100 on Tractor Hydraulics using standardized rubric", "SUCCESS")
        self.add_log("MatchingAgent", "MATCH_COMPUTED", "Generated 96% match score between Subhashish Soren and Kisan Agro", "SUCCESS")
        self.add_log("ConsentAgent", "PRIVACY_GUARD_ENGAGED", "Subhashish's phone masked pending explicit worker authorization", "INFO")
        self.add_log("FollowUpAgent", "RETENTION_CHECK_PASSED", "30-day follow-up verified for Rahul Roy: 100% wage receipt confirmed", "SUCCESS")

db = Database()
