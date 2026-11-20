/**
 * Hunar Setu Voice Engine
 * Handles Text-to-Speech (TTS) and Speech-to-Text (STT) for Hindi, Bengali, and English.
 * (Slide 6, 7)
 */

class VoiceEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentLanguage = 'hi';
    this.isSpeaking = false;

    if (this.synth) {
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  setLanguage(lang) {
    this.currentLanguage = lang; // 'hi', 'bn', 'en'
  }

  speak(text, lang = null, onEnd = null) {
    if (!this.synth) {
      console.warn("Speech synthesis not supported in this browser.");
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    const targetLang = lang || this.currentLanguage;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice
    const langCodes = {
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'en': 'en-IN'
    };
    const code = langCodes[targetLang] || 'en-US';
    utterance.lang = code;
    utterance.rate = 0.95; // Slightly slower for clarity in rural announcements
    utterance.pitch = 1.0;

    // Find matching voice if available
    const matchedVoice = this.voices.find(v => v.lang === code || v.lang.startsWith(targetLang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    this.isSpeaking = true;
    this.showVoiceWaveAnimation(true);

    utterance.onend = () => {
      this.isSpeaking = false;
      this.showVoiceWaveAnimation(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech error:", e);
      this.isSpeaking = false;
      this.showVoiceWaveAnimation(false);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.showVoiceWaveAnimation(false);
    }
  }

  showVoiceWaveAnimation(active) {
    const waves = document.querySelectorAll('.voice-wave-indicator');
    waves.forEach(w => {
      if (active) {
        w.classList.remove('hidden');
        w.classList.add('flex');
      } else {
        w.classList.add('hidden');
        w.classList.remove('flex');
      }
    });
  }
}

window.voiceEngine = new VoiceEngine();
