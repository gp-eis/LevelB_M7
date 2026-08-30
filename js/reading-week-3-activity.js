(() => {
  const ASSET = '../assets/images/week-3/reading/activity/';
  const ROUNDS = [
    {
      question: 'What do we wear when we go to space?',
      picture: 'life-q1-question.webp',
      pictureAlt: 'A child thinks beside a large question mark in space.',
      options: [
        { text: 'A spacesuit.', image: 'life-q1-spacesuit.webp', alt: 'A complete white and blue spacesuit with a helmet, gloves, and boots.', correct: true },
        { text: 'A swimsuit.', image: 'life-q1-swimsuit.webp', alt: 'A colorful swimsuit and swimming goggles beside a pool.' }
      ]
    },
    {
      question: 'What do we ride to travel to space?',
      picture: 'life-q2-question.webp',
      pictureAlt: 'A child thinks beside a question mark and a glowing path toward space.',
      options: [
        { text: 'A spaceship.', image: 'life-q2-spaceship.webp', alt: 'A rounded purple spaceship flying through space.', correct: true },
        { text: 'A car.', image: 'life-q2-car.webp', alt: 'A bright red car on a sunny road.' }
      ]
    },
    {
      question: 'What can we see in space?',
      picture: 'life-q3-question.webp',
      pictureAlt: 'A child looks at a large question mark through a round space window.',
      options: [
        { text: 'Stars and the Moon.', image: 'life-q3-stars-moon.webp', alt: 'A glowing crescent Moon surrounded by many bright stars.', correct: true },
        { text: 'Fish.', image: 'life-q3-fish.webp', alt: 'Three colorful fish swimming in a toy aquarium.' }
      ]
    },
    {
      question: 'Who might we meet in space?',
      picture: 'life-q4-question.webp',
      pictureAlt: 'A child waves toward an empty glowing doorway beside a large question mark.',
      options: [
        { text: 'An alien.', image: 'life-q4-alien.webp', alt: 'A friendly green alien waves in space.', correct: true },
        { text: 'A puppy.', image: 'life-q4-puppy.webp', alt: 'A fluffy golden puppy sits on green grass.' }
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
