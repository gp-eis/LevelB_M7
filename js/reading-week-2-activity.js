(() => {
  const BASE = '../assets/images/week-2/reading/activity/';
  const QUESTIONS = [
    {
      kicker: 'From the video',
      question: 'Why do we have World Bee Day?',
      image: 'question-mark-3d.png',
      imageAlt: 'A colorful three-dimensional question mark.',
      answers: [
        { text: 'To help people learn why bees are important.', image: 'q1-bees-important-photo.png', alt: 'A teacher and children learning about bees beside flowers.', correct: true },
        { text: 'To catch bees when they are flying outside.', image: 'q1-catch-bees-photo.png', alt: 'A child holding a net while bees fly outside.', correct: false }
      ]
    },
    {
      kicker: 'From the video',
      question: 'When is World Bee Day?',
      image: 'question-mark-3d.png',
      imageAlt: 'A colorful three-dimensional question mark.',
      answers: [
        { text: 'It is on May 20th.', image: 'q2-may-20-photo.png', alt: 'A May 20 calendar beside a bee on a flower.', correct: true },
        { text: 'It is on June 20th.', image: 'q2-june-20-photo.png', alt: 'A June 20 calendar beside a bee on a flower.', correct: false }
      ]
    },
    {
      kicker: 'From the video',
      question: 'How do bees help plants make fruit?',
      image: 'question-mark-3d.png',
      imageAlt: 'A colorful three-dimensional question mark.',
      answers: [
        { text: 'They help pollinate flowers.', image: 'q3-pollinate-photo.png', alt: 'A honeybee pollinating a pink fruit-tree blossom.', correct: true },
        { text: 'They water the trees.', image: 'q3-water-trees-photo.png', alt: 'A honeybee using a tiny watering can beside a young tree.', correct: false }
      ]
    },
    {
      kicker: 'Think about the lesson',
      question: 'What can we do to protect bees?',
      image: 'question-mark-3d.png',
      imageAlt: 'A colorful three-dimensional question mark.',
      answers: [
        { text: 'We can plant flowers that bees like.', image: 'q4-plant-flowers-photo.png', alt: 'A child planting colorful flowers that attract bees.', correct: true },
        { text: 'We can chase the bees.', image: 'q4-chase-bees-photo.png', alt: 'An adult gardener shooing bees away from flowers with a hat.', correct: false }
      ]
    }
  ];

  const introSpeaker = document.getElementById('intro-speaker');
  const questionSpeaker = document.getElementById('question-speaker');
  const questionImage = document.getElementById('question-image');
  const questionKicker = document.getElementById('question-kicker');
  const questionText = document.getElementById('question-text');
  const answerGrid = document.getElementById('answer-grid');
  const progressLabel = document.getElementById('progress-label');
  const progressDots = document.getElementById('progress-dots');
  const feedbackLine = document.getElementById('feedback-line');
  const completionOverlay = document.getElementById('completion-overlay');
  const tryAgain = document.getElementById('try-again');

  let questionIndex = 0;
  let locked = false;
  let speechToken = 0;
  let preferredVoice = null;

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function chooseVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    preferredVoice = voices.find((voice) => /^en[-_]US$/i.test(voice.lang || '') && /jenny|aria|zira|samantha|google/i.test(voice.name))
      || voices.find((voice) => /^en[-_]US$/i.test(voice.lang || ''))
      || null;
  }

  if ('speechSynthesis' in window) {
    chooseVoice();
    window.speechSynthesis.addEventListener('voiceschanged', chooseVoice);
  }

  function stopSpeech() {
    speechToken += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function speak(text, token = speechToken) {
    return new Promise((resolve) => {
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
  }

  function pause(milliseconds, token = speechToken) {
    return new Promise((resolve) => window.setTimeout(() => resolve(token === speechToken), milliseconds));
  }

  function setDisabled(disabled) {
    questionSpeaker.disabled = disabled;
    answerGrid.querySelectorAll('button').forEach((button) => { button.disabled = disabled; });
  }

  function renderProgress() {
    progressLabel.textContent = `Question ${questionIndex + 1} of ${QUESTIONS.length}`;
    progressDots.innerHTML = '';
    QUESTIONS.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'progress-dot';
      if (index < questionIndex) dot.classList.add('done');
      if (index === questionIndex) dot.classList.add('current');
      progressDots.appendChild(dot);
    });
  }

  function makeSpeaker(text) {
    const button = document.createElement('button');
    button.className = 'quiz-speaker answer-listen';
    button.type = 'button';
    button.textContent = '🔊';
    button.setAttribute('aria-label', `Listen to: ${text}`);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (locked) return;
      stopSpeech();
      speak(text);
    });
    return button;
  }

  function makeAnswer(answer) {
    const card = document.createElement('button');
    card.className = 'answer-card';
    card.type = 'button';
    card.setAttribute('aria-label', answer.text);

    const image = document.createElement('img');
    image.className = 'answer-image';
    image.src = BASE + answer.image;
    image.alt = answer.alt;

    const label = document.createElement('span');
    label.className = 'answer-label';
    label.textContent = answer.text;

    card.append(makeSpeaker(answer.text), image, label);
    card.addEventListener('click', () => checkAnswer(card, answer));
    return card;
  }

  function readQuestion() {
    if (locked) return;
    stopSpeech();
    speak(QUESTIONS[questionIndex].question);
  }

  function renderQuestion({ readAloud = true } = {}) {
    const item = QUESTIONS[questionIndex];
    locked = false;
    feedbackLine.textContent = '';
    feedbackLine.className = 'feedback-line';
    questionImage.src = BASE + item.image;
    questionImage.alt = item.imageAlt;
    questionKicker.textContent = item.kicker;
    questionText.textContent = item.question;
    answerGrid.innerHTML = '';
    shuffle(item.answers).forEach((answer) => answerGrid.appendChild(makeAnswer(answer)));
    setDisabled(false);
    renderProgress();
    if (readAloud) window.setTimeout(readQuestion, 350);
  }

  function resultSound(correct) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const notes = correct ? [523, 659, 784] : [220, 175];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * .09;
      oscillator.type = correct ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(correct ? .13 : .05, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + .2);
    });
  }

  async function checkAnswer(card, answer) {
    if (locked) return;
    locked = true;
    stopSpeech();
    setDisabled(true);

    if (!answer.correct) {
      resultSound(false);
      card.classList.add('is-wrong');
      feedbackLine.textContent = 'Try again!';
      feedbackLine.className = 'feedback-line try';
      await speak('Try again.');
      window.setTimeout(() => {
        card.classList.remove('is-wrong');
        feedbackLine.textContent = '';
        feedbackLine.className = 'feedback-line';
        setDisabled(false);
        locked = false;
      }, 430);
      return;
    }

    resultSound(true);
    card.classList.add('is-correct');
    feedbackLine.textContent = 'Great choice!';
    feedbackLine.className = 'feedback-line good';
    const token = speechToken;
    await speak(`That's right! ${answer.text}`, token);
    await pause(650, token);

    if (questionIndex < QUESTIONS.length - 1) {
      questionIndex += 1;
      renderQuestion();
      return;
    }

    completionOverlay.hidden = false;
    tryAgain.focus();
    stopSpeech();
    speak('Great job! You finished the World Bee Day activity!');
  }

  function restart() {
    stopSpeech();
    questionIndex = 0;
    completionOverlay.hidden = true;
    renderQuestion();
  }

  introSpeaker.addEventListener('click', () => {
    if (locked) return;
    stopSpeech();
    speak('Bee Story Challenge. Listen carefully, then choose the right picture!');
  });
  questionSpeaker.addEventListener('click', readQuestion);
  tryAgain.addEventListener('click', restart);
  window.addEventListener('pagehide', stopSpeech);

  renderQuestion();
})();
