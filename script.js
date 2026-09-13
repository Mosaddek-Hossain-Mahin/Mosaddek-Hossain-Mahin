// ==========================================================================
// RETRO CRT TERMINAL INTERACTIVITY & REPL ENGINE
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initScanlinesToggle();
  initAudioSynthesizer();
  initCopyMailBox();
  initInteractiveShell();
  initLiveUptimeCounter();
  initSkillBarAnimation();
});

/* --------------------------------------------------------------------------
   1. CRT SCANLINE TOGGLE ENGINE
   -------------------------------------------------------------------------- */
function initScanlinesToggle() {
  const scanlinesBtn = document.getElementById('btn-toggle-scanlines');
  const crtOverlay = document.getElementById('crt-overlay');

  if (!scanlinesBtn || !crtOverlay) return;

  let scanlinesActive = true;

  scanlinesBtn.addEventListener('click', () => {
    scanlinesActive = !scanlinesActive;
    if (scanlinesActive) {
      crtOverlay.classList.remove('disabled');
      scanlinesBtn.querySelector('.toggle-icon').textContent = '[CRT: ON]';
      showToast('CRT Scanlines Enabled');
    } else {
      crtOverlay.classList.add('disabled');
      scanlinesBtn.querySelector('.toggle-icon').textContent = '[CRT: OFF]';
      showToast('CRT Scanlines Disabled');
    }
    playTerminalBeep(500, 0.05);
  });
}

/* --------------------------------------------------------------------------
   2. RETRO WEB AUDIO SYNTHESIZER (Keyclicks & Beeps)
   -------------------------------------------------------------------------- */
let audioCtx = null;
let audioEnabled = false;

function initAudioSynthesizer() {
  const audioBtn = document.getElementById('btn-toggle-audio');
  const audioIcon = document.getElementById('audio-icon');

  if (!audioBtn) return;

  audioBtn.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      audioIcon.textContent = '[SFX: ON]';
      audioBtn.style.color = '#39ff7a';
      audioBtn.style.borderColor = '#39ff7a';
      playTerminalBeep(880, 0.1);
      showToast('Terminal Audio Enabled');
    } else {
      audioIcon.textContent = '[SFX: OFF]';
      audioBtn.style.color = '';
      audioBtn.style.borderColor = '';
      showToast('Terminal Audio Muted');
    }
  });

  // Global keyclick sound listener if audio is enabled
  document.addEventListener('keydown', (e) => {
    if (audioEnabled && !e.repeat) {
      playKeyClick();
    }
  });
}

function playTerminalBeep(freq = 600, duration = 0.08) {
  if (!audioEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.error('Audio synth error:', err);
  }
}

function playKeyClick() {
  if (!audioEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const randomFreq = 1200 + Math.random() * 600;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(randomFreq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  } catch (err) {
    console.error('Key click synth error:', err);
  }
}

/* --------------------------------------------------------------------------
   3. COPY MAIL BOX TO CLIPBOARD
   -------------------------------------------------------------------------- */
function initCopyMailBox() {
  const mailBox = document.getElementById('copy-mail-box');
  const copyText = document.getElementById('copy-text');

  if (!mailBox) return;

  mailBox.addEventListener('click', () => {
    const email = 'mosaddek.mahin@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      copyText.textContent = 'COPIED TO CLIPBOARD!';
      copyText.style.color = '#ffd24a';
      copyText.style.backgroundColor = 'rgba(255, 210, 74, 0.15)';
      showToast('Copied mosaddek.mahin@gmail.com to clipboard!');
      playTerminalBeep(950, 0.12);

      setTimeout(() => {
        copyText.textContent = 'click to copy';
        copyText.style.color = '';
        copyText.style.backgroundColor = '';
      }, 3000);
    }).catch(err => {
      showToast('Email: mosaddek.mahin@gmail.com');
    });
  });
}

/* --------------------------------------------------------------------------
   4. INTERACTIVE REPL SHELL ENGINE
   -------------------------------------------------------------------------- */
function initInteractiveShell() {
  const launchBtn = document.getElementById('btn-launch-cli');
  const closeBtn = document.getElementById('btn-close-cli');
  const drawer = document.getElementById('cli-drawer');
  const cliInput = document.getElementById('cli-input');
  const outputLog = document.getElementById('cli-output-log');

  if (!launchBtn || !drawer || !cliInput) return;

  launchBtn.addEventListener('click', () => {
    drawer.classList.remove('hidden');
    cliInput.focus();
    playTerminalBeep(750, 0.08);
  });

  closeBtn.addEventListener('click', () => {
    drawer.classList.add('hidden');
  });

  cliInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = cliInput.value.trim();
      if (cmd) {
        processCommand(cmd);
        cliInput.value = '';
      }
    }
  });

  function processCommand(cmd) {
    appendCliLine(`mahin~/dev $ ${cmd}`, 'user-cmd');
    playTerminalBeep(650, 0.05);

    const lowerCmd = cmd.toLowerCase().trim();

    if (lowerCmd === 'help') {
      appendCliLine('Available commands:', 'sys-msg');
      appendCliLine('  whoami     - Print engineer profile details', 'res-msg');
      appendCliLine('  neofetch   - Display system neofetch card', 'res-msg');
      appendCliLine('  ls         - List projects in ~/projects', 'res-msg');
      appendCliLine('  cat stack  - Display stack skill meters', 'res-msg');
      appendCliLine('  cv         - Download Mosaddek_Hossain_Mahin_CV.pdf', 'res-msg');
      appendCliLine('  contact    - Show hire & mail information', 'res-msg');
      appendCliLine('  matrix     - Run digital rain matrix simulation', 'res-msg');
      appendCliLine('  date       - Show current system timestamp', 'res-msg');
      appendCliLine('  uptime     - Display system uptime stats', 'res-msg');
      appendCliLine('  clear      - Clear the console log', 'res-msg');
      appendCliLine('  sudo       - Execute command with elevated permissions', 'res-msg');
    } else if (lowerCmd === 'clear') {
      outputLog.innerHTML = '';
      appendCliLine('Console log cleared.', 'sys-msg');
    } else if (lowerCmd === 'whoami' || lowerCmd === 'whoami --full') {
      appendCliLine('USER: MD. Mosaddek Hossain Mahin | ROLE: Full-Stack Web Developer | LOCATION: Dhaka, BD', 'res-msg');
    } else if (lowerCmd === 'neofetch') {
      appendCliLine('OS: Human v10.4 | Shell: zsh | Exp: 12+ mos (Evodynamix) | Stack: Next.js, React, Node.js, NestJS, Postgres', 'res-msg');
    } else if (lowerCmd === 'ls' || lowerCmd === 'projects' || lowerCmd === 'ls ~/projects') {
      appendCliLine('drwxr-xr-x  real-estate-app/  (★ 4.8k  SaaS)', 'res-msg');
      appendCliLine('drwxr-xr-x  ecommerce-api/    (★ 3.9k  open source)', 'res-msg');
      appendCliLine('drwxr-xr-x  auth-system/      (★ 2.5k  open source)', 'res-msg');
      appendCliLine('drwxr-xr-x  portfolio-v2/     (★ 1.8k  open source)', 'res-msg');
    } else if (lowerCmd.startsWith('cat') || lowerCmd === 'stack') {
      appendCliLine('Next.js/React [95%] | TS/JS [92%] | Node/NestJS [90%] | Postgres [88%] | Tailwind [85%]', 'res-msg');
    } else if (lowerCmd === 'cv' || lowerCmd === './cv' || lowerCmd === './cv --download' || lowerCmd === 'download cv') {
      appendCliLine('Downloading Mosaddek_Hossain_Mahin_CV.pdf...', 'res-msg');
      triggerCvDownload();
    } else if (lowerCmd === 'contact' || lowerCmd === './contact --hire') {
      appendCliLine('MAIL: mosaddek.mahin@gmail.com | GITHUB: github.com/Mosaddek-Hossain-Mahin | STATUS: Available for work', 'res-msg');
    } else if (lowerCmd === 'matrix') {
      runMatrixRain();
    } else if (lowerCmd === 'date') {
      appendCliLine(`TIMESTAMP: ${new Date().toISOString()}`, 'res-msg');
    } else if (lowerCmd === 'uptime') {
      appendCliLine('UPTIME: 12+ months experience, Evodynamix Solutions, 10+ projects completed', 'res-msg');
    } else if (lowerCmd.startsWith('sudo')) {
      appendCliLine('mahin is not in the sudoers file. This incident will be reported to security.', 'sys-msg');
    } else {
      appendCliLine(`zsh: command not found: ${cmd}. Type 'help' for available commands.`, 'sys-msg');
    }

    outputLog.scrollTop = outputLog.scrollHeight;
  }

  function appendCliLine(text, className) {
    const line = document.createElement('div');
    line.className = `cli-line ${className}`;
    line.textContent = text;
    outputLog.appendChild(line);
    outputLog.scrollTop = outputLog.scrollHeight;
  }

  function runMatrixRain() {
    appendCliLine('Initializing CRT Matrix Digital Rain...', 'sys-msg');
    const chars = '01010101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let count = 0;
    const interval = setInterval(() => {
      let rainLine = '';
      for (let i = 0; i < 45; i++) {
        rainLine += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      appendCliLine(rainLine, 'res-msg');
      count++;
      if (count > 8) {
        clearInterval(interval);
        appendCliLine('Matrix sequence complete.', 'sys-msg');
      }
    }, 100);
  }
}

/* --------------------------------------------------------------------------
   5. LIVE UPTIME COUNTER ANIMATION
   -------------------------------------------------------------------------- */
function initLiveUptimeCounter() {
  const counterEl = document.getElementById('uptime-counter');
  if (!counterEl) return;

  let baseUptime = 99.981;
  setInterval(() => {
    baseUptime += (Math.random() * 0.0001);
    if (baseUptime > 99.999) baseUptime = 99.981;
    counterEl.textContent = baseUptime.toFixed(3) + '%';
  }, 4000);
}

/* --------------------------------------------------------------------------
   6. SKILL BAR ANIMATION ON SCROLL
   -------------------------------------------------------------------------- */
function initSkillBarAnimation() {
  const skillFills = document.querySelectorAll('.skill-bar-fill');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.style.width;
        fill.style.width = '0%';
        setTimeout(() => {
          fill.style.width = width;
        }, 100);
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.2 });

  skillFills.forEach(fill => observer.observe(fill));
}

/* --------------------------------------------------------------------------
   7. TOAST NOTIFICATION UTILITY
   -------------------------------------------------------------------------- */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = `[SYSTEM]: ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2500);
}

function triggerCvDownload() {
  const link = document.createElement('a');
  link.href = 'Mosaddek_Hossain_Mahin_CV.pdf';
  link.download = 'Mosaddek_Hossain_Mahin_CV.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* Global Event Handlers for Links */
window.handleDownloadCV = function(e) {
  playTerminalBeep(900, 0.1);
  showToast('Downloading Mosaddek_Hossain_Mahin_CV.pdf...');
};

window.handleProjectClick = function(e, projName, type) {
  playTerminalBeep(800, 0.08);
  showToast(`Opening ${projName} ${type}...`);
};

window.handleSocialClick = function(e, target) {
  playTerminalBeep(700, 0.08);
  showToast(`Accessing ${target} resource stream...`);
};
