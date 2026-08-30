(() => {
  const root = document.getElementById('week-4-reading-activity');
  if (!root) return;

  const IMAGE_BASE = '../assets/images/week-4/reading/activity/';
  const ROUNDS = [
    {
      question: 'Who was Lorenzo Langstroth?',
      image: 'question-1.webp',
      imageAlt: 'Lorenzo Langstroth stands beside a beehive and talks with a curious child.',
      response: 'Lorenzo Langstroth was a beekeeper.',
      options: [
        { id: 'beekeeper', label: 'A beekeeper', image: 'answer-beekeeper.webp', alt: 'A beekeeper in a protective suit holds a honey frame.', correct: true },
        { id: 'farmer', label: 'A farmer', image: 'answer-farmer.webp', alt: 'A farmer holds a basket of vegetables beside a barn.' }
      ]
    },
    {
      question: 'What happened when people took honey from the old straw hive?',
      image: 'question-2.webp',
      imageAlt: 'Lorenzo and a child look worried beside an old straw beehive.',
      response: 'They broke the old straw hive, and the bees flew away.',
      options: [
        { id: 'broke', label: 'The hive broke, and the bees flew away.', image: 'answer-hive-broke.webp', alt: 'A broken straw hive with bees flying away.', correct: true },
        { id: 'safe', label: 'The hive stayed whole, and the bees stayed safe.', image: 'answer-bees-safe.webp', alt: 'A whole wooden hive with calm bees and a honey frame.' }
      ]
    },
    {
      question: 'What did Lorenzo make to keep the bees safe?',
      image: 'question-3.webp',
      imageAlt: 'Lorenzo builds a rectangular wooden beehive while a child watches.',
      response: 'Lorenzo made a modern beehive with sliding frames.',
      options: [
        { id: 'modern', label: 'A modern beehive with sliding frames', image: 'answer-modern-hive.webp', alt: 'A modern wooden beehive with sliding honey frames.', correct: true },
        { id: 'straw', label: 'An old straw hive', image: 'answer-straw-hive.webp', alt: 'An old dome-shaped straw beehive.' }
      ]
    },
    {
      question: 'What can a great person do?',
      image: 'question-1.webp',
      imageAlt: 'Lorenzo shares his helpful beehive idea with a curious child.',
      response: 'A great person can make something that helps others.',
      options: [
        { id: 'help', label: 'Make something that helps others.', image: 'answer-help-others.webp', alt: 'A friendly inventor shows children a helpful wooden bee home.', correct: true },
        { id: 'break', label: 'Break things on purpose.', image: 'answer-break-things.webp', alt: 'A child deliberately breaks a wooden toy while two friends look disappointed.' }
      ]
    }
  ];

  root.innerHTML = `
    <div class="reading-activity-overlay" id="reading-activity-overlay" hidden>
      <section class="reading-activity-modal" role="dialog" aria-modal="true" aria-labelledby="reading-activity-title">
        <header class="reading-activity-modal__header">
          <span class="reading-activity-modal__icon" aria-hidden="true">🏅</span>
          <div>
            <h2 id="reading-activity-title">Lorenzo Langstroth Challenge</h2>
            <p>Choose the picture that answers each question.</p>
          </div>
          <button class="reading-activity-modal__close" id="reading-activity-close" type="button" aria-label="Close the reading activity">×</button>
        </header>
        <section class="reading-quiz" aria-labelledby="reading-quiz-question">
          <div class="reading-quiz__intro">
            <p>Listen carefully, then choose the right picture!</p>
            <button class="reading-quiz__speaker" id="reading-quiz-intro" type="button" aria-label="Listen to the activity instructions">🔊</button>
          </div>
          <div class="reading-quiz__progress">
            <span id="reading-quiz-progress">Question 1 of 4</span>
            <span class="reading-quiz__dots" id="reading-quiz-dots" aria-hidden="true"></span>
          </div>
          <div class="reading-quiz__question">
            <img class="reading-quiz__question-image" id="reading-quiz-image" src="" alt="">
            <h3 id="reading-quiz-question"></h3>
            <button class="reading-quiz__speaker" id="reading-quiz-listen" type="button" aria-label="Listen to the question">🔊</button>
          </div>
          <div class="reading-quiz__answers" id="reading-quiz-answers"></div>
          <p class="reading-quiz__feedback" id="reading-quiz-feedback" aria-live="polite"></p>
        </section>
      </section>
    </div>
    <div class="reading-quiz__completion" id="reading-quiz-completion" role="dialog" aria-modal="true" aria-labelledby="reading-quiz-completion-title" hidden>
      <div class="reading-quiz__completion-card">
        <div class="reading-quiz__completion-icon" aria-hidden="true">🏆</div>
        <h3 id="reading-quiz-completion-title">Great job!</h3>
        <p>You finished The Story of Lorenzo Langstroth activity!</p>
        <div class="reading-quiz__completion-actions">
          <button class="reading-quiz__speaker" id="reading-quiz-completion-listen" type="button" aria-label="Listen to the congratulations message">🔊</button>
          <button class="pill-btn" id="reading-quiz-again" type="button">🔄 Try Again</button>
          <button class="pill-btn blue" id="reading-quiz-back" type="button">🎬 Back to Video</button>
        </div>
      </div>
    </div>`;

  const openButton = document.getElementById('week-4-reading-open');
  const overlay = root.querySelector('#reading-activity-overlay');
  const modal = root.querySelector('.reading-activity-modal');
  const closeButton = root.querySelector('#reading-activity-close');
  const question = root.querySelector('#reading-quiz-question');
  const questionImage = root.querySelector('#reading-quiz-image');
  const questionListen = root.querySelector('#reading-quiz-listen');
  const introListen = root.querySelector('#reading-quiz-intro');
  const answers = root.querySelector('#reading-quiz-answers');
  const progress = root.querySelector('#reading-quiz-progress');
  const dots = root.querySelector('#reading-quiz-dots');
  const feedback = root.querySelector('#reading-quiz-feedback');
  const completion = root.querySelector('#reading-quiz-completion');
  const completionListen = root.querySelector('#reading-quiz-completion-listen');
  const again = root.querySelector('#reading-quiz-again');
  const backToVideo = root.querySelector('#reading-quiz-back');

  let roundIndex = 0;
  let locked = false;
  let preferredVoice = null;
  let speechToken = 0;
  let previousBodyOverflow = '';

  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  };

  const chooseVoice = () => {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const usEnglish = (voice) => /^en[-_]US$/i.test(voice.lang || '');
    preferredVoice = voices.find((voice) => usEnglish(voice) && /jenny|aria|zira|samantha|google|english/i.test(voice.name))
      || voices.find(usEnglish)
      || null;
  };

  if ('speechSynthesis' in window) {
    chooseVoice();
    window.speechSynthesis.addEventListener('voiceschanged', chooseVoice);
  }

  const stopSpeech = () => {
    speechToken += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const closeActivity = () => {
    stopSpeech();
    completion.hidden = true;
    overlay.hidden = true;
    document.body.style.overflow = previousBodyOverflow;
    openButton?.focus();
  };

  const openActivity = () => {
    previousBodyOverflow = document.body.style.overflow;
    roundIndex = 0;
    completion.hidden = true;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    renderRound({ readAloud: false });
    closeButton.focus();
    window.setTimeout(readQuestion, 300);
  };

  const speak = (text, token = speechToken) => new Promise((resolve) => {
    if (!text || token !== speechToken || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = .88;
    utterance.pitch = 1.08;
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
  });

  const playResultSound = (correct) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const notes = correct ? [523, 659, 784] : [220, 175];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * .09;
      oscillator.type = correct ? 'sine' : 'sawtooth';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(correct ? .18 : .12, start + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .22);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + .23);
    });
    window.setTimeout(() => context.close(), 850);
  };

  const readQuestion = () => {
    stopSpeech();
    speak(ROUNDS[roundIndex].question);
  };

  const renderProgress = () => {
    progress.textContent = `Question ${roundIndex + 1} of ${ROUNDS.length}`;
    dots.innerHTML = '';
    ROUNDS.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'reading-quiz__dot';
      if (index < roundIndex) dot.classList.add('is-done');
      if (index === roundIndex) dot.classList.add('is-current');
      dots.appendChild(dot);
    });
  };

  const setLocked = (value) => {
    locked = value;
    questionListen.disabled = value;
    answers.querySelectorAll('button').forEach((button) => { button.disabled = value; });
    answers.querySelectorAll('.reading-answer').forEach((card) => card.classList.toggle('is-locked', value));
  };

  const complete = async () => {
    completion.hidden = false;
    again.focus();
    stopSpeech();
    await speak('Great job! You finished The Story of Lorenzo Langstroth activity!');
  };

  const handleAnswer = async (card, option) => {
    if (locked) return;
    if (!option.correct) {
      playResultSound(false);
      card.classList.remove('is-wrong');
      void card.offsetWidth;
      card.classList.add('is-wrong');
      feedback.textContent = 'Try again! Choose another picture.';
      feedback.className = 'reading-quiz__feedback is-try';
      stopSpeech();
      speak('Try again.');
      window.setTimeout(() => card.classList.remove('is-wrong'), 650);
      return;
    }

    setLocked(true);
    playResultSound(true);
    card.classList.add('is-correct');
    feedback.textContent = 'Great job! That is correct!';
    feedback.className = 'reading-quiz__feedback is-good';
    stopSpeech();
    const token = speechToken;
    await speak(ROUNDS[roundIndex].response, token);
    if (token !== speechToken) return;
    window.setTimeout(() => {
      roundIndex += 1;
      if (roundIndex >= ROUNDS.length) complete();
      else renderRound();
    }, 500);
  };

  const makeAnswer = (option) => {
    const card = document.createElement('article');
    card.className = 'reading-answer';

    const pick = document.createElement('button');
    pick.className = 'reading-answer__pick';
    pick.type = 'button';
    pick.setAttribute('aria-label', option.label);
    pick.innerHTML = `<img src="${IMAGE_BASE}${option.image}" alt="${option.alt}"><span class="reading-answer__label">${option.label}</span>`;
    pick.addEventListener('click', () => handleAnswer(card, option));

    const listen = document.createElement('button');
    listen.className = 'reading-quiz__speaker';
    listen.type = 'button';
    listen.textContent = '🔊';
    listen.setAttribute('aria-label', `Listen to: ${option.label}`);
    listen.addEventListener('click', () => {
      if (locked) return;
      stopSpeech();
      speak(option.label);
    });

    card.append(pick, listen);
    return card;
  };

  function renderRound({ readAloud = true } = {}) {
    const round = ROUNDS[roundIndex];
    question.textContent = round.question;
    questionImage.src = `${IMAGE_BASE}${round.image}`;
    questionImage.alt = round.imageAlt;
    feedback.textContent = '';
    feedback.className = 'reading-quiz__feedback';
    answers.innerHTML = '';
    shuffle(round.options).forEach((option) => answers.appendChild(makeAnswer(option)));
    renderProgress();
    setLocked(false);
    if (readAloud) window.setTimeout(readQuestion, 380);
  }

  introListen.addEventListener('click', () => {
    stopSpeech();
    speak('Lorenzo Langstroth Challenge. Listen carefully, then choose the right picture!');
  });
  questionListen.addEventListener('click', readQuestion);
  completionListen.addEventListener('click', () => {
    stopSpeech();
    speak('Great job! You finished The Story of Lorenzo Langstroth activity!');
  });
  again.addEventListener('click', () => {
    stopSpeech();
    roundIndex = 0;
    completion.hidden = true;
    renderRound();
  });

  openButton?.addEventListener('click', openActivity);
  closeButton.addEventListener('click', closeActivity);
  backToVideo.addEventListener('click', closeActivity);
  modal.addEventListener('click', (event) => event.stopPropagation());
  overlay.addEventListener('click', closeActivity);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) closeActivity();
  });

  renderRound({ readAloud: false });
})();
