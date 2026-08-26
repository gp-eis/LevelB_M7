(() => {
  const INTRO_AUDIO = '../assets/audio/week-1/literacy/page-03-intro.mp3';
  const CORRECT_SENTENCE_AUDIO = '../assets/audio/week-1/literacy/page-03-answer-beekeeper.mp3';
  const QUESTION_VIDEO = '../assets/video/week-1/literacy/page-03-question.mp4';
  const CORRECT_VIDEO = '../assets/video/week-1/literacy/page-03-correct.mp4';
  const WRONG_VIDEO = '../assets/video/week-1/literacy/page-03-wrong.mp4';
  const CORRECT_ANSWER = 'beekeeper';

  function speakSentence(sentence) {
    return typeof speakAmericanEnglish === 'function'
      ? speakAmericanEnglish(sentence)
      : Promise.resolve();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('week-1-beekeeper-video');
    const replayButton = document.getElementById('replay-week-1-question');
    const restartButton = document.getElementById('restart-week-1-beekeeper');
    const startLayer = document.getElementById('week-1-beekeeper-start');
    const startButton = document.getElementById('week-1-beekeeper-start-button');
    const feedback = document.getElementById('week-1-answer-feedback');
    const completion = document.getElementById('week-1-beekeeper-completion');
    const completionVideo = document.getElementById('week-1-beekeeper-good-job-video');
    const completionClose = document.getElementById('week-1-beekeeper-completion-close');
    const completionTryAgain = document.getElementById('week-1-beekeeper-completion-try-again');
    const answerList = document.querySelector('.week-1-answer-panel .answer-list');
    const choices = [...document.querySelectorAll('.week-1-answer-panel .sentence-choice')];
    let previousChoiceOrder = choices.map((choice) => choice.dataset.answer).join(',');
    let activeAudio = null;
    let activeAnswerAudio = null;
    let acceptingAnswer = false;
    let clipEndedAction = null;
    let clipStopAt = null;

    function stopMedia() {
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio = null;
      }
      video.pause();
      if (activeAnswerAudio) {
        activeAnswerAudio.pause();
        activeAnswerAudio.currentTime = 0;
        activeAnswerAudio = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    function hideCompletion() {
      completionVideo.pause();
      completionVideo.currentTime = 0;
      completion.hidden = true;
    }

    function showCompletion() {
      completion.hidden = false;
      completionVideo.currentTime = 0;
      completionVideo.play().catch(() => {});
    }

    function playRecordedAnswer(source, fallbackText) {
      if (typeof soundEnabled !== 'undefined' && !soundEnabled) return Promise.resolve();
      if (activeAnswerAudio) {
        activeAnswerAudio.pause();
        activeAnswerAudio.currentTime = 0;
      }
      activeAnswerAudio = new Audio(source);
      return new Promise((resolve) => {
        let handled = false;
        let fallbackStarted = false;
        const finish = () => {
          if (handled) return;
          handled = true;
          activeAnswerAudio = null;
          resolve();
        };
        const useFallback = () => {
          if (fallbackStarted) return;
          fallbackStarted = true;
          speakSentence(fallbackText).then(finish);
        };
        activeAnswerAudio.addEventListener('ended', finish, { once: true });
        activeAnswerAudio.addEventListener('error', useFallback, { once: true });
        activeAnswerAudio.play().catch(useFallback);
      });
    }

    function setChoicesEnabled(enabled) {
      choices.forEach((choice) => {
        choice.setAttribute('aria-disabled', String(!enabled));
        choice.tabIndex = enabled ? 0 : -1;
        choice.querySelector('.sentence-speaker').disabled = !enabled;
      });
    }

  function clearChoices() {
      choices.forEach((choice) => {
        choice.classList.remove('is-correct', 'is-wrong');
        choice.setAttribute('aria-checked', 'false');
      });
  }

  function shuffleChoices() {
    const shuffled = [...choices];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    if (shuffled.map((choice) => choice.dataset.answer).join(',') === previousChoiceOrder) {
      shuffled.push(shuffled.shift());
    }

    shuffled.forEach((choice) => answerList.appendChild(choice));
    previousChoiceOrder = shuffled.map((choice) => choice.dataset.answer).join(',');
  }

    function playAudio(source, onEnded) {
      if (activeAudio) activeAudio.pause();
      activeAudio = new Audio(source);
      let handled = false;
      const finish = () => {
        if (handled) return;
        handled = true;
        activeAudio = null;
        onEnded();
      };
      activeAudio.addEventListener('ended', finish, { once: true });
      activeAudio.addEventListener('error', finish, { once: true });
      activeAudio.play().catch(finish);
    }

    function finishClip() {
      const action = clipEndedAction;
      clipEndedAction = null;
      clipStopAt = null;
      if (action) action();
    }

    function loadClip(source, onEnded, stopAtSeconds = null) {
      video.pause();
      video.src = source;
      video.currentTime = 0;
      video.load();
      clipEndedAction = onEnded || null;
      clipStopAt = stopAtSeconds;
      return video.play();
    }

    function readyForAnswer() {
      acceptingAnswer = true;
      replayButton.disabled = false;
      setChoicesEnabled(true);
      feedback.textContent = 'Choose one answer.';
      feedback.className = 'answer-feedback';
    }

    function playQuestion() {
      stopMedia();
      acceptingAnswer = false;
      setChoicesEnabled(false);
      replayButton.disabled = true;
      feedback.textContent = 'Listen to the question.';
      feedback.className = 'answer-feedback';
      loadClip(QUESTION_VIDEO, readyForAnswer).catch(finishClip);
    }

    function restoreQuestionFrame() {
      video.pause();
      video.src = QUESTION_VIDEO;
      video.load();
      readyForAnswer();
    }

    function beginActivity() {
      stopMedia();
      hideCompletion();
      startLayer.hidden = true;
      acceptingAnswer = false;
      replayButton.disabled = true;
      setChoicesEnabled(false);
      clearChoices();
      shuffleChoices();
      feedback.textContent = 'Listen to the directions.';
      feedback.className = 'answer-feedback';
      playAudio(INTRO_AUDIO, playQuestion);
    }

    function markCorrect(choice) {
      acceptingAnswer = false;
      setChoicesEnabled(false);
      replayButton.disabled = true;
      choices.forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('is-correct', selected);
        item.classList.remove('is-wrong');
        item.setAttribute('aria-checked', String(selected));
      });
      feedback.textContent = 'Great job! I am a beekeeper.';
      feedback.className = 'answer-feedback is-correct';
      loadClip(CORRECT_VIDEO, () => {
        playRecordedAnswer(CORRECT_SENTENCE_AUDIO, 'I am a beekeeper.').then(showCompletion);
      }).catch(finishClip);
    }

    function markWrong(choice) {
      acceptingAnswer = false;
      setChoicesEnabled(false);
      replayButton.disabled = true;
      choice.classList.remove('is-wrong');
      void choice.offsetWidth;
      choice.classList.add('is-wrong');
      feedback.textContent = 'Try again! Choose another answer.';
      feedback.className = 'answer-feedback is-wrong';
      const finish = () => {
        choice.classList.remove('is-wrong');
        restoreQuestionFrame();
      };
      loadClip(WRONG_VIDEO, finish, 4).catch(finishClip);
    }

    function chooseAnswer(choice) {
      if (!acceptingAnswer) return;
      acceptingAnswer = false;
      setChoicesEnabled(false);
      replayButton.disabled = true;
      if (choice.dataset.answer === CORRECT_ANSWER) markCorrect(choice);
      else markWrong(choice);
    }

    choices.forEach((choice) => {
      choice.addEventListener('click', (event) => {
        if (event.target.closest('.sentence-speaker')) return;
        chooseAnswer(choice);
      });
      choice.addEventListener('keydown', (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && acceptingAnswer) {
          event.preventDefault();
          chooseAnswer(choice);
        }
      });
    });

    document.querySelectorAll('.week-1-answer-panel .sentence-speaker').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (acceptingAnswer) playRecordedAnswer(button.dataset.audio, button.dataset.speak);
      });
    });

    startButton.addEventListener('click', beginActivity);
    replayButton.addEventListener('click', playQuestion);
    restartButton.addEventListener('click', beginActivity);
    completionClose.addEventListener('click', hideCompletion);
    completionTryAgain.addEventListener('click', beginActivity);
    video.addEventListener('ended', finishClip);
    video.addEventListener('timeupdate', () => {
      if (clipStopAt !== null && video.currentTime >= clipStopAt) {
        video.pause();
        finishClip();
      }
    });

    setChoicesEnabled(false);
    clearChoices();
  });
})();
