document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const exploredKey = 'terramuseo_explored_rooms';

  const readExplored = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(exploredKey) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      return [];
    }
  };

  const writeExplored = (rooms) => {
    localStorage.setItem(exploredKey, JSON.stringify(rooms));
  };

  const updateProgress = () => {
    if (!progressBar || !progressText) return;
    const total = 3;
    const explored = readExplored();
    const percentage = Math.min(100, Math.round((explored.length / total) * 100));
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
  };

  document.querySelectorAll('.mark-explored').forEach((button) => {
    const room = button.dataset.room;
    const explored = readExplored();

    if (explored.includes(room)) {
      button.classList.add('is-done');
      button.disabled = true;
      button.textContent = 'Explorada ✓';
    }

    button.addEventListener('click', () => {
      const rooms = readExplored();
      if (!rooms.includes(room)) {
        rooms.push(room);
        writeExplored(rooms);
      }

      button.classList.add('is-done');
      button.disabled = true;
      button.textContent = 'Explorada ✓';
      updateProgress();
    });
  });

  updateProgress();

  const memoryBoard = document.getElementById('memoryBoard');
  const movesEl = document.getElementById('moves');
  const pairsEl = document.getElementById('pairs');
  const gameMessage = document.getElementById('gameMessage');
  const restartBtn = document.getElementById('restartGame');

  if (memoryBoard && movesEl && pairsEl && restartBtn) {
    const pairs = [
      { id: 'pyramid', name: 'Pirámide', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=260&q=80' },
      { id: 'hieroglyph', name: 'Jeroglíficos', image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=260&q=80' },
      { id: 'mask', name: 'Máscara', image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=260&q=80' },
      { id: 'papyrus', name: 'Papiro', image: 'https://images.unsplash.com/photo-1455390582262-044c42e3f4b0?auto=format&fit=crop&w=260&q=80' },
      { id: 'vase', name: 'Vasija', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=260&q=80' },
      { id: 'scarab', name: 'Escarabajo', image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=260&q=80' }
    ];

    let firstCard = null;
    let secondCard = null;
    let isLocked = false;
    let moves = 0;
    let matchedPairs = 0;

    const shuffleCards = (cards) => {
      const copy = [...cards];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const makeCard = (pair, type) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'memory-card';
      card.dataset.pair = pair.id;

      const front = document.createElement('span');
      front.className = 'card-front';
      front.textContent = '?';

      const back = document.createElement('span');
      back.className = 'card-back';

      if (type === 'image') {
        const img = document.createElement('img');
        img.src = pair.image;
        img.alt = pair.name;
        back.appendChild(img);
      } else {
        const symbol = document.createElement('strong');
        symbol.textContent = '✦';
        const label = document.createElement('span');
        label.textContent = pair.name;
        back.append(symbol, label);
      }

      card.append(front, back);
      card.addEventListener('click', () => flipCard(card));
      return card;
    };

    const resetTurn = () => {
      firstCard = null;
      secondCard = null;
      isLocked = false;
    };

    const finishGame = () => {
      gameMessage.textContent = `¡Memorama completado en ${moves} movimientos! 🏆`;
    };

    const flipCard = (card) => {
      if (isLocked || card === firstCard || card.classList.contains('is-matched')) return;

      card.classList.add('is-flipped');

      if (!firstCard) {
        firstCard = card;
        return;
      }

      secondCard = card;
      moves += 1;
      movesEl.textContent = String(moves);

      if (firstCard.dataset.pair === secondCard.dataset.pair) {
        firstCard.classList.add('is-matched');
        secondCard.classList.add('is-matched');
        firstCard.disabled = true;
        secondCard.disabled = true;
        matchedPairs += 1;
        pairsEl.textContent = `${matchedPairs} / ${pairs.length}`;
        gameMessage.textContent = '¡Pareja encontrada! Sigue así.';
        resetTurn();

        if (matchedPairs === pairs.length) {
          finishGame();
        }
        return;
      }

      isLocked = true;
      gameMessage.textContent = 'No coinciden. ¡Intenta otra vez!';
      setTimeout(() => {
        firstCard.classList.remove('is-flipped');
        secondCard.classList.remove('is-flipped');
        resetTurn();
      }, 900);
    };

    const renderBoard = () => {
      memoryBoard.innerHTML = '';
      const cards = [];

      pairs.forEach((pair) => {
        cards.push(makeCard(pair, 'image'), makeCard(pair, 'text'));
      });

      shuffleCards(cards).forEach((card) => memoryBoard.appendChild(card));
    };

    const restartGame = () => {
      firstCard = null;
      secondCard = null;
      isLocked = false;
      moves = 0;
      matchedPairs = 0;
      movesEl.textContent = '0';
      pairsEl.textContent = `0 / ${pairs.length}`;
      gameMessage.textContent = '¡Encuentra las seis parejas!';
      renderBoard();
    };

    restartBtn.addEventListener('click', restartGame);
    restartGame();
  }
});
