/**
 * Hunar Setu - Main Application Logic
 * Implements end-to-end features from the presentation:
 * - 5-Step Demo Path (Post -> Verify -> Skill Video -> Match -> Consent)
 * - Multi-agent monitoring & Human-in-the-loop
 * - 30/60/90 Day Follow-up retention engine
 * - Multilingual translation (En, Hi, Bn) + Voice narration
 */

const state = {
  currentLang: 'hi', // default to Hindi for rural accessibility
  activeTab: 'demo',
  demoStep: 1,
  currentWorker: null,
  currentJob: null,
  currentMatch: null,
  videoSimulator: null,
  stats: {},
  jobs: [],
  workers: [],
  matches: [],
  followups: [],
  humanReviews: [],
  logs: []
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  setupLanguage();
  setupNavigation();
  initVideoSimulator();
  await refreshAllData();
  
  // Set up live polling of logs and stats every 4 seconds
  setInterval(refreshLogsAndStats, 4000);
});

function setupNavigation() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    if (content.id === `view-${tabId}`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  if (tabId === 'demo' && state.videoSimulator) {
    state.videoSimulator.startSimulation();
  }
}

// --- LANGUAGE & TRANSLATION ENGINE ---
const translations = {
  en: {
    hero_title: "Verified skills. Trusted jobs.",
    hero_subtitle: "Agentic AI connecting rural youth with verified employers while eliminating fraud, delays, and early exits.",
    step1_title: "1. Employer Posts",
    step1_desc: "Employer posts job details via message or conversational form.",
    step2_title: "2. Listing Verified",
    step2_desc: "Listing Agent validates identity, wage parity, and fraud patterns before any worker sees it.",
    step3_title: "3. Skill Video",
    step3_desc: "Worker shows a task. Skill Agent scores with fixed rubric and appearance-neutral bias control.",
    step4_title: "4. Job Matched",
    step4_desc: "Matching Agent ranks jobs on skill, distance, and wage with explainable AI rationale.",
    step5_title: "5. Worker Consents",
    step5_desc: "Worker-first privacy guard. Contact details are only unlocked after explicit worker consent.",
    btn_next_step: "Proceed to Next Step",
    btn_verify: "Run Listing Agent Verification",
    btn_assess_video: "Run Skill Agent Scoring",
    btn_find_matches: "Run Matching Agent",
    btn_give_consent: "Grant Consent & Share Details",
    btn_pass: "Pass / Do Not Share",
    consent_guarantee: "Your phone number is masked. Only when you consent will this verified employer receive your contact details."
  },
  hi: {
    hero_title: "सत्यापित कौशल। विश्वसनीय रोज़गार।",
    hero_subtitle: "ग्रामीण युवाओं को प्रामाणिक नियोक्ताओं से जोड़ने वाली एजेंटिक एआई प्रणाली, जो धोखाधड़ी और नौकरी छोड़ने की समस्या को रोकती है।",
    step1_title: "1. नियोक्ता पोस्ट करता है",
    step1_desc: "नियोक्ता संदेश या सरल फ़ॉर्म द्वारा काम का विवरण देता है।",
    step2_title: "2. विज्ञापन सत्यापन (लिस्टिंग एजेंट)",
    step2_desc: "श्रमिकों के देखने से पहले लिस्टिंग एजेंट न्यूनतम वेतन, पहचान और धोखाधड़ी की जांच करता है।",
    step3_title: "3. हुनर वीडियो टेस्ट (स्किल एजेंट)",
    step3_desc: "श्रमिक काम करके दिखाता है। स्किल एजेंट तय मानकों पर निष्पक्ष जांच कर स्कोर जारी करता है।",
    step4_title: "4. उपयुक्त नौकरी मिलान (मैचिंग एजेंट)",
    step4_desc: "मैचिंग एजेंट कौशल, दूरी और वेतन के आधार पर सर्वोत्तम नौकरी ढूंढकर कारण समझाता है।",
    step5_title: "5. श्रमिक की सहमति (कंसेंट एजेंट)",
    step5_desc: "श्रमिक की अनुमति के बिना फ़ोन नंबर नहीं दिया जाता। केवल आपकी सहमति पर ही संपर्क खुलेगा।",
    btn_next_step: "अगले चरण पर जाएं",
    btn_verify: "लिस्टिंग एजेंट जांच चलाएं",
    btn_assess_video: "स्किल एजेंट से वीडियो जांचें",
    btn_find_matches: "मैचिंग एजेंट से नौकरी खोजें",
    btn_give_consent: "सहमति दें और संपर्क साझा करें",
    btn_pass: "अस्वीकार करें / आगे बढ़ें",
    consent_guarantee: "आपका फ़ोन नंबर पूरी तरह सुरक्षित और छुपा हुआ है। आपकी सहमति पर ही नियोक्ता आपसे संपर्क कर सकेगा।"
  },
  bn: {
    hero_title: "যাচাইকৃত দক্ষতা। বিশ্বস্ত কর্মসংস্থান।",
    hero_subtitle: "গ্রামীণ যুবকদের বিশ্বস্ত নিয়োগকর্তাদের সাথে যুক্ত করার এজেন্টিক এআই প্ল্যাটফর্ম, যা প্রতারণা ও কাজ ছাড়ার ঝুঁকি দূর করে।",
    step1_title: "১. নিয়োগকর্তার কাজের বিজ্ঞপ্তি",
    step1_desc: "নিয়োগকর্তা মেসেজ বা সহজ ফর্মের মাধ্যমে কাজের বিবরণ দেন।",
    step2_title: "২. বিজ্ঞপ্তি যাচাইকরণ (লিস্টিং এজেন্ট)",
    step2_desc: "কর্মীদের দেখার আগেই লিস্টিং এজেন্ট নূন্যতম মজুরি ও ভুয়া তথ্যের পুঙ্খানুপুঙ্খ যাচাই করে।",
    step3_title: "৩. কাজের ভিডিও পরীক্ষা (স্কিল এজেন্ট)",
    step3_desc: "কর্মী কাজের দক্ষতা ভিডিওর মাধ্যমে প্রদর্শন করেন। স্কিল এজেন্ট পক্ষপাতহীনভাবে স্কোর দেয়।",
    step4_title: "৪. উপযুক্ত কাজের ম্যাচিং (ম্যাচিং এজেন্ট)",
    step4_desc: "ম্যাচিং এজেন্ট দক্ষতা, দূরত্ব ও মজুরি বিশ্লেষণ করে স্পষ্ট কারণসহ কাজের প্রস্তাব দেয়।",
    step5_title: "৫. কর্মীর সম্মতি (কনসেন্ট এজেন্ট)",
    step5_desc: "কর্মীর স্পষ্ট অনুমতি ছাড়া ফোন নম্বর গোপন থাকে। সম্মতি দিলেই যোগাযোগের সুযোগ সৃষ্টি হয়।",
    btn_next_step: "পরবর্তী ধাপে যান",
    btn_verify: "লিস্টিং এজেন্ট যাচাই চালান",
    btn_assess_video: "স্কিল এজেন্ট ভিডিও মূল্যায়ন",
    btn_find_matches: "ম্যাচিং এজেন্ট দিয়ে খুঁজুন",
    btn_give_consent: "সম্মতি দিন ও তথ্য শেয়ার করুন",
    btn_pass: "বাতিল করুন",
    consent_guarantee: "আপনার ফোন নম্বর সম্পূর্ণ সুরক্ষিত। আপনি সম্মতি দিলে তবেই নিয়োগকর্তা যোগাযোগ করতে পারবেন।"
  }
};

function setupLanguage() {
  const langSelect = document.getElementById('lang-selector');
  if (langSelect) {
    langSelect.value = state.currentLang;
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
}

function setLanguage(lang) {
  state.currentLang = lang;
  window.voiceEngine.setLanguage(lang);
  
  // Update UI strings marked with data-i18n
  const dict = translations[lang] || translations.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Re-render any dynamic cards that have localized content
  if (state.currentMatch) {
    updateConsentCard(state.currentMatch);
  }
}

// --- VIDEO SIMULATOR ---
function initVideoSimulator() {
  state.videoSimulator = new SkillVideoSimulator('skillVideoCanvas');
  state.videoSimulator.startSimulation();

  const tradeSelect = document.getElementById('demo-trade-select');
  if (tradeSelect) {
    tradeSelect.addEventListener('change', (e) => {
      state.videoSimulator.setTrade(e.target.value);
      updateDemoRubricPreview(e.target.value);
    });
    updateDemoRubricPreview(tradeSelect.value);
  }
}

function updateDemoRubricPreview(trade) {
  const container = document.getElementById('trade-rubric-steps');
  if (!container) return;

  const presets = {
    "Tractor & Agri-Machinery Hydraulics": [
      "Spool valve seal replacement without scuffing",
      "Hydraulic pump circuit bleeding under 3 minutes",
      "High-pressure line torque tightening to spec",
      "Safety gear: Cut-resistant gloves & eye goggles"
    ],
    "Solar PV & Inverter Grid-Tie Wiring": [
      "DC isolator switch disengagement & LOTO check",
      "MC4 connector crimping with pull-test pass",
      "Earthing pit resistance verification (<5 ohms)",
      "Safety gear: 1000V rated insulated gloves"
    ],
    "Precision MIG/ARC Welding": [
      "Bevel edge preparation & oxide cleaning",
      "Root gap alignment & tack bead placement",
      "Uniform weave bead deposition",
      "Safety gear: Auto-darkening helmet & leather apron"
    ],
    "Mobile & Hardware Chip-Level Repair": [
      "Hot air rework station temp calibrated (340°C)",
      "Micro-BGA IC desoldering without trace lift",
      "Solder wick pad cleaning",
      "Safety gear: ESD wrist strap & fume extractor"
    ]
  };

  const steps = presets[trade] || presets["Tractor & Agri-Machinery Hydraulics"];
  container.innerHTML = steps.map((s, idx) => `
    <div class="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-1.5 rounded border border-gray-200">
      <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">${idx + 1}</span>
      <span>${s}</span>
    </div>
  `).join('');
}

// --- DATA FETCHING & UI REFRESH ---
async function refreshAllData() {
  await Promise.all([
    fetchStats(),
    fetchJobs(),
    fetchWorkers(),
    fetchFollowUps(),
    fetchHumanReviews(),
    fetchLogs()
  ]);
  renderJobsList();
  renderWorkersList();
  renderFollowUpsList();
  renderHumanReviewList();
}

async function refreshLogsAndStats() {
  await Promise.all([fetchStats(), fetchLogs()]);
}

async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    state.stats = await res.json();
    renderStats();
  } catch (err) {
    console.error("Failed to fetch stats", err);
  }
}

function renderStats() {
  document.getElementById('stat-verified-jobs').textContent = state.stats.verified_jobs_active || 0;
  document.getElementById('stat-scams-blocked').textContent = state.stats.scams_blocked || 0;
  document.getElementById('stat-flagged-review').textContent = state.stats.flagged_human_review || 0;
  document.getElementById('stat-avg-hire').textContent = `${state.stats.avg_hiring_time_days || 1.8} days`;
  document.getElementById('stat-retention').textContent = `+${state.stats.early_exit_reduction_pct || 74}%`;
}

async function fetchJobs() {
  try {
    const res = await fetch('/api/jobs');
    state.jobs = await res.json();
    if (!state.currentJob && state.jobs.length > 0) {
      state.currentJob = state.jobs.find(j => j.verification_status === "VERIFIED") || state.jobs[0];
    }
  } catch (err) {
    console.error("Failed to fetch jobs", err);
  }
}

async function fetchWorkers() {
  try {
    const res = await fetch('/api/workers');
    state.workers = await res.json();
    if (!state.currentWorker && state.workers.length > 0) {
      state.currentWorker = state.workers[0];
    }
  } catch (err) {
    console.error("Failed to fetch workers", err);
  }
}

async function fetchFollowUps() {
  try {
    const res = await fetch('/api/followups');
    state.followups = await res.json();
  } catch (err) {
    console.error("Failed to fetch followups", err);
  }
}

async function fetchHumanReviews() {
  try {
    const res = await fetch('/api/human-review');
    state.humanReviews = await res.json();
    const countBadge = document.getElementById('human-review-count');
    if (countBadge) {
      countBadge.textContent = state.humanReviews.length;
      if (state.humanReviews.length > 0) {
        countBadge.classList.remove('hidden');
      } else {
        countBadge.classList.add('hidden');
      }
    }
  } catch (err) {
    console.error("Failed to fetch human reviews", err);
  }
}

async function fetchLogs() {
  try {
    const res = await fetch('/api/logs');
    state.logs = await res.json();
    renderLogsList();
  } catch (err) {
    console.error("Failed to fetch logs", err);
  }
}

// --- 5-STEP INTERACTIVE DEMO CONTROLLER ---
function setDemoStep(step) {
  state.demoStep = step;
  
  // Highlight step buttons
  for (let i = 1; i <= 5; i++) {
    const indicator = document.getElementById(`step-indicator-${i}`);
    const card = document.getElementById(`demo-step-${i}`);
    if (indicator && card) {
      if (i === step) {
        indicator.classList.add('ring-4', 'ring-amber-400', 'bg-teal-900', 'text-white');
        card.classList.remove('hidden');
      } else {
        indicator.classList.remove('ring-4', 'ring-amber-400', 'bg-teal-900', 'text-white');
        card.classList.add('hidden');
      }
    }
  }
}

// Step 1: Employer Posts
async function handleDemoPostJob() {
  const form = document.getElementById('demo-post-job-form');
  const payload = {
    employer_name: form.querySelector('[name="employer_name"]').value,
    business_name: form.querySelector('[name="business_name"]').value,
    phone: form.querySelector('[name="phone"]').value,
    district: form.querySelector('[name="district"]').value,
    trade_category: form.querySelector('[name="trade_category"]').value,
    job_title: form.querySelector('[name="job_title"]').value,
    wage_offered: parseFloat(form.querySelector('[name="wage_offered"]').value),
    experience_months_required: parseInt(form.querySelector('[name="experience_months"]').value),
    job_description: form.querySelector('[name="job_description"]').value,
    lodging_provided: form.querySelector('[name="lodging_provided"]').checked,
    food_provided: form.querySelector('[name="food_provided"]').checked
  };

  showToast("Listing submitted! Orchestrator routing to Listing Agent...", "info");
  
  try {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    state.currentJob = data.job;
    
    // Refresh jobs list
    await fetchJobs();
    await fetchStats();
    
    // Populate Step 2 verification card
    renderVerificationResult(data.job);
    setDemoStep(2);
    
    // Voice announce in selected language
    announceStep2(data.job);
  } catch (err) {
    showToast("Error creating job: " + err.message, "error");
  }
}

// Step 1 helper: Pre-fill demo template
function prefillDemoJob(type) {
  const form = document.getElementById('demo-post-job-form');
  if (!form) return;

  if (type === 'tractor') {
    form.querySelector('[name="employer_name"]').value = "Ramesh Pal";
    form.querySelector('[name="business_name"]').value = "Kisan Agro Engineering Workshop";
    form.querySelector('[name="phone"]').value = "+91 98321 44510";
    form.querySelector('[name="district"]').value = "Purba Bardhaman";
    form.querySelector('[name="trade_category"]').value = "Tractor & Agri-Machinery Hydraulics";
    form.querySelector('[name="job_title"]').value = "Lead Tractor Hydraulics Mechanic";
    form.querySelector('[name="wage_offered"]').value = "18500";
    form.querySelector('[name="experience_months"]').value = "12";
    form.querySelector('[name="job_description"]').value = "Overhaul Mahindra & Sonalika hydraulic pumps, spool valves, and rotavators before harvest season. Lodging provided on premise.";
    form.querySelector('[name="lodging_provided"]').checked = true;
    form.querySelector('[name="food_provided"]').checked = false;
  } else if (type === 'solar') {
    form.querySelector('[name="employer_name"]').value = "Sunil Kumar Mahato";
    form.querySelector('[name="business_name"]').value = "Gramin Solar Solutions & Micro-Grid";
    form.querySelector('[name="phone"]').value = "+91 94340 77129";
    form.querySelector('[name="district"]').value = "Bankura";
    form.querySelector('[name="trade_category"]').value = "Solar PV & Inverter Grid-Tie Wiring";
    form.querySelector('[name="job_title"]').value = "Solar Inverter Field Electrician";
    form.querySelector('[name="wage_offered"]').value = "16000";
    form.querySelector('[name="experience_months"]').value = "6";
    form.querySelector('[name="job_description"]').value = "Installation of 5kW to 15kW rooftop solar panels and battery inverter bank across rural health centres in Bankura.";
    form.querySelector('[name="lodging_provided"]').checked = false;
    form.querySelector('[name="food_provided"]').checked = false;
  }
}

// Step 1 helper: Test scam detection live!
async function handleSimulateScam() {
  showToast("Submitting predatory listing with advance registration fee...", "warning");
  try {
    const res = await fetch('/api/jobs/simulate-scam', { method: 'POST' });
    const data = await res.json();
    state.currentJob = data.job;
    await fetchJobs();
    await fetchStats();
    renderVerificationResult(data.job);
    setDemoStep(2);
    showToast("Listing Agent detected and blocked advance fee fraud!", "error");
  } catch (err) {
    showToast("Error simulating scam: " + err.message, "error");
  }
}

// Step 2: Render Listing Agent Verification Report
function renderVerificationResult(job) {
  const container = document.getElementById('step-2-verification-card');
  if (!container || !job.verification_report) return;

  const rep = job.verification_report;
  const isSafe = rep.is_safe;
  const isBlocked = job.verification_status === "REJECTED";
  const isReview = job.verification_status === "FLAGGED_FOR_HUMAN_REVIEW";

  let statusBadge = '';
  if (isSafe) {
    statusBadge = `<span class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-300">✓ 100% PRE-VERIFIED & SAFE</span>`;
  } else if (isReview) {
    statusBadge = `<span class="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded border border-amber-300">⚠️ FLAGGED FOR HUMAN REVIEW</span>`;
  } else {
    statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded border border-red-300">⛔ BLOCKED BY LISTING AGENT</span>`;
  }

  container.innerHTML = `
    <div class="p-4 rounded-xl border ${isSafe ? 'bg-emerald-50/50 border-emerald-200' : (isReview ? 'bg-amber-50/50 border-amber-200' : 'bg-red-50/50 border-red-200')}">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h4 class="font-bold text-gray-900">${job.job_title} · ${job.business_name}</h4>
          <p class="text-xs text-gray-500">${job.district}, ${job.state} | Offered: ₹${job.wage_offered.toLocaleString()}/mo</p>
        </div>
        ${statusBadge}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
        <div class="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
          <div class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Employer Identity</div>
          <div class="text-sm font-bold text-gray-800 mt-0.5">${rep.verification_type}</div>
          <div class="text-[11px] text-emerald-600 font-medium">Telecom & Aadhaar Checked</div>
        </div>
        <div class="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
          <div class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Wage Compliance</div>
          <div class="text-sm font-bold ${rep.wage_compliance.includes('BELOW') ? 'text-red-600' : (rep.wage_compliance.includes('SUSPICIOUS') ? 'text-amber-600' : 'text-emerald-600')} mt-0.5">
            ${rep.wage_compliance}
          </div>
          <div class="text-[11px] text-gray-500">Benchmark: ₹${rep.statutory_benchmark_wage.toLocaleString()}/mo</div>
        </div>
        <div class="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
          <div class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Fraud Risk Score</div>
          <div class="text-sm font-bold ${rep.scam_risk_score > 30 ? 'text-red-600' : 'text-emerald-600'} mt-0.5">
            ${rep.scam_risk_score}% Risk
          </div>
          <div class="text-[11px] text-gray-500">Zero Predatory Clauses</div>
        </div>
      </div>

      <div class="bg-white/80 p-3 rounded-lg border border-gray-200 text-xs text-gray-700 my-2">
        <div class="font-semibold text-gray-900 mb-1">Listing Agent Rationale:</div>
        <p>${rep.ai_rationale}</p>
      </div>

      ${rep.red_flags.length > 0 ? `
        <div class="bg-red-50 p-3 rounded-lg border border-red-200 text-xs text-red-800 my-2">
          <div class="font-bold mb-1">Red Flags Detected:</div>
          <ul class="list-disc list-inside space-y-0.5">
            ${rep.red_flags.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="mt-4 flex items-center justify-between">
        <button onclick="playListingVoice()" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium">
          <svg class="w-4 h-4 text-teal-800" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"/></svg>
          Listen Audio Verification
        </button>

        ${isSafe ? `
          <button onclick="proceedToStep3()" class="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5">
            Listing Verified! Proceed to Step 3: Skill Video →
          </button>
        ` : (isReview ? `
          <span class="text-xs text-amber-700 font-medium">Pushed to Human-in-the-Loop Queue for Admin Approval</span>
        ` : `
          <span class="text-xs text-red-600 font-bold">Listing rejected. Protected workers from scam.</span>
        `)}
      </div>
    </div>
  `;
}

function announceStep2(job) {
  const rep = job.verification_report;
  if (!rep) return;
  const text = state.currentLang === 'hi'
    ? `लिस्टिंग एजेंट ने ${job.business_name} की नौकरी को सत्यापित कर लिया है। वेतन ${int(job.wage_offered)} रुपये न्यूनतम मानक के अनुरूप है। कोई फ़ीस या धोखाधड़ी नहीं है।`
    : `Listing agent verified job for ${job.business_name}. Wage of ${int(job.wage_offered)} rupees is compliant with district benchmarks. Zero fees required.`;
  window.voiceEngine.speak(text);
}

function playListingVoice() {
  if (state.currentJob) {
    announceStep2(state.currentJob);
  }
}

function proceedToStep3() {
  setDemoStep(3);
}

// Step 3: Run Skill Video Assessment
async function handleAssessSkillVideo() {
  const tradeSelect = document.getElementById('demo-trade-select');
  const taskNameInput = document.getElementById('demo-task-name');
  const workerSelect = document.getElementById('demo-worker-select');
  const lightingSelect = document.getElementById('demo-lighting-select');

  const trade = tradeSelect ? tradeSelect.value : "Tractor & Agri-Machinery Hydraulics";
  const taskName = taskNameInput ? taskNameInput.value : "Hydraulic Spool Valve Overhaul";
  const workerId = workerSelect ? workerSelect.value : (state.currentWorker ? state.currentWorker.id : "w-01");
  const lighting = lightingSelect ? lightingSelect.value : "GOOD";

  showToast("Skill Agent analyzing kinematic motion, tools, and safety gear...", "info");

  try {
    const res = await fetch('/api/workers/assess-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: workerId,
        trade: trade,
        task_name: taskName,
        duration_seconds: 52,
        lighting_quality: lighting
      })
    });
    const data = await res.json();
    state.currentWorker = data.worker;
    
    await fetchWorkers();
    renderSkillAssessmentResult(data.assessment);
    
    // Voice prompt
    const text = state.currentLang === 'hi'
      ? `स्किल एजेंट ने कौशल स्कोर जारी किया: ${data.assessment.overall_score} अंक। निष्पक्ष रूब्रिक द्वारा सत्यापित।`
      : `Skill agent completed video assessment: Score is ${data.assessment.overall_score} out of 100 on standardized rubric.`;
    window.voiceEngine.speak(text);
  } catch (err) {
    showToast("Error assessing video: " + err.message, "error");
  }
}

function renderSkillAssessmentResult(assessment) {
  const container = document.getElementById('step-3-skill-result');
  if (!container || !assessment) return;

  const rb = assessment.rubric_breakdown;
  const isFlagged = assessment.human_review_status === "FLAGGED_LOW_CONFIDENCE";

  container.innerHTML = `
    <div class="p-4 rounded-xl border bg-white shadow-sm mt-3">
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-gray-900">${assessment.badge_title}</h4>
            <span class="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded border border-amber-300">${assessment.badge_level}</span>
          </div>
          <p class="text-xs text-gray-500">${assessment.task_name}</p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-black text-teal-900">${assessment.overall_score}<span class="text-xs text-gray-500 font-normal">/100</span></div>
          <div class="text-[11px] text-emerald-600 font-semibold">Confidence: ${assessment.confidence_score}%</div>
        </div>
      </div>

      <!-- 4 Rubric Axes Breakdown (Slide 4, 5) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
        <div>
          <div class="flex justify-between text-xs font-semibold mb-1">
            <span class="text-gray-700">1. Technical Execution</span>
            <span class="text-teal-800 font-bold">${rb.technical_execution} / 25</span>
          </div>
          <div class="rubric-bar-bg"><div class="rubric-bar-fill bg-teal-700" style="width: ${(rb.technical_execution/25)*100}%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-xs font-semibold mb-1">
            <span class="text-gray-700">2. Safety Gear & PPE</span>
            <span class="text-emerald-700 font-bold">${rb.safety_and_ppe} / 25</span>
          </div>
          <div class="rubric-bar-bg"><div class="rubric-bar-fill bg-emerald-600" style="width: ${(rb.safety_and_ppe/25)*100}%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-xs font-semibold mb-1">
            <span class="text-gray-700">3. Tool Handling & Posture</span>
            <span class="text-blue-700 font-bold">${rb.tool_handling} / 25</span>
          </div>
          <div class="rubric-bar-bg"><div class="rubric-bar-fill bg-blue-600" style="width: ${(rb.tool_handling/25)*100}%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-xs font-semibold mb-1">
            <span class="text-gray-700">4. Efficiency & Precision</span>
            <span class="text-amber-700 font-bold">${rb.efficiency_precision} / 25</span>
          </div>
          <div class="rubric-bar-bg"><div class="rubric-bar-fill bg-amber-500" style="width: ${(rb.efficiency_precision/25)*100}%"></div></div>
        </div>
      </div>

      <!-- Bias Control Audit Box (Slide 5) -->
      <div class="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-xs text-emerald-900 my-2 flex items-start gap-2">
        <svg class="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        <div>
          <span class="font-bold">Bias Control Guard Engaged:</span>
          <span class="text-[11px] block mt-0.5">${assessment.bias_control.bias_audit_notes} (Rubric Adherence: ${assessment.bias_control.fixed_rubric_adherence}%)</span>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between">
        <div class="text-xs text-gray-500">
          Status: <strong class="${isFlagged ? 'text-amber-600' : 'text-emerald-700'}">${assessment.human_review_status}</strong>
        </div>
        <button onclick="handleRunMatching()" class="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5">
          Proceed to Step 4: Run Matching Agent →
        </button>
      </div>
    </div>
  `;
}

// Step 4: Run Matching Agent
async function handleRunMatching() {
  const workerId = state.currentWorker ? state.currentWorker.id : "w-01";
  showToast("Matching Agent ranking jobs on skill, distance, and wage...", "info");

  try {
    const res = await fetch(`/api/matches/${workerId}`);
    const matches = await res.json();
    state.matches = matches;
    if (matches.length > 0) {
      state.currentMatch = matches[0];
    }
    setDemoStep(4);
    renderMatchingResults(matches);
  } catch (err) {
    showToast("Error running matching: " + err.message, "error");
  }
}

function renderMatchingResults(matches) {
  const container = document.getElementById('step-4-matches-list');
  if (!container) return;

  if (matches.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-gray-500 text-sm">No verified matches found. Post a verified listing first!</div>`;
    return;
  }

  container.innerHTML = matches.map((m, idx) => {
    const isTop = idx === 0;
    const diff = m.wage_differential;
    const exp = state.currentLang === 'hi' ? m.explanation_hi : (state.currentLang === 'bn' ? m.explanation_bn : m.explanation_en);

    return `
      <div class="p-4 rounded-xl border ${isTop ? 'bg-amber-50/40 border-amber-300 shadow-md ring-2 ring-amber-200' : 'bg-white border-gray-200 shadow-sm'} transition hover:border-teal-700">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            ${isTop ? `<span class="bg-amber-500 text-teal-950 font-black text-xs px-2 py-0.5 rounded uppercase tracking-wider">Top Match #1</span>` : ''}
            <h4 class="font-bold text-gray-900 text-base">${m.job.job_title}</h4>
          </div>
          <div class="flex items-center gap-1.5 bg-teal-900 text-white px-3 py-1 rounded-full text-xs font-black">
            <span>${m.overall_match_score}%</span> Match
          </div>
        </div>

        <div class="text-xs text-gray-600 mb-3 flex flex-wrap gap-4">
          <span>🏢 <strong>${m.job.business_name}</strong></span>
          <span>📍 <strong>${m.distance_km} km</strong> away (${m.job.district})</span>
          <span>💰 <strong>₹${m.job.wage_offered.toLocaleString()}/mo</strong> (${diff >= 0 ? `+₹${diff.toLocaleString()} above target` : `-₹${Math.abs(diff).toLocaleString()}`})</span>
          ${m.job.lodging_provided ? `<span class="text-emerald-700 font-semibold">🏠 Free Lodging Included</span>` : ''}
        </div>

        <!-- 3 Pillars Radar (Slide 3) -->
        <div class="grid grid-cols-3 gap-2 py-2 px-3 bg-gray-50 rounded-lg text-center text-xs mb-3">
          <div>
            <div class="text-gray-500 text-[10px] uppercase font-bold">1. Skill Match</div>
            <div class="font-black text-teal-800 text-sm">${m.skill_fit_score}%</div>
          </div>
          <div>
            <div class="text-gray-500 text-[10px] uppercase font-bold">2. Distance Fit</div>
            <div class="font-black text-blue-800 text-sm">${m.distance_fit_score}%</div>
          </div>
          <div>
            <div class="text-gray-500 text-[10px] uppercase font-bold">3. Wage Match</div>
            <div class="font-black text-emerald-800 text-sm">${m.wage_fit_score}%</div>
          </div>
        </div>

        <!-- Explainable AI Box (Slide 4, 6) -->
        <div class="bg-teal-50/70 p-3 rounded-lg border border-teal-200 text-xs text-teal-950 mb-3">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-teal-900">Why this match? (Explainable AI):</span>
            <button onclick="speakText('${encodeURIComponent(exp)}')" class="text-teal-700 hover:text-teal-900 flex items-center gap-1 text-[11px] font-semibold">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
              Listen Explanation
            </button>
          </div>
          <p class="leading-relaxed">${exp}</p>
        </div>

        <div class="flex items-center justify-between pt-2">
          <div class="text-xs text-gray-500">
            Privacy: <span class="font-bold text-amber-700">Contact details withheld until consent</span>
          </div>
          <button onclick="proceedToConsent('${m.id}')" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-teal-950 font-bold rounded-lg text-xs shadow">
            Step 5: Review & Give Consent →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function speakText(encodedText) {
  const text = decodeURIComponent(encodedText);
  window.voiceEngine.speak(text, state.currentLang);
}

// Step 5: Worker Consent Protocol
async function proceedToConsent(matchId) {
  state.currentMatch = state.matches.find(m => m.id === matchId) || state.matches[0];
  setDemoStep(5);
  await updateConsentCard(state.currentMatch);
}

async function updateConsentCard(match) {
  const container = document.getElementById('step-5-consent-card');
  if (!container || !match) return;

  // Fetch consent briefing in current language
  try {
    const res = await fetch(`/api/consent/${match.id}?lang=${state.currentLang}`);
    const briefingData = await res.json();
    const briefing = briefingData.briefing;

    const isGranted = match.consent_status === "GRANTED";

    container.innerHTML = `
      <div class="p-5 rounded-2xl border ${isGranted ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-teal-200'} shadow-md">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <span class="bg-teal-100 text-teal-900 text-xs font-bold px-2.5 py-1 rounded-full border border-teal-300">
              🛡️ Worker-First Privacy Guard Active
            </span>
            <h3 class="text-lg font-bold text-gray-900 mt-2">${briefing.headline}</h3>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold px-2 py-1 rounded ${isGranted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${isGranted ? '✓ CONSENT GRANTED' : 'PENDING WORKER APPROVAL'}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div class="text-gray-500 font-semibold mb-1">Offered Terms:</div>
            <div class="font-bold text-gray-800 text-sm mb-1">${briefing.wage_text}</div>
            <div class="text-gray-600">${briefing.distance_text}</div>
            <div class="text-emerald-700 font-medium mt-1">✓ ${briefing.verification_text}</div>
          </div>

          <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div class="text-gray-500 font-semibold mb-1">Your Privacy Status:</div>
            <div class="text-xs text-gray-700 mb-2">
              ${isGranted ? `
                <div class="bg-emerald-100 text-emerald-900 p-2 rounded font-bold">
                  ✓ Contact Unlocked for ${match.job.employer_name}
                  <div class="text-[11px] font-normal mt-0.5">Phone: ${match.worker.phone_real}</div>
                </div>
              ` : `
                <div class="bg-amber-100 text-amber-900 p-2 rounded">
                  🔒 Phone masked as <strong>${match.worker.phone_masked}</strong>.
                  <div class="text-[11px] mt-0.5">Employer cannot see your contact until you click Give Consent.</div>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Voice Prompt Box with Play Button (Slide 6, 7) -->
        <div class="bg-teal-900 text-white p-3.5 rounded-xl flex items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <button onclick="playConsentVoicePrompt('${encodeURIComponent(briefing.voice_transcript)}')" class="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-teal-950 flex items-center justify-center shrink-0 shadow">
              <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
            </button>
            <div>
              <div class="text-xs font-bold text-amber-300">Local Voice Narration (Voice Agent):</div>
              <p class="text-xs text-gray-200">${briefing.prompt}</p>
            </div>
          </div>
          <span class="text-xs text-amber-300 font-mono hidden md:inline-block">${state.currentLang.toUpperCase()}</span>
        </div>

        <!-- Decision Buttons -->
        ${!isGranted ? `
          <div class="flex flex-col sm:flex-row gap-3">
            <button onclick="submitConsentDecision('${match.id}', 'GRANTED')" class="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>Give Consent & Share Details (सहमति दें)</span>
            </button>
            <button onclick="submitConsentDecision('${match.id}', 'REJECTED')" class="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl text-sm">
              Pass / Do Not Share (अस्वीकार करें)
            </button>
          </div>
        ` : `
          <div class="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
            <span class="font-bold">✓ Mutual contact exchange complete! Follow-up Agent has scheduled 30, 60, and 90-day retention checkpoints.</span>
            <button onclick="switchTab('retention')" class="underline font-semibold ml-2">View Retention Timeline →</button>
          </div>
        `}
      </div>
    `;

    // Auto speak prompt when opening consent view
    playConsentVoicePrompt(encodeURIComponent(briefing.voice_transcript));
  } catch (err) {
    console.error("Error loading consent card:", err);
  }
}

function playConsentVoicePrompt(encodedTranscript) {
  const text = decodeURIComponent(encodedTranscript);
  window.voiceEngine.speak(text, state.currentLang);
}

async function submitConsentDecision(matchId, decision) {
  try {
    const res = await fetch(`/api/consent/${matchId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });
    const result = await res.json();
    
    // Refresh data
    await fetchStats();
    await fetchFollowUps();
    
    // Update local match state
    if (state.currentMatch) {
      state.currentMatch.consent_status = decision;
      state.currentMatch.contact_unlocked = (decision === "GRANTED");
      updateConsentCard(state.currentMatch);
    }

    if (decision === "GRANTED") {
      showToast("Consent recorded! Contact details unlocked and 30-60-90 day follow-up scheduled.", "success");
      const speakMsg = state.currentLang === 'hi'
        ? "आपकी सहमति दर्ज हो गई है। नियोक्ता को आपका फ़ोन नंबर साझा कर दिया गया है।"
        : "Consent confirmed! Employer can now call your phone number directly.";
      window.voiceEngine.speak(speakMsg);
    } else {
      showToast("Consent declined. Your contact information remains 100% private.", "info");
    }
  } catch (err) {
    showToast("Error processing consent: " + err.message, "error");
  }
}

// --- PORTAL RENDERING ---
function renderJobsList() {
  const list = document.getElementById('employer-jobs-list');
  if (!list) return;

  list.innerHTML = state.jobs.map(j => `
    <div class="p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold px-2 py-0.5 rounded ${j.verification_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : (j.verification_status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')}">
            ${j.verification_status}
          </span>
          <span class="text-xs text-gray-400 font-mono">${j.id}</span>
        </div>
        <h4 class="font-bold text-gray-900 text-sm mb-1">${j.job_title}</h4>
        <p class="text-xs text-gray-600 mb-2">${j.business_name} · ${j.district}</p>
        <div class="text-xs font-semibold text-teal-900 mb-2">Wage: ₹${j.wage_offered.toLocaleString()}/mo</div>
        <p class="text-xs text-gray-500 line-clamp-2">${j.job_description}</p>
      </div>

      <div class="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between items-center">
        <span>${j.trade_category.split('&')[0]}</span>
        <button onclick="previewJob('${j.id}')" class="text-teal-800 hover:underline font-semibold">Inspect Audit →</button>
      </div>
    </div>
  `).join('');
}

function previewJob(jobId) {
  const job = state.jobs.find(j => j.id === jobId);
  if (job) {
    state.currentJob = job;
    renderVerificationResult(job);
    switchTab('demo');
    setDemoStep(2);
  }
}

function renderWorkersList() {
  const list = document.getElementById('workers-card-list');
  if (!list) return;

  list.innerHTML = state.workers.map(w => {
    const sa = w.skill_assessment;
    return `
      <div class="p-4 rounded-xl border bg-white shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${sa ? sa.video_thumbnail : '👤'}</span>
            <div>
              <h4 class="font-bold text-gray-900 text-sm">${w.name}</h4>
              <p class="text-xs text-gray-500">${w.district}, ${w.state}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-black text-teal-900">${sa ? sa.overall_score : 'N/A'}/100</span>
            <div class="text-[10px] text-emerald-600 font-bold">${sa ? sa.badge_level : 'Pending'}</div>
          </div>
        </div>

        <div class="text-xs text-gray-700 bg-gray-50 p-2 rounded my-2">
          <strong>Verified Trade:</strong> ${w.primary_trade}
        </div>

        <div class="flex justify-between items-center mt-3 text-xs">
          <span class="text-gray-500 font-mono">🔒 ${w.phone_masked}</span>
          <button onclick="selectWorkerForDemo('${w.id}')" class="text-teal-800 hover:underline font-bold">
            Select for Test →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function selectWorkerForDemo(workerId) {
  const w = state.workers.find(item => item.id === workerId);
  if (w) {
    state.currentWorker = w;
    switchTab('demo');
    setDemoStep(3);
  }
}

// 30-60-90 Day Retention List (Slide 4, 7)
function renderFollowUpsList() {
  const container = document.getElementById('followup-timeline-list');
  if (!container) return;

  container.innerHTML = state.followups.map(f => {
    const isDone = f.status === "COMPLETED";
    return `
      <div class="p-4 rounded-xl border ${isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-gray-200'} shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-xs font-black ${f.day_milestone === 30 ? 'bg-blue-100 text-blue-900' : (f.day_milestone === 60 ? 'bg-purple-100 text-purple-900' : 'bg-emerald-100 text-emerald-900')}">
              DAY ${f.day_milestone} MILESTONE
            </span>
            <h4 class="font-bold text-gray-900 text-sm">${f.worker_name} @ ${f.employer_name}</h4>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}">
            ${f.status}
          </span>
        </div>

        <div class="text-xs text-gray-600 mb-2">Trade: <strong>${f.trade}</strong> | Early Exit Risk: <strong class="${f.early_exit_risk === 'LOW' ? 'text-emerald-700' : 'text-red-600'}">${f.early_exit_risk}</strong></div>

        ${isDone ? `
          <div class="bg-white p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 space-y-1">
            <div class="flex justify-between">
              <span>Wage Paid on Time:</span>
              <strong class="${f.wage_paid_on_time ? 'text-emerald-700' : 'text-red-600'}">${f.wage_paid_on_time ? '✓ Full Amount Verified' : 'Disputed'}</strong>
            </div>
            <div class="flex justify-between">
              <span>Work Environment Rating:</span>
              <strong>${'⭐'.repeat(f.work_environment_rating || 5)} (${f.work_environment_rating}/5)</strong>
            </div>
            <p class="text-gray-500 italic mt-1 font-serif">"${f.worker_notes}"</p>
          </div>
        ` : `
          <div class="flex justify-end mt-2">
            <button onclick="openCheckinModal('${f.id}')" class="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded text-xs font-semibold">
              Simulate Day ${f.day_milestone} Check-in Survey
            </button>
          </div>
        `}
      </div>
    `;
  }).join('');
}

// Checkin Survey simulation
async function openCheckinModal(fupId) {
  const fup = state.followups.find(f => f.id === fupId);
  if (!fup) return;

  const payload = {
    wage_paid_on_time: true,
    actual_wage_received: 16500.0,
    work_environment_rating: 5,
    retention_confirmed: true,
    worker_notes: `Day ${fup.day_milestone} check-in: salary paid via direct bank transfer. Safe work conditions maintained.`,
    employer_notes: "Satisfied with skill precision and punctual attendance."
  };

  try {
    const res = await fetch(`/api/followups/${fupId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    await res.json();
    await fetchFollowUps();
    await fetchStats();
    showToast(`Day ${fup.day_milestone} check-in recorded! Trust feedback updated.`, "success");
  } catch (err) {
    showToast("Error updating check-in: " + err.message, "error");
  }
}

// Human-in-the-Loop Queue (Slide 5)
function renderHumanReviewList() {
  const container = document.getElementById('human-review-list');
  if (!container) return;

  if (state.humanReviews.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-gray-500 text-xs bg-white rounded-xl border border-gray-200">✓ All items verified! No pending human review cases.</div>`;
    return;
  }

  container.innerHTML = state.humanReviews.map(hr => `
    <div class="p-4 rounded-xl border border-amber-300 bg-amber-50/60 shadow-sm flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="bg-amber-400 text-teal-950 font-bold text-[10px] px-2 py-0.5 rounded uppercase">${hr.item_type}</span>
          <h4 class="font-bold text-gray-900 text-sm">${hr.title}</h4>
        </div>
        <p class="text-xs text-gray-600 mb-1">${hr.reason}</p>
        <span class="text-[10px] text-gray-400 font-mono">${hr.timestamp}</span>
      </div>

      <div class="flex gap-2">
        <button onclick="resolveHumanReview('${hr.id}', 'APPROVE')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold">
          Approve
        </button>
        <button onclick="resolveHumanReview('${hr.id}', 'REJECT')" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold">
          Reject
        </button>
      </div>
    </div>
  `).join('');
}

async function resolveHumanReview(reviewId, action) {
  try {
    const formData = new FormData();
    formData.append('action', action);
    const res = await fetch(`/api/human-review/${reviewId}/resolve`, {
      method: 'POST',
      body: formData
    });
    await res.json();
    await fetchHumanReviews();
    await fetchJobs();
    await fetchWorkers();
    showToast(`Case marked as ${action} by supervisor.`, "success");
  } catch (err) {
    showToast("Error resolving case: " + err.message, "error");
  }
}

// Live Logs Stream
function renderLogsList() {
  const container = document.getElementById('agent-logs-stream');
  if (!container) return;

  container.innerHTML = state.logs.slice(0, 15).map(log => {
    let badgeColor = 'bg-gray-100 text-gray-800';
    if (log.status === 'SUCCESS') badgeColor = 'bg-emerald-100 text-emerald-800';
    if (log.status === 'WARNING') badgeColor = 'bg-red-100 text-red-800';
    if (log.status === 'ACTION_REQUIRED') badgeColor = 'bg-amber-100 text-amber-800';

    return `
      <div class="p-2.5 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 text-xs flex items-start gap-2.5">
        <span class="font-mono text-gray-400 text-[10px] shrink-0 pt-0.5">${log.timestamp}</span>
        <span class="font-bold text-teal-900 shrink-0 min-w-[90px]">${log.agent_name}</span>
        <div class="flex-1">
          <span class="font-semibold text-gray-800">${log.action}:</span>
          <span class="text-gray-600 ml-1">${log.details}</span>
        </div>
        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor} shrink-0">${log.status}</span>
      </div>
    `;
  }).join('');
}

// Simple Toast Notification
function showToast(message, type = "info") {
  const toast = document.createElement('div');
  const bg = type === 'error' ? 'bg-red-600' : (type === 'warning' ? 'bg-amber-600' : (type === 'success' ? 'bg-emerald-600' : 'bg-teal-900'));
  toast.className = `fixed bottom-4 right-4 ${bg} text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg z-50 transition-opacity duration-300 flex items-center gap-2`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
