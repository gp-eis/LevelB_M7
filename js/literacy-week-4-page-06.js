(() => {
  const INTRO_AUDIO = '../assets/audio/week-4/literacy/page-06/intro.mp3';
  const IMAGE_ROOT = '../assets/images/week-4/literacy/page-06';
  const AUDIO_ROOT = '../assets/audio/week-4/literacy/page-06';
  const choices = [
    { key: 'animals', label: 'no animals', card: `${IMAGE_ROOT}/card-animals.png`, audio: `${AUDIO_ROOT}/animals.mp3`, sentence: `${AUDIO_ROOT}/sentence-animals.mp3`, correct: true },
    { key: 'people', label: 'no people', card: `${IMAGE_ROOT}/card-people.png`, audio: `${AUDIO_ROOT}/people.mp3`, sentence: `${AUDIO_ROOT}/sentence-people.mp3`, correct: true },
    { key: 'water', label: 'no water', card: `${IMAGE_ROOT}/card-water.png`, audio: `${AUDIO_ROOT}/water-corrected.mp3`, correct: false },
    { key: 'plants', label: 'no plants', card: `${IMAGE_ROOT}/card-plants.png`, audio: `${AUDIO_ROOT}/plants-corrected.mp3`, sentence: `${AUDIO_ROOT}/sentence-plants.mp3`, correct: true }
  ];
  const wrap = document.querySelector('.activity-sheet-wrap');
  const image = wrap?.querySelector('.activity-sheet-image');
  if (!wrap || !image) return;

  const stage = document.createElement('div');
  stage.className = 'w4-bee-stage w4-page6-stage';
  image.before(stage);
  stage.appendChild(image);
  wrap.classList.add('w4-bee-wrap');
  stage.insertAdjacentHTML('beforeend', `
    <button class="w4-page6-intro-replay" type="button" aria-label="Replay the Page 6 directions" disabled>🔊</button>
    <div class="w4-page6-grid" role="group" aria-label="Choose all correct pictures"></div>
    <div class="literacy-activity-start-layer w4-page6-start-layer">
      <button class="literacy-activity-start-button w4-page6-start-button" type="button"><span aria-hidden="true">▶</span><span>Start Activity</span></button>
    </div>`);
  document.querySelector('.activity-build-note')?.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="w4-feedback" aria-live="polite">Press Start Activity.</p>
    <div class="w4-actions"><button class="w4-restart" type="button" hidden>↻ Try Again</button></div>`);

  const grid = stage.querySelector('.w4-page6-grid');
  const startLayer = stage.querySelector('.w4-page6-start-layer');
  const startButton = stage.querySelector('.w4-page6-start-button');
  const replayButton = stage.querySelector('.w4-page6-intro-replay');
  const feedback = document.querySelector('.w4-feedback');
  const restart = document.querySelector('.w4-restart');
  const introAudio = new Audio(INTRO_AUDIO);
  const elementAudio = new Audio();
  const sentenceAudio = new Audio();
  let enabled = false;
  let finished = false;
  let previousOrder = '';
  const completed = new Set();

  function shuffledChoices() {
    let items;
    let signature;
    do {
      items = [...choices];
      for (let index = items.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [items[index], items[swap]] = [items[swap], items[index]];
      }
      signature = items.map(item => item.key).join(',');
    } while (signature === previousOrder);
    previousOrder = signature;
    return items;
  }

  function renderCards() {
    grid.innerHTML = shuffledChoices().map(choice => `
      <div class="w4-page6-slot">
        <button class="w4-page6-card" type="button" data-choice="${choice.key}" aria-label="Select ${choice.label}" aria-pressed="false" disabled>
          <img src="${choice.card}" alt="${choice.label}" draggable="false">
        </button>
        <button class="w4-page6-speaker" type="button" data-audio="${choice.audio}" aria-label="Listen to ${choice.label}" disabled>🔊</button>
      </div>`).join('');
    bindCards();
  }

  function stopAudio() {
    [introAudio, elementAudio, sentenceAudio].forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    sentenceAudio.onended = null;
  }

  function setEnabled(value) {
    enabled = value;
    grid.querySelectorAll('.w4-page6-card').forEach(button => {
      button.disabled = !value || button.classList.contains('is-correct');
    });
    grid.querySelectorAll('.w4-page6-speaker').forEach(button => { button.disabled = !value; });
    replayButton.disabled = !value;
  }

  function playElement(src) {
    if (!enabled || finished) return;
    elementAudio.pause();
    elementAudio.src = src;
    elementAudio.currentTime = 0;
    elementAudio.play().catch(() => {});
  }

  function bindCards() {
    grid.querySelectorAll('.w4-page6-card').forEach(button => {
      button.addEventListener('click', () => {
        if (!enabled || finished) return;
        const choice = choices.find(item => item.key === button.dataset.choice);
        button.classList.remove('is-wrong');
        if (!choice.correct) {
          sentenceAudio.pause();
          sentenceAudio.currentTime = 0;
          playElement(choice.audio);
          button.classList.add('is-wrong');
          feedback.className = 'w4-feedback is-wrong';
          feedback.textContent = `${choice.label} is not a correct answer. Try another picture.`;
          window.setTimeout(() => button.classList.remove('is-wrong'), 620);
          return;
        }
        elementAudio.pause();
        button.setAttribute('aria-pressed', 'true');
        button.classList.add('is-correct');
        button.disabled = true;
        completed.add(choice.key);
        sentenceAudio.pause();
        sentenceAudio.src = choice.sentence;
        sentenceAudio.currentTime = 0;
        sentenceAudio.play().catch(() => {});
        feedback.className = 'w4-feedback is-correct';
        feedback.textContent = `Correct! ${choice.label}.`;
        if (completed.size === 3) {
          finished = true;
          setEnabled(false);
          restart.hidden = false;
          feedback.textContent = 'Correct! No animals, no people, and no plants.';
        }
      });
    });
    grid.querySelectorAll('.w4-page6-speaker').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        playElement(button.dataset.audio);
      });
    });
  }

  function playIntro() {
    stopAudio();
    setEnabled(false);
    feedback.className = 'w4-feedback';
    feedback.textContent = 'Listen to the directions.';
    introAudio.onended = () => {
      introAudio.onended = null;
      setEnabled(true);
      feedback.textContent = 'Choose each correct picture. Use the speaker buttons whenever you want to listen.';
    };
    introAudio.play().catch(() => {
      setEnabled(true);
      feedback.textContent = 'Choose each correct picture. Use the speaker buttons whenever you want to listen.';
    });
  }

  function reset() {
    stopAudio();
    finished = false;
    completed.clear();
    renderCards();
    restart.hidden = true;
    playIntro();
  }

  startButton.addEventListener('click', () => {
    startLayer.hidden = true;
    reset();
  });
  replayButton.addEventListener('click', playIntro);
  restart.addEventListener('click', reset);
  renderCards();
  setEnabled(false);
})();
