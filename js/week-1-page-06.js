(() => {
  const AUDIO = {
    intro: '../assets/audio/week-1/literacy/page-06-intro.mp3',
    clues: '../assets/audio/week-1/literacy/page-06-clues.mp3',
    correct: '../assets/audio/week-1/literacy/page-06-correct.mp3',
    wrong: '../assets/audio/week-1/literacy/page-06-wrong.mp3'
  };

  document.addEventListener('DOMContentLoaded', () => {
    const choicesBox = document.getElementById('page6-choices');
    const choices = [...document.querySelectorAll('.page6-choice')];
    const cluesSpeaker = document.getElementById('page6-clues-speaker');
    const startLayer = document.getElementById('page6-start');
    const startButton = document.getElementById('page6-start-button');
    const restartButton = document.getElementById('page6-restart');
    const status = document.getElementById('page6-status');
    const completion = document.getElementById('page6-completion');
    const completionVideo = document.getElementById('page6-good-job-video');
    const completionClose = document.getElementById('page6-completion-close');
    const completionTryAgain = document.getElementById('page6-completion-try-again');
    let activeAudio = null;
    let ready = false;
    let complete = false;
    let lastFirstAnswer = '';

    function stopSound() {
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    function speakFallback(text) {
      return typeof speakAmericanEnglish === 'function'
        ? speakAmericanEnglish(text)
        : Promise.resolve();
    }

    function playAudio(source, fallbackText) {
      stopSound();
      if (typeof soundEnabled !== 'undefined' && !soundEnabled) return Promise.resolve();
      const audio = new Audio(source);
      activeAudio = audio;
      return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          if (activeAudio === audio) activeAudio = null;
          resolve();
        };
        audio.addEventListener('ended', finish, { once: true });
        audio.addEventListener('error', () => speakFallback(fallbackText).then(finish), { once: true });
        audio.play().catch(() => speakFallback(fallbackText).then(finish));
      });
    }

    function setChoicesEnabled(enabled) {
      choices.forEach((choice) => { choice.disabled = !enabled; });
      cluesSpeaker.disabled = !enabled;
    }

    function clearFeedback() {
      choices.forEach((choice) => choice.classList.remove('is-correct', 'is-wrong'));
    }

    function arrangeChoices() {
      let first = Math.random() < .5 ? 'queen' : 'athlete';
      if (first === lastFirstAnswer) first = first === 'queen' ? 'athlete' : 'queen';
      const ordered = [...choices].sort((a, b) => (a.dataset.answer === first ? -1 : b.dataset.answer === first ? 1 : 0));
      ordered.forEach((choice) => choicesBox.appendChild(choice));
      lastFirstAnswer = first;
    }

    function playCorrectCue() {
      if (typeof playTone !== 'function') return;
      playTone(660, .1, .07, 'triangle');
      playTone(920, .17, .08, 'triangle', .09);
    }

    function playWrongCue() {
      if (typeof playTone !== 'function') return;
      playTone(220, .17, .085, 'sawtooth');
      playTone(145, .22, .075, 'sawtooth', .12);
    }

    async function showCompletion() {
      completion.hidden = false;
      completionVideo.currentTime = 0;
      try { await completionVideo.play(); } catch (_) { /* The replay control remains available. */ }
    }

    function closeCompletion() {
      completionVideo.pause();
      completion.hidden = true;
    }

    async function beginActivity() {
      stopSound();
      closeCompletion();
      clearFeedback();
      arrangeChoices();
      ready = false;
      complete = false;
      startLayer.hidden = true;
      setChoicesEnabled(false);
      status.textContent = 'Listen carefully.';
      await playAudio(AUDIO.intro, 'She is a queen. Read the clues to find the queen.');
      await playAudio(AUDIO.clues, 'She has a dress. She has a crown.');
      if (complete) return;
      ready = true;
      setChoicesEnabled(true);
      status.textContent = 'Choose the woman who is the queen.';
    }

    async function choose(choice) {
      if (!ready || complete) return;
      if (choice.dataset.answer === 'athlete') {
        ready = false;
        setChoicesEnabled(false);
        clearFeedback();
        choice.classList.add('is-wrong');
        playWrongCue();
        status.textContent = 'That is the athlete. Try again.';
        await playAudio(AUDIO.wrong, 'I am not the queen. I am an athlete.');
        choice.classList.remove('is-wrong');
        ready = true;
        setChoicesEnabled(true);
        status.textContent = 'Try again. Choose the queen.';
        return;
      }

      complete = true;
      ready = false;
      setChoicesEnabled(false);
      clearFeedback();
      choice.classList.add('is-correct');
      playCorrectCue();
      status.textContent = 'Correct! She is the queen.';
      await playAudio(AUDIO.correct, 'I am the queen.');
      await showCompletion();
    }

    startButton.addEventListener('click', beginActivity);
    restartButton.addEventListener('click', beginActivity);
    completionTryAgain.addEventListener('click', beginActivity);
    completionClose.addEventListener('click', closeCompletion);
    cluesSpeaker.addEventListener('click', async () => {
      if (!ready || complete) return;
      ready = false;
      setChoicesEnabled(false);
      status.textContent = 'Listen to the clues.';
      await playAudio(AUDIO.clues, 'She has a dress. She has a crown.');
      ready = true;
      setChoicesEnabled(true);
      status.textContent = 'Choose the woman who is the queen.';
    });
    choices.forEach((choice) => choice.addEventListener('click', () => choose(choice)));
    completionVideo.addEventListener('ended', () => { status.textContent = 'Great work! You found the queen.'; });

    arrangeChoices();
    setChoicesEnabled(false);
  });
})();
