"""
Orchestrator Agent: Routes tasks, calls tools, and coordinates multi-agent workflow.
Flags cases for human review (Human-in-the-loop).
(Slide 4, 5)
"""

import uuid
from typing import Dict, Any, List, Optional
from app.agents.listing_agent import ListingAgent
from app.agents.skill_agent import SkillAgent
from app.agents.matching_agent import MatchingAgent
from app.agents.consent_agent import ConsentAgent
from app.agents.followup_agent import FollowUpAgent
from app.models import EmployerListing, WorkerProfile, JobMatch, SkillAssessment

class OrchestratorAgent:
    def __init__(self, database):
        self.name = "OrchestratorAgent"
        self.db = database
        self.listing_agent = ListingAgent()
        self.skill_agent = SkillAgent()
        self.matching_agent = MatchingAgent()
        self.consent_agent = ConsentAgent()
        self.followup_agent = FollowUpAgent()

    def process_new_employer_listing(self, listing_data: Dict[str, Any]) -> EmployerListing:
        """
        Step 1 & 2: Employer posts -> Orchestrator routes to Listing Agent for pre-verification.
        """
        job_id = listing_data.get("id") or f"job-{uuid.uuid4().hex[:6]}"
        
        self.db.add_log(
            "Orchestrator",
            "ROUTE_LISTING_VERIFICATION",
            f"Routing job '{listing_data.get('job_title')}' from {listing_data.get('business_name')} to ListingAgent",
            "INFO"
        )

        # Listing Agent Audit
        report = self.listing_agent.verify_listing(listing_data)

        status = "VERIFIED" if report.is_safe else ("FLAGGED_FOR_HUMAN_REVIEW" if report.requires_human_review else "REJECTED")

        listing = EmployerListing(
            id=job_id,
            employer_name=listing_data.get("employer_name", "Anonymous"),
            business_name=listing_data.get("business_name", "Local Enterprise"),
            phone=listing_data.get("phone", ""),
            district=listing_data.get("district", "Purba Bardhaman"),
            state=listing_data.get("state", "West Bengal"),
            trade_category=listing_data.get("trade_category", "Tractor & Agri-Machinery Hydraulics"),
            job_title=listing_data.get("job_title", "Technician"),
            wage_offered=float(listing_data.get("wage_offered", 14000.0)),
            wage_type=listing_data.get("wage_type", "monthly"),
            experience_months_required=int(listing_data.get("experience_months_required", 6)),
            job_description=listing_data.get("job_description", ""),
            lodging_provided=bool(listing_data.get("lodging_provided", False)),
            food_provided=bool(listing_data.get("food_provided", False)),
            verification_status=status,
            verification_report=report
        )

        self.db.listings[job_id] = listing

        if report.is_safe:
            self.db.add_log(
                "ListingAgent",
                "LISTING_VERIFIED_SAFE",
                f"Job #{job_id} approved: identity verified, wage compliant, zero fraud detected.",
                "SUCCESS"
            )
        elif report.requires_human_review:
            self.db.add_log(
                "Orchestrator",
                "HUMAN_IN_THE_LOOP_ESCALATION",
                f"Job #{job_id} flagged for human review. Ambiguous wage or unverified identity.",
                "ACTION_REQUIRED"
            )
            self.db.human_review_queue.append({
                "id": f"hr-{uuid.uuid4().hex[:6]}",
                "item_type": "JOB_LISTING",
                "item_id": job_id,
                "title": listing.job_title,
                "reason": report.ai_rationale,
                "timestamp": listing.created_at
            })
        else:
            self.db.add_log(
                "ListingAgent",
                "PREDATORY_LISTING_BLOCKED",
                f"Job #{job_id} blocked: {', '.join(report.red_flags)}",
                "WARNING"
            )

        return listing

    def process_worker_skill_video(
        self,
        worker_id: str,
        trade: str,
        task_name: str,
        video_filename: str = "",
        observed_actions: List[str] = None,
        safety_gear_detected: List[str] = None,
        duration_seconds: int = 45,
        lighting_quality: str = "GOOD"
    ) -> SkillAssessment:
        """
        Step 3: Worker submits video -> Orchestrator routes to Skill Agent.
        Scores task with fixed rubric & bias control.
        """
        self.db.add_log(
            "Orchestrator",
            "ROUTE_SKILL_ANALYSIS",
            f"Routing skill assessment video for worker #{worker_id} in trade '{trade}' to SkillAgent",
            "INFO"
        )

        assessment = self.skill_agent.assess_skill_video(
            worker_id=worker_id,
            trade=trade,
            task_name=task_name,
            video_filename=video_filename,
            observed_actions=observed_actions,
            safety_gear_detected=safety_gear_detected,
            duration_seconds=duration_seconds,
            lighting_quality=lighting_quality
        )

        # Update worker record if exists, or create profile
        if worker_id in self.db.workers:
            self.db.workers[worker_id].skill_assessment = assessment
            worker = self.db.workers[worker_id]
        else:
            worker = WorkerProfile(
                id=worker_id,
                name="Applicant " + worker_id,
                phone_masked="+91 98*** •••••",
                phone_real="+91 98321 00000",
                district="Purba Bardhaman",
                state="West Bengal",
                primary_trade=trade,
                experience_months=12,
                minimum_wage_expected=14000.0,
                skill_assessment=assessment
            )
            self.db.workers[worker_id] = worker

        if assessment.human_review_status == "FLAGGED_LOW_CONFIDENCE":
            self.db.add_log(
                "Orchestrator",
                "HUMAN_IN_THE_LOOP_ESCALATION",
                f"Skill video for worker #{worker_id} has low confidence ({assessment.confidence_score}%). Flagged for human review.",
                "ACTION_REQUIRED"
            )
            self.db.human_review_queue.append({
                "id": f"hr-{uuid.uuid4().hex[:6]}",
                "item_type": "SKILL_VIDEO",
                "item_id": assessment.id,
                "title": f"Skill Video: {worker.name} - {trade}",
                "reason": f"Low video confidence ({assessment.confidence_score}%). Lighting: {lighting_quality}.",
                "timestamp": worker.created_at
            })
        else:
            self.db.add_log(
                "SkillAgent",
                "SKILL_CERTIFICATION_ISSUED",
                f"Worker #{worker_id} awarded {assessment.badge_title} ({assessment.overall_score}/100) using bias-free rubric.",
                "SUCCESS"
            )

        return assessment

    def run_matching_engine(self, worker_id: str) -> List[JobMatch]:
        """
        Step 4: Orchestrator routes worker and all verified listings to Matching Agent.
        """
        worker = self.db.workers.get(worker_id)
        if not worker:
            return []

        self.db.add_log(
            "Orchestrator",
            "ROUTE_MATCHING",
            f"Invoking MatchingAgent for worker '{worker.name}' across verified database listings",
            "INFO"
        )

        all_jobs = list(self.db.listings.values())
        matches = self.matching_agent.match_worker_to_jobs(worker, all_jobs)

        for match in matches:
            self.db.matches[match.id] = match

        self.db.add_log(
            "MatchingAgent",
            "MATCHING_COMPLETE",
            f"Found {len(matches)} verified matches for {worker.name}. Top match score: {matches[0].overall_match_score if matches else 0}%",
            "SUCCESS"
        )

        return matches

    def request_worker_consent(self, match_id: str, language: str = "hi") -> Dict[str, Any]:
        """
        Step 5 (Part A): Consent Agent prepares privacy briefing for worker.
        """
        match = self.db.matches.get(match_id)
        if not match:
            return {"error": "Match not found"}

        self.db.add_log(
            "ConsentAgent",
            "CONSENT_REQUEST_PREPARED",
            f"Worker privacy shield active. Preparing consent briefing for {match.worker.name} in '{language}'",
            "INFO"
        )

        return self.consent_agent.prepare_consent_request(match, language)

    def execute_worker_consent(self, match_id: str, decision: str) -> Dict[str, Any]:
        """
        Step 5 (Part B): Worker makes choice -> Consent Agent updates contact unmasking & spawns follow-ups!
        """
        match = self.db.matches.get(match_id)
        if not match:
            return {"error": "Match not found"}

        updated_match, result = self.consent_agent.process_consent_decision(match, decision)
        self.db.matches[match_id] = updated_match

        if decision == "GRANTED":
            self.db.add_log(
                "ConsentAgent",
                "CONSENT_GRANTED_UNLOCKED",
                f"Worker '{match.worker.name}' approved contact sharing with '{match.job.business_name}'. Mutual channel opened.",
                "SUCCESS"
            )

            # Schedule 30, 60, 90 day follow-up lifecycle retention agent checks!
            follow_ups = self.followup_agent.schedule_milestones(
                match_id=match.id,
                worker_name=match.worker.name,
                employer_name=match.job.employer_name,
                trade=match.job.trade_category
            )
            for f in follow_ups:
                self.db.follow_ups[f.id] = f

            self.db.add_log(
                "FollowUpAgent",
                "RETENTION_LIFECYCLE_SCHEDULED",
                f"Automated 30, 60, and 90-day retention checks scheduled for {match.worker.name}.",
                "INFO"
            )
        else:
            self.db.add_log(
                "ConsentAgent",
                "CONSENT_DECLINED",
                f"Worker '{match.worker.name}' declined opportunity. Contact info strictly withheld.",
                "INFO"
            )

        return result
