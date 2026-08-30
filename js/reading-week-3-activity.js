(() => {
  const ASSET = '../assets/images/week-3/reading/activity/';
  const ROUNDS = [
    {
      question: "What was the alien's planet like at the beginning?",
      picture: 'q1-question.webp',
      pictureAlt: 'The friendly alien describes a gray, bare planet to the child.',
      options: [
        { text: 'It was gray and bare.', image: 'q1-gray-bare.webp', alt: 'The sad alien stands on a gray, rocky planet with no plants.', correct: true },
        { text: 'It was green with plants.', image: 'q1-green-plants.webp', alt: 'The child and alien stand on a lush green planet full of plants.' }
      ]
    },
    {
      question: "What did the child take to the alien's planet?",
      picture: 'q2-question.webp',
      pictureAlt: 'The child shows seeds to the excited alien beside the spaceship.',
      options: [
        { text: 'She took seeds.', image: 'q2-seeds.webp', alt: 'The child carries seeds toward the alien spaceship.', correct: true },
        { text: 'She took toys.', image: 'q2-toys.webp', alt: 'The child carries a teddy bear, blocks, and a ball toward the spaceship.' }
      ]
    },
    {
      question: "What grew on the alien's planet?",
      picture: 'q3-question.webp',
      pictureAlt: 'The child and alien happily discover flowers growing on the gray planet.',
      options: [
        { text: 'Many flowers grew.', image: 'q3-flowers.webp', alt: 'Many colorful flowers grow around the child, alien, and spaceship.', correct: true },
        { text: 'Tall buildings grew.', image: 'q3-buildings.webp', alt: 'Tall futuristic buildings stand on the alien planet.' }
      ]
    },
    {
      question: 'How should we explore a new place?',
      picture: 'q1-question.webp',
      pictureAlt: 'A child and a friendly alien explore a new planet.',
      options: [
        { text: 'Stay with a grown-up.', image: 'q4-stay-with-grownup.webp', alt: 'A child safely explores a new trail beside a grown-up.', correct: true },
        { text: 'Run away alone.', image: 'q4-run-alone.webp', alt: 'A child runs far ahead alone while a worried grown-up calls them back.' }
      ]
    }
  ];

  const question = document.getElementById('reading-question');
  const questionPicture = document.getElementById('reading-question-picture');
  const questionSpeaker = document.getElementById('reading-question-speaker');
  const introSpeaker = document.getElementById('reading-intro-speaker');
  const answers = document.getElementById('reading-answers');
  const progressLabel = document.getElementById('reading-progress-label');
  const progressDots = document.getElementById('reading-progress-dots');
  const feedback = document.getElementById('reading-feedback');
  const completion = document.getElementById('reading-completion');
  const completionSpeaker = document.getElementById('reading-completion-speaker');
  const tryAgain = document.getElementById('reading-try-again');
  let roundIndex = 0;
  let locked = false;

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function speak(text) {
    if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish(text, { rate: .82, pitch: 1.05 });
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function playResultSound(correct) {
    if (typeof playTone !== 'function') return;
    if (correct) {
      playTone(523.25, .12, .11, 'triangle');
      playTone(659.25, .14, .1, 'triangle', .11);
      playTone(783.99, .18, .09, 'triangle', .22);
    } else {
      playTone(220, .14, .08, 'sine');
      playTone(174.61, .18, .07, 'sine', .12);
    }
  }

  function renderProgress() {
    progressLabel.textContent = `Question ${roundIndex + 1} of ${ROUNDS.length}`;
    progressDots.replaceChildren();
    ROUNDS.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'reading-progress-dot';
      if (index < roundIndex) dot.classList.add('done');
      if (index === roundIndex) dot.classList.add('current');
      progressDots.appendChild(dot);
    });
  }

  function setCardsDisabled(disabled) {
    answers.querySelectorAll('.reading-answer-card').forEach(card => {
      card.dataset.disabled = String(disabled);
      card.tabIndex = disabled ? -1 : 0;
      card.setAttribute('aria-disabled', String(disabled));
    });
    answers.querySelectorAll('.reading-answer-listen').forEach(button => { button.disabled = disabled; });
  }

  function chooseOption(card, option) {
    if (locked || card.dataset.disabled === 'true') return;
    locked = true;
    stopSpeech();
    questionSpeaker.disabled = true;
    setCardsDisabled(true);
    if (!option.correct) {
      playResultSound(false);
      card.classList.add('is-wrong');
      feedback.textContent = 'Try again!';
      feedback.className = 'reading-feedback try';
      speak('Try again.');
      window.setTimeout(() => {
        card.classList.remove('is-wrong');
        feedback.textContent = '';
        feedback.className = 'reading-feedback';
        questionSpeaker.disabled = false;
        setCardsDisabled(false);
        locked = false;
      }, 780);
      return;
    }
    playResultSound(true);
    card.classList.add('is-correct');
    feedback.textContent = 'Great choice!';
    feedback.className = 'reading-feedback good';
    speak(`That's right! ${option.text}`);
    window.setTimeout(() => {
      if (roundIndex < ROUNDS.length - 1) {
        roundIndex += 1;
        renderRound();
      } else {
        locked = false;
        completion.hidden = false;
        tryAgain.focus();
        speak('Great job! You finished the Zoom to Space Challenge. Keep helping Earth stay green and healthy!');
      }
    }, 1800);
  }

  function makeAnswerCard(option) {
    const card = document.createElement('div');
    card.className = 'reading-answer-card';
    card.role = 'button';
    card.tabIndex = 0;
    card.dataset.disabled = 'false';
    card.setAttribute('aria-label', option.text);

    const listen = document.createElement('button');
    listen.className = 'reading-speaker reading-answer-listen';
    listen.type = 'button';
    listen.textContent = '🔊';
    listen.setAttribute('aria-label', `Listen to: ${option.text}`);
    listen.addEventListener('click', event => {
      event.stopPropagation();
      if (!locked) speak(option.text);
    });

    const picture = document.createElement('img');
    picture.className = 'reading-answer-picture';
    picture.src = ASSET + option.image;
    picture.alt = option.alt;
    picture.width = 768;
    picture.height = 768;

    const label = document.createElement('span');
    label.className = 'reading-answer-label';
    label.textContent = option.text;
    card.append(listen, picture, label);
    card.addEventListener('click', () => chooseOption(card, option));
    card.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      chooseOption(card, option);
    });
    return card;
  }

  function renderRound() {
    locked = false;
    questionSpeaker.disabled = false;
    feedback.textContent = '';
    feedback.className = 'reading-feedback';
    const round = ROUNDS[roundIndex];
    question.textContent = round.question;
    questionPicture.src = ASSET + round.picture;
    questionPicture.alt = round.pictureAlt;
    answers.replaceChildren();
    shuffle(round.options).forEach(option => answers.appendChild(makeAnswerCard(option)));
    renderProgress();
    window.setTimeout(() => { if (!locked) speak(round.question); }, 380);
  }

  function restart() {
    stopSpeech();
    roundIndex = 0;
    completion.hidden = true;
    renderRound();
  }

  introSpeaker.addEventListener('click', () => speak('Zoom to Space Challenge. Listen carefully, then choose the right answer!'));
  questionSpeaker.addEventListener('click', () => { if (!locked) speak(ROUNDS[roundIndex].question); });
  completionSpeaker.addEventListener('click', () => speak('Great job! You finished the Zoom to Space Challenge. Keep helping Earth stay green and healthy!'));
  tryAgain.addEventListener('click', restart);
  window.addEventListener('pagehide', stopSpeech);
  renderRound();
})();
