(() => {
  const app = document.querySelector('#track-app');
  if (!app || document.body.dataset.week !== '1' || document.body.dataset.track !== 'reading') return;

  const imageBase = '../assets/images/week-1/reading/activity/';
  const questions = [
    {
      question: 'Who did the children meet after the queen?',
      image: 'question-1.webp',
      imageAlt: 'Children meet a human queen and a queen bee in a garden.',
      answers: [
        { label: 'A queen bee.', image: 'answer-queen-bee.webp', alt: 'A friendly crowned queen bee.', correct: true },
        { label: 'A butterfly.', image: 'answer-butterfly.webp', alt: 'A colorful butterfly.', correct: false }
      ]
    },
    {
      question: 'Where does the queen live?',
      image: 'question-2.webp',
      imageAlt: 'A queen thinks about a castle and a beehive.',
      answers: [
        { label: 'In a castle.', image: 'answer-castle.webp', alt: 'A fairytale castle.', correct: true },
        { label: 'In a beehive.', image: 'answer-beehive.webp', alt: 'A natural beehive hanging from a tree.', correct: false }
      ]
    },
    {
      question: 'What does the queen bee have?',
      image: 'question-3.webp',
      imageAlt: 'A crowned queen bee spreads her wings in a flower garden.',
      answers: [
        { label: 'She has wings.', image: 'answer-wings.webp', alt: 'A pair of pale blue bee wings.', correct: true },
        { label: 'She has a dress.', image: 'answer-dress.webp', alt: 'A purple royal dress.', correct: false }
      ]
    },
    {
      question: 'What should we do when friends are different?',
      image: 'question-4.webp',
      imageAlt: 'Different friends welcome each other with smiles.',
      answers: [
        { label: 'Be kind and celebrate our differences.', image: 'answer-kind.webp', alt: 'Children welcoming one another with a friendly high-five.', correct: true },
        { label: 'Laugh and turn away.', image: 'answer-unkind.webp', alt: 'A child laughs while another child feels sad.', correct: false }
      ]
    }
  ];

  const placeholder = app.querySelector('.track-video-placeholder');
  if (placeholder) {
    const shell = document.createElement('div');
    shell.className = 'video-play-shell w1-reading-video-shell';
    shell.innerHTML = `
      <video class="w1-reading-video" controls playsinline preload="metadata" poster="../assets/images/week-1/reading/who-is-the-queen-thumbnail.webp" aria-label="Who is the Queen reading video">
        <source src="../assets/video/week-1/reading/who-is-the-queen.mp4" type="video/mp4">
        Your browser does not support this video.
      </video>
      <button class="center-video-play" type="button" aria-label="Play Who is the Queen">▶</button>`;
    placeholder.replaceWith(shell);
    const video = shell.querySelector('video');
    const play = shell.querySelector('.center-video-play');
    const show = () => { play.hidden = false; };
    const hide = () => { play.hidden = true; };
    play.addEventListener('click', () => video.play().catch(show));
    video.addEventListener('play', hide);
    video.addEventListener('playing', hide);
    video.addEventListener('pause', show);
    video.addEventListener('ended', show);
  }

  const activity = app.querySelector('.track-activity-card');
  if (!activity) return;
  activity.classList.add('w1-reading-activity-card');
  activity.innerHTML = `
    <h2 class="section-title">⭐ Who Is the Queen? Challenge</h2>
    <div class="w1-reading-intro">
      <p>Look, listen, and choose the right answer!</p>
      <button class="w1-reading-speaker" id="w1-reading-intro" type="button" aria-label="Listen to the activity instructions">🔊</button>
    </div>
    <div id="w1-reading-game">
      <div class="w1-reading-progress"><span id="w1-reading-progress-label"></span><span class="w1-reading-dots" id="w1-reading-dots" aria-hidden="true"></span></div>
      <div class="w1-reading-question">
        <img id="w1-reading-question-image" alt="">
        <h2 id="w1-reading-question-text"></h2>
        <button class="w1-reading-speaker" id="w1-reading-question-speaker" type="button" aria-label="Listen to the question">🔊</button>
      </div>
      <div class="w1-reading-answers" id="w1-reading-answers"></div>
      <p class="w1-reading-feedback" id="w1-reading-feedback" aria-live="polite"></p>
    </div>
    <section class="w1-reading-complete" id="w1-reading-complete" aria-live="polite" hidden>
      <h2>🏆 Great job!</h2>
      <p>You finished the Who Is the Queen? challenge!</p>
      <div class="w1-reading-complete-actions">
        <button class="track-activity-btn" id="w1-reading-again" type="button">🔄 Try Again</button>
        <button class="w1-reading-speaker" id="w1-reading-complete-speaker" type="button" aria-label="Listen to the congratulations message">🔊</button>
      </div>
    </section>`;

  const game = document.querySelector('#w1-reading-game');
  const progressLabel = document.querySelector('#w1-reading-progress-label');
  const dots = document.querySelector('#w1-reading-dots');
  const questionImage = document.querySelector('#w1-reading-question-image');
  const questionText = document.querySelector('#w1-reading-question-text');
  const answerGrid = document.querySelector('#w1-reading-answers');
  const feedback = document.querySelector('#w1-reading-feedback');
  const questionSpeaker = document.querySelector('#w1-reading-question-speaker');
  const completion = document.querySelector('#w1-reading-complete');
  let index = 0;
  let locked = false;

  function speak(text) {
    if (typeof window.speakAmericanEnglish === 'function') return window.speakAmericanEnglish(text, { rate: .82, pitch: 1.05 });
    return Promise.resolve();
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function resultSound(correct) {
    if (typeof window.playTone !== 'function') return;
    if (correct) {
      window.playTone(523,.16,.11,'sine');
      window.playTone(659,.16,.1,'sine',.1);
      window.playTone(784,.2,.1,'sine',.2);
    } else {
      window.playTone(220,.18,.08,'sawtooth');
      window.playTone(160,.24,.07,'sawtooth',.13);
    }
  }

  function setDisabled(disabled) {
    answerGrid.querySelectorAll('button').forEach((button) => { button.disabled = disabled; });
    questionSpeaker.disabled = disabled;
  }

  function renderProgress() {
    progressLabel.textContent = `Question ${index + 1} of ${questions.length}`;
    dots.innerHTML = '';
    questions.forEach((_, dotIndex) => {
      const dot = document.createElement('span');
      dot.className = 'w1-reading-dot';
      if (dotIndex < index) dot.classList.add('is-done');
      if (dotIndex === index) dot.classList.add('is-current');
      dots.appendChild(dot);
    });
  }

  function makeAnswer(answer) {
    const card = document.createElement('article');
    card.className = 'w1-reading-answer';
    const select = document.createElement('button');
    select.className = 'w1-reading-answer-select';
    select.type = 'button';
    select.innerHTML = `<img src="${imageBase}${answer.image}" alt="${answer.alt}"><span class="w1-reading-answer-label">${answer.label}</span>`;
    const listen = document.createElement('button');
    listen.className = 'w1-reading-speaker';
    listen.type = 'button';
    listen.textContent = '🔊';
    listen.setAttribute('aria-label', `Listen to: ${answer.label}`);
    listen.addEventListener('click', (event) => { event.stopPropagation(); if (!locked) speak(answer.label); });
    card.append(listen, select);
    select.addEventListener('click', async () => {
      if (locked) return;
      locked = true;
      setDisabled(true);
      if (!answer.correct) {
        resultSound(false);
        card.classList.add('is-wrong');
        feedback.textContent = 'Try again!';
        feedback.className = 'w1-reading-feedback is-wrong';
        await speak(answer.label);
        window.setTimeout(() => {
          card.classList.remove('is-wrong');
          feedback.textContent = '';
          feedback.className = 'w1-reading-feedback';
          locked = false;
          setDisabled(false);
        }, 500);
        return;
      }
      resultSound(true);
      card.classList.add('is-correct');
      feedback.textContent = 'Great choice!';
      feedback.className = 'w1-reading-feedback is-good';
      await speak(`That's right! ${answer.label}`);
      window.setTimeout(() => {
        if (index < questions.length - 1) {
          index += 1;
          render();
        } else {
          game.hidden = true;
          completion.hidden = false;
          speak('Great job! You finished the Who Is the Queen challenge!');
        }
      }, 450);
    });
    return card;
  }

  function render() {
    locked = false;
    completion.hidden = true;
    game.hidden = false;
    const item = questions[index];
    questionImage.src = `${imageBase}${item.image}`;
    questionImage.alt = item.imageAlt;
    questionText.textContent = item.question;
    answerGrid.innerHTML = '';
    shuffle(item.answers).forEach((answer) => answerGrid.appendChild(makeAnswer(answer)));
    feedback.textContent = '';
    feedback.className = 'w1-reading-feedback';
    setDisabled(false);
    renderProgress();
  }

  document.querySelector('#w1-reading-intro').addEventListener('click', () => speak('Look, listen, and choose the right answer!'));
  questionSpeaker.addEventListener('click', () => { if (!locked) speak(questions[index].question); });
  document.querySelector('#w1-reading-complete-speaker').addEventListener('click', () => speak('Great job! You finished the Who Is the Queen challenge!'));
  document.querySelector('#w1-reading-again').addEventListener('click', () => { index = 0; render(); });
  render();
})();
