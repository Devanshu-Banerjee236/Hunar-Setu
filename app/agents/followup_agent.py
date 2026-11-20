"""
Follow-up Agent: Checks in at 30, 60, and 90 days and feeds results back into matching.
(Slide 4, 7)
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List
from app.models import FollowUpRecord, WorkerProfile, EmployerListing

class FollowUpAgent:
    def __init__(self):
        self.name = "FollowUpAgent"

    def schedule_milestones(self, match_id: str, worker_name: str, employer_name: str, trade: str) -> List[FollowUpRecord]:
        """
        Schedules automated 30, 60, and 90-day retention checkpoints.
        """
        milestones = []
        for days in [30, 60, 90]:
            fup = FollowUpRecord(
                id=f"fup-{uuid.uuid4().hex[:6]}",
                match_id=match_id,
                worker_name=worker_name,
                employer_name=employer_name,
                trade=trade,
                day_milestone=days,
                due_date=f"Day +{days}",
                status="SCHEDULED",
                early_exit_risk="LOW"
            )
            milestones.append(fup)
        return milestones

    def record_check_in(
        self,
        record: FollowUpRecord,
        wage_paid_on_time: bool,
        actual_wage_received: float,
        work_environment_rating: int, # 1 to 5
        retention_confirmed: bool,
        worker_notes: str = "",
        employer_notes: str = ""
    ) -> Dict[str, Any]:
        """
        Records 30/60/90 day survey responses and calculates trust impact feedback.
        Feeds results back into the matching algorithm.
        """
        record.wage_paid_on_time = wage_paid_on_time
        record.actual_wage_received = actual_wage_received
        record.work_environment_rating = work_environment_rating
        record.retention_confirmed = retention_confirmed
        record.worker_notes = worker_notes
        record.employer_notes = employer_notes
        record.status = "COMPLETED"

        trust_impact = 0.0
        early_exit_risk = "LOW"

        # 1. Timely Wage Receipt Check
        if wage_paid_on_time:
            trust_impact += 2.5
        else:
            trust_impact -= 10.0
            early_exit_risk = "HIGH"

        # 2. Workplace Rating Check
        if work_environment_rating >= 4:
            trust_impact += 1.5
        elif work_environment_rating <= 2:
            trust_impact -= 5.0
            early_exit_risk = "HIGH" if early_exit_risk == "HIGH" else "MEDIUM"

        # 3. Retention Check
        if not retention_confirmed:
            early_exit_risk = "HIGH"
            trust_impact -= 15.0

        record.early_exit_risk = early_exit_risk
        record.trust_score_impact = trust_impact

        feedback_summary = (
            f"Day {record.day_milestone} check-in recorded for {record.worker_name} at {record.employer_name}. "
            f"Wage on time: {wage_paid_on_time} (₹{actual_wage_received:,.0f}). "
            f"Environment rating: {work_environment_rating}/5. "
            f"Feedback impact on matching trust weight: {'+' if trust_impact >= 0 else ''}{trust_impact:.1f}%."
        )

        return {
            "record": record,
            "trust_impact": trust_impact,
            "early_exit_risk": early_exit_risk,
            "feedback_summary": feedback_summary
        }
