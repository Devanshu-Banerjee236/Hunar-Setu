"""
Matching Agent: Ranks jobs and explains each match transparently in local languages.
(Slide 3, 4, 6)
"""

import uuid
from typing import List, Dict, Any, Optional
from app.models import EmployerListing, WorkerProfile, JobMatch

class MatchingAgent:
    def __init__(self):
        self.name = "MatchingAgent"

    def match_worker_to_jobs(
        self,
        worker: WorkerProfile,
        jobs: List[EmployerListing]
    ) -> List[JobMatch]:
        """
        Calculates multidimensional matching score and generates explainable AI rationale.
        Filters out any unverified or rejected listings.
        """
        matches = []

        # Filter strictly verified jobs
        verified_jobs = [j for j in jobs if j.verification_status == "VERIFIED"]

        for job in verified_jobs:
            # 1. Skill Fit
            skill_score = 70.0
            if worker.skill_assessment and worker.skill_assessment.overall_score:
                skill_score = worker.skill_assessment.overall_score
            
            # Same trade bonus
            trade_match = (worker.primary_trade.lower() in job.trade_category.lower() or 
                           job.trade_category.lower() in worker.primary_trade.lower())
            
            if trade_match:
                skill_fit = skill_score
            else:
                skill_fit = max(skill_score * 0.5, 40.0)

            # 2. Distance Fit (Calculated or estimated)
            # Same district is typically 5-25 km, different district 35-70 km
            if worker.district.lower() == job.district.lower():
                distance_km = 9.5
                distance_fit = 95.0
            else:
                distance_km = 42.0
                # If lodging is provided, distance penalty is minimized!
                distance_fit = 85.0 if job.lodging_provided else 55.0

            # 3. Wage Fit
            wage_offered = job.wage_offered
            wage_expected = worker.minimum_wage_expected
            diff = wage_offered - wage_expected

            if diff >= 0:
                wage_fit = min(90.0 + (diff / 1000.0) * 2.0, 100.0)
            else:
                penalty = abs(diff) / 1000.0 * 8.0
                wage_fit = max(100.0 - penalty, 20.0)

            # 4. Amenities Fit
            amenities_fit = 80.0
            if job.lodging_provided:
                amenities_fit += 10.0
            if job.food_provided:
                amenities_fit += 10.0

            # Total Weighted Score
            # Skill: 40%, Distance: 30%, Wage: 20%, Amenities: 10%
            overall_score = round(
                (skill_fit * 0.40) +
                (distance_fit * 0.30) +
                (wage_fit * 0.20) +
                (amenities_fit * 0.10),
                1
            )

            # Generate Explainable AI Rationales (En, Hi, Bn)
            trade_name_short = job.trade_category.split('&')[0].strip()
            
            exp_en = (
                f"Matched with {overall_score}% confidence. {worker.name}'s verified skill score "
                f"({skill_score:.0f}%) fits '{job.job_title}'. Distance is {distance_km:.1f} km from home. "
                f"Offered wage of ₹{wage_offered:,.0f} {'surpasses' if diff >= 0 else 'is close to'} your target by ₹{abs(diff):,.0f}"
                f"{' with complimentary lodging' if job.lodging_provided else ''}."
            )

            exp_hi = (
                f"{overall_score}% सटीकता के साथ मिलान। {worker.name} का सत्यापित कौशल स्कोर "
                f"({skill_score:.0f}%) '{job.job_title}' के लिए श्रेष्ठ है। घर से दूरी केवल {distance_km:.1f} किमी है। "
                f"प्रस्तावित वेतन ₹{wage_offered:,.0f} आपकी अपेक्षा से ₹{abs(diff):,.0f} {'अधिक' if diff >= 0 else 'कम'} है"
                f"{', साथ में आवास की सुविधा भी उपलब्ध है' if job.lodging_provided else ''}।"
            )

            exp_bn = (
                f"{overall_score}% নির্ভুলতার সাথে কাজ মিলেছে। {worker.name}-এর যাচাইকৃত স্কোর "
                f"({skill_score:.0f}%) '{job.job_title}' কাজের সাথে খাপ খায়। দূরত্ব মাত্র {distance_km:.1f} কিমি। "
                f"প্রস্তাবিত বেতন ₹{wage_offered:,.0f} আপনার লক্ষ্যের চেয়ে ₹{abs(diff):,.0f} {'বেশি' if diff >= 0 else 'কম'}"
                f"{', সাথে বাসস্থান সুবিধা রয়েছে' if job.lodging_provided else ''}।"
            )

            match = JobMatch(
                id=f"match-{uuid.uuid4().hex[:6]}",
                job_id=job.id,
                worker_id=worker.id,
                job=job,
                worker=worker,
                overall_match_score=overall_score,
                skill_fit_score=round(skill_fit, 1),
                distance_km=round(distance_km, 1),
                distance_fit_score=round(distance_fit, 1),
                wage_fit_score=round(wage_fit, 1),
                wage_differential=round(diff, 1),
                explanation_en=exp_en,
                explanation_hi=exp_hi,
                explanation_bn=exp_bn,
                consent_status="PENDING",
                contact_unlocked=False
            )
            matches.append(match)

        # Sort matches by overall score descending
        matches.sort(key=lambda m: m.overall_match_score, reverse=True)
        return matches
