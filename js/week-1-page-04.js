(() => {
  const INTRO_AUDIO = '../assets/audio/week-1/literacy/page-04-intro.mp3';
  const PICTURE_SENTENCE_AUDIO = {
    'protect the queen': '../assets/audio/week-1/literacy/page-04-sentence-protect-the-queen.mp3',
    'collect nectar': '../assets/audio/week-1/literacy/page-04-sentence-collect-nectar.mp3',
    'find flowers': '../assets/audio/week-1/literacy/page-04-sentence-find-flowers.mp3',
    'build hives': '../assets/audio/week-1/literacy/page-04-sentence-build-hives.mp3',
    'make honey': '../assets/audio/week-1/literacy/page-04-sentence-make-honey.mp3'
  };
  const REQUIRED_CORRECT = 5;

  document.addEventListener('DOMContentLoaded', () => {
    const startLayer = document.getElementById('week-1-bees-start');
    const startButton = document.getElementById('week-1-bees-start-button');
    const restartButton = document.getElementById('week-1-bees-restart');
    const status = document.getElementById('week-1-bees-status');
    const hotspots = [...document.querySelectorAll('.bee-hotspot')];
    const completion = document.getElementById('week-1-bees-completion');
    const completionVideo = document.getElementById('week-1-bees-good-job-video');
    const completionClose = document.getElementById('week-1-bees-completion-close');
    const completionTryAgain = document.getElementById('week-1-bees-completion-try-again');
    let introAudio = null;
    let ready = false;
    let selectedCount = 0;
    let activeClipAudio = null;
    let sentenceDelayTimer = null;

    function speakFallback(text) {
      return typeof speakAmericanEnglish === 'function'
        ? speakAmericanEnglish(text)
        : Promise.resolve();
    }

    function stopActiveClip() {
      if (!activeClipAudio) return;
      activeClipAudio.pause();
      activeClipAudio.currentTime = 0;
      activeClipAudio = null;
    }

    function playCorrectCue() {
      if (typeof playTone !== 'function') return;
      playTone(700, .1, .075, 'triangle');
      playTone(980, .16, .085, 'triangle', .09);
    }

    function playWrongCue() {
      if (typeof playTone !== 'function') return;
      playTone(230, .18, .09, 'sawtooth');
      playTone(145, .24, .075, 'sawtooth', .13);
    }

    function playClip(source, fallbackText, onEnded) {
      if (typeof soundEnabled !== 'undefined' && !soundEnabled) {
        if (onEnded) onEnded();
        return;
      }
      stopActiveClip();
      activeClipAudio = new Audio(source);
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        activeClipAudio = null;
        if (onEnded) onEnded();
      };
      activeClipAudio.addEventListener('ended', finish, { once: true });
      activeClipAudio.play().catch(() => speakFallback(fallbackText).then(finish));
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

    function setReady(enabled) {
      ready = enabled;
      hotspots.forEach((hotspot) => {
        hotspot.querySelector('.bee-picture-choice').disabled = !enabled;
        hotspot.querySelector('.bee-element-speaker').disabled = !enabled;
      });
    }

    function resetSelections() {
      selectedCount = 0;
      hotspots.forEach((hotspot) => {
        hotspot.classList.remove('is-correct', 'is-wrong');
        hotspot.querySelector('.bee-picture-choice').setAttribute('aria-pressed', 'false');
      });
    }

    function stopAudio() {
      if (introAudio) {
        introAudio.pause();
        introAudio.currentTime = 0;
      }
      stopActiveClip();
      if (sentenceDelayTimer) {
        window.clearTimeout(sentenceDelayTimer);
        sentenceDelayTimer = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    function beginActivity() {
      stopAudio();
      hideCompletion();
      startLayer.hidden = true;
      resetSelections();
      setReady(false);
      status.className = 'week-1-bees-status';
      status.textContent = 'Listen to the directions.';

      introAudio = new Audio(INTRO_AUDIO);
      const finishIntro = () => {
        setReady(true);
        status.textContent = 'Click every picture that shows something bees do.';
      };
      introAudio.addEventListener('ended', finishIntro, { once: true });
      introAudio.addEventListener('error', finishIntro, { once: true });
      introAudio.play().catch(finishIntro);
    }

    function choose(hotspot) {
      if (!ready) return;

      if (hotspot.dataset.correct === 'true') {
        const completesActivity = !hotspot.classList.contains('is-correct') && selectedCount + 1 === REQUIRED_CORRECT;
        stopActiveClip();
        if (sentenceDelayTimer) window.clearTimeout(sentenceDelayTimer);
        playCorrectCue();
        sentenceDelayTimer = window.setTimeout(() => {
          sentenceDelayTimer = null;
          playClip(
            PICTURE_SENTENCE_AUDIO[hotspot.dataset.label],
            `Bees ${hotspot.dataset.label}.`,
            completesActivity ? showCompletion : null
          );
        }, 270);
        if (hotspot.classList.contains('is-correct')) return;

        hotspot.classList.add('is-correct');
        hotspot.querySelector('.bee-picture-choice').setAttribute('aria-pressed', 'true');
        selectedCount += 1;
        status.className = 'week-1-bees-status is-correct';
        status.textContent = `${selectedCount} of ${REQUIRED_CORRECT} correct answers circled.`;

        if (selectedCount === REQUIRED_CORRECT) {
          setReady(false);
          status.textContent = 'Great job! You circled all five correct answers!';
        }
        return;
      }

      hotspot.classList.remove('is-wrong');
      void hotspot.offsetWidth;
      hotspot.classList.add('is-wrong');
      stopActiveClip();
      if (sentenceDelayTimer) {
        window.clearTimeout(sentenceDelayTimer);
        sentenceDelayTimer = null;
      }
      playWrongCue();
      status.className = 'week-1-bees-status is-wrong';
      status.textContent = 'Bees do not eat nuts. Try again!';
      window.setTimeout(() => {
        hotspot.classList.remove('is-wrong');
        status.className = 'week-1-bees-status';
        status.textContent = `${selectedCount} of ${REQUIRED_CORRECT} correct answers circled.`;
      }, 900);
    }

    hotspots.forEach((hotspot) => {
      hotspot.querySelector('.bee-picture-choice').addEventListener('click', () => choose(hotspot));
      hotspot.querySelector('.bee-element-speaker').addEventListener('click', () => {
        if (!ready) return;
        const speaker = hotspot.querySelector('.bee-element-speaker');
        playClip(speaker.dataset.audio, hotspot.dataset.label);
      });
    });

    startButton.addEventListener('click', beginActivity);
    restartButton.addEventListener('click', beginActivity);
    completionClose.addEventListener('click', hideCompletion);
    completionTryAgain.addEventListener('click', beginActivity);
    setReady(false);
    resetSelections();
  });
})();
