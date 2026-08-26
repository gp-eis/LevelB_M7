(() => {
  const params = new URLSearchParams(location.search);
  const requestedWeek = Math.max(1, Math.min(4, Number(params.get('week')) || 1));
  const weekTitles = {
    1: 'Do you keep bees?',
    2: 'When can I see bees?',
    3: 'Why do we need bees?',
    4: 'I am Lorenzo Langstroth.'
  };
  const weekImages = {
    1: 'week-1-beekeeper.png',
    2: 'week-2-bee-work.png',
    3: 'week-3-pollination.png',
    4: 'week-4-langstroth-hive.png'
  };
  const weekColors = { 1: 'pink', 2: 'blue', 3: 'green', 4: 'orange' };
  const games = [
    { key:'memory', label:'Memory Game', icon:'🧠', iconImage:'game-memory.webp', hint:'Find the matching pictures!' },
    { key:'spin-the-wheel', label:'Spin the Wheel', icon:'🎡', iconImage:'game-wheel.webp', hint:'Spin, stop, and flip a card!' },
    { key:'matching', label:'Picture Match', icon:'🧩', iconImage:'game-matching.webp', hint:'Pick the picture for the sentence!' },
    { key:'pick-the-right-one', label:'Pick the Right One', icon:'☝️', iconImage:'game-pick.webp', hint:'Listen and choose the answer!' },
    { key:'phonics', label:'Phonics', icon:'🔤', hint:'Letter games for this week!' }
  ];
  const weekOneGamePages = {
    memory: 'week-1-memory.html',
    'spin-the-wheel': 'week-1-spin-the-wheel.html',
    matching: 'week-1-picture-match.html'
  };
  const weekTwoGamePages = {
    memory: 'week-2-memory.html',
    'spin-the-wheel': 'week-2-spin-the-wheel.html',
    matching: 'week-2-picture-match.html'
  };

  function gameHref(week, game) {
    if (game.key === 'phonics') {
      return week === 1 ? 'phonics.html?from=games' : `week-${week}/phonics.html?from=games`;
    }
    if (week === 1 && weekOneGamePages[game.key]) return weekOneGamePages[game.key];
    if (week === 2 && weekTwoGamePages[game.key]) return weekTwoGamePages[game.key];
    return `placeholder.html?week=${week}&game=${game.key}`;
  }

  function gameIcon(game) {
    return game.iconImage
      ? `<img class="icon-img" src="../assets/images/ui/${game.iconImage}" alt="">`
      : `<span class="emoji" aria-hidden="true">${game.icon}</span>`;
  }

  const hub = document.querySelector('#games-app');
  const gameApp = document.querySelector('#game-app');

  if (hub) {
    hub.className = 'page games-hub';
    hub.innerHTML = `
      <div class="floaties" aria-hidden="true">
        <span style="top:10%;left:5%;">🎮</span><span style="top:25%;left:90%;">🐝</span>
        <span style="top:65%;left:3%;">⭐</span><span style="top:80%;left:93%;">🍯</span>
      </div>
      <a class="back-link" id="games-week-home" href="../week-1.html#card-games">⬅️ Week 1 Home</a>
      <header class="center" style="margin-top:20px;">
        <h1 class="big-title hub-title-with-icon"><img class="hub-title-icon" src="../assets/images/ui/games-3d.webp" alt="">Games</h1>
        <p class="subtitle" id="hub-subtitle">Pick a week, then choose a game!</p>
      </header>
      <section id="week-picker" aria-label="Choose a week">
        <div class="week-picker">
          ${[1,2,3,4].map(week => `
            <button class="week-pick-btn ${weekColors[week]}" type="button" data-week="${week}" aria-label="Week ${week} — ${weekTitles[week]}">
              <span class="week-pick-btn__inner">
                <span class="week-pick-btn__icon" aria-hidden="true"><img class="week-pick-btn__icon-img" src="../assets/images/ui/weekly/${weekImages[week]}" alt=""></span>
                <span class="week-pick-btn__label">Week ${week}</span>
                <span class="week-pick-btn__hint">${weekTitles[week]}</span>
              </span>
            </button>`).join('')}
        </div>
      </section>
      ${[1,2,3,4].map(week => `
        <section class="week-games-panel" id="week-${week}-games" data-week="${week}" hidden aria-label="Week ${week} games">
          <div class="week-games-header">
            <h2 class="week-heading"><span class="week-number">${week}</span>${weekTitles[week]}</h2>
            <button class="pill-btn orange back-weeks" type="button">⬅️ All Weeks</button>
          </div>
          <nav class="card-grid" aria-label="Week ${week} games">
            ${games.map(game => `<a class="nav-card" href="${gameHref(week, game)}">${gameIcon(game)}<span class="label">${game.label}</span><span class="hint">${game.hint}</span></a>`).join('')}
          </nav>
        </section>`).join('')}`;

    const weekPicker = document.getElementById('week-picker');
    const weekPanels = [...document.querySelectorAll('.week-games-panel')];
    const subtitle = document.getElementById('hub-subtitle');
    const weekHome = document.getElementById('games-week-home');

    function showWeek(week, updateUrl = true) {
      weekPicker.hidden = true;
      weekPanels.forEach(panel => { panel.hidden = panel.dataset.week !== String(week); });
      subtitle.textContent = `Week ${week} — ${weekTitles[week]}`;
      weekHome.href = `../week-${week}.html#card-games`;
      weekHome.textContent = `⬅️ Week ${week} Home`;
      if (updateUrl) {
        const url = new URL(location.href);
        url.searchParams.set('week', week);
        history.replaceState(null, '', url);
      }
    }

    function showWeekPicker(updateUrl = true) {
      weekPicker.hidden = false;
      weekPanels.forEach(panel => { panel.hidden = true; });
      subtitle.textContent = 'Pick a week, then choose a game!';
      if (updateUrl) {
        const url = new URL(location.href);
        url.searchParams.delete('week');
        history.replaceState(null, '', url);
      }
    }

    document.querySelectorAll('.week-pick-btn').forEach(button => {
      button.addEventListener('click', () => showWeek(Number(button.dataset.week)));
    });
    document.querySelectorAll('.back-weeks').forEach(button => button.addEventListener('click', () => showWeekPicker()));
    if (params.has('week')) showWeek(requestedWeek, false);
    else showWeekPicker(false);
  }

  if (gameApp) {
    const week = requestedWeek;
    const game = games.find(item => item.key === params.get('game')) || games[0];
    document.title = `${game.label} — Week ${week} — Beekeeper`;
    gameApp.className = 'page';
    gameApp.innerHTML = `
      <div class="floaties" aria-hidden="true"><span style="top:10%;left:4%;">${game.icon}</span><span style="top:75%;left:93%;">🐝</span></div>
      <a class="back-link" href="index.html?week=${week}">⬅️ All Games</a>
      <header class="center" style="margin-top:16px;">
        <h1 class="big-title page-title-with-icon" style="font-size:2.4rem;">${gameIcon(game)}${game.label}</h1>
        <p class="subtitle">Week ${week} — ${weekTitles[week]}</p>
      </header>
      <section class="game-placeholder-board">
        <h2>Game Coming Soon</h2>
        <div class="placeholder-stage"><div class="placeholder-stage__inner"><span class="placeholder-stage__icon" aria-hidden="true">🐝</span><strong>${game.label}</strong><span>This Week ${week} activity is ready for its lesson content.</span></div></div>
      </section>`;
  }
})();
