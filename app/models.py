from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class VerificationReport(BaseModel):
    scam_risk_score: float = 0.0  # 0 to 100 (lower is safer)
    is_safe: bool = True
    wage_compliance: str = "COMPLIANT" # COMPLIANT, BELOW_STATUTORY_MINIMUM, SUSPICIOUS_HIGH
    statutory_benchmark_wage: float = 12500.0
    identity_verified: bool = True
    verification_type: str = "GSTIN/Udyam Verified"
    red_flags: List[str] = []
    confidence: float = 95.0
    requires_human_review: bool = False
    ai_rationale: str = ""

class EmployerListing(BaseModel):
    id: str
    employer_name: str
    business_name: str
    phone: str
    district: str
    state: str
    trade_category: str
    job_title: str
    wage_offered: float
    wage_type: str = "monthly"  # monthly or daily
    daily_wage_equivalent: float = 550.0  # e.g., ₹450 - ₹650 / day
    experience_months_required: int = 12
    job_description: str
    posting_source: str = "WHATSAPP"  # WHATSAPP, WEB_FORM, PANCHAYAT_OFFICE
    lodging_provided: bool = False
    food_provided: bool = False
    verification_status: str = "PENDING"  # PENDING, VERIFIED, FLAGGED_FOR_HUMAN_REVIEW, REJECTED
    verification_report: Optional[VerificationReport] = None
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M"))

class RubricBreakdown(BaseModel):
    technical_execution: float = 24.0  # out of 25
    safety_and_ppe: float = 23.0       # out of 25
    tool_handling: float = 24.5        # out of 25
    efficiency_precision: float = 22.5 # out of 25

class BiasControlMetrics(BaseModel):
    appearance_agnostic: bool = True
    accent_dialect_neutral: bool = True
    fixed_rubric_adherence: float = 99.4
    bias_audit_notes: str = "Scoring strictly isolated to kinematic tool movement and safety compliance. No facial or clothing weights."

class SkillAssessment(BaseModel):
    id: str
    worker_id: str
    trade: str
    task_name: str
    video_url: str = ""
    video_thumbnail: str = ""
    overall_score: float = 92.0
    confidence_score: float = 94.0
    rubric_breakdown: RubricBreakdown = Field(default_factory=RubricBreakdown)
    bias_control: BiasControlMetrics = Field(default_factory=BiasControlMetrics)
    badge_title: str = "Certified High-Precision Technician"
    badge_level: str = "Gold Level A"
    iti_certificate_verified: bool = True
    iti_roll_no: Optional[str] = "NCVT-WB-2024-88419"
    verified_competencies: List[str] = []
    improvement_feedback: List[str] = []
    human_review_status: str = "AUTO_PASSED" # AUTO_PASSED, FLAGGED_LOW_CONFIDENCE, HUMAN_CONFIRMED

class WorkerProfile(BaseModel):
    id: str
    name: str
    phone_masked: str  # e.g., +91 98*** 42109
    phone_real: str    # Protected until consent!
    district: str
    state: str
    primary_trade: str
    experience_months: int
    minimum_wage_expected: float
    daily_wage_expected: float = 450.0
    max_commute_km: float = 25.0
    seasonal_availability: str = "Immediate / Post-Harvest"  # e.g. Immediate, Post-Harvest
    preferred_language: str = "hi"  # hi, bn, en
    trust_score: float = 96.0
    retention_rating: float = 4.8
    skill_assessment: Optional[SkillAssessment] = None
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M"))

class JobMatch(BaseModel):
    id: str
    job_id: str
    worker_id: str
    job: Optional[EmployerListing] = None
    worker: Optional[WorkerProfile] = None
    overall_match_score: float = 92.0
    skill_fit_score: float = 95.0
    distance_km: float = 12.5
    distance_fit_score: float = 90.0
    wage_fit_score: float = 94.0
    wage_differential: float = 2000.0  # +2000 above expectations
    daily_wage: float = 550.0
    explanation_en: str = ""
    explanation_hi: str = ""
    explanation_bn: str = ""
    consent_status: str = "PENDING"  # PENDING, GRANTED, REJECTED
    consent_timestamp: Optional[str] = None
    contact_unlocked: bool = False
    scheduled_interview_call: Optional[str] = None  # Automated call slot

class FollowUpRecord(BaseModel):
    id: str
    match_id: str
    worker_name: str
    employer_name: str
    trade: str
    day_milestone: int # 30, 60, 90
    due_date: str
    status: str = "SCHEDULED" # SCHEDULED, COMPLETED, ALERT_RAISED
    wage_paid_on_time: Optional[bool] = None
    actual_wage_received: Optional[float] = None
    unpaid_wages_complaint: bool = False
    leaving_reason: Optional[str] = None # e.g. "None (Active)", "Wage delayed", "Harsh conditions"
    work_environment_rating: Optional[int] = None # 1 to 5
    early_exit_risk: str = "LOW" # LOW, MEDIUM, HIGH
    worker_notes: str = ""
    employer_notes: str = ""
    retention_confirmed: bool = True
    trust_score_impact: float = 2.0

class AgentLog(BaseModel):
    id: str
    timestamp: str = Field(default_factory=lambda: datetime.now().strftime("%H:%M:%S"))
    agent_name: str
    action: str
    details: str
    status: str = "SUCCESS"  # SUCCESS, WARNING, ACTION_REQUIRED, INFO
