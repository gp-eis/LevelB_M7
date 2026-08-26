(() => {
  const INTRO_AUDIO = '../assets/audio/week-1/literacy/page-05-intro.mp3';
  const SOURCE_SLOTS = [
    { left: 53, top: 32 },
    { left: 76, top: 32 },
    { left: 53, top: 64 },
    { left: 76, top: 64 }
  ];
  const PICTURE_AUDIO = {
    wings: '../assets/audio/week-1/literacy/page-05-element-stinger.mp3',
    antennae: '../assets/audio/week-1/literacy/page-05-element-wings.mp3',
    stinger: '../assets/audio/week-1/literacy/page-05-element-antennae.mp3',
    abdomen: '../assets/audio/week-1/literacy/page-05-element-abdomen.mp3'
  };
  const PICTURE_LABEL = {
    wings: 'wings',
    antennae: 'antennae',
    stinger: 'a stinger',
    abdomen: 'an abdomen'
  };

  document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('page5-match-board');
    const svg = document.getElementById('page5-match-lines');
    const guide = document.getElementById('page5-guide-line');
    const sources = [...document.querySelectorAll('.page5-part-source')];
    const targets = [...document.querySelectorAll('.page5-word-target')];
    const startLayer = document.getElementById('page5-start');
    const status = document.getElementById('page5-status');
    const completion = document.getElementById('page5-completion');
    const completionVideo = document.getElementById('page5-good-job-video');
    let activeSource = null;
    let activeAudio = null;
    let ready = false;
    let matches = 0;
    let drag = null;
    let previousSlotOrder = '';
    let suppressPictureClickUntil = 0;

    function speakFallback(text) {
      return typeof speakAmericanEnglish === 'function'
        ? speakAmericanEnglish(text)
        : Promise.resolve();
    }

    function stopAudio() {
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    function playAudio(source, fallbackText) {
      stopAudio();
      if (typeof soundEnabled !== 'undefined' && !soundEnabled) return Promise.resolve();
      activeAudio = new Audio(source);
      return new Promise((resolve) => {
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          activeAudio = null;
          resolve();
        };
        const fallback = () => speakFallback(fallbackText).then(finish);
        activeAudio.addEventListener('ended', finish, { once: true });
        activeAudio.addEventListener('error', fallback, { once: true });
        activeAudio.play().catch(fallback);
      });
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

    function pointFromEvent(event) {
      const rect = board.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * 1412 / rect.width, y: (event.clientY - rect.top) * 1114 / rect.height };
    }

    const sourcePoint = (source) => {
      const boardRect = board.getBoundingClientRect();
      const sourceRect = source.getBoundingClientRect();
      return {
        x: (sourceRect.left - boardRect.left + sourceRect.width * Number(source.dataset.anchorX) / 100) * 1412 / boardRect.width,
        y: (sourceRect.top - boardRect.top + sourceRect.height * Number(source.dataset.anchorY) / 100) * 1114 / boardRect.height
      };
    };
    const targetPoint = (target) => ({ x: Number(target.dataset.x), y: Number(target.dataset.y) });

    function arrangeSources() {
      const order = SOURCE_SLOTS.map((_, index) => index);
      for (let index = order.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
      }
      if (order.join(',') === previousSlotOrder) order.push(order.shift());
      sources.forEach((source, index) => {
        const slot = SOURCE_SLOTS[order[index]];
        source.style.left = `${slot.left}%`;
        source.style.top = `${slot.top}%`;
      });
      previousSlotOrder = order.join(',');
    }

    function setGuideEnd(point) {
      if (!activeSource) return;
      const from = sourcePoint(activeSource);
      guide.setAttribute('x1', from.x);
      guide.setAttribute('y1', from.y);
      guide.setAttribute('x2', point.x);
      guide.setAttribute('y2', point.y);
      guide.setAttribute('class', `page5-match-line is-guide ${activeSource.dataset.part}`);
      guide.removeAttribute('hidden');
    }

    function hideGuide() {
      guide.setAttribute('hidden', '');
      guide.setAttribute('class', 'page5-match-line is-guide');
    }

    function selectSource(source) {
      if (!ready || source.classList.contains('is-matched')) return;
      activeSource = source;
      sources.forEach((item) => item.classList.toggle('is-selected', item === source));
      targets.forEach((item) => item.classList.remove('is-selected'));
      const compactTouchLayout = window.matchMedia('(max-width: 700px)').matches
        || window.matchMedia('(pointer: coarse)').matches;
      if (compactTouchLayout) {
        hideGuide();
      } else {
        const from = sourcePoint(source);
        setGuideEnd({ x: 436, y: from.y });
      }
      status.className = 'page5-status';
      status.textContent = `Connect the ${source.dataset.part} picture to its word.`;
    }

    function drawMatchedLine(source, target) {
      const from = sourcePoint(source);
      const to = targetPoint(target);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.setAttribute('class', `page5-match-line ${source.dataset.part}`);
      line.dataset.match = source.dataset.part;
      svg.insertBefore(line, guide);
    }

    function showCompletion() {
      completion.hidden = false;
      completionVideo.currentTime = 0;
      completionVideo.play().catch(() => {});
    }

    function hideCompletion() {
      completionVideo.pause();
      completionVideo.currentTime = 0;
      completion.hidden = true;
    }

    function setReady(enabled) {
      ready = enabled;
      sources.forEach((source) => { source.disabled = !enabled || source.classList.contains('is-matched'); });
      targets.forEach((target) => {
        target.tabIndex = enabled ? 0 : -1;
        target.querySelector('.page5-speaker').disabled = !enabled;
      });
    }

    function attemptMatch(source, target) {
      if (!ready || !source || source.classList.contains('is-matched')) return;
      setGuideEnd(targetPoint(target));
      if (source.dataset.part !== target.dataset.part) {
        target.classList.remove('is-wrong');
        void target.offsetWidth;
        target.classList.add('is-wrong');
        window.setTimeout(() => target.classList.remove('is-wrong'), 520);
        playWrongCue();
        status.className = 'page5-status is-wrong';
        status.textContent = 'That picture does not match this word. Try again!';
        return;
      }

      hideGuide();
      source.classList.remove('is-selected');
      source.classList.add('is-matched');
      source.disabled = true;
      target.classList.remove('is-selected', 'is-wrong');
      target.classList.add('is-matched');
      target.setAttribute('aria-pressed', 'true');
      drawMatchedLine(source, target);
      matches += 1;
      activeSource = null;
      playCorrectCue();
      status.className = 'page5-status is-correct';
      status.textContent = target.dataset.sentence;
      const isComplete = matches === sources.length;
      if (isComplete) setReady(false);
      playAudio(target.dataset.sentenceAudio, target.dataset.sentence).then(() => {
        if (isComplete) showCompletion();
      });
    }

    function resetActivity() {
      stopAudio();
      hideCompletion();
      hideGuide();
      matches = 0;
      activeSource = null;
      sources.forEach((source) => {
        source.classList.remove('is-selected', 'is-matched', 'is-dragging');
        source.disabled = true;
      });
      targets.forEach((target) => {
        target.classList.remove('is-selected', 'is-matched', 'is-wrong');
        target.setAttribute('aria-pressed', 'false');
      });
      svg.querySelectorAll('[data-match]').forEach((line) => line.remove());
      arrangeSources();
      setReady(false);
    }

    function beginActivity() {
      resetActivity();
      startLayer.hidden = true;
      status.className = 'page5-status';
      status.textContent = 'Listen to the directions.';
      playAudio(INTRO_AUDIO, 'Connect the dots. Match each queen bee part to its word.').then(() => {
        setReady(true);
        status.textContent = 'Click or drag a picture to its matching word.';
      });
    }

    sources.forEach((source) => {
      source.addEventListener('click', () => {
        if (Date.now() < suppressPictureClickUntil) return;
        selectSource(source);
        if (ready) playAudio(PICTURE_AUDIO[source.dataset.part], PICTURE_LABEL[source.dataset.part]);
      });
      source.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectSource(source);
          if (ready) playAudio(PICTURE_AUDIO[source.dataset.part], PICTURE_LABEL[source.dataset.part]);
        }
      });
      source.addEventListener('pointerdown', (event) => {
        if (!ready || source.classList.contains('is-matched')) return;
        selectSource(source);
        drag = { source, startX: event.clientX, startY: event.clientY, moved: false, ghost: null };
        source.classList.add('is-dragging');
        source.setPointerCapture(event.pointerId);
      });
      source.addEventListener('pointermove', (event) => {
        if (!drag || drag.source !== source) return;
        setGuideEnd(pointFromEvent(event));
        if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 8) {
          drag.moved = true;
          drag.ghost = source.querySelector('img').cloneNode();
          drag.ghost.className = 'page5-drag-ghost';
          document.body.appendChild(drag.ghost);
        }
        if (drag.ghost) {
          drag.ghost.style.left = `${event.clientX}px`;
          drag.ghost.style.top = `${event.clientY}px`;
        }
      });
      source.addEventListener('pointerup', (event) => {
        if (!drag || drag.source !== source) return;
        suppressPictureClickUntil = drag.moved ? Date.now() + 350 : 0;
        source.classList.remove('is-dragging');
        drag.ghost?.remove();
        const target = document.elementsFromPoint(event.clientX, event.clientY)
          .map((element) => element.closest?.('.page5-word-target'))
          .find(Boolean);
        if (drag.moved && target) attemptMatch(source, target);
        else if (activeSource === source) {
          const compactTouchLayout = window.matchMedia('(max-width: 700px)').matches
            || window.matchMedia('(pointer: coarse)').matches;
          if (compactTouchLayout) hideGuide();
          else {
            const from = sourcePoint(source);
            setGuideEnd({ x: 436, y: from.y });
          }
        }
        drag = null;
      });
      source.addEventListener('pointercancel', () => {
        if (!drag || drag.source !== source) return;
        source.classList.remove('is-dragging');
        drag.ghost?.remove();
        drag = null;
      });
    });

    targets.forEach((target) => {
      target.addEventListener('click', (event) => {
        if (event.target.closest('.page5-speaker')) return;
        if (activeSource) attemptMatch(activeSource, target);
        else {
          target.classList.add('is-selected');
          status.textContent = 'Choose or drag a picture from the right first.';
        }
      });
      target.addEventListener('keydown', (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.page5-speaker')) {
          event.preventDefault();
          target.click();
        }
      });
      target.querySelector('.page5-speaker').addEventListener('click', (event) => {
        event.stopPropagation();
        if (ready) playAudio(target.dataset.wordAudio, target.dataset.part);
      });
    });

    board.addEventListener('pointermove', (event) => {
      if (activeSource && !drag && ready) setGuideEnd(pointFromEvent(event));
    });
    document.getElementById('page5-start-button').addEventListener('click', beginActivity);
    document.getElementById('page5-restart').addEventListener('click', beginActivity);
    document.getElementById('page5-completion-close').addEventListener('click', hideCompletion);
    document.getElementById('page5-completion-try-again').addEventListener('click', beginActivity);
    resetActivity();
  });
})();
