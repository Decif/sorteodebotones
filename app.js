/**
 * Sorteo de Botones: Elige tu Destino
 * Lógica principal del juego en JavaScript Vanilla
 */

// ============================================================================
// Elementos del DOM
// ============================================================================
const btnRed = document.getElementById('btn-red');
const btnBlue = document.getElementById('btn-blue');
const btnRestart = document.getElementById('btn-restart');

const choiceSection = document.getElementById('choice-section');
const resultSection = document.getElementById('result-section');
const resultCard = document.getElementById('result-card');
const resultIcon = document.getElementById('result-icon');
const resultTitle = document.getElementById('result-title');
const resultDescription = document.getElementById('result-description');

const winsCountEl = document.getElementById('wins-count');
const lossesCountEl = document.getElementById('losses-count');
const canvas = document.getElementById('confetti-canvas');

// ============================================================================
// Estado de la aplicación
// ============================================================================
let wins = 0;
let losses = 0;
let isAnimating = false;

// ============================================================================
// Sistema de Audio Sintetizado (Web Audio API)
// ============================================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sonido de clic suave
function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

// Sonido de Victoria (Arpegio alegre)
function playWinSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + idx * 0.1;
      const duration = 0.28;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

// Sonido de Derrota (Tono descendente)
function playLoseSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [311.13, 277.18, 233.08]; // Eb4, Db4, Bb3
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + idx * 0.14;
      const duration = 0.22;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

// ============================================================================
// Animación de Confeti (Canvas Vanilla)
// ============================================================================
let confettiAnimationId = null;
const confettiParticles = [];
const confettiColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function launchConfetti() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  confettiParticles.length = 0;

  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 1.2) * 12,
      size: Math.random() * 8 + 5,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      gravity: 0.28,
      opacity: 1
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

  let frameCount = 0;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    confettiParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRotation;
      if (frameCount > 40) {
        p.opacity -= 0.015;
      }

      if (p.opacity > 0 && p.y < canvas.height + 50) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    frameCount++;
    if (activeParticles > 0) {
      confettiAnimationId = requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiAnimationId = null;
    }
  }

  updateConfetti();
}

function clearConfetti() {
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
  }
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ============================================================================
// Lógica Principal del Juego
// ============================================================================
function handleChoice(chosenColor) {
  if (isAnimating) return;
  isAnimating = true;

  playClickSound();

  // Decisión aleatoria equitativa (50% probabilidad de ganar o perder)
  const isWinner = Math.random() < 0.5;

  // Actualizar estadísticas
  if (isWinner) {
    wins++;
    winsCountEl.textContent = wins;
  } else {
    losses++;
    lossesCountEl.textContent = losses;
  }

  // Configurar contenido del resultado
  const colorName = chosenColor === 'red' ? 'rojo' : 'azul';

  if (isWinner) {
    resultCard.className = 'result-box won';
    resultIcon.textContent = '🎉';
    resultTitle.textContent = 'Has ganado';
    resultDescription.textContent = `¡Excelente elección! El botón ${colorName} te ha otorgado la victoria.`;
    playWinSound();
    launchConfetti();
  } else {
    resultCard.className = 'result-box lost';
    resultIcon.textContent = '💀';
    resultTitle.textContent = 'Has perdido';
    resultDescription.textContent = `La suerte no te ha acompañado esta vez con el botón ${colorName}. ¡Inténtalo de nuevo!`;
    playLoseSound();
  }

  // Transición suave entre paneles
  choiceSection.classList.add('hidden');
  resultSection.classList.remove('hidden');

  // Enfocar el botón de reinicio para accesibilidad
  setTimeout(() => {
    btnRestart.focus();
    isAnimating = false;
  }, 100);
}

function resetGame() {
  if (isAnimating) return;
  isAnimating = true;

  playClickSound();
  clearConfetti();

  // Restaurar vista de selección
  resultSection.classList.add('hidden');
  choiceSection.classList.remove('hidden');

  setTimeout(() => {
    btnRed.focus();
    isAnimating = false;
  }, 100);
}

// ============================================================================
// Listeners y Eventos
// ============================================================================
btnRed.addEventListener('click', () => handleChoice('red'));
btnBlue.addEventListener('click', () => handleChoice('blue'));
btnRestart.addEventListener('click', resetGame);

// Soporte de accesibilidad con teclado (Tecla 'R' para reiniciar si está en pantalla de resultado)
window.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') {
    if (!resultSection.classList.contains('hidden')) {
      resetGame();
    }
  }
});
