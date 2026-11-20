/**
 * Hunar Setu - Video Demo & Skill Task Simulator
 * Simulates trade video recordings with live AI bounding boxes, safety gear detection, and kinematics.
 * Also supports real camera video recording if selected.
 * (Slide 3, 5, 6)
 */

class SkillVideoSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.animationId = null;
    this.currentTrade = "Tractor & Agri-Machinery Hydraulics";
    this.time = 0;
    this.isRecording = false;
  }

  setTrade(trade) {
    this.currentTrade = trade;
    this.drawFrame();
  }

  startSimulation() {
    if (!this.canvas || !this.ctx) return;
    this.stopSimulation();
    
    const animate = () => {
      this.time += 0.03;
      this.drawFrame();
      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  stopSimulation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  drawFrame() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    // Background gradient representing a workshop or rural work area
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#1a2930');
    bg.addColorStop(1, '#0e191d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Workshop bench
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.lineTo(w, h * 0.65);
    ctx.stroke();

    // Trade-specific work element
    if (this.currentTrade.includes("Tractor")) {
      this.drawTractorHydraulics(w, h);
    } else if (this.currentTrade.includes("Solar")) {
      this.drawSolarInverter(w, h);
    } else if (this.currentTrade.includes("Welding")) {
      this.drawWeldingArc(w, h);
    } else if (this.currentTrade.includes("Mobile")) {
      this.drawMobileBoard(w, h);
    } else {
      this.drawGeneralTrade(w, h);
    }

    // AI Overlays (Kinematic tracking, Safety gear bounding box, Bias-neutral filter tag)
    this.drawAIOverlays(w, h);
  }

  drawTractorHydraulics(w, h) {
    const ctx = this.ctx;
    // Hydraulic pump valve body
    ctx.fillStyle = '#4b5563';
    ctx.roundRect(w * 0.3, h * 0.45, w * 0.4, h * 0.25, 8);
    ctx.fill();

    // Spool cylinders
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(w * 0.35, h * 0.4, w * 0.08, h * 0.1);
    ctx.fillRect(w * 0.47, h * 0.4, w * 0.08, h * 0.1);
    ctx.fillRect(w * 0.59, h * 0.4, w * 0.08, h * 0.1);

    // High pressure fluid pipe
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.55);
    ctx.bezierCurveTo(w * 0.25, h * 0.5, w * 0.25, h * 0.6, w * 0.3, h * 0.55);
    ctx.stroke();

    // Simulated technician hand with wrench oscillating
    const handX = w * 0.5 + Math.sin(this.time * 2) * 20;
    const handY = h * 0.38 + Math.cos(this.time * 2) * 10;

    // Torque wrench
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(Math.sin(this.time * 3) * 0.25);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-8, -40, 16, 60);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-10, -42, 20, 12);
    ctx.restore();

    // Hand with protective glove
    ctx.fillStyle = '#059669'; // Green heavy duty glove
    ctx.beginPath();
    ctx.arc(handX, handY, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSolarInverter(w, h) {
    const ctx = this.ctx;
    // Inverter metal casing
    ctx.fillStyle = '#e2e8f0';
    ctx.roundRect(w * 0.28, h * 0.25, w * 0.44, h * 0.45, 12);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    // LCD display on inverter
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(w * 0.35, h * 0.3, w * 0.3, h * 0.12);
    ctx.fillStyle = '#22c55e';
    ctx.font = '11px monospace';
    ctx.fillText("GRID: 232V | DC: 480V", w * 0.36, h * 0.37);

    // MC4 solar cables
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#dc2626'; // DC positive
    ctx.beginPath();
    ctx.moveTo(w * 0.38, h * 0.7);
    ctx.lineTo(w * 0.38, h * 0.85);
    ctx.stroke();

    ctx.strokeStyle = '#1e293b'; // DC negative
    ctx.beginPath();
    ctx.moveTo(w * 0.46, h * 0.7);
    ctx.lineTo(w * 0.46, h * 0.85);
    ctx.stroke();

    // Insulated testing probe
    const probeX = w * 0.5 + Math.sin(this.time * 2) * 15;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(probeX, h * 0.48, 12, 45);
    ctx.fillStyle = '#ea580c'; // 1000V rated glove
    ctx.beginPath();
    ctx.arc(probeX + 6, h * 0.52, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWeldingArc(w, h) {
    const ctx = this.ctx;
    // Steel joint plates
    ctx.fillStyle = '#64748b';
    ctx.fillRect(w * 0.25, h * 0.6, w * 0.24, h * 0.08);
    ctx.fillRect(w * 0.51, h * 0.6, w * 0.24, h * 0.08);

    // Weld seam
    ctx.fillStyle = '#475569';
    ctx.fillRect(w * 0.49, h * 0.6, w * 0.02, h * 0.08);

    // Welding torch and oscillating spark arc
    const sparkX = w * 0.5 + Math.sin(this.time * 3) * 12;
    const sparkY = h * 0.58;

    // Glowing arc burst
    const arcRadius = 15 + Math.random() * 8;
    const glow = ctx.createRadialGradient(sparkX, sparkY, 2, sparkX, sparkY, arcRadius);
    glow.addColorStop(0, '#ffffff');
    glow.addColorStop(0.3, '#38bdf8');
    glow.addColorStop(0.8, '#0284c7');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, arcRadius, 0, Math.PI * 2);
    ctx.fill();

    // Heavy leather gauntlet
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(sparkX - 25, sparkY - 35, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMobileBoard(w, h) {
    const ctx = this.ctx;
    // PCB board
    ctx.fillStyle = '#065f46';
    ctx.roundRect(w * 0.32, h * 0.35, w * 0.36, h * 0.35, 6);
    ctx.fill();

    // Microchips
    ctx.fillStyle = '#111827';
    ctx.fillRect(w * 0.42, h * 0.44, w * 0.16, h * 0.16);

    // Hot air rework nozzle
    const nozzleX = w * 0.5 + Math.sin(this.time * 2.5) * 8;
    const nozzleY = h * 0.38 + Math.cos(this.time * 2.5) * 5;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(nozzleX - 4, nozzleY - 30, 8, 30);

    // Thermal flux highlight
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.beginPath();
    ctx.arc(nozzleX, nozzleY + 15, 18, 0, Math.PI * 2);
    ctx.fill();

    // ESD strap on wrist
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(w * 0.15, h * 0.6, 28, 12);
  }

  drawGeneralTrade(w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = '#475569';
    ctx.fillRect(w * 0.35, h * 0.4, w * 0.3, h * 0.25);
  }

  drawAIOverlays(w, h) {
    const ctx = this.ctx;
    
    // Top right: AI Agent Live Badge
    ctx.fillStyle = 'rgba(15, 45, 51, 0.85)';
    ctx.roundRect(w - 185, 12, 175, 58, 6);
    ctx.fill();
    ctx.strokeStyle = '#e6a738';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(w - 170, 26, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText("SKILL AGENT ACTIVE", w - 160, 29);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText("Rubric: Tool Kinematics", w - 170, 44);
    ctx.fillText("Bias Control: Appearance Blind", w - 170, 58);

    // Kinematic Bounding Box tracking tool
    const boxX = w * 0.32;
    const boxY = h * 0.35;
    const boxW = w * 0.36;
    const boxH = h * 0.36;

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.setLineDash([]);

    // Tag on bounding box
    ctx.fillStyle = '#10b981';
    ctx.fillRect(boxX, boxY - 18, 130, 18);
    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 10px monospace';
    ctx.fillText("PPE: GLOVES CONFIRMED", boxX + 6, boxY - 5);

    // Confidence indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.roundRect(14, 14, 160, 46, 6);
    ctx.fill();
    ctx.fillStyle = '#e6a738';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText("Confidence: 96.4%", 24, 32);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px sans-serif';
    ctx.fillText("Fixed Rubric Score: 94/100", 24, 48);
  }
}

window.SkillVideoSimulator = SkillVideoSimulator;
