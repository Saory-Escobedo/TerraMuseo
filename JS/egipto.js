/* TERRAMUSEO | Interacciones de la exposición El Antiguo Egipto */

// Visor panorámico simulado: permite arrastrar la fotografía horizontalmente.
const viewer = document.getElementById('panoramaViewer');
const panorama = document.getElementById('panoramaImage');
if (viewer && panorama) {
  let dragging = false;
  let startX = 0;
  let offset = -22;
  let startOffset = offset;
  const moveTo = (value) => {
    offset = Math.max(-48, Math.min(0, value));
    panorama.style.transform = `translateX(${offset}%)`;
  };
  viewer.addEventListener('pointerdown', (event) => {
    dragging = true; startX = event.clientX; startOffset = offset;
    viewer.setPointerCapture(event.pointerId);
  });
  viewer.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    moveTo(startOffset + ((event.clientX - startX) / viewer.clientWidth) * 48);
  });
  viewer.addEventListener('pointerup', () => dragging = false);
  viewer.addEventListener('pointercancel', () => dragging = false);
  document.getElementById('panLeft').addEventListener('click', () => moveTo(offset + 8));
  document.getElementById('panRight').addEventListener('click', () => moveTo(offset - 8));
  document.getElementById('panReset').addEventListener('click', () => moveTo(-22));
}

// Fichas ampliadas de las piezas de la exposición.
const artifacts = {
  mask: {
    title: 'Máscaras funerarias',
    description: 'Las máscaras funerarias se colocaban sobre el rostro de algunas momias. Podían elaborarse con distintos materiales según la época y los recursos de la persona. La famosa máscara de Tutankamón está hecha principalmente de oro y otros materiales decorativos.',
    fact: 'Dato curioso: la máscara de Tutankamón es uno de los objetos más reconocibles del arte del antiguo Egipto.'
  },
  papyrus: {
    title: 'Jeroglíficos y papiro',
    description: 'Los jeroglíficos fueron uno de los sistemas de escritura del antiguo Egipto. Se tallaban en piedra y también se escribían con tinta sobre soportes como el papiro, elaborado a partir de una planta que crecía en zonas húmedas del Nilo.',
    fact: 'Dato curioso: la piedra de Rosetta fue clave para descifrar los jeroglíficos porque contenía un decreto en tres escrituras: jeroglífica, demótica y griega.'
  },
  canopic: {
    title: 'Vasos canopos',
    description: 'Durante ciertos procesos de momificación, algunos órganos se extraían y se guardaban en recipientes especiales conocidos como vasos canopos. Tradicionalmente se relacionaban con cuatro hijos del dios Horus y con la protección de los órganos.',
    fact: 'Dato curioso: las tapas de algunos vasos canopos tenían formas humanas o de animales.'
  }
};
document.querySelectorAll('.artifact-card').forEach((button) => {
  button.addEventListener('click', () => {
    const info = artifacts[button.dataset.artifact];
    document.getElementById('artifactTitle').textContent = info.title;
    document.getElementById('artifactDescription').textContent = info.description;
    document.getElementById('artifactFact').textContent = info.fact;
    document.getElementById('artifactDetail').hidden = false;
    document.getElementById('artifactDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});
document.getElementById('closeArtifact').addEventListener('click', () => {
  document.getElementById('artifactDetail').hidden = true;
});

// Memorama: cada concepto tiene una tarjeta con imagen y otra con su nombre.
const pairs = [
  { id: 'pyramid', name: 'Pirámide', image: 'Resources/piramide.jpg' },
  { id: 'hieroglyph', name: 'Jeroglíficos', image: 'Resources/jeroglifico.jpg' },
  { id: 'mask', name: 'Máscara', image: 'Resources/mascara.jpg' },
  { id: 'papyrus', name: 'Papiro', image: 'Resources/papiro.jpg' },
  { id: 'vase', name: 'Vasija', image: 'Resources/vasija.jpg' },
  { id: 'scarab', name: 'Escarabajo', image: 'Resources/escarabajo.jpg' }
];
const board = document.getElementById('memoryBoard');
if (board) initMemory();
function initMemory() {
  const movesEl = document.getElementById('memoryMoves');
  const pairsEl = document.getElementById('memoryPairs');
  const message = document.getElementById('memoryMessage');
  let first = null, second = null, locked = false, moves = 0, matched = 0;
  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function makeCard(pair, type) {
    const card = document.createElement('button');
    card.type = 'button'; card.className = 'memory-card'; card.dataset.pair = pair.id;
    const front = document.createElement('span'); front.className = 'card-front'; front.textContent = '?';
    const back = document.createElement('span'); back.className = 'card-back';
    if (type === 'image') {
      const img = document.createElement('img'); img.src = pair.image; img.alt = pair.name; back.appendChild(img);
    } else {
      const symbol = document.createElement('strong'); symbol.textContent = '✦';
      const label = document.createElement('span'); label.textContent = pair.name; back.append(symbol, label);
    }
    card.append(front, back); card.addEventListener('click', () => flip(card));
    return card;
  }
  function flip(card) {
    if (locked || card === first || card.classList.contains('is-matched')) return;
    card.classList.add('is-flipped');
    if (!first) { first = card; return; }
    second = card; moves++; movesEl.textContent = moves;
    if (first.dataset.pair === second.dataset.pair) {
      first.classList.add('is-matched'); second.classList.add('is-matched');
      first.disabled = true; second.disabled = true; matched++;
      pairsEl.textContent = `${matched} / ${pairs.length}`;
      message.textContent = '¡Pareja encontrada! Sigue así.';
      resetTurn();
      if (matched === pairs.length) message.textContent = `¡Memorama completado en ${moves} movimientos! 🏆`;
    } else {
      locked = true; message.textContent = 'No coinciden. ¡Intenta otra vez!';
      window.setTimeout(() => {
        first.classList.remove('is-flipped'); second.classList.remove('is-flipped'); resetTurn();
      }, 900);
    }
  }
  function resetTurn() { first = null; second = null; locked = false; }
  function render() {
    board.innerHTML = '';
    const cards = [];
    pairs.forEach(pair => { cards.push(makeCard(pair, 'image'), makeCard(pair, 'text')); });
    shuffle(cards).forEach(card => board.appendChild(card));
  }
  function restart() {
    first = null; second = null; locked = false; moves = 0; matched = 0;
    movesEl.textContent = '0'; pairsEl.textContent = `0 / ${pairs.length}`;
    message.textContent = '¡Encuentra las seis parejas!'; render();
  }
  document.getElementById('restartMemory').addEventListener('click', restart);
  restart();
}

// Test de cinco preguntas con retroalimentación.
const questions = [
  { q: '¿Junto a qué río se desarrolló la civilización egipcia?', a: ['Río Amazonas', 'Río Nilo', 'Río Tigris', 'Río Danubio'], c: 1, why: '¡Correcto! El Nilo aportaba agua, tierras fértiles y una importante vía de transporte.' },
  { q: '¿Cómo se llamaba el gobernante del antiguo Egipto?', a: ['Cónsul', 'Emperador', 'Faraón', 'Senador'], c: 2, why: '¡Así es! El faraón era la máxima autoridad política y tenía un papel religioso.' },
  { q: '¿Para qué se utilizaban los jeroglíficos?', a: ['Para escribir', 'Para fabricar herramientas', 'Para navegar', 'Para cultivar'], c: 0, why: '¡Muy bien! Los jeroglíficos eran signos de escritura que podían representar sonidos, palabras e ideas.' },
  { q: '¿Qué eran los vasos canopos?', a: ['Instrumentos musicales', 'Recipientes vinculados a la conservación de órganos', 'Lámparas', 'Juguetes'], c: 1, why: '¡Exactamente! Algunos órganos extraídos durante la momificación se guardaban en vasos canopos.' },
  { q: '¿Por qué preparaban momias y tumbas?', a: ['Para almacenar cosechas', 'Para vivir dentro de ellas', 'Por sus creencias sobre la vida después de la muerte', 'Para comerciar'], c: 2, why: '¡Correcto! Muchas creencias egipcias incluían una existencia después de la muerte.' }
];
const questionTitle = document.getElementById('quizQuestion');
if (questionTitle) initQuiz();
function initQuiz() {
  let index = 0, score = 0, answered = false;
  const options = document.getElementById('quizOptions');
  const feedback = document.getElementById('quizFeedback');
  const next = document.getElementById('nextQuestion');
  function render() {
    answered = false;
    const item = questions[index];
    document.getElementById('quizCount').textContent = `${index + 1} / ${questions.length}`;
    document.getElementById('quizProgress').style.width = `${(index + 1) / questions.length * 100}%`;
    questionTitle.textContent = item.q; document.getElementById('quizScore').textContent = score;
    feedback.textContent = ''; options.innerHTML = ''; next.disabled = true; next.hidden = false;
    item.a.forEach((answer, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'quiz-option'; button.textContent = answer;
      button.addEventListener('click', () => choose(i, button)); options.appendChild(button);
    });
    next.textContent = index === questions.length - 1 ? 'Ver resultado ★' : 'Siguiente →';
  }
  function choose(choice, selected) {
    if (answered) return; answered = true;
    const item = questions[index];
    [...options.querySelectorAll('button')].forEach((button, i) => {
      button.disabled = true; if (i === item.c) button.classList.add('correct');
    });
    if (choice === item.c) { score++; feedback.textContent = '🎉 ' + item.why; }
    else { selected.classList.add('incorrect'); feedback.textContent = 'Buen intento. ' + item.why; }
    document.getElementById('quizScore').textContent = score; next.disabled = false;
  }
  function showResult() {
    questionTitle.textContent = '¡Terminaste el test!'; options.innerHTML = ''; feedback.textContent = '';
    next.hidden = true; document.getElementById('quizCount').textContent = 'Finalizado';
    const result = document.getElementById('quizResult'); result.hidden = false;
    result.innerHTML = `<div class="display-4">${score >= 4 ? '🏆' : score >= 3 ? '🌟' : '📚'}</div><h3>Obtuviste ${score} de ${questions.length}</h3><p>${Math.round(score / questions.length * 100)}% de respuestas correctas. ${score >= 4 ? '¡Eres un gran explorador de la historia!' : '¡Puedes volver a recorrer la sala y probar otra vez!'}</p><button class="btn btn-terra" id="retryQuiz" type="button">Volver a intentarlo</button>`;
    document.getElementById('retryQuiz').addEventListener('click', () => { index = 0; score = 0; result.hidden = true; render(); });
  }
  next.addEventListener('click', () => { if (!answered) return; if (index < questions.length - 1) { index++; render(); } else showResult(); });
  render();
}
