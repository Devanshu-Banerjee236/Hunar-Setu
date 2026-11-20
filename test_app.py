"""
Unit & Integration Test for Hunar Setu Multi-Agent System
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import db
from app.agents.orchestrator import OrchestratorAgent

def run_tests():
    print(">>> 1. Initializing Orchestrator Agent...")
    orchestrator = OrchestratorAgent(db)
    assert orchestrator is not None
    print("✓ Orchestrator initialized.")

    print(">>> 2. Testing Listing Agent Verification (Legitimate Job)...")
    legit_job = {
        "employer_name": "Test Employer",
        "business_name": "Modern Agri Works",
        "phone": "+91 98321 11223",
        "district": "Purba Bardhaman",
        "state": "West Bengal",
        "trade_category": "Tractor & Agri-Machinery Hydraulics",
        "job_title": "Hydraulic Mechanic",
        "wage_offered": 19000.0,
        "job_description": "Overhaul pumps and spool valves. Lodging provided.",
        "lodging_provided": True
    }
    result_job = orchestrator.process_new_employer_listing(legit_job)
    assert result_job.verification_status == "VERIFIED", f"Expected VERIFIED, got {result_job.verification_status}"
    print(f"✓ Legitimate job verified: {result_job.verification_report.ai_rationale[:60]}...")

    print(">>> 3. Testing Listing Agent Scam Detection (Fraud Advance Fee)...")
    scam_job = {
        "employer_name": "Fake Agent",
        "business_name": "Quick Cash Ltd",
        "phone": "+91 88990 00000",
        "district": "Purba Bardhaman",
        "state": "West Bengal",
        "trade_category": "Mobile & Hardware Chip-Level Repair",
        "job_title": "Easy Data / Mobile Assistant",
        "wage_offered": 50000.0,
        "job_description": "Pay Rs 1200 registration fee to get this job.",
    }
    scam_result = orchestrator.process_new_employer_listing(scam_job)
    assert scam_result.verification_status == "REJECTED", f"Expected REJECTED, got {scam_result.verification_status}"
    print(f"✓ Scam detected and blocked: {scam_result.verification_report.ai_rationale[:60]}...")

    print(">>> 4. Testing Skill Agent Video Assessment with Bias Control...")
    skill = orchestrator.process_worker_skill_video(
        worker_id="w-test-1",
        trade="Tractor & Agri-Machinery Hydraulics",
        task_name="Spool valve pressure check",
        observed_actions=["Spool valve pressure check", "O-ring replacement & lubrication"],
        safety_gear_detected=["Cut-resistant gloves", "Safety goggles"]
    )
    assert skill.overall_score > 80.0
    assert skill.bias_control.appearance_agnostic is True
    print(f"✓ Skill assessed: {skill.badge_title} - Score: {skill.overall_score}/100")

    print(">>> 5. Testing Matching Agent...")
    matches = orchestrator.run_matching_engine("w-test-1")
    assert len(matches) > 0
    top_match = matches[0]
    print(f"✓ Top match: {top_match.job.job_title} ({top_match.overall_match_score}% match score)")
    print(f"  Explainable AI (Hindi): {top_match.explanation_hi[:70]}...")

    print(">>> 6. Testing Consent Agent Privacy Protocol...")
    # Check that contact is initially locked
    assert top_match.contact_unlocked is False
    # Execute consent
    consent_res = orchestrator.execute_worker_consent(top_match.id, "GRANTED")
    assert top_match.contact_unlocked is True
    assert top_match.consent_status == "GRANTED"
    print(f"✓ Consent granted. Contact unlocked: {consent_res['unlocked_contact']['phone']}")

    print(">>> 7. Testing Follow-up Agent 30-60-90 Day Retention Milestones...")
    fups = [f for f in db.follow_ups.values() if f.match_id == top_match.id]
    assert len(fups) == 3
    print(f"✓ Scheduled {len(fups)} retention milestones: {[f.day_milestone for f in fups]} days.")

    # Record 30-day check-in
    fup30 = fups[0]
    checkin = orchestrator.followup_agent.record_check_in(
        record=fup30,
        wage_paid_on_time=True,
        actual_wage_received=19000.0,
        work_environment_rating=5,
        retention_confirmed=True,
        worker_notes="Salary received on time, lodging is clean."
    )
    assert checkin["trust_impact"] > 0
    print(f"✓ 30-day check-in processed. Trust impact: +{checkin['trust_impact']}%")

    print("\n===========================================================")
    print("ALL MULTI-AGENT ARCHITECTURE TESTS PASSED SUCCESSFULLY! (7/7)")
    print("===========================================================")

if __name__ == "__main__":
    run_tests()
