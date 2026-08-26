(() => {
  const params = new URLSearchParams(location.search);
  const pageWeekMatch = location.pathname.match(/\/week-(\d+)\//i);
  const week = Math.max(1, Math.min(4, Number(document.body.dataset.week || pageWeekMatch?.[1] || params.get('week')) || 1));
  const isNestedHub = /\/games\/week-\d+\/phonics\.html$/i.test(location.pathname);
  const gamesRoot = isNestedHub ? '../' : '';
  const siteRoot = isNestedHub ? '../../' : '../';
  const origin = params.get('from') === 'phonics' ? 'phonics' : 'games';
  const hubHref = week === 1 ? `phonics.html?from=${origin}` : `week-${week}/phonics.html?from=${origin}`;
  const lessonHref = `${siteRoot}phonics/week-${week}.html`;
  const gamesHref = `${gamesRoot}index.html?week=${week}`;
  const phonicsIconBase = `${siteRoot}assets/images/ui/phonics-games/`;
  const cameFromPhonics = origin === 'phonics';
  const weekTitles = {
    1: 'Do you keep bees?',
    2: 'What do bees do?',
    3: 'Why do we need bees?',
    4: 'I am Lorenzo Langstroth.'
  };
  const findWordHints = {
    1: 'Find dog, log, and fog.',
    2: 'Find cop, mop, and shop.',
    3: 'Find cot, dot, and pot.'
  };
  const findGame = week <= 3
    ? { key:'find-word', label:'Find the Word', icon:'\u{1F50E}', iconImage:'find-letter-3d.png', hint:findWordHints[week] }
    : { key:'find-letter', label:'Find the Letter', icon:'\u{1F50E}', iconImage:'find-letter-3d.png', hint:'Find every target letter.' };
  const games = [
    findGame,
    { key:'build-word', label:'Build the Word', icon:'\u{1F9F1}', iconImage:'build-word-3d.png', hint:'Use letter tiles to build the Week words.' },
    { key:'letter-maze', label:'Letter Maze', icon:'\u{1F36F}', iconImage:'letter-maze-3d.png', hint:'Guide the target letter through the maze.' },
    { key:'picture-match', label:'Picture Match', icon:'\u{1F5BC}\uFE0F', iconImage:'picture-match-3d.png', hint:'Listen and match the correct pictures.' }
  ];
  const weekTwoHints = {
    'find-word': 'Find cop, mop, and shop.',
    'build-word': 'Build cop, mop, and shop.',
    'letter-maze': 'Guide “op” through the maze.',
    'picture-match': 'Match cop, mop, and shop.'
  };
  if (week === 2) games.forEach(game => { game.hint = weekTwoHints[game.key]; });
  const weekThreeHints = {
    'find-word': 'Find cot, dot, and pot.',
    'build-word': 'Build cot, dot, and pot.',
    'letter-maze': 'Guide “ot” through the maze.',
    'picture-match': 'Match cot, dot, and pot.'
  };
  if (week === 3) games.forEach(game => { game.hint = weekThreeHints[game.key]; });
  const iconMarkup=game=>`<img class="icon-img" src="${phonicsIconBase}${game.iconImage}" alt="">`;
  const weekGamePages = {
    1: {
      'find-word': 'phonics-find-word.html',
      'build-word': 'phonics-build.html',
      'letter-maze': 'phonics-maze.html',
      'picture-match': 'phonics-picture-match.html'
    },
    2: {
      'find-word': '../phonics-find-word.html?week=2',
      'build-word': 'phonics-build.html',
      'letter-maze': 'phonics-maze.html',
      'picture-match': 'phonics-picture-match.html'
    },
    3: {
      'find-word': '../phonics-find-word.html?week=3',
      'build-word': 'phonics-build.html',
      'letter-maze': 'phonics-maze.html',
      'picture-match': 'phonics-picture-match.html'
    }
  };
  const gameHref = game => {
    const gamePage = weekGamePages[week]?.[game.key];
    if (gamePage) {
      const separator = gamePage.includes('?') ? '&' : '?';
      return `${week === 1 ? gamesRoot : ''}${gamePage}${separator}from=${origin}`;
    }
    return `${gamesRoot}phonics-placeholder.html?week=${week}&game=${game.key}&from=${origin}`;
  };

  const hub = document.querySelector('#phonics-games-app');
  if (hub) {
    document.title = `Week ${week} Phonics Games \u2014 Beekeeper`;
    hub.className = 'page phonics-games-hub';
    hub.innerHTML = `
      <div class="floaties" aria-hidden="true"><span style="top:10%;left:4%;">🔤</span><span style="top:72%;left:92%;">✨</span></div>
      <a class="back-link" href="${cameFromPhonics ? lessonHref : gamesHref}">\u2B05\uFE0F ${cameFromPhonics ? 'Phonics Lesson' : `Week ${week} Games`}</a>
      <header class="center phonics-games-heading">
        <h1 class="big-title page-title-with-icon"><img class="page-title-icon" src="${siteRoot}assets/images/ui/literacy-3d.webp" alt="">Phonics</h1>
        <p class="subtitle">Week ${week} \u2014 pick a phonics game!</p>
      </header>
      <nav class="card-grid phonics-game-grid" aria-label="Week ${week} phonics games">
        ${games.map(game => `<a class="nav-card" href="${gameHref(game)}">${iconMarkup(game)}<span class="label">${game.label}</span><span class="hint">${game.hint}</span></a>`).join('')}
      </nav>`;
  }

  const gameApp = document.querySelector('#phonics-game-app');
  if (gameApp) {
    const game = games.find(item => item.key === params.get('game')) || games[0];
    document.title = `${game.label} \u2014 Week ${week} \u2014 Beekeeper`;
    gameApp.className = 'page phonics-game-placeholder';
    gameApp.innerHTML = `
      <div class="floaties" aria-hidden="true"><span style="top:10%;left:4%;">🔤</span><span style="top:72%;left:92%;">✨</span></div>
      <a class="back-link" href="${hubHref}">\u2B05\uFE0F Phonics Games</a>
      <header class="center" style="margin-top:16px;"><h1 class="big-title page-title-with-icon" style="font-size:2.4rem;"><img class="page-title-icon" src="${phonicsIconBase}${game.iconImage}" alt="">${game.label}</h1><p class="subtitle">Week ${week} \u2014 ${weekTitles[week]}</p></header>
      <section class="game-placeholder-board"><h2>Game Coming Soon</h2><div class="placeholder-stage"><div class="placeholder-stage__inner"><span class="placeholder-stage__icon" aria-hidden="true">\u{1F524}</span><strong>${game.label}</strong><span>This Week ${week} phonics activity is ready for its lesson content.</span></div></div></section>`;
  }
})();
