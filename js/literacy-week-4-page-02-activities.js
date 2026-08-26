(() => {
  const video = document.getElementById('dialogue-video');
  const triggers = [...document.querySelectorAll('[data-topic][data-video]')];
  if (!video || !triggers.length) return;

  const flashcardsLink = document.querySelector('a[href*="flashcards.html"]');
  if (flashcardsLink) {
    flashcardsLink.href = 'flashcards.html?week=4&return=week-4-page-02.html%23lesson-focus&from=2';
  }

  const ACTIVITIES = {
    book: {
      icon: '📘', title: 'Wrote a book',
      instruction: 'Drag the ideas to Lorenzo in order.',
      sentence: 'Lorenzo Langstroth wrote a book about bees.'
    },
    help: {
      icon: '🥽', title: 'Helped beekeepers',
      instruction: 'Choose the right clothes to dress Coover safely.',
      sentence: 'Lorenzo Langstroth helped beekeepers.'
    },
    kept: {
      icon: '🐝', title: 'Kept bees',
      instruction: 'Complete each stop, then drag Coover to the next dot.',
      sentence: 'Lorenzo Langstroth kept bees.'
    },
    loved: {
      icon: '💛', title: 'Loved bees',
      instruction: 'Use the bee cursor to choose three actions that help bees.',
      sentence: 'Lorenzo Langstroth loved bees.'
    },
    hive: {
      icon: '🏠', title: 'Made the modern beehive',
      instruction: 'Drag the 3D hive blocks into the build area in order.',
      sentence: 'Lorenzo Langstroth made the modern beehive.'
    }
  };

  const videoShell = document.createElement('div');
  videoShell.className = 'w4-video-shell';
  video.parentNode.insertBefore(videoShell, video);
  videoShell.appendChild(video);

  const videoCover = document.createElement('button');
  videoCover.className = 'w4-video-cover';
  videoCover.type = 'button';
  videoCover.disabled = true;
  videoCover.innerHTML = '<span aria-hidden="true">🔒</span><small>Choose an activity below.</small>';
  videoShell.appendChild(videoCover);
  video.pause();
  video.removeAttribute('src');
  video.querySelectorAll('source').forEach((source) => source.remove());
  video.load();

  let videoReady = false;
  const showVideoCover = () => { videoCover.hidden = false; };
  const hideVideoCover = () => { videoCover.hidden = true; };
  video.addEventListener('playing', hideVideoCover);
  video.addEventListener('pause', () => { if (videoReady) showVideoCover(); });
  video.addEventListener('ended', showVideoCover);
  videoCover.addEventListener('click', () => {
    if (!videoReady) return;
    video.play().catch(showVideoCover);
  });

  const overlay = document.createElement('div');
  overlay.className = 'w4-p2-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="w4-p2-dialog" role="dialog" aria-modal="true" aria-labelledby="w4-p2-title">
      <header class="w4-p2-header">
        <span class="w4-p2-icon" aria-hidden="true"></span>
        <div class="w4-p2-heading">
          <h2 id="w4-p2-title"></h2>
          <p></p>
        </div>
        <div class="w4-p2-actions">
          <button class="w4-p2-skip" type="button">Skip to Video ▶</button>
          <button class="w4-p2-close" type="button" aria-label="Close activity">×</button>
        </div>
      </header>
      <div class="w4-p2-progress" aria-hidden="true"><span></span></div>
      <div class="w4-p2-stage"></div>
      <div class="w4-p2-feedback" role="status" aria-live="polite"></div>
      <div class="w4-p2-footer"><button class="w4-p2-restart" type="button">↻ Start Again</button></div>
      <div class="w4-p2-success" hidden>
        <div class="w4-p2-success-card">
          <span aria-hidden="true">⭐</span>
          <h3>Great job!</h3>
          <p></p>
          <button class="w4-p2-watch" type="button">Watch Video ▶</button>
        </div>
      </div>
    </section>`;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.w4-p2-dialog');
  const icon = overlay.querySelector('.w4-p2-icon');
  const heading = overlay.querySelector('.w4-p2-heading h2');
  const instruction = overlay.querySelector('.w4-p2-heading p');
  const progress = overlay.querySelector('.w4-p2-progress span');
  const stage = overlay.querySelector('.w4-p2-stage');
  const feedback = overlay.querySelector('.w4-p2-feedback');
  const closeButton = overlay.querySelector('.w4-p2-close');
  const skipButton = overlay.querySelector('.w4-p2-skip');
  const restartButton = overlay.querySelector('.w4-p2-restart');
  const success = overlay.querySelector('.w4-p2-success');
  const successText = success.querySelector('p');
  const watchButton = success.querySelector('.w4-p2-watch');

  let activeKey = '';
  let activeTrigger = null;
  let cleanupCursor = null;

  const setProgress = (value, total) => {
    progress.style.width = `${Math.max(0, Math.min(100, value / total * 100))}%`;
  };

  const setFeedback = (message, wrong = false) => {
    feedback.textContent = message;
    feedback.classList.toggle('is-wrong', wrong);
  };

  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  };

  const shake = (element, message = 'Try again.') => {
    element.classList.remove('w4-shake');
    void element.offsetWidth;
    element.classList.add('w4-shake');
    setFeedback(message, true);
  };

  function finishActivity() {
    const definition = ACTIVITIES[activeKey];
    if (!definition) return;
    setProgress(1, 1);
    successText.textContent = definition.sentence;
    watchButton.textContent = `Watch “${definition.title}” ▶`;
    success.hidden = false;
  }

  function closeActivity() {
    cleanupCursor?.();
    cleanupCursor = null;
    overlay.hidden = true;
    success.hidden = true;
    document.body.style.overflow = '';
    activeTrigger?.focus();
  }

  function playActiveVideo() {
    if (!activeTrigger) return;
    videoReady = true;
    video.pause();
    video.src = activeTrigger.dataset.video;
    video.setAttribute('aria-label', `${activeTrigger.dataset.line} video`);
    videoCover.disabled = false;
    videoCover.innerHTML = `<span aria-hidden="true">▶</span><small>${activeTrigger.dataset.line}</small>`;
    video.load();
    closeActivity();
    video.scrollIntoView({ behavior: 'smooth', block: 'center' });
    video.play().catch(showVideoCover);
  }

  function wireDropItem(item, target, onDrop) {
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let moved = false;

    const reset = () => {
      item.classList.remove('w4-dragging');
      item.style.transform = '';
    };

    item.addEventListener('pointerdown', (event) => {
      if (item.disabled) return;
      startX = event.clientX;
      startY = event.clientY;
      dx = 0;
      dy = 0;
      moved = false;
      item.setPointerCapture(event.pointerId);
      item.classList.add('w4-dragging');
    });

    item.addEventListener('pointermove', (event) => {
      if (!item.hasPointerCapture(event.pointerId)) return;
      dx = event.clientX - startX;
      dy = event.clientY - startY;
      moved ||= Math.hypot(dx, dy) > 8;
      item.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
    });

    item.addEventListener('pointerup', (event) => {
      if (!item.hasPointerCapture(event.pointerId)) return;
      item.releasePointerCapture(event.pointerId);
      const targetRect = target.getBoundingClientRect();
      const inside = event.clientX >= targetRect.left && event.clientX <= targetRect.right && event.clientY >= targetRect.top && event.clientY <= targetRect.bottom;
      reset();
      if (moved) onDrop(inside);
    });

    item.addEventListener('pointercancel', reset);
    item.addEventListener('click', () => {
      if (!moved && !item.disabled) onDrop(true);
      moved = false;
    });
  }

  function renderBook() {
    const steps = [
      { label: 'Think', cell: 0 },
      { label: 'Write', cell: 1 },
      { label: 'Add Pages', cell: 2 },
      { label: 'Book', cell: 3 }
    ];
    let next = 0;
    stage.innerHTML = `
      <div class="w4-book-game">
        <div class="w4-book-scene" data-state="0" role="img" aria-label="Lorenzo looks troubled at his desk"></div>
        <div>
          <p class="w4-game-hint">Drag <strong>Think</strong> to Lorenzo first.</p>
          <div class="w4-book-tray">
            ${steps.map((item, index) => `<button class="w4-book-item" type="button" data-step="${index}"><span class="w4-object-sprite" data-cell="${item.cell}" aria-hidden="true"></span>${item.label}</button>`).join('')}
          </div>
        </div>
      </div>`;
    const scene = stage.querySelector('.w4-book-scene');
    const hint = stage.querySelector('.w4-game-hint');
    const buttons = [...stage.querySelectorAll('.w4-book-item')];
    buttons.forEach((button) => {
      wireDropItem(button, scene, (inside) => {
        if (!inside) return shake(button, 'Drop the item onto Lorenzo.');
        const chosen = Number(button.dataset.step);
        if (chosen !== next) return shake(button, `Find ${steps[next].label} first.`);
        button.classList.add('is-used');
        button.disabled = true;
        next += 1;
        scene.dataset.state = String(next);
        scene.setAttribute('aria-label', ['Lorenzo looks troubled at his desk', 'Lorenzo has an idea', 'Lorenzo holds a pen', 'Lorenzo writes on pages', 'Lorenzo proudly holds a book'][next]);
        setProgress(next, steps.length);
        if (next === steps.length) {
          hint.textContent = 'Lorenzo finished his book!';
          setFeedback('You helped Lorenzo think, write, add pages, and make a book.');
          window.setTimeout(finishActivity, 650);
        } else {
          hint.innerHTML = `Now drag <strong>${steps[next].label}</strong> to Lorenzo.`;
          setFeedback(`Step ${next} complete!`);
        }
      });
    });
  }

  function renderHelp() {
    const groups = [
      [{ label: 'Bee suit', file: 'bee-suit.png', correct: true }, { label: 'Soccer uniform', file: 'soccer-uniform.png' }],
      [{ label: 'Beekeeper veil', file: 'beekeeper-veil.png', correct: true }, { label: 'Beanie', file: 'beanie.png' }],
      [{ label: 'Leather gloves', file: 'leather-gloves.png', correct: true }, { label: 'Winter gloves', file: 'winter-gloves.png' }],
      [{ label: 'Work boots', file: 'work-boots.png', correct: true }, { label: 'Sneakers', file: 'sneakers.png' }]
    ];
    let group = 0;
    stage.innerHTML = `
      <div class="w4-dress-game">
        <div class="w4-coover-state" data-state="0" role="img" aria-label="Coover wearing a white shirt and white shorts"></div>
        <section class="w4-dress-panel"><h3></h3><div class="w4-dress-choices"></div></section>
      </div>`;
    const coover = stage.querySelector('.w4-coover-state');
    const panelTitle = stage.querySelector('.w4-dress-panel h3');
    const choices = stage.querySelector('.w4-dress-choices');

    const showGroup = () => {
      const labels = ['Choose Coover’s suit.', 'Choose Coover’s head protection.', 'Choose Coover’s gloves.', 'Choose Coover’s shoes.'];
      panelTitle.textContent = labels[group];
      choices.innerHTML = groups[group].map((item) => `
        <button class="w4-dress-choice" type="button" data-correct="${item.correct === true}">
          <img class="w4-dress-image" src="../assets/images/week-4/literacy/page-02/game-elements/dress-up-items-v2/${item.file}" alt="">${item.label}
        </button>`).join('');
      choices.querySelectorAll('.w4-dress-choice').forEach((button) => {
        button.addEventListener('click', () => {
          if (button.dataset.correct !== 'true') return shake(button, 'That item is not part of Coover’s beekeeper outfit.');
          group += 1;
          coover.dataset.state = String(group);
          coover.setAttribute('aria-label', `Coover in beekeeper outfit stage ${group} of 4`);
          setProgress(group, groups.length);
          setFeedback(`Great choice! Stage ${group} of 4 complete.`);
          if (group === groups.length) {
            panelTitle.textContent = 'Coover is ready to help the beekeepers!';
            choices.innerHTML = '';
            window.setTimeout(finishActivity, 650);
          } else {
            window.setTimeout(showGroup, 350);
          }
        });
      });
    };
    showGroup();
  }

  function wireGesture(element, onEnd, onMove = null) {
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let minDy = 0;
    let maxDy = 0;
    element.addEventListener('pointerdown', (event) => {
      if (element.disabled) return;
      startX = event.clientX;
      startY = event.clientY;
      dx = 0;
      dy = 0;
      minDy = 0;
      maxDy = 0;
      element.setPointerCapture(event.pointerId);
      element.classList.add('w4-dragging');
    });
    element.addEventListener('pointermove', (event) => {
      if (!element.hasPointerCapture(event.pointerId)) return;
      dx = event.clientX - startX;
      dy = event.clientY - startY;
      minDy = Math.min(minDy, dy);
      maxDy = Math.max(maxDy, dy);
      element.style.transform = `translate(${dx}px, ${dy}px)`;
      onMove?.({ dx, dy, minDy, maxDy });
    });
    element.addEventListener('pointerup', (event) => {
      if (!element.hasPointerCapture(event.pointerId)) return;
      element.releasePointerCapture(event.pointerId);
      element.classList.remove('w4-dragging');
      const accepted = onEnd({ dx, dy, minDy, maxDy });
      if (!accepted) element.style.transform = '';
    });
    element.addEventListener('pointercancel', () => {
      element.classList.remove('w4-dragging');
      element.style.transform = '';
    });
  }

  function renderKept() {
    const positions = [12.5, 37.5, 62.5, 87.5];
    let stop = 0;
    let actionDone = false;
    stage.innerHTML = `
      <div class="w4-journey">
        <p class="w4-game-hint">Stop 1: click the bee suit.</p>
        <div class="w4-journey-canvas">
          <div class="w4-journey-scenes" role="img" aria-label="Four apiary journey scenes"></div>
          <span class="w4-kept-guide w4-kept-lid-guide" aria-hidden="true"></span>
          <span class="w4-kept-guide w4-kept-frame-guide is-top-target" aria-hidden="true">&#8593;</span>
          <span class="w4-kept-guide w4-kept-frame-guide is-bottom-target" aria-hidden="true">&#8595;</span>
          <button class="w4-kept-object w4-kept-suit" type="button" aria-label="Put on the bee suit"></button>
          <button class="w4-kept-object w4-kept-lid" type="button" aria-label="Drag the actual beehive lid" hidden>
            <img src="../assets/images/week-4/literacy/page-02/game-elements/kept-bees-lid-v2.png" alt="">
          </button>
          <button class="w4-kept-object w4-kept-frame" type="button" aria-label="Drag the honey frame" hidden>
            <img src="../assets/images/week-4/literacy/page-02/game-elements/kept-bees-honey-frame-v2.png" alt="">
          </button>
        </div>
        <div class="w4-journey-track" aria-label="Journey path">
          <div class="w4-journey-line"></div>
          ${positions.map((left, index) => `<span class="w4-journey-dot${index === 0 ? ' is-current' : ''}" style="left:${left}%" aria-label="Stop ${index + 1}"></span>`).join('')}
          <button class="w4-journey-coover" type="button" aria-label="Drag Coover along the path" style="left:${positions[0]}%"></button>
        </div>
      </div>`;
    const journey = stage.querySelector('.w4-journey');
    const coover = stage.querySelector('.w4-journey-coover');
    const dots = [...stage.querySelectorAll('.w4-journey-dot')];
    const hint = stage.querySelector('.w4-game-hint');
    const suit = stage.querySelector('.w4-kept-suit');
    const lid = stage.querySelector('.w4-kept-lid');
    const frame = stage.querySelector('.w4-kept-frame');
    const lidGuide = stage.querySelector('.w4-kept-lid-guide');
    const frameTopGuide = stage.querySelector('.w4-kept-frame-guide.is-top-target');
    const frameBottomGuide = stage.querySelector('.w4-kept-frame-guide.is-bottom-target');
    let frameReachedTop = false;

    const isOnGuide = (element, guide) => {
      const itemRect = element.getBoundingClientRect();
      const guideRect = guide.getBoundingClientRect();
      const horizontalOverlap = Math.max(0, Math.min(itemRect.right, guideRect.right) - Math.max(itemRect.left, guideRect.left));
      const verticalOverlap = Math.max(0, Math.min(itemRect.bottom, guideRect.bottom) - Math.max(itemRect.top, guideRect.top));
      return horizontalOverlap >= Math.min(itemRect.width, guideRect.width) * .45
        && verticalOverlap >= Math.min(itemRect.height, guideRect.height) * .45;
    };

    const hideGuides = () => {
      lidGuide.classList.remove('is-visible', 'is-ground-target', 'is-hive-target', 'is-reached');
      frameTopGuide.classList.remove('is-visible', 'is-reached');
      frameBottomGuide.classList.remove('is-visible', 'is-reached');
      lid.classList.remove('is-selected');
      frame.classList.remove('is-selected');
    };

    const completeAction = (message) => {
      actionDone = true;
      setProgress(stop + 1, 4);
      setFeedback(message);
      if (stop === 3) {
        window.setTimeout(finishActivity, 700);
      } else {
        hint.textContent = `Great! Drag Coover to stop ${stop + 2}.`;
      }
    };

    const prepareStop = () => {
      actionDone = false;
      frameReachedTop = false;
      hideGuides();
      suit.hidden = stop !== 0;
      suit.disabled = stop !== 0;
      frame.hidden = stop !== 2;
      frame.disabled = stop !== 2;
      frame.classList.remove('is-height-ready');

      lid.hidden = stop === 0;
      lid.classList.remove('is-on-hive', 'is-left-ground', 'is-right-ground', 'is-closed', 'is-height-ready');
      if (stop === 1) {
        lid.disabled = false;
        lid.classList.add('is-on-hive');
      } else if (stop === 2) {
        lid.disabled = true;
        lid.classList.add('is-left-ground');
      } else if (stop === 3) {
        lid.disabled = false;
        lid.classList.add('is-right-ground');
      }
    };

    suit.addEventListener('click', () => {
      if (stop !== 0 || actionDone) return;
      coover.classList.add('is-suited');
      suit.disabled = true;
      completeAction('Coover is wearing his bee suit.');
    });

    lid.addEventListener('pointerdown', () => {
      if (lid.disabled || actionDone || (stop !== 1 && stop !== 3)) return;
      lid.classList.add('is-selected');
      lidGuide.classList.remove('is-ground-target', 'is-hive-target', 'is-reached');
      lidGuide.classList.add(stop === 1 ? 'is-ground-target' : 'is-hive-target', 'is-visible');
      setFeedback(stop === 1 ? 'Follow the red box: lift the lid, then place it on the ground.' : 'Follow the red box: place the lid squarely on top of the hive.');
    });

    wireGesture(lid, ({ dy, minDy }) => {
      const opening = stop === 1;
      const closing = stop === 3;
      const overTarget = isOnGuide(lid, lidGuide);
      const correct = opening ? minDy < -45 && overTarget : closing ? minDy < -70 && overTarget : false;
      lid.style.transform = '';
      lid.classList.remove('is-height-ready');
      lidGuide.classList.remove('is-reached');
      if (!correct) {
        shake(lid, opening ? 'Lift the lid first, then place it inside the red ground box.' : 'Place the lid inside the red box on top of the hive.');
        return false;
      }
      lid.disabled = true;
      hideGuides();
      if (opening) {
        lid.classList.remove('is-on-hive');
        lid.classList.add('is-left-ground');
        completeAction('The actual lid is now on the ground. The hive is open.');
      } else {
        lid.classList.remove('is-right-ground');
        lid.classList.add('is-closed');
        completeAction('The actual lid is back on the hive. It is closed safely.');
      }
      return true;
    }, ({ minDy }) => {
      const liftedEnough = stop === 1 ? minDy < -45 : stop === 3 ? minDy < -70 : false;
      const overTarget = isOnGuide(lid, lidGuide);
      lid.classList.toggle('is-height-ready', liftedEnough);
      lidGuide.classList.toggle('is-reached', liftedEnough && overTarget);
    });

    frame.addEventListener('pointerdown', () => {
      if (frame.disabled || actionDone || stop !== 2) return;
      frameReachedTop = false;
      frame.classList.add('is-selected');
      frameTopGuide.classList.add('is-visible');
      frameBottomGuide.classList.add('is-visible');
      frameTopGuide.classList.remove('is-reached');
      frameBottomGuide.classList.remove('is-reached');
      setFeedback('Drag the frame to the upper red box, then return it to the lower red box.');
    });

    wireGesture(frame, ({ dy, minDy }) => {
      const returnedToBottom = isOnGuide(frame, frameBottomGuide);
      const correct = stop === 2 && frameReachedTop && returnedToBottom;
      frame.style.transform = '';
      frame.classList.remove('is-height-ready');
      frameTopGuide.classList.remove('is-reached');
      frameBottomGuide.classList.remove('is-reached');
      if (!correct) {
        shake(frame, 'Move the frame into the upper red box, wait for green, then return it to the lower red box.');
        return false;
      }
      frame.disabled = true;
      hideGuides();
      completeAction('The honey frame was checked and returned to the hive.');
      return true;
    }, ({ minDy }) => {
      if (stop !== 2) return;
      const reachedHeight = minDy < -45 && isOnGuide(frame, frameTopGuide);
      if (reachedHeight && !frameReachedTop) {
        frameReachedTop = true;
        setFeedback('Green means high enough! Now return the frame to the lower red box.');
      }
      frame.classList.toggle('is-height-ready', frameReachedTop);
      frameTopGuide.classList.toggle('is-reached', frameReachedTop);
      frameBottomGuide.classList.toggle('is-reached', frameReachedTop && isOnGuide(frame, frameBottomGuide));
    });

    let startX = 0;
    let baseLeft = positions[0];
    coover.addEventListener('pointerdown', (event) => {
      startX = event.clientX;
      baseLeft = positions[stop];
      coover.setPointerCapture(event.pointerId);
      coover.classList.add('w4-dragging');
    });
    coover.addEventListener('pointermove', (event) => {
      if (!coover.hasPointerCapture(event.pointerId)) return;
      const width = stage.querySelector('.w4-journey-track').getBoundingClientRect().width;
      const nextLeft = Math.max(positions[stop], Math.min(positions[Math.min(stop + 1, 3)], baseLeft + (event.clientX - startX) / width * 100));
      coover.style.left = `${nextLeft}%`;
    });
    coover.addEventListener('pointerup', (event) => {
      if (!coover.hasPointerCapture(event.pointerId)) return;
      coover.releasePointerCapture(event.pointerId);
      coover.classList.remove('w4-dragging');
      const currentLeft = Number.parseFloat(coover.style.left);
      if (stop < 3 && actionDone && currentLeft >= positions[stop + 1] - 7) {
        stop += 1;
        coover.style.left = `${positions[stop]}%`;
        dots.forEach((dot, index) => dot.classList.toggle('is-current', index === stop));
        hint.textContent = ['Click the bee suit.', 'Lift the lid, then place it on the ground.', 'Pull the honey frame up high, then lower it back.', 'Drag the lid upward to close the hive.'][stop];
        prepareStop();
      } else {
        coover.style.left = `${positions[stop]}%`;
        if (!actionDone) shake(journey, 'Complete this stop before moving Coover.');
        else if (stop < 3) setFeedback(`Drag Coover all the way to dot ${stop + 2}.`, true);
      }
    });
    prepareStop();
  }

  function renderLoved() {
    const scenes = [
      { label: 'Protect hives', correct: true },
      { label: 'Plant flowers', correct: true },
      { label: 'Give water', correct: true },
      { label: 'Leave trash', correct: false },
      { label: 'Swat bees', correct: false },
      { label: 'Burn flowers', correct: false }
    ];
    let found = 0;
    const arrangedScenes = shuffle(scenes);
    stage.innerHTML = `
      <div class="w4-love-game">
        <p class="w4-game-hint">Choose the three scenes that are good for bees.</p>
        <div class="w4-love-grid">
          ${arrangedScenes.map((scene) => {
            const cell = scenes.indexOf(scene);
            return `<button class="w4-love-card" type="button" data-correct="${scene.correct}" data-index="${cell}"><span class="w4-love-image" data-cell="${cell}" aria-hidden="true"></span><span class="w4-love-label">${scene.label}</span></button>`;
          }).join('')}
        </div>
      </div>`;
    const game = stage.querySelector('.w4-love-game');
    const beeCursor = document.createElement('span');
    beeCursor.className = 'w4-bee-cursor';
    beeCursor.textContent = '🐝';
    beeCursor.hidden = true;
    document.body.appendChild(beeCursor);
    const moveBee = (event) => {
      beeCursor.hidden = false;
      beeCursor.style.left = `${event.clientX}px`;
      beeCursor.style.top = `${event.clientY}px`;
    };
    const hideBee = () => { beeCursor.hidden = true; };
    game.addEventListener('pointermove', moveBee);
    game.addEventListener('pointerleave', hideBee);
    cleanupCursor = () => {
      game.removeEventListener('pointermove', moveBee);
      game.removeEventListener('pointerleave', hideBee);
      beeCursor.remove();
    };
    stage.querySelectorAll('.w4-love-card').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.correct !== 'true') return shake(button, 'That action is not good for bees. Choose another scene.');
        if (button.classList.contains('is-good')) return;
        button.classList.add('is-good');
        button.disabled = true;
        found += 1;
        setProgress(found, 3);
        setFeedback(`${found} of 3 bee-friendly actions found!`);
        if (found === 3) window.setTimeout(finishActivity, 650);
      });
    });
  }

  function renderHive() {
    const names = ['Hive base', 'Lower bee box', 'Honey box', 'Roof'];
    let next = 0;
    stage.innerHTML = `
      <div class="w4-hive-game">
        <div class="w4-hive-build" aria-label="Area for building the modern beehive"><span class="w4-hive-progress" data-state="0" hidden aria-hidden="true"></span></div>
        <div>
          <p class="w4-game-hint">Start with the hive base.</p>
          <div class="w4-hive-tray">
            ${[2, 0, 3, 1].map((piece) => `<button class="w4-hive-piece" type="button" data-piece="${piece}" aria-label="${names[piece]}"></button>`).join('')}
          </div>
        </div>
      </div>`;
    const build = stage.querySelector('.w4-hive-build');
    const builtHive = stage.querySelector('.w4-hive-progress');
    const hint = stage.querySelector('.w4-game-hint');
    stage.querySelectorAll('.w4-hive-piece').forEach((piece) => {
      wireDropItem(piece, build, (inside) => {
        if (!inside) return shake(piece, 'Drop the block into the build area.');
        const chosen = Number(piece.dataset.piece);
        if (chosen !== next) return shake(piece, `Build the ${names[next].toLowerCase()} next.`);
        builtHive.hidden = false;
        builtHive.dataset.state = String(chosen);
        builtHive.classList.remove('w4-hive-progress');
        void builtHive.offsetWidth;
        builtHive.classList.add('w4-hive-progress');
        piece.classList.add('is-used');
        piece.disabled = true;
        next += 1;
        setProgress(next, 4);
        if (next === 4) {
          hint.textContent = 'The modern beehive is complete!';
          setFeedback('Every 3D block is in the correct order.');
          window.setTimeout(finishActivity, 700);
        } else {
          hint.textContent = `Next: ${names[next]}.`;
          setFeedback(`${names[chosen]} added.`);
        }
      });
    });
  }

  function renderActivity() {
    cleanupCursor?.();
    cleanupCursor = null;
    feedback.textContent = '';
    feedback.classList.remove('is-wrong');
    success.hidden = true;
    setProgress(0, 1);
    if (activeKey === 'book') renderBook();
    if (activeKey === 'help') renderHelp();
    if (activeKey === 'kept') renderKept();
    if (activeKey === 'loved') renderLoved();
    if (activeKey === 'hive') renderHive();
  }

  function openActivity(trigger) {
    const definition = ACTIVITIES[trigger.dataset.topic];
    if (!definition) return;
    activeKey = trigger.dataset.topic;
    activeTrigger = trigger;
    dialog.dataset.activity = activeKey;
    icon.textContent = definition.icon;
    heading.textContent = definition.title;
    instruction.textContent = definition.instruction;
    video.pause();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    renderActivity();
    closeButton.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openActivity(trigger);
    }, true);
  });

  closeButton.addEventListener('click', closeActivity);
  skipButton.addEventListener('click', playActiveVideo);
  watchButton.addEventListener('click', playActiveVideo);
  restartButton.addEventListener('click', renderActivity);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeActivity(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !overlay.hidden) closeActivity(); });
  dialog.addEventListener('click', (event) => event.stopPropagation());
})();
