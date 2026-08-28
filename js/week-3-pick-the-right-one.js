(() => {
  const imageRoot = '../../assets/images/week-3/games/pick-right/';
  const answer = (id, text, file, imageAlt) => ({ id, text, image: `${imageRoot}${file}`, imageAlt });

  const ANSWERS = {
    dontMove: answer('dontMove', "It's okay. Don't move.", 'answer-dont-move.png', 'A calm adult reassuring a child who stands still while a friendly bee flies past'),
    runAway: answer('runAway', 'Run away and wave your arms!', 'answer-run-away.png', 'A child running and waving both arms near a bee'),
    plantsGrow: answer('plantsGrow', 'Bees help plants grow.', 'answer-plants-grow.png', 'A bee helping many kinds of garden plants grow'),
    flowersGrow: answer('flowersGrow', 'Bees help flowers grow.', 'answer-flowers-grow.png', 'A bee pollinating a colorful flower garden'),
    treesGrow: answer('treesGrow', 'Bees help trees grow.', 'answer-trees-grow.png', 'A bee visiting blossoms in an orchard of trees'),
    vegetablesGrow: answer('vegetablesGrow', 'Bees help vegetables grow.', 'answer-vegetables-grow.png', 'A bee pollinating blossoms in a vegetable garden'),
    fruitsGrow: answer('fruitsGrow', 'Bees help fruits grow.', 'answer-fruits-grow.png', 'A bee pollinating blossoms among many kinds of fruit'),
    earthBees: answer('earthBees', 'Earth needs bees.', 'answer-earth-bees.png', 'A happy Earth surrounded by helpful bees and blossoms'),
    earthTrees: answer('earthTrees', 'Earth needs trees.', 'answer-earth-trees.png', 'A happy Earth surrounded by a forest of trees'),
    earthCleanAir: answer('earthCleanAir', 'Earth needs clean air.', 'answer-earth-clean-air.png', 'A happy Earth surrounded by fresh air swirls and leaves'),
    earthPlants: answer('earthPlants', 'Earth needs plants.', 'answer-earth-plants.png', 'A happy Earth surrounded by healthy green plants'),
    earthCleanWater: answer('earthCleanWater', 'Earth needs clean water.', 'answer-earth-clean-water.png', 'A happy Earth beside a clean waterfall and river')
  };

  const QUESTION_BANK = [
    {
      id: 'scared', question: "Shoo! Shoo! I'm scared.", visual: `${imageRoot}question-scared.png`,
      visualAlt: 'A worried child sees a small friendly bee in a garden', correctIds: ['dontMove']
    },
    {
      id: 'whyBees', question: 'Why do we need bees?', visual: `${imageRoot}question-why-bees.png`,
      visualAlt: 'A bee pollinating plants in a thriving garden',
      correctIds: ['plantsGrow', 'flowersGrow', 'treesGrow', 'vegetablesGrow', 'fruitsGrow']
    },
    {
      id: 'earthNeeds', question: 'What does Earth need?', visual: `${imageRoot}question-earth-needs.png`,
      visualAlt: 'A thoughtful Earth considers bees, trees, plants, clean air, and clean water',
      correctIds: ['earthBees', 'earthTrees', 'earthCleanAir', 'earthPlants', 'earthCleanWater']
    }
  ];

  const questionText = document.getElementById('question-text');
  const questionVisual = document.getElementById('question-visual');
  const questionListen = document.getElementById('question-listen');
  const answersRow = document.getElementById('answers-row');
  const successModal = document.getElementById('success-modal');
  const reviewQuestion = document.getElementById('review-question');
  const reviewAnswer = document.getElementById('review-answer');
  const continueBtn = document.getElementById('continue-btn');
  const questionCount = document.getElementById('question-count');
  let locked = false;
  let currentRound = null;
  let questionQueue = [];
  let questionNumber = 0;
  let usVoice = null;

  const sounds = (() => {
    let context = null;
    const audio = () => {
      if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') context.resume();
      return context;
    };
    const tone = (frequency, start, duration, type = 'sine', volume = .14) => {
      const oscillator = audio().createOscillator();
      const gain = audio().createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(audio().destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .02);
    };
    return {
      correct() { const now = audio().currentTime; tone(523, now, .12); tone(659, now + .08, .12); tone(784, now + .16, .2, 'sine', .17); },
      wrong() { const now = audio().currentTime; tone(220, now, .14, 'sawtooth', .07); tone(175, now + .1, .18, 'sawtooth', .065); }
    };
  })();

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function randomFrom(items) { return items[Math.floor(Math.random() * items.length)]; }

  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    usVoice = voices.find(voice => /^en[-_]US$/i.test(voice.lang || '') && /google|samantha|zira|jenny|aria|english/i.test(voice.name))
      || voices.find(voice => /^en[-_]US$/i.test(voice.lang || '')) || null;
  }

  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.addEventListener('voiceschanged', pickVoice);
  }

  function stopSpeech() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function speak(text) {
    stopSpeech();
    if (!('speechSynthesis' in window)) return Promise.resolve();
    return new Promise(resolve => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = .9;
      if (usVoice) utterance.voice = usVoice;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      speechSynthesis.speak(utterance);
    });
  }

  function buildRound() {
    if (!questionQueue.length) {
      questionQueue = shuffle(QUESTION_BANK);
      questionNumber = 0;
    }
    const question = questionQueue.shift();
    questionNumber += 1;
    const correctId = randomFrom(question.correctIds);
    const otherAnswerPool = QUESTION_BANK
      .filter(item => item.id !== question.id)
      .flatMap(item => item.correctIds);
    const wrongId = randomFrom(otherAnswerPool);
    return { ...question, correct: ANSWERS[correctId], options: [ANSWERS[correctId], ANSWERS[wrongId]] };
  }

  function makeListenButton(item) {
    const button = document.createElement('button');
    button.className = 'listen-btn';
    button.type = 'button';
    button.textContent = '🔊';
    button.setAttribute('aria-label', `Listen to answer: ${item.text}`);
    button.addEventListener('click', event => { event.stopPropagation(); if (!locked) speak(item.text); });
    return button;
  }

  function renderRound() {
    locked = false;
    questionListen.disabled = false;
    successModal.hidden = true;
    currentRound = buildRound();
    questionCount.textContent = `Question ${questionNumber} of ${QUESTION_BANK.length}`;
    questionText.textContent = currentRound.question;
    questionVisual.src = currentRound.visual;
    questionVisual.alt = currentRound.visualAlt;
    answersRow.innerHTML = '';
    questionListen.onclick = () => { if (!locked) speak(currentRound.question); };

    shuffle(currentRound.options).forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-btn';
      button.dataset.answer = item.id;
      const image = document.createElement('img');
      image.className = 'answer-visual';
      image.src = item.image;
      image.alt = item.imageAlt;
      const text = document.createElement('span');
      text.className = 'answer-text';
      text.textContent = item.text;
      button.append(image, text, makeListenButton(item));
      button.addEventListener('click', () => chooseAnswer(button, item));
      answersRow.appendChild(button);
    });
    window.setTimeout(() => { if (!locked) speak(currentRound.question); }, 250);
  }

  async function chooseAnswer(button, item) {
    if (locked) return;
    locked = true;
    answersRow.querySelectorAll('.answer-btn').forEach(answerButton => { answerButton.disabled = true; });
    if (item.id === currentRound.correct.id) {
      sounds.correct();
      button.classList.add('correct');
      reviewQuestion.textContent = currentRound.question;
      reviewAnswer.textContent = currentRound.correct.text;
      successModal.hidden = false;
      questionListen.disabled = true;
      continueBtn.focus();
      await speak(currentRound.correct.text);
      return;
    }
    sounds.wrong();
    button.classList.add('wrong');
    window.setTimeout(() => {
      button.classList.remove('wrong');
      answersRow.querySelectorAll('.answer-btn').forEach(answerButton => { answerButton.disabled = false; });
      locked = false;
    }, 650);
  }

  continueBtn.addEventListener('click', () => { stopSpeech(); renderRound(); });
  document.getElementById('new-question').addEventListener('click', () => { stopSpeech(); renderRound(); });
  renderRound();
})();
