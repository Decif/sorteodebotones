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
    triggerBgCelebration();
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

// ============================================================================
// Fondo Dinámico: Aviones, Bicicletas, Naves, Coches y Computadoras
// ============================================================================
const bgScene = document.getElementById('bg-scene');

const BG_CATALOG = [
  // Aviones
  { category: 'plane', icon: '✈️', className: 'item-plane', weight: 2 },
  { category: 'plane', icon: '🛩️', className: 'item-plane', weight: 1 },
  // Bicicletas
  { category: 'bike', icon: '🚲', className: 'item-bike', weight: 2 },
  // Naves Espaciales
  { category: 'spaceship', icon: '🚀', className: 'item-spaceship', weight: 2 },
  { category: 'spaceship', icon: '🛸', className: 'item-spaceship', weight: 1 },
  // Coches
  { category: 'car', icon: '🚗', className: 'item-car', weight: 2 },
  { category: 'car', icon: '🏎️', className: 'item-car', weight: 1 },
  // Computadoras
  { category: 'computer', icon: '💻', className: 'item-computer', weight: 2 },
  { category: 'computer', icon: '🖥️', className: 'item-computer', weight: 1 },
];

let ambientLayer = null;
let traversingLayer = null;
let celebrationTimeout = null;
let traversingInterval = null;

// Distribución equilibrada para los elementos flotantes fijos
const AMBIENT_POSITIONS = [
  // Esquina superior izquierda
  { top: '8%', left: '8%', category: 'spaceship', icon: '🚀', depth: 'depth-near', anim: 'float-ambient-1' },
  { top: '16%', left: '18%', category: 'plane', icon: '✈️', depth: 'depth-mid', anim: 'float-ambient-2' },
  { top: '28%', left: '6%', category: 'computer', icon: '💻', depth: 'depth-far', anim: 'float-ambient-pulse' },

  // Esquina superior derecha
  { top: '7%', left: '84%', category: 'spaceship', icon: '🛸', depth: 'depth-near', anim: 'float-ambient-pulse' },
  { top: '18%', left: '72%', category: 'plane', icon: '🛩️', depth: 'depth-far', anim: 'float-ambient-1' },
  { top: '26%', left: '90%', category: 'computer', icon: '🖥️', depth: 'depth-mid', anim: 'float-ambient-3' },

  // Laterales centrales
  { top: '48%', left: '4%', category: 'car', icon: '🚗', depth: 'depth-mid', anim: 'float-ambient-2' },
  { top: '56%', left: '14%', category: 'bike', icon: '🚲', depth: 'depth-near', anim: 'float-ambient-1' },
  { top: '46%', left: '92%', category: 'bike', icon: '🚲', depth: 'depth-far', anim: 'float-ambient-3' },
  { top: '55%', left: '82%', category: 'car', icon: '🏎️', depth: 'depth-mid', anim: 'float-ambient-1' },

  // Esquina inferior izquierda
  { top: '74%', left: '8%', category: 'computer', icon: '💻', depth: 'depth-mid', anim: 'float-ambient-pulse' },
  { top: '86%', left: '18%', category: 'car', icon: '🚗', depth: 'depth-far', anim: 'float-ambient-2' },
  { top: '82%', left: '5%', category: 'spaceship', icon: '🚀', depth: 'depth-far', anim: 'float-ambient-3' },

  // Esquina inferior derecha
  { top: '75%', left: '86%', category: 'bike', icon: '🚲', depth: 'depth-near', anim: 'float-ambient-2' },
  { top: '85%', left: '74%', category: 'plane', icon: '✈️', depth: 'depth-mid', anim: 'float-ambient-1' },
  { top: '88%', left: '90%', category: 'computer', icon: '🖥️', depth: 'depth-far', anim: 'float-ambient-pulse' },
  { top: '92%', left: '48%', category: 'car', icon: '🏎️', depth: 'depth-far', anim: 'float-ambient-3' }
];

function initBackgroundScene() {
  if (!bgScene) return;

  // Limpiar por si se reinicializa
  bgScene.innerHTML = '';

  // Capa para elementos ambientales con efecto Parallax
  ambientLayer = document.createElement('div');
  ambientLayer.className = 'bg-ambient-layer';
  ambientLayer.style.cssText = 'position: absolute; inset: 0; pointer-events: none; transition: transform 0.15s ease-out;';

  // Capa para elementos en movimiento (tránsito activo)
  traversingLayer = document.createElement('div');
  traversingLayer.className = 'bg-traversing-layer';
  traversingLayer.style.cssText = 'position: absolute; inset: 0; pointer-events: none;';

  bgScene.appendChild(ambientLayer);
  bgScene.appendChild(traversingLayer);

  // 1. Crear elementos flotantes ambientales
  AMBIENT_POSITIONS.forEach((pos, idx) => {
    const itemEl = document.createElement('div');
    itemEl.className = `bg-item item-${pos.category} ${pos.depth} ${pos.anim}`;
    itemEl.style.top = pos.top;
    itemEl.style.left = pos.left;
    // Variación aleatoria para que cada uno respire de forma independiente
    itemEl.style.animationDelay = `${-(idx * 1.7 + Math.random() * 3)}s`;
    itemEl.style.animationDuration = `${10 + (idx % 5) * 3}s`;

    const span = document.createElement('span');
    span.textContent = pos.icon;
    itemEl.appendChild(span);

    ambientLayer.appendChild(itemEl);
  });

  // 2. Iniciar generador de elementos que cruzan la pantalla
  startTraversingVehicles();

  // 3. Activar Parallax suave con el cursor
  setupMouseParallax();
}

// Generador de vehículos y objetos que cruzan el fondo periódicamente
function spawnTraversingItem(forcedCategory = null) {
  if (!traversingLayer) return;

  // Limitar número máximo simultáneo para óptimo rendimiento
  if (traversingLayer.children.length > 7) return;

  const category = forcedCategory || pickRandomCategory();
  const itemConfig = pickRandomItemForCategory(category);
  if (!itemConfig) return;

  const itemEl = document.createElement('div');
  itemEl.className = `bg-item traversing-item ${itemConfig.className}`;

  // Seleccionar profundidad
  const depths = ['depth-far', 'depth-mid', 'depth-near'];
  const depth = depths[Math.floor(Math.random() * depths.length)];
  itemEl.classList.add(depth);

  const innerSprite = document.createElement('span');
  innerSprite.className = 'inner-sprite';
  innerSprite.textContent = itemConfig.icon;
  itemEl.appendChild(innerSprite);

  // Configuración de movimiento según la categoría
  switch (category) {
    case 'spaceship': {
      if (itemConfig.icon === '🚀') {
        const startX = Math.random() * 40; // vw
        const duration = 6 + Math.random() * 3;
        itemEl.style.left = `${startX}vw`;
        itemEl.style.bottom = '-80px';
        itemEl.style.animation = `rocketLaunch ${duration}s cubic-bezier(0.2, 0.8, 0.4, 1) forwards`;
      } else { // 🛸
        const topY = 10 + Math.random() * 35; // %
        const duration = 10 + Math.random() * 4;
        itemEl.style.top = `${topY}%`;
        itemEl.style.left = '0';
        itemEl.style.animation = `ufoFly ${duration}s ease-in-out forwards`;
      }
      break;
    }

    case 'plane': {
      const topY = 8 + Math.random() * 38; // %
      const duration = 8 + Math.random() * 5;
      const isLTR = Math.random() > 0.3;
      itemEl.style.top = `${topY}%`;
      itemEl.style.left = '0';
      itemEl.style.animation = `${isLTR ? 'planeFlyLTR' : 'planeFlyRTL'} ${duration}s linear forwards`;
      break;
    }

    case 'car': {
      const topY = 72 + Math.random() * 18; // %
      const isSpeedCar = itemConfig.icon === '🏎️';
      const duration = isSpeedCar ? (4.5 + Math.random() * 2.5) : (7 + Math.random() * 3);
      const isLTR = Math.random() > 0.4;
      itemEl.style.top = `${topY}%`;
      itemEl.style.left = '0';
      itemEl.style.animation = `${isLTR ? 'carDriveLTR' : 'carDriveRTL'} ${duration}s linear forwards`;
      break;
    }

    case 'bike': {
      const topY = 66 + Math.random() * 20; // %
      const duration = 13 + Math.random() * 5;
      itemEl.style.top = `${topY}%`;
      itemEl.style.left = '0';
      itemEl.style.animation = `bikeRideLTR ${duration}s linear forwards`;
      innerSprite.style.animation = 'bikePedalBob 0.55s ease-in-out infinite';
      break;
    }

    case 'computer': {
      const topY = 18 + Math.random() * 45; // %
      const duration = 14 + Math.random() * 6;
      itemEl.style.top = `${topY}%`;
      itemEl.style.left = '0';
      itemEl.style.animation = `computerDrift ${duration}s ease-in-out forwards`;
      break;
    }
  }

  // Eliminar del DOM al finalizar la animación
  itemEl.addEventListener('animationend', () => {
    itemEl.remove();
  }, { once: true });

  traversingLayer.appendChild(itemEl);
}

function pickRandomCategory() {
  const categories = ['plane', 'bike', 'spaceship', 'car', 'computer'];
  return categories[Math.floor(Math.random() * categories.length)];
}

function pickRandomItemForCategory(category) {
  const matches = BG_CATALOG.filter(it => it.category === category);
  if (!matches.length) return null;
  return matches[Math.floor(Math.random() * matches.length)];
}

function startTraversingVehicles() {
  if (traversingInterval) clearInterval(traversingInterval);

  // Spawn inicial tras 800ms
  setTimeout(() => {
    spawnTraversingItem('plane');
    setTimeout(() => spawnTraversingItem('spaceship'), 1200);
    setTimeout(() => spawnTraversingItem('car'), 2400);
  }, 800);

  // Flujo regular de cruce
  traversingInterval = setInterval(() => {
    // Si la pestaña está oculta, pausar para ahorrar batería/CPU
    if (document.hidden) return;
    spawnTraversingItem();
  }, 2800);
}

// Parallax interactivo sutil con el ratón
function setupMouseParallax() {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;
    targetX = normX * 18; // Desplazamiento máx en px
    targetY = normY * 18;
  }, { passive: true });

  function renderParallax() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    if (ambientLayer) {
      ambientLayer.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
    }

    rafId = requestAnimationFrame(renderParallax);
  }

  rafId = requestAnimationFrame(renderParallax);
}

// Reacción especial de celebración cuando el jugador gana
function triggerBgCelebration() {
  if (!bgScene) return;

  bgScene.classList.add('celebrating');

  // Lanzar ráfaga de naves y aviones triunfales
  spawnTraversingItem('spaceship');
  setTimeout(() => spawnTraversingItem('spaceship'), 400);
  setTimeout(() => spawnTraversingItem('plane'), 700);
  setTimeout(() => spawnTraversingItem('car'), 1100);

  if (celebrationTimeout) clearTimeout(celebrationTimeout);
  celebrationTimeout = setTimeout(() => {
    bgScene.classList.remove('celebrating');
  }, 4000);
}

// Iniciar al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackgroundScene);
} else {
  initBackgroundScene();
}
