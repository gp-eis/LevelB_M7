(() => {
  const cleanupGroup = (cleanups) => () => {
    cleanups.splice(0).forEach((cleanup) => {
      try { cleanup(); } catch (_) {}
    });
  };

  function showSuccessAfterPause(cleanups, finishActivity) {
    const timer = window.setTimeout(finishActivity, 1000);
    cleanups.push(() => window.clearTimeout(timer));
  }

  const centerInside = (element, target) => {
    const item = element.getBoundingClientRect();
    const zone = target.getBoundingClientRect();
    const x = item.left + item.width / 2;
    const y = item.top + item.height / 2;
    return x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
  };

  function placeAt(element, left, top) {
    element.style.left = `${left}%`;
    element.style.top = `${top}%`;
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.transform = 'translate(-50%, -50%)';
  }

  function makeDraggable(element, container, onDrop, options = {}) {
    let pointerId = null;
    let offsetX = 0;
    let offsetY = 0;
    const axis = options.axis || 'both';

    const down = (event) => {
      if (pointerId !== null || element.disabled) return;
      pointerId = event.pointerId;
      const item = element.getBoundingClientRect();
      const frame = container.getBoundingClientRect();
      element.style.left = `${item.left - frame.left}px`;
      element.style.top = `${item.top - frame.top}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
      element.style.transform = 'none';
      offsetX = event.clientX - item.left;
      offsetY = event.clientY - item.top;
      element.classList.add('is-dragging');
      element.setPointerCapture?.(pointerId);
      event.preventDefault();
    };

    const move = (event) => {
      if (event.pointerId !== pointerId) return;
      const frame = container.getBoundingClientRect();
      const maxX = Math.max(0, frame.width - element.offsetWidth);
      const maxY = Math.max(0, frame.height - element.offsetHeight);
      if (axis !== 'y') {
        element.style.left = `${Math.max(0, Math.min(maxX, event.clientX - frame.left - offsetX))}px`;
      }
      if (axis !== 'x') {
        element.style.top = `${Math.max(0, Math.min(maxY, event.clientY - frame.top - offsetY))}px`;
      }
      event.preventDefault();
    };

    const up = (event) => {
      if (event.pointerId !== pointerId) return;
      try { element.releasePointerCapture?.(pointerId); } catch (_) {}
      pointerId = null;
      element.classList.remove('is-dragging');
      onDrop?.(element, event);
      event.preventDefault();
    };

    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    return () => {
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
    };
  }

  function seasonGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const used = new Set();
    stage.innerHTML = `
      <div class="w2-game w2-seasons-game">
        <p class="w2-game-hint">Drag each new bee to a season and watch its face change!</p>
        <div class="w2-season-zones">
          ${seasons.map((season, index) => `<div class="w2-season-zone" data-season="${index}"><strong>${season}</strong></div>`).join('')}
        </div>
        <div class="w2-bee-home" aria-hidden="true">Drag me!</div>
      </div>`;
    const game = stage.querySelector('.w2-seasons-game');

    const spawnBee = () => {
      const bee = document.createElement('button');
      bee.type = 'button';
      bee.className = 'w2-sprite w2-bee-sprite w2-season-bee';
      bee.dataset.sprite = '0';
      bee.setAttribute('aria-label', 'Drag the bee to a season');
      game.appendChild(bee);
      placeAt(bee, 50, 78);
      cleanups.push(makeDraggable(bee, game, () => {
        const gameRect = game.getBoundingClientRect();
        const beeRect = bee.getBoundingClientRect();
        const centerX = beeRect.left + beeRect.width / 2 - gameRect.left;
        const seasonIndex = Math.max(0, Math.min(3, Math.floor(centerX / (gameRect.width / 4))));
        if (used.has(seasonIndex)) {
          placeAt(bee, 50, 78);
          setFeedback(`${seasons[seasonIndex]} already has a bee. Try another season.`, true);
          return;
        }
        used.add(seasonIndex);
        bee.dataset.sprite = String(seasonIndex + 1);
        bee.classList.add('is-placed');
        bee.disabled = true;
        placeAt(bee, seasonIndex * 25 + 12.5, 58);
        setProgress(used.size, 4);
        setFeedback(`${seasons[seasonIndex]} changes the bee's expression! ${used.size} of 4.`);
        if (used.size === 4) showSuccessAfterPause(cleanups, finishActivity);
        else spawnBee();
      }));
    };

    spawnBee();
    return cleanupGroup(cleanups);
  }

  function springGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const flowers = ['Sunflower', 'Rose', 'Lily', 'Tulip'];
    const collected = new Set();
    let carrying = null;
    stage.innerHTML = `
      <div class="w2-game w2-spring-game">
        <p class="w2-game-hint">Visit a flower, then carry it to the vase.</p>
        ${flowers.map((flower, index) => `<div class="w2-spring-target target-${index}" data-flower="${index}" aria-label="${flower} patch"><strong>${flower}</strong></div>`).join('')}
        <div class="w2-spring-vase-zone" aria-label="Flower vase">
          <span class="w2-sprite w2-spring-object-sprite w2-spring-vase" data-sprite="4"></span>
          <div class="w2-vase-flowers"></div>
        </div>
        <button class="w2-sprite w2-bee-sprite w2-spring-bee" data-sprite="0" type="button" aria-label="Drag the bee to collect flowers"></button>
      </div>`;
    const game = stage.querySelector('.w2-spring-game');
    const bee = stage.querySelector('.w2-spring-bee');
    const vase = stage.querySelector('.w2-spring-vase-zone');
    const vaseFlowers = stage.querySelector('.w2-vase-flowers');
    const targets = [...stage.querySelectorAll('.w2-spring-target')];
    placeAt(bee, 50, 48);

    const resetBee = () => placeAt(bee, 50, 48);
    cleanups.push(makeDraggable(bee, game, () => {
      if (carrying !== null) {
        if (!centerInside(bee, vase)) {
          setFeedback(`Carry the ${flowers[carrying].toLowerCase()} to the vase.`, true);
          return;
        }
        const flower = document.createElement('span');
        flower.className = 'w2-sprite w2-spring-object-sprite w2-vase-flower';
        flower.dataset.sprite = String(carrying);
        vaseFlowers.appendChild(flower);
        collected.add(carrying);
        targets[carrying].classList.add('is-picked');
        bee.querySelector('.w2-carried-flower')?.remove();
        carrying = null;
        setProgress(collected.size, 4);
        setFeedback(`Beautiful! ${collected.size} of 4 flowers are in the vase.`);
        resetBee();
        if (collected.size === 4) showSuccessAfterPause(cleanups, finishActivity);
        return;
      }

      const target = targets.find((item) => !collected.has(Number(item.dataset.flower)) && centerInside(bee, item));
      if (!target) {
        resetBee();
        setFeedback('Fly to one of the flowers around the garden.', true);
        return;
      }
      carrying = Number(target.dataset.flower);
      target.classList.add('is-visited');
      const flowerPop = document.createElement('span');
      flowerPop.className = 'w2-sprite w2-spring-object-sprite w2-picked-flower-pop';
      flowerPop.dataset.sprite = String(carrying);
      target.appendChild(flowerPop);
      const flower = document.createElement('span');
      flower.className = 'w2-sprite w2-spring-object-sprite w2-carried-flower';
      flower.dataset.sprite = String(carrying);
      bee.appendChild(flower);
      setFeedback(`The bee picked up the ${flowers[carrying].toLowerCase()}! Now fly to the vase.`);
    }));

    return cleanupGroup(cleanups);
  }

  function summerGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const labels = ['Snow', 'Ice cube', 'Snowman', 'Igloo'];
    let found = 0;
    stage.innerHTML = `
      <div class="w2-game w2-summer-game">
        <p class="w2-game-hint">Use the bee cursor. Find what does not belong in summer.</p>
        <span class="w2-sprite w2-bee-sprite w2-bee-cursor" data-sprite="0" aria-hidden="true" hidden></span>
        ${labels.map((label, index) => `<button class="w2-sprite w2-summer-object-sprite w2-summer-object object-${index}" data-sprite="${index}" type="button" aria-label="${label}"></button>`).join('')}
      </div>`;
    const game = stage.querySelector('.w2-summer-game');
    const cursor = stage.querySelector('.w2-bee-cursor');
    const moveCursor = (event) => {
      const rect = game.getBoundingClientRect();
      cursor.style.left = `${event.clientX - rect.left}px`;
      cursor.style.top = `${event.clientY - rect.top}px`;
      cursor.hidden = false;
    };
    const hideCursor = () => { cursor.hidden = true; };
    game.addEventListener('pointermove', moveCursor);
    game.addEventListener('pointerleave', hideCursor);
    cleanups.push(() => game.removeEventListener('pointermove', moveCursor));
    cleanups.push(() => game.removeEventListener('pointerleave', hideCursor));

    stage.querySelectorAll('.w2-summer-object').forEach((button) => {
      const click = () => {
        if (button.classList.contains('is-crossed')) return;
        button.classList.add('is-crossed');
        button.disabled = true;
        found += 1;
        setProgress(found, 4);
        setFeedback(`Correct! ${button.getAttribute('aria-label')} does not belong in summer. ${found} of 4.`);
        if (found === 4) showSuccessAfterPause(cleanups, finishActivity);
      };
      button.addEventListener('click', click);
      cleanups.push(() => button.removeEventListener('click', click));
    });

    return cleanupGroup(cleanups);
  }

  function fallGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const leaves = new Set();
    let caught = 0;
    stage.innerHTML = `
      <div class="w2-game w2-fall-game">
        <p class="w2-game-hint">Move the bee basket and catch 10 falling leaves!</p>
        <button class="w2-sprite w2-fall-object-sprite w2-fall-basket" data-sprite="0" type="button" aria-label="Move the basket"></button>
      </div>`;
    const game = stage.querySelector('.w2-fall-game');
    const basket = stage.querySelector('.w2-fall-basket');
    placeAt(basket, 50, 84);
    cleanups.push(makeDraggable(basket, game, () => {}, { axis: 'x' }));

    const spawnLeaf = () => {
      if (caught >= 10) return;
      const leaf = document.createElement('span');
      leaf.className = 'w2-sprite w2-fall-object-sprite w2-falling-leaf';
      leaf.dataset.sprite = String(1 + Math.floor(Math.random() * 3));
      const item = {
        element: leaf,
        x: 12 + Math.random() * Math.max(20, game.clientWidth - 90),
        y: -85,
        speed: 3.2 + Math.random() * 2.1,
        drift: Math.random() * Math.PI * 2,
        turn: Math.random() > .5 ? 2.2 : -2.2
      };
      leaf._fallData = item;
      game.appendChild(leaf);
      leaves.add(leaf);
    };

    const tick = window.setInterval(() => {
      const basketRect = basket.getBoundingClientRect();
      leaves.forEach((leaf) => {
        if (caught >= 10) return;
        const item = leaf._fallData;
        item.y += item.speed;
        item.drift += .06;
        item.x += Math.sin(item.drift) * .7;
        leaf.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.y * item.turn}deg)`;
        const leafRect = leaf.getBoundingClientRect();
        const touching = leafRect.left < basketRect.right && leafRect.right > basketRect.left && leafRect.bottom > basketRect.top + 14 && leafRect.top < basketRect.bottom;
        if (touching) {
          leaf.remove();
          leaves.delete(leaf);
          caught += 1;
          setProgress(caught, 10);
          setFeedback(`Great catch! ${caught} of 10 leaves.`);
          if (caught === 10) showSuccessAfterPause(cleanups, finishActivity);
        } else if (item.y > game.clientHeight + 90) {
          leaf.remove();
          leaves.delete(leaf);
        }
      });
    }, 34);
    const spawner = window.setInterval(spawnLeaf, 520);
    spawnLeaf();
    cleanups.push(() => window.clearInterval(tick));
    cleanups.push(() => window.clearInterval(spawner));
    cleanups.push(() => {
      leaves.forEach((leaf) => leaf.remove());
      leaves.clear();
    });
    return cleanupGroup(cleanups);
  }

  function winterGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const homes = [[8, 25], [22, 12], [78, 12], [92, 25], [8, 72], [22, 88], [92, 72]];
    const clusterSlots = [[40, 40], [60, 40], [34, 55], [66, 55], [40, 70], [60, 70], [50, 82]];
    let warmed = 0;
    stage.innerHTML = `
      <div class="w2-game w2-winter-game">
        <p class="w2-game-hint">Bring all 7 shivering bees close to their queen.</p>
        <div class="w2-winter-cluster-zone" aria-label="Warm bee cluster">
          <img class="w2-queen-bee" src="../assets/images/week-2/literacy/page-02/game-elements/queen-bee.png" alt="Queen bee">
        </div>
        ${homes.map((position, index) => `<button class="w2-sprite w2-bee-sprite w2-winter-worker" data-sprite="4" data-worker="${index}" type="button" aria-label="Shivering worker bee ${index + 1}" style="--home-x:${position[0]};--home-y:${position[1]}"></button>`).join('')}
      </div>`;
    const game = stage.querySelector('.w2-winter-game');
    const zone = stage.querySelector('.w2-winter-cluster-zone');
    const workers = [...stage.querySelectorAll('.w2-winter-worker')];

    workers.forEach((worker, index) => {
      placeAt(worker, homes[index][0], homes[index][1]);
      cleanups.push(makeDraggable(worker, game, () => {
        if (!centerInside(worker, zone)) {
          placeAt(worker, homes[index][0], homes[index][1]);
          setFeedback('Move this cold bee closer to the queen.', true);
          return;
        }
        worker.dataset.sprite = '0';
        worker.classList.add('is-warm');
        worker.disabled = true;
        placeAt(worker, clusterSlots[warmed][0], clusterSlots[warmed][1]);
        warmed += 1;
        setProgress(warmed, 7);
        setFeedback(`${warmed} of 7 bees are warm in the cluster!`);
        if (warmed === 7) showSuccessAfterPause(cleanups, finishActivity);
      }));
    });

    return cleanupGroup(cleanups);
  }

  window.LevelBWeek2Page2Games = {
    seasons: seasonGame,
    spring: springGame,
    summer: summerGame,
    fall: fallGame,
    winter: winterGame
  };
})();
