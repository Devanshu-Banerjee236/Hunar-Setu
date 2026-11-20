"""
Configuration, benchmarks, and multilingual voice dictionaries for Hunar Setu.
"""

DISTRICT_WAGE_BENCHMARKS = {
    "Purba Bardhaman": {"skilled_monthly": 14500, "semi_skilled": 12200, "daily_min": 560},
    "Bankura": {"skilled_monthly": 13800, "semi_skilled": 11500, "daily_min": 530},
    "Birbhum": {"skilled_monthly": 13500, "semi_skilled": 11200, "daily_min": 520},
    "Nadia": {"skilled_monthly": 14200, "semi_skilled": 12000, "daily_min": 550},
    "Hooghly": {"skilled_monthly": 15000, "semi_skilled": 12800, "daily_min": 580},
    "Patna": {"skilled_monthly": 14800, "semi_skilled": 12500, "daily_min": 570},
    "Gaya": {"skilled_monthly": 13200, "semi_skilled": 11000, "daily_min": 510},
    "Varanasi": {"skilled_monthly": 14000, "semi_skilled": 11800, "daily_min": 540},
    "Gorakhpur": {"skilled_monthly": 13500, "semi_skilled": 11300, "daily_min": 520},
    "Default": {"skilled_monthly": 13500, "semi_skilled": 11500, "daily_min": 520}
}

SCAM_TRIGGER_PATTERNS = [
    "registration fee", "security deposit", "pay advance", "processing fee",
    "part time 50000 daily", "easy money", "no work needed", "send money to activate",
    "telegram task", "crypto", "pan card fee", "laptop security money"
]

TRADE_RUBRICS = {
    "Tractor & Agri-Machinery Hydraulics": {
        "technical_steps": [
            "Hydraulic spool valve pressure check",
            "O-ring replacement & lubrication",
            "High-pressure line bleeding",
            "Torque tightening to manufacturer spec"
        ],
        "ppe_required": ["Cut-resistant gloves", "Steel-toe safety shoes", "Safety goggles"],
        "critical_flaws": ["Working under unchocked implements", "Dry seal installation"]
    },
    "Solar PV & Inverter Grid-Tie Wiring": {
        "technical_steps": [
            "DC isolator switch disengagement & LOTO verification",
            "MC4 connector crimping & polarity testing",
            "Earthing pit resistance verification (<5 ohms)",
            "Inverter phase matching & conduit sealing"
        ],
        "ppe_required": ["1000V rated insulated gloves", "Safety helmet", "Voltage detector pen"],
        "critical_flaws": ["Cross-polarity connection", "Ungrounded inverter body"]
    },
    "Precision MIG/ARC Welding": {
        "technical_steps": [
            "Bevel edge preparation & oxide removal",
            "Root gap alignment & tack welding",
            "Uniform weave bead deposition",
            "Slag chipping & penetration inspection"
        ],
        "ppe_required": ["Auto-darkening welding helmet", "Split cowhide leather apron", "Welding gauntlets"],
        "critical_flaws": ["Porosity from damp electrode", "Welding without eye shield"]
    },
    "Mobile & Hardware Chip-Level Repair": {
        "technical_steps": [
            "Hot air rework station temperature calibration (340°C)",
            "Flux application & micro-BGA IC desoldering",
            "Solder wick pad cleaning",
            "Microscope solder ball alignment"
        ],
        "ppe_required": ["ESD wrist strap", "Fume extractor", "ESD tweezers"],
        "critical_flaws": ["PCB pad tearing from excess heat", "Static discharge"]
    },
    "Commercial Masonry & Brickwork Bonding": {
        "technical_steps": [
            "Mortar batch proportioning (1:4 cement sand)",
            "Corner plumb line stringing",
            "English bond alternating header-stretcher lay",
            "Raked joint finishing for plaster key"
        ],
        "ppe_required": ["Hard hat", "Rubber gloves for lime contact", "Steel-toe work boots"],
        "critical_flaws": ["Unsoaked dry bricks", "Plumb misalignment > 3mm"]
    },
    "Heavy Garment & Textile Tailoring": {
        "technical_steps": [
            "Fabric grain alignment & chalk marking",
            "Thread tension dial setting for twill weave",
            "Lockstitch seam allowance consistency",
            "Overlock edge finishing"
        ],
        "ppe_required": ["Finger guard", "Proper ergonomic chair posture", "Needle plate shield"],
        "critical_flaws": ["Seam puckering", "Skipped stitches"]
    }
}

LOCALIZED_STRINGS = {
    "en": {
        "title": "Hunar Setu",
        "tagline": "Verified skills. Trusted jobs.",
        "byline": "Team The Bridge Coders · Jadavpur University",
        "post_job": "Post a Job",
        "verify_skills": "Skill Video Test",
        "matches": "Matched Jobs",
        "consent": "Worker Consent Protocol",
        "follow_up": "30-60-90 Day Retention",
        "trust_safety": "Trust & Safety Center",
        "human_review": "Human-in-the-Loop",
        "give_consent": "Give Consent & Share Details",
        "consent_explanation": "Your phone number and village address will only be shared with this verified employer upon your consent.",
        "verified_badge": "100% Pre-Verified Listing"
    },
    "hi": {
        "title": "हुनर सेतु",
        "tagline": "सत्यापित कौशल। विश्वसनीय रोज़गार।",
        "byline": "टीम द ब्रिज कोडर्स · जादवपुर विश्वविद्यालय",
        "post_job": "नौकरी पोस्ट करें",
        "verify_skills": "कौशल वीडियो परीक्षण",
        "matches": "उपयुक्त नौकरियां",
        "consent": "श्रमिक सहमति सुरक्षा",
        "follow_up": "30-60-90 दिन फ़ॉलो-अप",
        "trust_safety": "सुरक्षा और विश्वास केंद्र",
        "human_review": "मानव समीक्षा (रिव्यू)",
        "give_consent": "सहमति दें और संपर्क साझा करें",
        "consent_explanation": "आपकी अनुमति के बिना नियोक्ता को आपका फ़ोन नंबर या पता नहीं दिखेगा। केवल आपकी मंज़ूरी के बाद ही विवरण साझा होगा।",
        "verified_badge": "सत्यापित और सुरक्षित नौकरी"
    },
    "bn": {
        "title": "হুনর সেতু",
        "tagline": "যাচাইকৃত দক্ষতা। বিশ্বস্ত কর্মসংস্থান।",
        "byline": "টিম দ্য ব্রিজ কোডার্স · যাদবপুর বিশ্ববিদ্যালয়",
        "post_job": "কাজের বিজ্ঞপ্তি দিন",
        "verify_skills": "দক্ষতা ভিডিও পরীক্ষা",
        "matches": "উপযুক্ত কাজ",
        "consent": "কর্মীর সম্মতি প্রোটোকল",
        "follow_up": "৩০-৬০-৯০ দিন ফলো-আপ",
        "trust_safety": "বিশ্বাস ও নিরাপত্তা কেন্দ্র",
        "human_review": "হিউম্যান রিভিউ",
        "give_consent": "সম্মতি দিন ও তথ্য শেয়ার করুন",
        "consent_explanation": "আপনার স্পষ্ট সম্মতি ছাড়া নিয়োগকর্তার কাছে আপনার ফোন নম্বর বা ঠিকানা পৌঁছাবে না। আপনি রাজি হলেই তথ্য প্রকাশ পাবে।",
        "verified_badge": "১০০% যাচাইকৃত ও নিরাপদ কাজ"
    }
}
