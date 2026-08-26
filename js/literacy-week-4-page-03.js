(() => {
  const INTRO_AUDIO = '../assets/audio/week-4/literacy/page-03/intro.mp3';
  const INTRO_VIDEO = '../assets/video/week-4/literacy/page-03/intro.mp4';
  const WRONG_VIDEO = '../assets/video/week-4/literacy/page-03/wrong.mp4';
  const CORRECT_VIDEO = '../assets/video/week-4/literacy/page-03/correct.mp4';
  const WRONG_AUDIO = '../assets/audio/week-4/literacy/page-03/wrong-answer-level-a.mp3';
  const choices = [
    { key: 'santa', sentence: 'I am Santa Claus.', color: '#2870ca', audio: '../assets/audio/week-4/literacy/page-03/santa-claus.mp3' },
    { key: 'lorenzo', sentence: 'I am Lorenzo Langstroth.', color: '#67b84a', audio: '../assets/audio/week-4/literacy/page-03/lorenzo-langstroth.mp3', correct: true },
    { key: 'king', sentence: 'I am King Sejeong.', color: '#f1782c', audio: '../assets/audio/week-4/literacy/page-03/king-sejeong.mp3' }
  ];
  const wrap = document.querySelector('.activity-sheet-wrap');
  const image = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !image) return;

  const stage = document.createElement('div');
  stage.className = 'w4-bee-stage w4-page3-stage';
  image.before(stage);
  stage.appendChild(image);
  wrap.classList.add('w4-bee-wrap', 'w4-page3-wrap');
  stage.insertAdjacentHTML('beforeend', `
    <video class="w4-page3-video" playsinline preload="metadata" aria-label="Page 3 activity video" hidden></video>
    <button class="w4-page3-replay" type="button" aria-label="Replay the introduction and question" disabled>🔊</button>
    <div class="w4-page3-answer-panel">
      <div class="w4-page3-answer-list" role="radiogroup" aria-label="Choose the correct identity">
        ${choices.map(choice => `
          <div class="w4-page3-choice" role="radio" aria-checked="false" aria-disabled="true" tabindex="-1" data-choice="${choice.key}">
            <span class="w4-page3-dot-mask" style="--dot:${choice.color}" aria-hidden="true"></span>
            <span class="w4-page3-choice-text">${choice.sentence}</span>
            <button class="w4-page3-speaker" type="button" data-audio="${choice.audio}" aria-label="Listen to: ${choice.sentence}" disabled>🔊</button>
          </div>`).join('')}
      </div>
    </div>
    <div class="literacy-activity-start-layer w4-page3-start-layer">
      <button class="literacy-activity-start-button w4-page3-start-button" type="button"><span aria-hidden="true">▶</span><span>Start Activity</span></button>
    </div>
  `);
  document.querySelector('.activity-build-note')?.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="w4-feedback" aria-live="polite">Press Start Activity and listen.</p>
    <div class="w4-actions"><button class="w4-restart" type="button">↻ Try Again</button></div>
  `);

  const answerList = stage.querySelector('.w4-page3-answer-list');
  const choiceElements = [...stage.querySelectorAll('.w4-page3-choice')];
  const video = stage.querySelector('.w4-page3-video');
  const startLayer = stage.querySelector('.w4-page3-start-layer');
  const startButton = stage.querySelector('.w4-page3-start-button');
  const replayButton = stage.querySelector('.w4-page3-replay');
  const feedback = document.querySelector('.w4-feedback');
  const restart = document.querySelector('.w4-restart');
  const introAudio = new Audio(INTRO_AUDIO);
  const elementAudio = new Audio();
  const wrongAudio = new Audio(WRONG_AUDIO);
  elementAudio.volume = 10 ** (-5 / 20);
  let acceptingAnswer = false;
  let previousOrder = choiceElements.map(element => element.dataset.choice).join(',');
  let videoEndedAction = null;

  function stopMedia() {
    introAudio.pause();
    introAudio.currentTime = 0;
    elementAudio.pause();
    elementAudio.currentTime = 0;
    wrongAudio.pause();
    wrongAudio.currentTime = 0;
    wrongAudio.onended = null;
    video.pause();
    videoEndedAction = null;
  }

  function setChoicesEnabled(enabled) {
    choiceElements.forEach(element => {
      element.setAttribute('aria-disabled', String(!enabled));
      element.tabIndex = enabled ? 0 : -1;
      element.querySelector('.w4-page3-speaker').disabled = !enabled;
    });
  }

  function clearChoices() {
    choiceElements.forEach(element => {
      element.classList.remove('is-correct', 'is-wrong');
      element.setAttribute('aria-checked', 'false');
    });
  }

  function shuffleChoices() {
    const shuffled = [...choiceElements];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    if (shuffled.map(element => element.dataset.choice).join(',') === previousOrder) shuffled.push(shuffled.shift());
    shuffled.forEach(element => answerList.appendChild(element));
    previousOrder = shuffled.map(element => element.dataset.choice).join(',');
  }

  function playVideo(source, onEnded, keepFinalFrame = false) {
    video.pause();
    video.hidden = false;
    video.src = source;
    video.currentTime = 0;
    video.load();
    videoEndedAction = () => {
      if (!keepFinalFrame) video.hidden = true;
      onEnded?.();
    };
    return video.play();
  }

  function readyForAnswer() {
    acceptingAnswer = true;
    replayButton.disabled = false;
    setChoicesEnabled(true);
    feedback.className = 'w4-feedback';
    feedback.textContent = 'Choose one answer. Tap a speaker to hear a sentence.';
  }

  function playQuestionClip() {
    feedback.textContent = 'Watch and listen.';
    playVideo(INTRO_VIDEO, readyForAnswer).catch(() => {
      video.hidden = true;
      readyForAnswer();
    });
  }

  function playIntroSequence() {
    acceptingAnswer = false;
    replayButton.disabled = true;
    setChoicesEnabled(false);
    elementAudio.pause();
    feedback.className = 'w4-feedback';
    feedback.textContent = 'Listen to the introduction.';
    introAudio.currentTime = 0;
    introAudio.onended = playQuestionClip;
    introAudio.play().catch(playQuestionClip);
  }

  function beginActivity() {
    stopMedia();
    video.hidden = true;
    startLayer.hidden = true;
    clearChoices();
    shuffleChoices();
    playIntroSequence();
  }

  function playWrongSound() {
    wrongAudio.pause();
    wrongAudio.currentTime = 0;
    wrongAudio.onended = null;
    wrongAudio.play().catch(() => {});
  }

  function markWrong(element) {
    acceptingAnswer = false;
    replayButton.disabled = true;
    setChoicesEnabled(false);
    element.classList.remove('is-wrong');
    void element.offsetWidth;
    element.classList.add('is-wrong');
    feedback.className = 'w4-feedback is-wrong';
    feedback.textContent = 'Try again! Watch the clue.';
    playWrongSound();
    playVideo(WRONG_VIDEO, () => {
      element.classList.remove('is-wrong');
      readyForAnswer();
    }).catch(() => {
      video.hidden = true;
      element.classList.remove('is-wrong');
      readyForAnswer();
    });
  }

  function markCorrect(element) {
    acceptingAnswer = false;
    replayButton.disabled = true;
    setChoicesEnabled(false);
    choiceElements.forEach(choice => {
      const selected = choice === element;
      choice.classList.toggle('is-correct', selected);
      choice.classList.remove('is-wrong');
      choice.setAttribute('aria-checked', String(selected));
    });
    feedback.className = 'w4-feedback is-correct';
    feedback.textContent = 'Correct! I am Lorenzo Langstroth.';
    playVideo(CORRECT_VIDEO, () => {
      feedback.textContent = 'Great job! Press Try Again to play once more.';
    }, true).catch(() => {
      video.hidden = true;
      feedback.textContent = 'Great job! Press Try Again to play once more.';
    });
  }

  function choose(element) {
    if (!acceptingAnswer || element.getAttribute('aria-disabled') === 'true') return;
    const choice = choices.find(item => item.key === element.dataset.choice);
    if (choice.correct) markCorrect(element); else markWrong(element);
  }

  choiceElements.forEach(element => {
    element.addEventListener('click', event => {
      if (event.target.closest('.w4-page3-speaker')) return;
      choose(element);
    });
    element.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      choose(element);
    });
  });

  stage.querySelectorAll('.w4-page3-speaker').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    if (!acceptingAnswer) return;
    elementAudio.pause();
    elementAudio.src = button.dataset.audio;
    elementAudio.currentTime = 0;
    elementAudio.play().catch(() => {});
  }));

  video.addEventListener('ended', () => {
    const action = videoEndedAction;
    videoEndedAction = null;
    action?.();
  });
  startButton.addEventListener('click', beginActivity);
  replayButton.addEventListener('click', playIntroSequence);
  restart.addEventListener('click', beginActivity);
  setChoicesEnabled(false);
  clearChoices();
})();
