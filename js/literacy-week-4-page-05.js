(() => {
  const INTRO_AUDIO = '../assets/audio/week-4/literacy/page-05/intro.mp3';
  const CORRECT_AUDIO = '../assets/audio/week-4/literacy/page-05/sentence-correct.mp3';
  const ASSET_ROOT = '../assets/images/week-4/literacy/page-05';
  const occupations = [
    { key: 'fireman', label: 'a fireman', picture: `${ASSET_ROOT}/picture-fireman-v2.png`, card: `${ASSET_ROOT}/label-fireman-v2.png`, audio: '../assets/audio/week-4/literacy/page-05/fireman.mp3' },
    { key: 'beekeeper', label: 'a beekeeper', picture: `${ASSET_ROOT}/picture-beekeeper-v2.png`, card: `${ASSET_ROOT}/label-beekeeper-v2.png`, audio: '../assets/audio/week-4/literacy/page-05/beekeeper.mp3' },
    { key: 'nurse', label: 'a nurse', picture: `${ASSET_ROOT}/picture-nurse-v2.png`, card: `${ASSET_ROOT}/label-nurse-v2.png`, audio: '../assets/audio/week-4/literacy/page-05/nurse.mp3' }
  ];
  const wrap = document.querySelector('.activity-sheet-wrap');
  const image = wrap?.querySelector('.activity-sheet-image');
  if (!wrap || !image) return;

  const stage = document.createElement('div');
  stage.className = 'w4-bee-stage w4-page5-stage';
  image.before(stage);
  stage.appendChild(image);
  wrap.classList.add('w4-bee-wrap');
  stage.insertAdjacentHTML('beforeend', `
    <button class="w4-page5-intro-replay" type="button" aria-label="Replay the Page 5 directions" disabled>🔊</button>
    <div class="w4-page5-picture-grid" role="radiogroup" aria-label="Choose Lorenzo Langstroth's occupation"></div>
    <div class="w4-page5-answer-drop" role="button" tabindex="-1" aria-disabled="true" aria-label="Answer line. Drop the selected occupation here."></div>
    <div class="literacy-activity-start-layer w4-page5-start-layer">
      <button class="literacy-activity-start-button w4-page5-start-button" type="button"><span aria-hidden="true">▶</span><span>Start Activity</span></button>
    </div>`);
  document.querySelector('.activity-build-note')?.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="w4-feedback" aria-live="polite">Press Start Activity.</p>
    <div class="w4-actions"><button class="w4-restart" type="button" hidden>↻ Try Again</button></div>`);

  const pictureGrid = stage.querySelector('.w4-page5-picture-grid');
  const answerDrop = stage.querySelector('.w4-page5-answer-drop');
  const startLayer = stage.querySelector('.w4-page5-start-layer');
  const startButton = stage.querySelector('.w4-page5-start-button');
  const replayButton = stage.querySelector('.w4-page5-intro-replay');
  const feedback = document.querySelector('.w4-feedback');
  const restart = document.querySelector('.w4-restart');
  const introAudio = new Audio(INTRO_AUDIO);
  const elementAudio = new Audio();
  const correctAudio = new Audio(CORRECT_AUDIO);
  let enabled = false;
  let selectedPicture = null;
  let finished = false;
  let previousPictureOrder = '';
  let dragState = null;

  function shuffle(items, previous) {
    let result;
    let signature;
    do {
      result = [...items];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [result[index], result[swap]] = [result[swap], result[index]];
      }
      signature = result.map(item => item.key).join(',');
    } while (items.length > 1 && signature === previous);
    return { result, signature };
  }

  function renderChoices() {
    const pictures = shuffle(occupations, previousPictureOrder);
    previousPictureOrder = pictures.signature;
    pictureGrid.innerHTML = pictures.result.map(item => `
      <div class="w4-page5-picture-slot">
        <button class="w4-page5-picture-card" type="button" role="radio" aria-checked="false" data-picture="${item.key}" aria-label="Choose ${item.label}" disabled>
          <img src="${item.picture}" alt="${item.label}" draggable="false">
        </button>
        <button class="w4-page5-picture-speaker" type="button" data-audio="${item.audio}" aria-label="Listen to ${item.label}" disabled>🔊</button>
        <button class="w4-page5-label-card" type="button" data-label="${item.key}" aria-label="Drag ${item.label} to the answer line" draggable="true" disabled>
          <img src="${item.card}" alt="${item.label}" draggable="false">
        </button>
      </div>`).join('');
    bindChoices();
  }

  function stopAudio() {
    [introAudio, elementAudio, correctAudio].forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  function playElement(src) {
    if (!enabled || finished) return;
    elementAudio.pause();
    elementAudio.src = src;
    elementAudio.currentTime = 0;
    elementAudio.play().catch(() => {});
  }

  function setEnabled(value) {
    enabled = value;
    stage.querySelectorAll('.w4-page5-picture-card, .w4-page5-picture-speaker, .w4-page5-label-card').forEach(button => {
      button.disabled = !value;
    });
    replayButton.disabled = !value;
    answerDrop.tabIndex = value ? 0 : -1;
    answerDrop.setAttribute('aria-disabled', String(!value));
  }

  function choosePicture(button) {
    if (!enabled || finished) return;
    const item = occupations.find(entry => entry.key === button.dataset.picture);
    stage.querySelectorAll('.w4-page5-picture-card').forEach(card => {
      card.classList.remove('is-selected', 'is-wrong');
      card.setAttribute('aria-checked', 'false');
    });
    playElement(item.audio);
    if (item.key !== 'beekeeper') {
      const pair = button.closest('.w4-page5-picture-slot');
      selectedPicture = null;
      button.classList.add('is-wrong');
      pair?.classList.add('is-wrong');
      feedback.className = 'w4-feedback is-wrong';
      feedback.textContent = `${item.label} is not correct. Try another picture.`;
      if (typeof playTone === 'function') {
        playTone(210, .15, .1, 'sawtooth');
        playTone(145, .22, .08, 'sawtooth', .13);
      }
      window.setTimeout(() => {
        button.classList.remove('is-wrong');
        pair?.classList.remove('is-wrong');
      }, 650);
      return;
    }
    selectedPicture = item.key;
    button.classList.add('is-correct');
    button.setAttribute('aria-checked', 'true');
    stage.querySelectorAll('.w4-page5-picture-card').forEach(card => { card.disabled = true; });
    feedback.className = 'w4-feedback';
    feedback.textContent = `Correct picture! Now drag “${item.label}” to the answer line.`;
  }

  function wrongAnswer(labelKey) {
    const labelButton = stage.querySelector(`[data-label="${labelKey}"]`);
    const labelPair = labelButton?.closest('.w4-page5-picture-slot');
    labelPair?.classList.add('is-wrong');
    labelButton?.classList.add('is-wrong');
    answerDrop.classList.add('is-wrong');
    feedback.className = 'w4-feedback is-wrong';
    feedback.textContent = 'Not quite. Choose the beekeeper, then drag “a beekeeper” to the line.';
    if (typeof playTone === 'function') {
      playTone(210, .15, .1, 'sawtooth');
      playTone(145, .22, .08, 'sawtooth', .13);
    }
    window.setTimeout(() => {
      labelButton?.classList.remove('is-wrong');
      labelPair?.classList.remove('is-wrong');
      answerDrop.classList.remove('is-wrong');
    }, 650);
  }

  function submitLabel(labelKey) {
    if (!enabled || finished) return;
    if (!selectedPicture) {
      feedback.className = 'w4-feedback is-wrong';
      feedback.textContent = 'Click a picture first, then drag its text box to the answer line.';
      answerDrop.classList.add('is-wrong');
      if (typeof playTone === 'function') playTone(210, .16, .08, 'sine');
      window.setTimeout(() => answerDrop.classList.remove('is-wrong'), 500);
      return;
    }
    if (selectedPicture !== 'beekeeper' || labelKey !== 'beekeeper') {
      wrongAnswer(labelKey);
      return;
    }
    finished = true;
    setEnabled(false);
    const selectedCard = stage.querySelector('[data-picture="beekeeper"]');
    const labelCard = stage.querySelector('[data-label="beekeeper"]');
    selectedCard?.classList.add('is-correct');
    labelCard?.classList.add('is-correct');
    answerDrop.classList.add('is-correct');
    answerDrop.innerHTML = '<span class="w4-page5-answer-text">a beekeeper</span>';
    answerDrop.setAttribute('aria-label', 'He was a beekeeper.');
    labelCard.hidden = true;
    feedback.className = 'w4-feedback is-correct';
    feedback.textContent = 'Correct! He was a beekeeper.';
    restart.hidden = false;
    correctAudio.currentTime = 0;
    correctAudio.play().catch(() => {});
  }

  function createGhost(button, event) {
    const ghost = button.cloneNode(true);
    ghost.className = 'w4-page5-drag-ghost';
    ghost.disabled = true;
    document.body.appendChild(ghost);
    moveGhost(ghost, event.clientX, event.clientY);
    return ghost;
  }

  function moveGhost(ghost, x, y) {
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
  }

  function bindChoices() {
    stage.querySelectorAll('.w4-page5-picture-card').forEach(button => {
      button.addEventListener('click', () => choosePicture(button));
    });
    stage.querySelectorAll('.w4-page5-picture-speaker').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        playElement(button.dataset.audio);
      });
    });
    stage.querySelectorAll('.w4-page5-label-card').forEach(button => {
      let suppressClick = false;
      button.addEventListener('click', () => {
        if (suppressClick) {
          suppressClick = false;
          return;
        }
        submitLabel(button.dataset.label);
      });
      button.addEventListener('dragstart', event => {
        event.dataTransfer.setData('text/plain', button.dataset.label);
        event.dataTransfer.effectAllowed = 'move';
      });
      button.addEventListener('pointerdown', event => {
        if (!enabled || event.pointerType === 'mouse') return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        dragState = { pointerId: event.pointerId, button, x: event.clientX, y: event.clientY, ghost: null };
      });
      button.addEventListener('pointermove', event => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        const distance = Math.hypot(event.clientX - dragState.x, event.clientY - dragState.y);
        if (!dragState.ghost && distance > 8) dragState.ghost = createGhost(button, event);
        if (dragState.ghost) moveGhost(dragState.ghost, event.clientX, event.clientY);
      });
      button.addEventListener('pointerup', event => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        const wasDragging = Boolean(dragState.ghost);
        dragState.ghost?.remove();
        dragState = null;
        if (wasDragging) {
          suppressClick = true;
          const rect = answerDrop.getBoundingClientRect();
          if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) submitLabel(button.dataset.label);
        }
      });
    });
  }

  answerDrop.addEventListener('dragover', event => {
    if (!enabled) return;
    event.preventDefault();
    answerDrop.classList.add('is-drag-over');
  });
  answerDrop.addEventListener('dragleave', () => answerDrop.classList.remove('is-drag-over'));
  answerDrop.addEventListener('drop', event => {
    event.preventDefault();
    answerDrop.classList.remove('is-drag-over');
    submitLabel(event.dataTransfer.getData('text/plain'));
  });

  function playIntro() {
    stopAudio();
    setEnabled(false);
    feedback.className = 'w4-feedback';
    feedback.textContent = 'Listen to the directions.';
    introAudio.onended = () => {
      introAudio.onended = null;
      setEnabled(true);
      feedback.textContent = 'Click a picture, listen, then drag its text box to the answer line.';
    };
    introAudio.play().catch(() => {
      setEnabled(true);
      feedback.textContent = 'Click a picture, listen, then drag its text box to the answer line.';
    });
  }

  function reset() {
    stopAudio();
    selectedPicture = null;
    finished = false;
    answerDrop.innerHTML = '';
    answerDrop.className = 'w4-page5-answer-drop';
    restart.hidden = true;
    renderChoices();
    playIntro();
  }

  startButton.addEventListener('click', () => {
    startLayer.hidden = true;
    reset();
  });
  replayButton.addEventListener('click', playIntro);
  restart.addEventListener('click', reset);
  renderChoices();
  setEnabled(false);
})();
