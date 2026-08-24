
// ============ SCROLL ANIMATIONS ============
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ============ WAVE ANIMATION ============
const waveCanvas = document.getElementById('waveCanvas');
const wCtx = waveCanvas.getContext('2d');

function resizeWave() {
  waveCanvas.width = waveCanvas.offsetWidth;
  waveCanvas.height = waveCanvas.offsetHeight;
}
resizeWave();
window.addEventListener('resize', resizeWave);

let waveTime = 0;
function drawWaves() {
  wCtx.fillStyle = '#000';
  wCtx.fillRect(0, 0, waveCanvas.width, waveCanvas.height);
  
  const centerY = waveCanvas.height / 2;
  const barrierX = waveCanvas.width * 0.5;
  const slitY = centerY;
  const slitSize = 30;
  
  // Draw barrier
  wCtx.fillStyle = '#333';
  wCtx.fillRect(barrierX - 3, 0, 6, slitY - slitSize/2);
  wCtx.fillRect(barrierX - 3, slitY + slitSize/2, 6, waveCanvas.height);
  
  // Incoming waves (left)
  for (let i = 0; i < 8; i++) {
    const x = (barrierX - 20) - (waveTime * 2 + i * 40) % (barrierX - 20);
    if (x > 0) {
      wCtx.strokeStyle = `rgba(100, 150, 255, ${0.5 - i*0.05})`;
      wCtx.lineWidth = 2;
      wCtx.beginPath();
      wCtx.moveTo(x, 0);
      wCtx.lineTo(x, waveCanvas.height);
      wCtx.stroke();
    }
  }
  
  // Diffracted waves (right) - circular
  for (let i = 0; i < 10; i++) {
    const radius = (waveTime * 2 + i * 30) % 400;
    if (radius > 0 && barrierX + radius < waveCanvas.width + 50) {
      wCtx.strokeStyle = `rgba(100, 200, 255, ${0.6 - radius/500})`;
      wCtx.lineWidth = 2;
      wCtx.beginPath();
      wCtx.arc(barrierX, slitY, radius, -Math.PI/2, Math.PI/2);
      wCtx.stroke();
    }
  }
  
  // Slit glow
  wCtx.fillStyle = 'rgba(100, 200, 255, 0.3)';
  wCtx.fillRect(barrierX - 3, slitY - slitSize/2, 6, slitSize);
  
  waveTime++;
  requestAnimationFrame(drawWaves);
}
drawWaves();

// ============ SPECTRUM INTERACTIVE ============
const spectrumBar = document.getElementById('spectrumBar');
const wavelengthDisplay = document.getElementById('wavelengthDisplay');
const colorName = document.getElementById('colorName');
const colorDesc = document.getElementById('colorDesc');

function wavelengthToColor(wl) {
  let r, g, b;
  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380); g = 0; b = 1;
  } else if (wl >= 440 && wl < 490) {
    r = 0; g = (wl - 440) / (490 - 440); b = 1;
  } else if (wl >= 490 && wl < 510) {
    r = 0; g = 1; b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510); g = 1; b = 0;
  } else if (wl >= 580 && wl < 645) {
    r = 1; g = -(wl - 645) / (645 - 580); b = 0;
  } else if (wl >= 645 && wl <= 750) {
    r = 1; g = 0; b = 0;
  } else {
    r = 0; g = 0; b = 0;
  }
  
  let factor;
  if (wl >= 380 && wl < 420) factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
  else if (wl >= 420 && wl <= 700) factor = 1.0;
  else if (wl > 700 && wl <= 750) factor = 0.3 + 0.7 * (750 - wl) / (750 - 700);
  else factor = 0;
  
  return `rgb(${Math.round(r*factor*255)}, ${Math.round(g*factor*255)}, ${Math.round(b*factor*255)})`;
}

function getColorInfo(wl) {
  if (wl < 400) return { name: 'Ultravioleta (invisível)', desc: 'Comprimentos de onda abaixo de 380 nm não são visíveis ao olho humano.' };
  if (wl < 450) return { name: 'Violeta / Índigo', desc: 'As cores de menor comprimento de onda visível. São as mais desviadas na refração, mas as MENOS desviadas na difração.' };
  if (wl < 495) return { name: 'Azul', desc: 'Luz azul tem comprimento de onda entre 450-495 nm. O céu é azul devido ao espalhamento Rayleigh.' };
  if (wl < 570) return { name: 'Verde', desc: 'O olho humano é mais sensível à luz verde (por volta de 555 nm). Comprimento de onda intermediário.' };
  if (wl < 590) return { name: 'Amarelo', desc: 'Luz amarela, como a emitida por lâmpadas de sódio. Comprimento de onda em torno de 580 nm.' };
  if (wl < 620) return { name: 'Laranja', desc: 'Transição entre amarelo e vermelho. Presente no pôr do sol devido ao espalhamento atmosférico.' };
  if (wl <= 750) return { name: 'Vermelho', desc: 'Maior comprimento de onda visível. Na difração, é o mais desviado — oposto do que ocorre na refração!' };
  return { name: 'Infravermelho (invisível)', desc: 'Comprimentos de onda acima de 750 nm não são visíveis, mas podem ser detectados como calor.' };
}

spectrumBar.addEventListener('mousemove', (e) => {
  const rect = spectrumBar.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const ratio = x / rect.width;
  const wl = Math.round(750 - ratio * (750 - 380));
  
  wavelengthDisplay.textContent = `${wl} nm`;
  const info = getColorInfo(wl);
  colorName.textContent = info.name;
  colorName.style.color = wavelengthToColor(wl);
  colorDesc.textContent = info.desc;
});

// ============ DIFFRACTION SIMULATOR ============
const diffCanvas = document.getElementById('diffractionCanvas');
const dCtx = diffCanvas.getContext('2d');

function resizeDiff() {
  diffCanvas.width = diffCanvas.offsetWidth;
  diffCanvas.height = 300;
}
resizeDiff();
window.addEventListener('resize', () => { resizeDiff(); drawDiffraction(); });

const wlSlider = document.getElementById('wavelength');
const slitsSlider = document.getElementById('slits');
const spacingSlider = document.getElementById('spacing');
const widthSlider = document.getElementById('slitWidth');

function drawDiffraction() {
  const W = diffCanvas.width;
  const H = diffCanvas.height;
  dCtx.fillStyle = '#000';
  dCtx.fillRect(0, 0, W, H);
  
  const lambda = parseInt(wlSlider.value);
  const N = parseInt(slitsSlider.value);
  const d = parseInt(spacingSlider.value); // μm
  const a = parseInt(widthSlider.value); // μm
  
  // Update labels
  document.getElementById('wlValue').textContent = `${lambda} nm`;
  document.getElementById('slitsValue').textContent = N;
  document.getElementById('spacingValue').textContent = `${d} μm`;
  document.getElementById('widthValue').textContent = `${a} μm`;
  
  // Calculate intensity pattern
  const points = W;
  const intensities = [];
  const color = wavelengthToColor(lambda);
  
  for (let i = 0; i < points; i++) {
    const x = (i / points) * 2 - 1; // -1 to 1
    const theta = x * Math.PI / 3; // angle range
    
    // Single slit diffraction envelope
    const alpha = (Math.PI * a * Math.sin(theta)) / (lambda / 1000);
    const singleSlit = alpha === 0 ? 1 : Math.pow(Math.sin(alpha) / alpha, 2);
    
    // Multiple slit interference
    const delta = (Math.PI * d * Math.sin(theta)) / (lambda / 1000);
    let multiSlit;
    if (Math.sin(delta) === 0) {
      multiSlit = N * N;
    } else {
      multiSlit = Math.pow(Math.sin(N * delta) / Math.sin(delta), 2);
    }
    
    intensities.push(singleSlit * multiSlit);
  }
  
  // Normalize
  const maxI = Math.max(...intensities);
  
  // Draw pattern as vertical bars with color
  for (let i = 0; i < points; i++) {
    const intensity = intensities[i] / maxI;
    const x = i;
    
    // Parse color
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    // Gradient vertical bar
    const grad = dCtx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgba(${r},${g},${b},${intensity * 0.3})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${intensity})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${intensity * 0.3})`);
    
    dCtx.fillStyle = grad;
    dCtx.fillRect(x, 0, 1, H);
  }
  
  // Draw grating representation on the left
  dCtx.fillStyle = '#222';
  dCtx.fillRect(0, 0, 30, H);
  const slitH = H / (N * 2);
  for (let i = 0; i < N; i++) {
    const y = (i + 0.5) * (H / N) - slitH/2;
    dCtx.fillStyle = '#000';
    dCtx.fillRect(0, y, 30, slitH);
  }
  
  // Label
  dCtx.fillStyle = 'rgba(255,255,255,0.5)';
  dCtx.font = '12px sans-serif';
  dCtx.fillText('Padrão de intensidade na tela', W/2 - 100, 20);
}

[wlSlider, slitsSlider, spacingSlider, widthSlider].forEach(s => {
  s.addEventListener('input', drawDiffraction);
});
drawDiffraction();

// ============ CALCULATOR ============
const calcD = document.getElementById('calcD');
const calcLambda = document.getElementById('calcLambda');
const calcM = document.getElementById('calcM');
const calcResult = document.getElementById('calcResult');
const calcExplanation = document.getElementById('calcExplanation');

function updateCalc() {
  const d = parseFloat(calcD.value) * 1000; // convert to nm
  const lambda = parseFloat(calcLambda.value);
  const m = parseFloat(calcM.value);
  
  const sinTheta = (m * lambda) / d;
  
  if (sinTheta > 1 || sinTheta < -1) {
    calcResult.textContent = '∞ (não existe)';
    calcExplanation.textContent = `sin(θ) = ${sinTheta.toFixed(4)} > 1 — esta ordem não existe para estes parâmetros!`;
    return;
  }
  
  const theta = Math.asin(sinTheta) * 180 / Math.PI;
  calcResult.textContent = `${theta.toFixed(2)}°`;
  calcExplanation.textContent = `sin(θ) = m·λ/d = ${m} × ${lambda} nm / ${d.toFixed(0)} nm = ${sinTheta.toFixed(4)}`;
}

[calcD, calcLambda, calcM].forEach(i => i.addEventListener('input', updateCalc));
updateCalc();

// ============ QUIZ ============
const questions = [
  {
    q: 'O que é difração da luz?',
    options: [
      'A reflexão da luz em espelhos',
      'O espalhamento da luz ao encontrar obstáculos ou fendas',
      'A absorção da luz por materiais opacos',
      'A emissão de luz por átomos excitados'
    ],
    correct: 1,
    explanation: 'A difração é o fenômeno em que a luz se espalha ao encontrar um obstáculo ou fenda com dimensões comparáveis ao seu comprimento de onda.'
  },
  {
    q: 'Na difração por uma rede, qual cor é mais desviada?',
    options: [
      'Violeta',
      'Azul',
      'Verde',
      'Vermelha'
    ],
    correct: 3,
    explanation: 'Na difração, o ângulo é proporcional ao comprimento de onda (d·sin(θ) = m·λ). Como o vermelho tem maior λ, é o mais desviado — o oposto do que ocorre na refração!'
  },
  {
    q: 'O que acontece com os máximos de difração quando aumentamos o número de fendas?',
    options: [
      'Ficam mais largos e difusos',
      'Desaparecem completamente',
      'Ficam mais nítidos e brilhantes',
      'Mudam de cor'
    ],
    correct: 2,
    explanation: 'Com mais fendas, a interferência construtiva é mais precisa, produzindo máximos mais estreitos, nítidos e brilhantes. É por isso que redes com muitas fendas são usadas em espectrômetros.'
  },
  {
    q: 'A equação d·sin(θ) = m·λ relaciona quais grandezas?',
    options: [
      'Massa, velocidade e energia',
      'Espaçamento entre fendas, ângulo, ordem e comprimento de onda',
      'Temperatura, pressão e volume',
      'Força, aceleração e massa'
    ],
    correct: 1,
    explanation: 'A equação fundamental das redes de difração relaciona: d (espaçamento entre fendas), θ (ângulo do máximo), m (ordem: 0, ±1, ±2...) e λ (comprimento de onda).'
  },
  {
    q: 'Qual destas NÃO é uma aplicação da difração da luz?',
    options: [
      'Espectroscopia astronômica',
      'Leitura de CDs e DVDs',
      'Formação de imagens em espelhos planos',
      'Cristalografia de raios-X'
    ],
    correct: 2,
    explanation: 'Espelhos planos funcionam por REFLEXÃO, não por difração. As outras opções usam difração: espectroscopia usa redes, CDs têm trilhas que atuam como redes, e cristais difratam raios-X.'
  }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const currentQEl = document.getElementById('currentQ');
const totalQEl = document.getElementById('totalQ');

totalQEl.textContent = questions.length;

function showQuestion() {
  answered = false;
  nextBtn.disabled = true;
  const q = questions[currentQuestion];
  questionText.textContent = `${currentQuestion + 1}. ${q.q}`;
  currentQEl.textContent = currentQuestion + 1;
  
  optionsContainer.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i, btn);
    optionsContainer.appendChild(btn);
  });
  
  feedback.classList.remove('show');
}

function selectAnswer(idx, btn) {
  if (answered) return;
  answered = true;
  
  const q = questions[currentQuestion];
  const allBtns = document.querySelectorAll('.quiz-option');
  
  allBtns.forEach((b, i) => {
    if (i === q.correct) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
    b.onclick = null;
  });
  
  if (idx === q.correct) {
    score++;
    feedback.style.background = 'rgba(34,197,94,0.15)';
    feedback.style.borderLeft = '4px solid #22c55e';
    feedback.innerHTML = `<strong style="color:#22c55e">✓ Correto!</strong> ${q.explanation}`;
  } else {
    feedback.style.background = 'rgba(239,68,68,0.15)';
    feedback.style.borderLeft = '4px solid #ef4444';
    feedback.innerHTML = `<strong style="color:#ef4444">✗ Incorreto.</strong> ${q.explanation}`;
  }
  feedback.classList.add('show');
  nextBtn.disabled = false;
}

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showFinalScore();
  }
};

function showFinalScore() {
  document.getElementById('quizContent').style.display = 'none';
  document.querySelector('.quiz-nav').style.display = 'none';
  const finalScore = document.getElementById('finalScore');
  finalScore.style.display = 'block';
  document.getElementById('scoreDisplay').textContent = `${score} / ${questions.length}`;
  
  let msg = '';
  const pct = score / questions.length;
  if (pct === 1) msg = '🏆 Perfeito! Você dominou o assunto!';
  else if (pct >= 0.8) msg = '🌟 Excelente! Muito bom conhecimento!';
  else if (pct >= 0.6) msg = '👍 Bom trabalho! Revise alguns pontos.';
  else msg = '📚 Continue estudando! A prática leva à perfeição.';
  document.getElementById('scoreMessage').textContent = msg;
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  document.getElementById('quizContent').style.display = 'block';
  document.querySelector('.quiz-nav').style.display = 'flex';
  document.getElementById('finalScore').style.display = 'none';
  showQuestion();
}

showQuestion();

// Smooth scroll
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
