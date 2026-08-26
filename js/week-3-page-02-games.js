(() => {
  const cleanAll = (cleanups) => () => cleanups.splice(0).forEach((cleanup) => {
    try { cleanup(); } catch (_) {}
  });

  const centerInside = (element, target) => {
    const item = element.getBoundingClientRect();
    const zone = target.getBoundingClientRect();
    const x = item.left + item.width / 2;
    const y = item.top + item.height / 2;
    return x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
  };

  const droppedInside = (element, target, event) => {
    const zone = target.getBoundingClientRect();
    const pointerInside = Number.isFinite(event?.clientX) && Number.isFinite(event?.clientY)
      && event.clientX >= zone.left && event.clientX <= zone.right
      && event.clientY >= zone.top && event.clientY <= zone.bottom;
    return pointerInside || centerInside(element, target);
  };

  const placeAt = (element, left, top) => {
    element.style.left = `${left}%`;
    element.style.top = `${top}%`;
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.transform = 'translate(-50%, -50%)';
  };

  function makeDraggable(element, container, onDrop) {
    let pointerId = null;
    let offsetX = 0;
    let offsetY = 0;

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
      element.style.left = `${Math.max(0, Math.min(maxX, event.clientX - frame.left - offsetX))}px`;
      element.style.top = `${Math.max(0, Math.min(maxY, event.clientY - frame.top - offsetY))}px`;
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
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      element.classList.remove('is-dragging');
    };
  }

  function attachBeeCursor(game, cursor, cleanups) {
    const move = (event) => {
      const rect = game.getBoundingClientRect();
      cursor.style.left = `${event.clientX - rect.left}px`;
      cursor.style.top = `${event.clientY - rect.top}px`;
      cursor.hidden = false;
    };
    const hide = () => { cursor.hidden = true; };
    game.addEventListener('pointermove', move);
    game.addEventListener('pointerleave', hide);
    cleanups.push(() => game.removeEventListener('pointermove', move));
    cleanups.push(() => game.removeEventListener('pointerleave', hide));
  }

  function plantGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const steps = [
      { key: 'seed', label: 'seed', sprite: 0, home: [10, 25] },
      { key: 'water', label: 'water', sprite: 1, home: [30, 25] },
      { key: 'sun', label: 'sun', sprite: 2, home: [50, 25] },
      { key: 'love', label: 'love', sprite: 3, home: [70, 25] },
      { key: 'bee', label: 'bee', sprite: 4, home: [90, 25] }
    ];
    let next = 0;
    stage.innerHTML = `
      <div class="w3-game w3-plant-game">
        <p class="w3-game-hint">Drag the seed into the soil. Then add water, sun, love, and the bee.</p>
        <div class="w3-plant-drop-zone" aria-label="Soil planting area"></div>
        <span class="w3-plant-sprite w3-growing-plant" data-sprite="0" aria-hidden="true" hidden></span>
        <span class="w3-plant-sprite w3-finish-bee" data-sprite="4" aria-hidden="true" hidden></span>
        ${steps.map((step, index) => `<button class="w3-plant-sprite w3-plant-item item-${step.key}" data-step="${index}" data-sprite="${step.sprite}" type="button" aria-label="Drag ${step.label} to the plant"></button>`).join('')}
      </div>`;
    const game = stage.querySelector('.w3-plant-game');
    const zone = stage.querySelector('.w3-plant-drop-zone');
    const plant = stage.querySelector('.w3-growing-plant');
    const finishBee = stage.querySelector('.w3-finish-bee');

    steps.forEach((step, index) => {
      const item = stage.querySelector(`[data-step="${index}"]`);
      placeAt(item, step.home[0], step.home[1]);
      cleanups.push(makeDraggable(item, game, (_element, event) => {
        if (!droppedInside(item, zone, event)) {
          placeAt(item, step.home[0], step.home[1]);
          setFeedback(`Drag the ${step.label} to the soil in the middle.`, true);
          return;
        }
        if (index !== next) {
          placeAt(item, step.home[0], step.home[1]);
          item.classList.remove('is-wrong');
          void item.offsetWidth;
          item.classList.add('is-wrong');
          setFeedback(`First use the ${steps[next].label}.`, true);
          return;
        }
        item.disabled = true;
        item.hidden = true;
        plant.hidden = false;
        plant.dataset.sprite = String([0, 5, 7, 6, 8][index]);
        plant.classList.remove('is-growing');
        void plant.offsetWidth;
        plant.classList.add('is-growing');
        if (step.key === 'bee') finishBee.hidden = false;
        next += 1;
        setProgress(next, steps.length);
        const feedback = [
          'The seed is tucked into the soil!',
          'Water helped a small sprout appear!',
          'Sunlight helped the leaves grow!',
          'Love helped a flower bud appear!',
          'The bee visited—and the flower bloomed!'
        ][index];
        setFeedback(feedback);
        if (next === steps.length) window.setTimeout(finishActivity, 650);
      }));
    });
    return cleanAll(cleanups);
  }

  function flowersGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const positions = [[11, 64.5], [27, 64.5], [43, 64.5], [58, 64.5], [74, 64.5], [89, 64.5]];
    let jumps = 0;
    let picked = 0;
    let jumping = false;
    stage.innerHTML = `
      <div class="w3-game w3-flowers-game">
        <p class="w3-game-hint">Press Jump. Each flower grows after the bee leaves it!</p>
        ${positions.map((position, index) => `<button class="w3-flower-sprite w3-line-flower flower-${index}" data-flower="${index}" data-sprite="1" type="button" aria-label="Flower ${index + 1}" disabled></button>`).join('')}
        <span class="w3-flower-sprite w3-flower-hive" data-sprite="3" aria-label="Beehive"></span>
        <img class="w3-jumping-bee" src="../assets/images/week-3/literacy/page-02/game-elements/bee-cursor-v4.png?v=5" alt="" aria-hidden="true">
        <button class="w3-jump-button" type="button">Jump! 🐝</button>
        <div class="w3-vase-zone" hidden>
          <span class="w3-flower-sprite w3-flower-vase" data-sprite="4" aria-hidden="true"></span>
          <div class="w3-vase-bouquet" aria-hidden="true"></div>
        </div>
      </div>`;
    const game = stage.querySelector('.w3-flowers-game');
    const bee = stage.querySelector('.w3-jumping-bee');
    const jumpButton = stage.querySelector('.w3-jump-button');
    const flowers = [...stage.querySelectorAll('.w3-line-flower')];
    const vaseZone = stage.querySelector('.w3-vase-zone');
    const bouquet = stage.querySelector('.w3-vase-bouquet');
    flowers.forEach((flower, index) => placeAt(flower, positions[index][0], positions[index][1]));
    placeAt(bee, positions[0][0], positions[0][1] - 23);

    const layoutBouquet = () => {
      const stems = [...bouquet.children];
      const center = (stems.length - 1) / 2;
      stems.forEach((stem, slot) => {
        stem.style.setProperty('--bouquet-x', `${(slot - center) * 10}%`);
        stem.style.setProperty('--bouquet-rotate', `${(slot - center) * 8}deg`);
      });
    };

    const jump = () => {
      if (jumping || jumps >= 6) return;
      jumping = true;
      jumpButton.disabled = true;
      flowers[jumps].dataset.sprite = '2';
      flowers[jumps].classList.add('is-tall');
      const destination = jumps < 5 ? [positions[jumps + 1][0], positions[jumps + 1][1] - 23] : [92, 38];
      bee.classList.add('is-jumping');
      window.requestAnimationFrame(() => placeAt(bee, destination[0], destination[1]));
      jumps += 1;
      setProgress(jumps, 12);
      setFeedback(jumps < 6 ? `Jump ${jumps} of 6! The flower grew taller.` : 'The bee reached the hive! Now click all six tall flowers.');
      const timer = window.setTimeout(() => {
        bee.classList.remove('is-jumping');
        jumping = false;
        if (jumps < 6) jumpButton.disabled = false;
        else {
          jumpButton.hidden = true;
          vaseZone.hidden = false;
          flowers.forEach((flower) => { flower.disabled = false; });
        }
      }, 590);
      cleanups.push(() => window.clearTimeout(timer));
    };
    jumpButton.addEventListener('click', jump);
    cleanups.push(() => jumpButton.removeEventListener('click', jump));

    flowers.forEach((flower, index) => {
      const collect = () => {
        if (jumps < 6 || flower.classList.contains('is-picked')) return;
        flower.classList.add('is-picked');
        flower.disabled = true;
        const stem = document.createElement('span');
        stem.className = 'w3-flower-sprite w3-vase-stem';
        stem.dataset.sprite = '2';
        bouquet.appendChild(stem);
        layoutBouquet();
        picked += 1;
        setProgress(6 + picked, 12);
        setFeedback(`${picked} of 6 flowers are in the vase.`);
        if (picked === 6) window.setTimeout(finishActivity, 550);
      };
      flower.addEventListener('click', collect);
      cleanups.push(() => flower.removeEventListener('click', collect));
    });
    return cleanAll(cleanups);
  }

  function treesGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const spots = [[28, 27], [47, 20], [67, 28], [24, 48], [50, 43], [73, 49]];
    let pollinated = 0;
    stage.innerHTML = `
      <div class="w3-game w3-trees-game">
        <p class="w3-game-hint">Move the bee cursor and click every apple blossom.</p>
        <img class="w3-bee-cursor" src="../assets/images/week-3/literacy/page-02/game-elements/bee-cursor-v4.png?v=4" alt="" aria-hidden="true" hidden>
        ${spots.map((spot, index) => `<button class="w3-tree-sprite w3-apple-spot blossom-${index}" data-sprite="0" type="button" aria-label="Pollinate apple blossoms ${index + 1}"></button>`).join('')}
      </div>`;
    const game = stage.querySelector('.w3-trees-game');
    const cursor = stage.querySelector('.w3-bee-cursor');
    attachBeeCursor(game, cursor, cleanups);
    [...stage.querySelectorAll('.w3-apple-spot')].forEach((button, index) => {
      placeAt(button, spots[index][0], spots[index][1]);
      const pollinate = () => {
        if (button.classList.contains('is-apple')) return;
        button.dataset.sprite = '1';
        button.classList.add('is-apple');
        button.disabled = true;
        pollinated += 1;
        setProgress(pollinated, spots.length);
        setFeedback(`The blossom became an apple! ${pollinated} of ${spots.length}.`);
        if (pollinated === spots.length) window.setTimeout(finishActivity, 600);
      };
      button.addEventListener('click', pollinate);
      cleanups.push(() => button.removeEventListener('click', pollinate));
    });
    return cleanAll(cleanups);
  }

  const fruitItems = [
    { name: 'apple', sprite: 0, correct: true }, { name: 'mango', sprite: 1, correct: true },
    { name: 'strawberry', sprite: 2, correct: true }, { name: 'grapes', sprite: 3, correct: true },
    { name: 'orange', sprite: 4, correct: true }, { name: 'watermelon', sprite: 5, correct: true },
    { name: 'pumpkin', sprite: 7, correct: false }, { name: 'eggplant', sprite: 8, correct: false },
    { name: 'carrot', sprite: 9, correct: false }, { name: 'corn', sprite: 10, correct: false }
  ];

  function fruitsGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const homes = [[9, 22], [25, 22], [41, 22], [57, 22], [73, 22], [89, 22], [18, 49], [39, 49], [61, 49], [82, 49]];
    const basketSlots = [[46, 71.5], [50, 70], [54, 71.5], [44.5, 77], [50, 77], [55.5, 77]];
    const shuffle = (items) => {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
      }
      return copy;
    };
    const fruits = shuffle(fruitItems.filter((item) => item.correct));
    const vegetables = shuffle(fruitItems.filter((item) => !item.correct));
    const topFruitCount = Math.random() < 0.5 ? 3 : 4;
    const topVegetableCount = 6 - topFruitCount;
    const arrangedItems = [
      ...shuffle([...fruits.slice(0, topFruitCount), ...vegetables.slice(0, topVegetableCount)]),
      ...shuffle([...fruits.slice(topFruitCount), ...vegetables.slice(topVegetableCount)])
    ];
    let sorted = 0;
    stage.innerHTML = `
      <div class="w3-game w3-fruits-game">
        <p class="w3-game-hint">Drag only the fruits into the basket.</p>
        ${arrangedItems.map((item, index) => `<button class="w3-produce-sprite w3-sort-item" data-item="${index}" data-sprite="${item.sprite}" type="button" aria-label="Drag ${item.name}"></button>`).join('')}
        <span class="w3-produce-sprite w3-fruit-basket" data-sprite="13" aria-label="Fruit basket"></span>
        <span class="w3-produce-sprite w3-fruit-basket-front" data-sprite="13" aria-hidden="true"></span>
      </div>`;
    const game = stage.querySelector('.w3-fruits-game');
    const basket = stage.querySelector('.w3-fruit-basket');
    const basketFront = stage.querySelector('.w3-fruit-basket-front');
    placeAt(basket, 50, 77);
    placeAt(basketFront, 50, 77);
    arrangedItems.forEach((item, index) => {
      const button = stage.querySelector(`[data-item="${index}"]`);
      placeAt(button, homes[index][0], homes[index][1]);
      cleanups.push(makeDraggable(button, game, (_element, event) => {
        if (!droppedInside(button, basket, event)) {
          placeAt(button, homes[index][0], homes[index][1]);
          setFeedback('Drop the fruit inside the basket.', true);
          return;
        }
        if (!item.correct) {
          placeAt(button, homes[index][0], homes[index][1]);
          basket.classList.remove('is-wrong');
          basketFront.classList.remove('is-wrong');
          void basket.offsetWidth;
          basket.classList.add('is-wrong');
          basketFront.classList.add('is-wrong');
          setFeedback(`${item.name[0].toUpperCase() + item.name.slice(1)} is a vegetable. Try a fruit.`, true);
          const timer = window.setTimeout(() => {
            basket.classList.remove('is-wrong');
            basketFront.classList.remove('is-wrong');
          }, 430);
          cleanups.push(() => window.clearTimeout(timer));
          return;
        }
        button.disabled = true;
        button.classList.add('is-in-basket');
        placeAt(button, basketSlots[sorted][0], basketSlots[sorted][1]);
        sorted += 1;
        setProgress(sorted, 6);
        setFeedback(`${item.name[0].toUpperCase() + item.name.slice(1)} is in the basket! ${sorted} of 6 fruits.`);
        if (sorted === 6) window.setTimeout(finishActivity, 650);
      }));
    });
    return cleanAll(cleanups);
  }

  const fallingItems = [
    { name: 'pumpkin', sprite: 7, vegetable: true }, { name: 'eggplant', sprite: 8, vegetable: true },
    { name: 'carrot', sprite: 9, vegetable: true }, { name: 'corn', sprite: 10, vegetable: true },
    { name: 'cabbage', sprite: 11, vegetable: true }, { name: 'pepper', sprite: 12, vegetable: true },
    { name: 'mango', sprite: 1, vegetable: false }, { name: 'strawberry', sprite: 2, vegetable: false },
    { name: 'orange', sprite: 4, vegetable: false }, { name: 'peach', sprite: 6, vegetable: false }
  ];

  function vegetablesGame({ stage, setProgress, setFeedback, finishActivity }) {
    const cleanups = [];
    const target = 10;
    let caught = 0;
    const active = new Set();
    const lanes = [14, 26, 38, 50, 62, 74, 86];
    let laneQueue = [];
    let queue = [...fallingItems];
    for (let i = queue.length - 1; i > 0; i -= 1) {
      const swap = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[swap]] = [queue[swap], queue[i]];
    }
    stage.innerHTML = `
      <div class="w3-game w3-vegetables-game">
        <p class="w3-game-hint">Use the bee cursor. Click vegetables—not fruits!</p>
        <img class="w3-bee-cursor" src="../assets/images/week-3/literacy/page-02/game-elements/bee-cursor-v4.png?v=4" alt="" aria-hidden="true" hidden>
      </div>`;
    const game = stage.querySelector('.w3-vegetables-game');
    const cursor = stage.querySelector('.w3-bee-cursor');
    attachBeeCursor(game, cursor, cleanups);

    const spawn = () => {
      if (caught >= target) return;
      const item = queue.shift() || fallingItems[Math.floor(Math.random() * fallingItems.length)];
      if (!item) return;
      if (!laneQueue.length) {
        laneQueue = [...lanes];
        for (let index = laneQueue.length - 1; index > 0; index -= 1) {
          const swap = Math.floor(Math.random() * (index + 1));
          [laneQueue[index], laneQueue[swap]] = [laneQueue[swap], laneQueue[index]];
        }
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w3-falling-produce';
      button.setAttribute('aria-label', item.name);
      button.style.left = `${laneQueue.shift()}%`;
      button.style.setProperty('--fall-duration', `${4.8 + Math.random() * 2.2}s`);
      button.innerHTML = `<span class="w3-produce-sprite" data-sprite="${item.sprite}" aria-hidden="true"></span>`;
      game.appendChild(button);
      active.add(button);
      const remove = () => { active.delete(button); button.remove(); };
      const click = () => {
        if (item.vegetable) {
          caught += 1;
          button.classList.add('is-caught');
          button.disabled = true;
          setProgress(caught, target);
          setFeedback(`You popped the ${item.name}! ${caught} of ${target} vegetables.`);
          const timer = window.setTimeout(remove, 560);
          cleanups.push(() => window.clearTimeout(timer));
          if (caught === target) window.setTimeout(finishActivity, 600);
          return;
        }
        const sprite = button.querySelector('.w3-produce-sprite');
        sprite.classList.remove('is-wrong');
        void sprite.offsetWidth;
        sprite.classList.add('is-wrong');
        setFeedback(`${item.name[0].toUpperCase() + item.name.slice(1)} is a fruit. Catch vegetables.`, true);
      };
      button.addEventListener('click', click);
      const finishFall = (event) => {
        if (event.target === button && event.animationName === 'w3-produce-fall') remove();
      };
      button.addEventListener('animationend', finishFall);
      cleanups.push(() => button.removeEventListener('animationend', finishFall));
    };
    spawn();
    const spawner = window.setInterval(spawn, 720);
    cleanups.push(() => window.clearInterval(spawner));
    cleanups.push(() => active.forEach((button) => button.remove()));
    return cleanAll(cleanups);
  }

  window.LevelBWeek3Page2Games = {
    plants: plantGame,
    flowers: flowersGame,
    trees: treesGame,
    fruits: fruitsGame,
    vegetables: vegetablesGame
  };
})();
