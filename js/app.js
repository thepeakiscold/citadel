/**
 * CITADEL ADVANCED ENGINEERING - CORE APPLICATION & SIMULATION ENGINE
 * Base: ODTU Teknokent, Ankara, Turkey
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTabs();
  initModals();
  initAeroGridSimulator();
  initShredderSimulator();
  initExtruderSimulator();
  initWindConfigurator();
  initRFQForm();
});

/* ==========================================================================
   NAVIGATION & UTILITIES
   ========================================================================== */
function initNavigation() {
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = mainNav.style.display === 'flex';
      mainNav.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        mainNav.style.flexDirection = 'column';
        mainNav.style.position = 'absolute';
        mainNav.style.top = '76px';
        mainNav.style.left = '0';
        mainNav.style.right = '0';
        mainNav.style.background = 'rgba(8, 11, 17, 0.98)';
        mainNav.style.padding = '24px';
        mainNav.style.borderBottom = '1px solid var(--border-bright)';
      }
    });
  }

  // Smooth scroll and active link tracking
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          if (window.innerWidth <= 768 && mainNav) {
            mainNav.style.display = 'none';
          }
        }
      }
    });
  });
}

/* ==========================================================================
   SIMULATION STUDIO TABS
   ========================================================================== */
function initTabs() {
  const tabBtns = document.querySelectorAll('.studio-tab-btn');
  const panes = document.querySelectorAll('.sim-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(target);
      if (activePane) {
        activePane.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   SIMULATOR 1: CITADEL AEROGRID (WINDSHAPER EQUIVALENT)
   ========================================================================== */
function initAeroGridSimulator() {
  const canvas = document.getElementById('aeroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Simulation State
  let windSpeed = 14; // m/s
  let turbulence = 12; // %
  let dronePitch = 4; // degrees
  let currentPreset = 'cruise';

  // Elements
  const speedSlider = document.getElementById('windSpeedSlider');
  const speedVal = document.getElementById('windSpeedVal');
  const turbSlider = document.getElementById('windTurbSlider');
  const turbVal = document.getElementById('windTurbVal');
  const pitchSlider = document.getElementById('dronePitchSlider');
  const pitchVal = document.getElementById('dronePitchVal');

  const telSpeed = document.getElementById('telAirspeed');
  const telPress = document.getElementById('telDynPressure');
  const telRe = document.getElementById('telReynolds');
  const telPower = document.getElementById('telPowerDraw');

  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      windSpeed = parseFloat(e.target.value);
      if (speedVal) speedVal.textContent = `${windSpeed.toFixed(1)} m/s`;
      updateTelemetry();
    });
  }
  if (turbSlider) {
    turbSlider.addEventListener('input', (e) => {
      turbulence = parseFloat(e.target.value);
      if (turbVal) turbVal.textContent = `${turbulence}%`;
      updateTelemetry();
    });
  }
  if (pitchSlider) {
    pitchSlider.addEventListener('input', (e) => {
      dronePitch = parseFloat(e.target.value);
      if (pitchVal) pitchVal.textContent = `${dronePitch}°`;
    });
  }

  // Presets
  document.querySelectorAll('[data-aero-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-aero-preset]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.aeroPreset;
      currentPreset = preset;

      if (preset === 'laminar') {
        windSpeed = 10;
        turbulence = 2;
        dronePitch = 0;
      } else if (preset === 'cruise') {
        windSpeed = 16;
        turbulence = 12;
        dronePitch = 5;
      } else if (preset === 'gust') {
        windSpeed = 22;
        turbulence = 35;
        dronePitch = -8;
      } else if (preset === 'shear') {
        windSpeed = 18;
        turbulence = 24;
        dronePitch = 12;
      }

      if (speedSlider) speedSlider.value = windSpeed;
      if (speedVal) speedVal.textContent = `${windSpeed.toFixed(1)} m/s`;
      if (turbSlider) turbSlider.value = turbulence;
      if (turbVal) turbVal.textContent = `${turbulence}%`;
      if (pitchSlider) pitchSlider.value = dronePitch;
      if (pitchVal) pitchVal.textContent = `${dronePitch}°`;
      updateTelemetry();
    });
  });

  function updateTelemetry() {
    const kmh = (windSpeed * 3.6).toFixed(1);
    const dynPress = (0.5 * 1.225 * Math.pow(windSpeed, 2)).toFixed(1); // 1/2 rho v^2
    const reynolds = Math.round((1.225 * windSpeed * 0.45) / 0.0000181);
    const power = (Math.pow(windSpeed / 16, 2.5) * 18.5).toFixed(1); // approx kW

    if (telSpeed) telSpeed.textContent = `${windSpeed.toFixed(1)} m/s (${kmh} km/h)`;
    if (telPress) telPress.textContent = `${dynPress} Pa`;
    if (telRe) telRe.textContent = `${reynolds.toLocaleString()}`;
    if (telPower) telPower.textContent = `${power} kW`;
  }
  updateTelemetry();

  // Particle Streamlines
  const PARTICLE_COUNT = 320;
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * 800,
      y: Math.random() * 500,
      speedOffset: (Math.random() - 0.5) * 2,
      size: Math.random() * 2 + 1.2,
      alpha: Math.random() * 0.7 + 0.3,
      history: []
    });
  }

  let fanAngle = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const wallX = 60;
    const droneX = w * 0.58;
    const droneY = h * 0.52;

    // Draw AeroGrid Fan Wall (Left)
    const fanModulesCount = 4;
    const modHeight = (h - 60) / fanModulesCount;
    fanAngle += (windSpeed / 10) * 0.4;

    ctx.fillStyle = '#0F1626';
    ctx.fillRect(10, 20, wallX - 10, h - 40);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 20, wallX - 10, h - 40);

    for (let i = 0; i < fanModulesCount; i++) {
      const my = 30 + i * modHeight;
      const fanCenterY = my + modHeight / 2;
      const fanCenterX = 35;
      const fanRadius = Math.min(22, modHeight * 0.35);

      // Fan housing
      ctx.beginPath();
      ctx.arc(fanCenterX, fanCenterY, fanRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#060B12';
      ctx.fill();
      ctx.strokeStyle = windSpeed > 0 ? '#00E5FF' : '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing LED ring
      if (windSpeed > 0) {
        ctx.beginPath();
        ctx.arc(fanCenterX, fanCenterY, fanRadius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${Math.min(1, windSpeed / 20)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Spinning blades
      for (let b = 0; b < 3; b++) {
        const bladeAng = fanAngle + (b * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.moveTo(fanCenterX, fanCenterY);
        ctx.lineTo(
          fanCenterX + Math.cos(bladeAng) * (fanRadius - 3),
          fanCenterY + Math.sin(bladeAng) * (fanRadius - 3)
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    // Draw Sting mount & Floor grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = wallX; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(wallX, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Sting Stand supporting drone
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(droneX - 8, droneY + 30, 16, h - (droneY + 30));
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.strokeRect(droneX - 8, droneY + 30, 16, h - (droneY + 30));

    // Draw Drone Body (Tilted with dronePitch)
    ctx.save();
    ctx.translate(droneX, droneY);
    ctx.rotate((dronePitch * Math.PI) / 180);

    // Drone fuselage
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-35, -12, 70, 24, 6);
    ctx.fill();
    ctx.stroke();

    // Avionics Pod / Citadel Optics
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(15, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Quad Arms
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-75, -8);
    ctx.lineTo(75, -8);
    ctx.stroke();

    // Rotor Motors & Spinning Propellers
    const propSpin = fanAngle * 3;
    [-75, 75].forEach(rx => {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(rx - 6, -18, 12, 10);

      // Spinning propeller disc
      ctx.save();
      ctx.translate(rx, -18);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Label on drone
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('CITADEL AERO', -30, 4);

    ctx.restore();

    // Update and Draw Streamline Particles
    const effectiveSpeed = windSpeed * 0.7 + 1;
    const turbFactor = (turbulence / 100) * 8;

    particles.forEach(p => {
      // Wind speed + turbulence noise
      const noise = (Math.random() - 0.5) * turbFactor;
      p.x += (effectiveSpeed + p.speedOffset);
      p.y += noise;

      // Deflection around Drone Body
      const dx = p.x - droneX;
      const dy = p.y - droneY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 85 && p.x < droneX + 40) {
        // Push particles around the drone hull
        const pushAngle = Math.atan2(dy, dx);
        p.y += Math.sin(pushAngle) * 2.8;
        if (p.x > droneX - 30 && p.x < droneX + 30) {
          // Downwash under rotors
          p.y += (windSpeed / 12) * 1.5;
        }
      }

      // Wake turbulence behind drone
      if (p.x > droneX + 50 && Math.abs(dy) < 55) {
        p.y += (Math.random() - 0.5) * turbFactor * 1.8;
      }

      // Reset when exiting right edge
      if (p.x > w) {
        p.x = wallX + Math.random() * 15;
        p.y = Math.random() * h;
        p.history = [];
      }

      // Record trail
      p.history.push({ x: p.x, y: p.y });
      if (p.history.length > 8) p.history.shift();

      // Render particle trail
      ctx.beginPath();
      if (p.history.length > 1) {
        ctx.moveTo(p.history[0].x, p.history[0].y);
        for (let hIndex = 1; hIndex < p.history.length; hIndex++) {
          ctx.lineTo(p.history[hIndex].x, p.history[hIndex].y);
        }
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }

      // Dynamic color depending on speed
      const hue = Math.min(220, 180 + (p.speedOffset * 20));
      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${p.alpha * 0.8})`;
      ctx.lineWidth = p.size;
      ctx.stroke();
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/* ==========================================================================
   SIMULATOR 2: CITADEL SHREDX-30 (SINGLE-SHAFT ROTARY SHREDDER)
   User Specification: Single powered shaft, other end is fixed counter-knives
   ========================================================================== */
function initShredderSimulator() {
  const canvas = document.getElementById('shredCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Shredder State
  let rpm = 36;
  let direction = 1; // 1 = Forward Shred, -1 = Reverse Jog
  let isJamming = false;
  let isEStop = false;
  let currentTorque = 38; // %
  let baseAngle = 0;

  // Particle scrap arrays
  const plasticScrapPieces = [];
  const shreddedFlakes = [];

  // Elements
  const rpmSlider = document.getElementById('shredRpmSlider');
  const rpmVal = document.getElementById('shredRpmVal');
  const dirToggleBtn = document.getElementById('shredDirToggle');
  const dropScrapBtn = document.getElementById('dropScrapBtn');
  const eStopBtn = document.getElementById('shredEStopBtn');
  const torqueMeter = document.getElementById('telShredTorque');
  const statusDisplay = document.getElementById('telShredStatus');
  const flakeCountDisplay = document.getElementById('telFlakeCount');

  let totalFlakesProduced = 1420;

  if (rpmSlider) {
    rpmSlider.addEventListener('input', (e) => {
      rpm = parseInt(e.target.value);
      if (rpmVal) rpmVal.textContent = `${rpm} RPM`;
    });
  }

  if (dirToggleBtn) {
    dirToggleBtn.addEventListener('click', () => {
      if (isEStop) return;
      direction *= -1;
      dirToggleBtn.textContent = direction === 1 ? 'Direction: Forward Shred' : 'Direction: Reverse Jog';
      dirToggleBtn.classList.toggle('active', direction === -1);
      if (statusDisplay) {
        statusDisplay.textContent = direction === 1 ? 'RUNNING (FORWARD)' : 'REVERSE CLEARING';
        statusDisplay.style.color = direction === 1 ? 'var(--accent-emerald)' : 'var(--accent-amber)';
      }
    });
  }

  if (dropScrapBtn) {
    dropScrapBtn.addEventListener('click', () => {
      if (isEStop) return;
      spawnScrapBatch();
    });
  }

  if (eStopBtn) {
    eStopBtn.addEventListener('click', () => {
      isEStop = !isEStop;
      eStopBtn.classList.toggle('active', isEStop);
      eStopBtn.textContent = isEStop ? 'E-STOP ACTIVE (RESET)' : 'EMERGENCY STOP';
      if (statusDisplay) {
        statusDisplay.textContent = isEStop ? 'EMERGENCY SHUTDOWN' : 'RUNNING';
        statusDisplay.style.color = isEStop ? 'var(--accent-rose)' : 'var(--accent-emerald)';
      }
    });
  }

  function spawnScrapBatch() {
    const colors = ['#00E5FF', '#F59E0B', '#EF4444', '#10B981', '#A855F7', '#EC4899'];
    for (let i = 0; i < 6; i++) {
      plasticScrapPieces.push({
        x: canvas.width * 0.44 + (Math.random() - 0.5) * 80,
        y: 40 + Math.random() * 40,
        w: 18 + Math.random() * 16,
        h: 14 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: 2 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 1,
        angle: Math.random() * Math.PI,
        va: (Math.random() - 0.5) * 0.1,
        bitten: false
      });
    }
  }

  // Pre-seed a few scrap pieces
  spawnScrapBatch();

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    const chamberW = 300;
    const chamberH = 300;
    const chamberX = (w - chamberW) / 2;
    const chamberY = 100;

    // Center of the Single Rotary Shaft
    const shaftX = chamberX + 115;
    const shaftY = chamberY + 150;
    const shaftRadius = 38;
    const bladeRadius = 82;

    // Fixed Counter-Knives Bed position (Right wall)
    const bedX = chamberX + 225;
    const bedY = chamberY + 150;

    // Step Rotation Angle
    if (!isEStop) {
      baseAngle += direction * (rpm / 60) * 0.12;
    }

    // Dynamic torque fluctuation
    let activeCuttingLoad = 0;

    // 1. Draw Feed Hopper (Top Funnel)
    ctx.fillStyle = '#0D1424';
    ctx.beginPath();
    ctx.moveTo(chamberX - 30, chamberY - 70);
    ctx.lineTo(chamberX + chamberW + 30, chamberY - 70);
    ctx.lineTo(chamberX + chamberW, chamberY);
    ctx.lineTo(chamberX, chamberY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Draw Cutting Box Enclosure (30x30 cm chamber)
    ctx.fillStyle = '#070B13';
    ctx.fillRect(chamberX, chamberY, chamberW, chamberH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(chamberX, chamberY, chamberW, chamberH);

    // Grid dimension text
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.fillText('300 mm CUTTING ZONE', chamberX + 10, chamberY + 20);

    // 3. Draw Fixed Stationary Bed Knives (Comb) on the Right
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(bedX, chamberY + 60, chamberW - (bedX - chamberX), 180);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.strokeRect(bedX, chamberY + 60, chamberW - (bedX - chamberX), 180);

    // Fixed Comb Teeth projecting towards the rotor
    const teethCount = 7;
    for (let t = 0; t < teethCount; t++) {
      const toothY = chamberY + 80 + t * 20;
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(bedX, toothY);
      ctx.lineTo(bedX - 32, toothY + 6);
      ctx.lineTo(bedX - 32, toothY + 14);
      ctx.lineTo(bedX, toothY + 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('FIXED COUNTER-COMB', bedX + 8, chamberY + 75);

    // 4. Draw Single Rotary Shaft & Staggered Rotary Claw Blades
    // Rotating Shaft Core
    ctx.beginPath();
    ctx.arc(shaftX, shaftY, shaftRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Rotary Claw Blades (multi-hook rotary blades rotating around single shaft)
    const bladeHooks = 8;
    for (let i = 0; i < bladeHooks; i++) {
      const hookAngle = baseAngle + (i * Math.PI * 2) / bladeHooks;
      const hookTipX = shaftX + Math.cos(hookAngle) * bladeRadius;
      const hookTipY = shaftY + Math.sin(hookAngle) * bladeRadius;
      const hookMidX = shaftX + Math.cos(hookAngle - 0.28) * (bladeRadius * 0.7);
      const hookMidY = shaftY + Math.sin(hookAngle - 0.28) * (bladeRadius * 0.7);

      ctx.beginPath();
      ctx.moveTo(shaftX + Math.cos(hookAngle - 0.35) * shaftRadius, shaftY + Math.sin(hookAngle - 0.35) * shaftRadius);
      ctx.lineTo(hookTipX, hookTipY);
      ctx.lineTo(hookMidX, hookMidY);
      ctx.lineTo(shaftX + Math.cos(hookAngle + 0.15) * shaftRadius, shaftY + Math.sin(hookAngle + 0.15) * shaftRadius);
      ctx.closePath();

      // Blade styling
      ctx.fillStyle = '#CBD5E1';
      ctx.fill();
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Check cutting zone intersection (pinch point between rotor and fixed comb)
      if (Math.cos(hookAngle) > 0.65 && Math.sin(hookAngle) > -0.2 && Math.sin(hookAngle) < 0.6) {
        // Rotor claw is meshing with fixed comb!
        ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.fill();
      }
    }

    // Shaft Center Hub & Coupling
    ctx.beginPath();
    ctx.arc(shaftX, shaftY, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 5. Bottom Granule Sizing Screen
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(chamberX + 20, chamberY + chamberH - 20);
    ctx.lineTo(chamberX + chamberW - 20, chamberY + chamberH - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('4 mm CLASSIFIER SCREEN', chamberX + 80, chamberY + chamberH - 6);

    // 6. Physics & Shearing for Scrap Pieces
    for (let i = plasticScrapPieces.length - 1; i >= 0; i--) {
      const p = plasticScrapPieces[i];

      if (!isEStop) {
        p.y += p.vy;
        p.x += p.vx;
        p.angle += p.va;
      }

      // Check distance to rotor center
      const dx = p.x - shaftX;
      const dy = p.y - shaftY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // In cutting pinch zone (between spinning rotor and fixed bed knives)
      if (dist < bladeRadius + 15 && p.x > shaftX && p.y > shaftY - 50) {
        activeCuttingLoad += 18;
        p.bitten = true;

        if (direction === 1) {
          // Pulled down and sheared!
          p.vy = 4;
          p.vx = (Math.random() - 0.5) * 3;

          // Shred into small flakes!
          if (p.y > shaftY + 20) {
            // Spawn 5 flakes
            for (let f = 0; f < 5; f++) {
              shreddedFlakes.push({
                x: p.x + (Math.random() - 0.5) * 20,
                y: p.y + Math.random() * 10,
                vx: (Math.random() - 0.5) * 2,
                vy: 3 + Math.random() * 3,
                size: 3 + Math.random() * 3,
                color: p.color
              });
            }
            totalFlakesProduced += 5;
            if (flakeCountDisplay) flakeCountDisplay.textContent = `${totalFlakesProduced.toLocaleString()} pcs`;

            // Remove this scrap block
            plasticScrapPieces.splice(i, 1);
            continue;
          }
        } else {
          // Reverse: push back up
          p.vy = -3;
        }
      }

      // Draw scrap piece
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    // 7. Update and Draw Shredded Granular Flakes falling into collection bin
    for (let f = shreddedFlakes.length - 1; f >= 0; f--) {
      const fl = shreddedFlakes[f];
      fl.y += fl.vy;
      fl.x += fl.vx;

      ctx.fillStyle = fl.color;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, fl.size, 0, Math.PI * 2);
      ctx.fill();

      // Remove after falling below chamber
      if (fl.y > chamberY + chamberH + 60) {
        shreddedFlakes.splice(f, 1);
      }
    }

    // 8. Update Torque Load Display
    currentTorque = Math.min(95, Math.max(22, 28 + activeCuttingLoad + (Math.random() - 0.5) * 4));
    if (isEStop) currentTorque = 0;
    const nm = Math.round(currentTorque * 3.4);
    if (torqueMeter) torqueMeter.textContent = `${currentTorque.toFixed(0)}% (${nm} N·m)`;

    // Auto replenish scrap when empty
    if (plasticScrapPieces.length === 0 && !isEStop) {
      setTimeout(spawnScrapBatch, 1800);
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/* ==========================================================================
   SIMULATOR 3: CITADEL EXTRUDEX (DESKTOP FILAMENT EXTRUSION)
   ========================================================================== */
function initExtruderSimulator() {
  const canvas = document.getElementById('extrudeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Extruder State
  let screwRpm = 8;
  let targetTemp = 210; // PLA
  let currentDiameter = 1.750;
  let totalMeters = 34.8;
  let screwAngle = 0;
  let spoolAngle = 0;
  let pidActive = true;

  const diameterHistory = [];
  for (let i = 0; i < 60; i++) {
    diameterHistory.push(1.75 + (Math.random() - 0.5) * 0.02);
  }

  // Elements
  const screwSlider = document.getElementById('screwRpmSlider');
  const screwVal = document.getElementById('screwRpmVal');
  const matSelector = document.getElementById('polymerSelector');
  const pidToggle = document.getElementById('pidToggleBtn');
  const diaReadout = document.getElementById('telExtrudeDia');
  const tempReadout = document.getElementById('telExtrudeTemp');
  const metersReadout = document.getElementById('telExtrudeMeters');

  if (screwSlider) {
    screwSlider.addEventListener('input', (e) => {
      screwRpm = parseFloat(e.target.value);
      if (screwVal) screwVal.textContent = `${screwRpm} RPM`;
    });
  }

  if (matSelector) {
    matSelector.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'PLA') targetTemp = 205;
      else if (val === 'PETG') targetTemp = 235;
      else if (val === 'ABS') targetTemp = 245;
      else if (val === 'PACF') targetTemp = 265;
      else if (val === 'TPU') targetTemp = 215;
      if (tempReadout) tempReadout.textContent = `${targetTemp} °C`;
    });
  }

  if (pidToggle) {
    pidToggle.addEventListener('click', () => {
      pidActive = !pidActive;
      pidToggle.classList.toggle('active', pidActive);
      pidToggle.textContent = pidActive ? 'Optical Laser PID: Active' : 'Optical Laser PID: Disabled';
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    const centerY = h * 0.48;

    // Component Positions
    const hopperX = 80;
    const barrelX = 140;
    const barrelW = 220;
    const barrelH = 46;
    const nozzleX = barrelX + barrelW;
    const laserX = nozzleX + 90;
    const pullerX = laserX + 110;
    const spoolX = Math.min(w - 90, pullerX + 110);

    screwAngle += (screwRpm / 60) * 0.2;
    spoolAngle += (screwRpm / 60) * 0.15;
    totalMeters += (screwRpm * 0.0008);
    if (metersReadout) metersReadout.textContent = `${totalMeters.toFixed(1)} m`;

    // 1. Transparent Feed Hopper
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hopperX - 35, centerY - 130);
    ctx.lineTo(hopperX + 35, centerY - 130);
    ctx.lineTo(hopperX + 14, centerY - barrelH / 2);
    ctx.lineTo(hopperX - 14, centerY - barrelH / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Polymer pellets in hopper
    for (let p = 0; p < 22; p++) {
      const px = hopperX + (Math.sin(p * 3.4) * 18);
      const py = centerY - 120 + (p * 4);
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('PELLET HOPPER', hopperX - 35, centerY - 136);

    // 2. Heated Extrusion Barrel (3 Zones)
    const zoneW = barrelW / 3;
    const zones = [
      { name: 'ZONE 1 (FEED)', temp: targetTemp - 35, color: '#F59E0B' },
      { name: 'ZONE 2 (MELT)', temp: targetTemp - 15, color: '#EF4444' },
      { name: 'ZONE 3 (METER)', temp: targetTemp, color: '#EC4899' }
    ];

    for (let z = 0; z < 3; z++) {
      const zx = barrelX + z * zoneW;
      ctx.fillStyle = '#111827';
      ctx.fillRect(zx, centerY - barrelH / 2, zoneW, barrelH);
      ctx.strokeStyle = zones[z].color;
      ctx.lineWidth = 2;
      ctx.strokeRect(zx, centerY - barrelH / 2, zoneW, barrelH);

      // Heating Band Wire coils
      for (let c = 4; c < zoneW - 4; c += 8) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(zx + c, centerY - barrelH / 2 + 2);
        ctx.lineTo(zx + c, centerY + barrelH / 2 - 2);
        ctx.stroke();
      }

      ctx.fillStyle = zones[z].color;
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`${zones[z].temp}°C`, zx + 10, centerY - barrelH / 2 - 6);
    }

    // Rotating Helical Extrusion Screw inside barrel
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let sx = barrelX + 6; sx < barrelX + barrelW - 6; sx += 14) {
      const screwPhase = Math.sin(screwAngle + sx * 0.1) * (barrelH * 0.35);
      ctx.moveTo(sx, centerY + screwPhase);
      ctx.lineTo(sx + 8, centerY - screwPhase);
    }
    ctx.stroke();

    // 3. Brass Extrusion Die Nozzle
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.moveTo(nozzleX, centerY - 14);
    ctx.lineTo(nozzleX + 22, centerY - 4);
    ctx.lineTo(nozzleX + 22, centerY + 4);
    ctx.lineTo(nozzleX, centerY + 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#FDE68A';
    ctx.stroke();

    // 4. Optical Dual-Axis Laser Micrometer
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(laserX - 16, centerY - 45, 32, 90);
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(laserX - 16, centerY - 45, 32, 90);

    // Laser beam crossing filament
    ctx.strokeStyle = pidActive ? '#10B981' : '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(laserX, centerY - 38);
    ctx.lineTo(laserX, centerY + 38);
    ctx.stroke();

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = pidActive ? '#10B981' : '#EF4444';
    ctx.fillText('OPTICAL LASER', laserX - 35, centerY - 52);

    // Calculate dynamic diameter noise with PID correction
    const noiseTarget = pidActive ? 0.008 : 0.035;
    currentDiameter += ((1.75 - currentDiameter) * (pidActive ? 0.15 : 0.02)) + ((Math.random() - 0.5) * noiseTarget);
    diameterHistory.push(currentDiameter);
    if (diameterHistory.length > 50) diameterHistory.shift();

    if (diaReadout) diaReadout.textContent = `${currentDiameter.toFixed(3)} mm`;

    // 5. Active Cooling Section
    const coolX = nozzleX + 35;
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let cf = 0; cf < 3; cf++) {
      ctx.beginPath();
      ctx.arc(coolX + cf * 14, centerY - 22, 6, 0, Math.PI);
      ctx.stroke();
    }

    // 6. Motorized Tension Puller Wheels
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(pullerX, centerY - 14, 12, 0, Math.PI * 2);
    ctx.arc(pullerX, centerY + 14, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 7. Rotating Filament Spool & Winding
    ctx.save();
    ctx.translate(spoolX, centerY);
    ctx.rotate(spoolAngle);

    // Outer Spool Flanges
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wound Filament layers
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#00E5FF';
    ctx.fill();

    // Inner Hub
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#060B12';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    ctx.restore();
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('AUTO-SPOOLER', spoolX - 35, centerY + 68);

    // 8. Continuous Extruded Filament Strand (Connecting nozzle -> laser -> puller -> spool)
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(nozzleX + 22, centerY);
    ctx.lineTo(laserX, centerY);
    ctx.lineTo(pullerX, centerY);
    ctx.lineTo(spoolX, centerY - 38);
    ctx.stroke();

    // 9. Real-Time Laser Diameter Oscilloscope Graph (Bottom Left)
    const graphX = 30;
    const graphY = h - 90;
    const graphW = 200;
    const graphH = 65;

    ctx.fillStyle = '#06090F';
    ctx.fillRect(graphX, graphY, graphW, graphH);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    // Center nominal line 1.75 mm
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(graphX, graphY + graphH / 2);
    ctx.lineTo(graphX + graphW, graphY + graphH / 2);
    ctx.stroke();

    // Tolerance limits (±0.02 mm)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(graphX, graphY + 12);
    ctx.lineTo(graphX + graphW, graphY + 12);
    ctx.moveTo(graphX, graphY + graphH - 12);
    ctx.lineTo(graphX + graphW, graphY + graphH - 12);
    ctx.stroke();
    ctx.setLineDash([]);

    // Graph trace
    ctx.strokeStyle = pidActive ? '#10B981' : '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < diameterHistory.length; i++) {
      const gx = graphX + (i / diameterHistory.length) * graphW;
      const deviation = (diameterHistory[i] - 1.75) * 800;
      const gy = graphY + graphH / 2 - deviation;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.stroke();

    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('LIVE LASER TOLERANCE (±0.02mm)', graphX + 6, graphY + 10);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/* ==========================================================================
   WINDSHAPER MODULAR CONFIGURATOR
   ========================================================================== */
function initWindConfigurator() {
  const widthInput = document.getElementById('cfgWidth');
  const heightInput = document.getElementById('cfgHeight');
  const matrixContainer = document.getElementById('fanMatrixDisplay');

  const summaryModules = document.getElementById('cfgModulesCount');
  const summaryPixels = document.getElementById('cfgPixelsCount');
  const summaryArea = document.getElementById('cfgTestArea');
  const summaryPower = document.getElementById('cfgPowerEstimate');
  const configQuoteBtn = document.getElementById('cfgRequestQuoteBtn');

  function updateConfigurator() {
    if (!widthInput || !heightInput || !matrixContainer) return;

    const w = parseInt(widthInput.value) || 4;
    const h = parseInt(heightInput.value) || 3;
    const totalModules = w * h;
    const totalPixels = totalModules * 9; // 9 ducted fans per module
    const areaM2 = (w * 0.25 * h * 0.25).toFixed(2);
    const powerKw = (totalModules * 0.75).toFixed(1);

    if (summaryModules) summaryModules.textContent = `${totalModules} Units`;
    if (summaryPixels) summaryPixels.textContent = `${totalPixels} Pixels`;
    if (summaryArea) summaryArea.textContent = `${(w * 0.25).toFixed(2)} m × ${(h * 0.25).toFixed(2)} m (${areaM2} m²)`;
    if (summaryPower) summaryPower.textContent = `${powerKw} kW Peak`;

    // Render Matrix Grid
    matrixContainer.style.gridTemplateColumns = `repeat(${w}, 1fr)`;
    matrixContainer.innerHTML = '';

    for (let i = 0; i < totalModules; i++) {
      const cell = document.createElement('div');
      cell.className = 'fan-matrix-cell';
      cell.title = `Module #${i + 1} (9 Fans)`;
      matrixContainer.appendChild(cell);
    }
  }

  if (widthInput && heightInput) {
    widthInput.addEventListener('input', updateConfigurator);
    heightInput.addEventListener('input', updateConfigurator);
    updateConfigurator();
  }

  if (configQuoteBtn) {
    configQuoteBtn.addEventListener('click', () => {
      const w = widthInput ? widthInput.value : 4;
      const h = heightInput ? heightInput.value : 3;
      const totalModules = w * h;
      const totalPixels = totalModules * 9;

      // Pre-fill RFQ modal
      const sysSelect = document.getElementById('rfqSystem');
      const details = document.getElementById('rfqDetails');
      if (sysSelect) sysSelect.value = 'AEROGRID';
      if (details) {
        details.value = `WindShaper Configuration Request: ${w}x${h} Matrix (${totalModules} Modules, ${totalPixels} Fan Pixels). Estimated test area ${(w * 0.25).toFixed(2)}m x ${(h * 0.25).toFixed(2)}m.`;
      }

      openModal('rfqModal');
    });
  }
}

/* ==========================================================================
   MODALS (RFQ, TERMS, PRIVACY, QUALITY)
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function initModals() {
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.dataset.openModal;
      const targetSystem = btn.dataset.rfqSystem;

      if (modalId === 'rfqModal' && targetSystem) {
        const sysSelect = document.getElementById('rfqSystem');
        if (sysSelect) sysSelect.value = targetSystem;
      }
      openModal(modalId);
    });
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) closeModal(modal.id);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(m => closeModal(m.id));
    }
  });
}

/* ==========================================================================
   RFQ FORM SUBMISSION & QUOTATION LOGIC
   ========================================================================== */
function initRFQForm() {
  const rfqForm = document.getElementById('rfqForm');
  const responseBox = document.getElementById('rfqResponseBox');

  if (rfqForm) {
    rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('rfqName').value;
      const email = document.getElementById('rfqEmail').value;
      const institution = document.getElementById('rfqOrg').value;
      const system = document.getElementById('rfqSystem').value;
      const details = document.getElementById('rfqDetails').value;

      const rfqId = `CITADEL-RFQ-${Date.now().toString().slice(-6)}`;

      if (responseBox) {
        responseBox.style.display = 'block';
        responseBox.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-emerald); border-radius: var(--radius-sm); padding: 18px;">
            <h4 style="color: var(--accent-emerald); margin-bottom: 8px;">Quotation Request Recorded!</h4>
            <p style="color: var(--text-primary); font-size: 0.9rem;">Reference Code: <strong class="mono" style="color: var(--accent-cyan);">${rfqId}</strong></p>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 6px;">Thank you, ${name} (${institution}). Our engineering team at ODTU Teknokent will review your technical specifications for <strong>${system}</strong> and provide detailed technical documentation and price quotation.</p>
            <div style="margin-top: 14px; display: flex; gap: 10px;">
              <a href="mailto:contact@citadel.com.tr?subject=RFQ ${rfqId} - ${system}&body=Reference: ${rfqId}%0D%0AOrganization: ${institution}%0D%0AContact: ${name} (${email})%0D%0ARequirements: ${encodeURIComponent(details)}" class="btn btn-outline" style="font-size: 0.825rem; padding: 6px 14px;">Open in Email Client</a>
            </div>
          </div>
        `;
        rfqForm.style.display = 'none';
      }
    });
  }
}
