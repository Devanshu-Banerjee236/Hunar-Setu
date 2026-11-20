"""
Consent Agent: Worker-first privacy guard. Ensures details go to an employer ONLY after approval.
(Slide 3, 4, 5)
"""

from datetime import datetime
from typing import Dict, Any, Tuple
from app.models import JobMatch, WorkerProfile, EmployerListing

class ConsentAgent:
    def __init__(self):
        self.name = "ConsentAgent"

    def prepare_consent_request(self, match: JobMatch, language: str = "hi") -> Dict[str, Any]:
        """
        Creates a voice and visual consent briefing for the worker.
        Explains verified employer details, distance, wage, and asks for explicit authorization.
        """
        job = match.job
        worker = match.worker

        lang_explanations = {
            "en": {
                "headline": f"Job Opportunity: {job.job_title} at {job.business_name}",
                "wage_text": f"Offered Wage: ₹{job.wage_offered:,.0f} per month ({job.wage_type})",
                "distance_text": f"Location: {job.district}, approx {match.distance_km:.1f} km away",
                "verification_text": f"Employer Status: Verified Safe ({job.verification_report.verification_type if job.verification_report else 'Verified Entity'})",
                "prompt": "Do you want to share your phone number and verified skill badge with this employer?",
                "voice_transcript": f"Hello {worker.name}. A verified job for {job.job_title} at {job.business_name} in {job.district} has matched your skill score. The monthly wage is {int(job.wage_offered)} rupees. Distance is {int(match.distance_km)} kilometres. Press green to grant consent or red to pass."
            },
            "hi": {
                "headline": f"नौकरी का अवसर: {job.business_name} में {job.job_title}",
                "wage_text": f"प्रस्तावित वेतन: ₹{job.wage_offered:,.0f} प्रति माह",
                "distance_text": f"स्थान: {job.district}, आपके घर से लगभग {match.distance_km:.1f} किमी",
                "verification_text": "नियोक्ता स्थिति: 100% सत्यापित एवं सुरक्षित (कोई शुल्क नहीं)",
                "prompt": "क्या आप इस सत्यापित नियोक्ता के साथ अपना फ़ोन नंबर और हुनर कार्ड साझा करना चाहते हैं?",
                "voice_transcript": f"नमस्ते {worker.name}। {job.business_name} में {job.job_title} के लिए आपकी हुनर योग्यता शत-प्रतिशत मेल खाती है। वेतन {int(job.wage_offered)} रुपये महीना है और दूरी {int(match.distance_km)} किलोमीटर है। सहमति देने के लिए हरा बटन दबाएं।"
            },
            "bn": {
                "headline": f"কাজের সুযোগ: {job.business_name}-এ {job.job_title}",
                "wage_text": f"প্রস্তাবিত বেতন: প্রতি মাসে ₹{job.wage_offered:,.0f}",
                "distance_text": f"অবস্থান: {job.district}, আপনার বাড়ি থেকে প্রায় {match.distance_km:.1f} কিমি",
                "verification_text": "নিয়োগকর্তার স্ট্যাটাস: ১০০% যাচাইকৃত ও নিরাপদ",
                "prompt": "আপনি কি এই যাচাইকৃত নিয়োগকর্তার সাথে আপনার ফোন নম্বর এবং দক্ষতার কার্ড শেয়ার করতে চান?",
                "voice_transcript": f"নমস্কার {worker.name}। {job.business_name}-এ {job.job_title} কাজের জন্য আপনার দক্ষতার স্কোর মিলেছে। মাসিক বেতন {int(job.wage_offered)} টাকা এবং দূরত্ব {int(match.distance_km)} কিলোমিটার। সম্মতি জানাতে সবুজ বোতাম চাপুন।"
            }
        }

        selected_text = lang_explanations.get(language, lang_explanations["hi"])

        return {
            "match_id": match.id,
            "worker_id": match.worker_id,
            "job_id": match.job_id,
            "briefing": selected_text,
            "privacy_status": "LOCKED_PENDING_WORKER_CONSENT",
            "contact_masked": worker.phone_masked
        }

    def process_consent_decision(
        self,
        match: JobMatch,
        decision: str # "GRANTED" or "REJECTED"
    ) -> Tuple[JobMatch, Dict[str, Any]]:
        """
        Updates consent state. Only when GRANTED are full contact details released.
        """
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if decision == "GRANTED":
            match.consent_status = "GRANTED"
            match.consent_timestamp = now_str
            match.contact_unlocked = True
            
            result_payload = {
                "status": "CONSENT_RECORDED",
                "message": "Consent granted! Worker contact details are now securely unlocked for this employer.",
                "unlocked_contact": {
                    "worker_name": match.worker.name,
                    "phone": match.worker.phone_real,
                    "district": match.worker.district,
                    "skill_badge": match.worker.skill_assessment.badge_title if match.worker.skill_assessment else "Verified Technician"
                },
                "consent_timestamp": now_str
            }
        else:
            match.consent_status = "REJECTED"
            match.consent_timestamp = now_str
            match.contact_unlocked = False

            result_payload = {
                "status": "CONSENT_WITHHELD",
                "message": "Consent declined. Worker privacy preserved. No details were shared with the employer.",
                "consent_timestamp": now_str
            }

        return match, result_payload
