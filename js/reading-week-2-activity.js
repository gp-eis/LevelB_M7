(() => {
  const BASE = '../assets/images/week-2/reading/activity/';
  const QUESTIONS = [
    {
      kicker: 'From the video',
      question: 'How does the bee feel in spring?',
      image: 'question-spring.png',
      imageAlt: 'A bright spring garden filled with colorful flowers.',
      answers: [
        { text: 'The bee feels warm and happy.', image: 'spring-warm.png', alt: 'A warm and happy bee in a spring meadow.', correct: true },
        { text: 'The bee feels cold and shivery.', image: 'winter-cold.png', alt: 'A cold bee shivering in snow.', correct: false }
      ]
    },
    {
      kicker: 'From the video',
      question: 'How many bees can you see in summer?',
      image: 'question-mark-3d.png',
      imageAlt: 'A colorful three-dimensional question mark.',
      answers: [
        { text: 'I can see two hot bees.', image: 'summer-two-bees.png', alt: 'Two bees in a sunny summer meadow.', correct: true },
        { text: 'I can see three cool bees.', image: 'fall-three-bees.png', alt: 'Three bees in a fall meadow.', correct: false }
      ]
    },
    {
      kicker: 'From the video',
      question: 'Where do the bees go in winter?',
      image: 'question-mark-3d.png',
      imageAlt: 'A colorful three-dimensional question mark.',
      answers: [
        { text: 'The bees go into the hive.', image: 'winter-inside-hive.png', alt: 'Bees keeping warm together inside the hive.', correct: true },
        { text: 'The bees stay outside in the snow.', image: 'winter-outside-hive.png', alt: 'Cold bees standing outside in winter snow.', correct: false }
      ]
    },
    {
      kicker: 'Think about nature',
      question: 'Where should we put our trash?',
      image: 'question-mark-3d.png',
      imageAlt: 'A colorful question mark invites children to think about caring for nature.',
      answers: [
        { text: 'In the trash bin.', image: 'answer-trash-bin.webp', alt: 'A child puts litter into a colorful outdoor trash bin.', correct: true },
        { text: 'On the flowers.', image: 'answer-trash-on-flowers.webp', alt: 'A child drops litter onto sad flowers instead of using the nearby bin.', correct: false }
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
