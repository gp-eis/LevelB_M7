(() => {
  const params = new URLSearchParams(location.search);
  const week = Math.max(1,Math.min(4,Number(document.body.dataset.week || params.get('week')) || 1));
  const allowedTracks = ['literacy','reading','phonics','games','tpr','flashcards'];
  const requestedTrack = document.body.dataset.track || params.get('track');
  const track = allowedTracks.includes(requestedTrack) ? requestedTrack : 'literacy';
  const pageCounts = { literacy:6, reading:2, phonics:1, games:1, tpr:1, flashcards:1 };
  const pageCount = pageCounts[track];
  const page = Math.max(1,Math.min(pageCount,Number(document.body.dataset.page || params.get('page')) || 1));
  const labels = { literacy:'Literacy', reading:'Reading', phonics:'Phonics', games:'Games', tpr:'Week Song', flashcards:'Flashcards' };
  const icons = { literacy:'📚', reading:'📖', phonics:'🔤', games:'🎮', tpr:'🎵', flashcards:'🃏' };
  const weekTitles = {
    1:'Do you keep bees?',
    2:'What do bees do?',
    3:'Why do we need bees?',
    4:'I am Lorenzo Langstroth.'
  };
  const descriptions = {
    literacy:'This learning page is ready for the Week content, video, vocabulary, or activity.',
    reading:'This reading page is ready for the story, read-aloud media, and comprehension activity.',
    phonics:'This phonics page is ready for the target sound, letter practice, and listening activity.',
    games:'This games hub is ready for the Week review games and interactive practice.',
    tpr:'Sing, listen, and move along with the Week Week Song.',
    flashcards:'This flashcard page is ready for the Week vocabulary cards and audio.'
  };
  const app = document.querySelector('#lesson-app');
  if (!app) return;
  const isNested = location.pathname.split('/').filter(Boolean).length > 1;
  const root = isNested ? '../' : '';
  const currentFile = location.pathname.split('/').pop() || 'lesson.html';
  const hrefFor = targetPage => `${currentFile}?page=${targetPage}`;
  const returnTrack = ['tpr','flashcards'].includes(track) ? 'literacy' : track;
  const weekHome = `${root}week-${week}.html#card-${returnTrack}`;
  const previousHref = page > 1 ? hrefFor(page - 1) : weekHome;
  const nextHref = page < pageCount ? hrefFor(page + 1) : weekHome;
  const hasWeekOneTalkSong = track === 'tpr' && week === 1;

  document.title = `Week ${week} ${labels[track]} — Beekeeper`;
  app.className = 'lesson-shell';
  app.innerHTML = `
    <nav class="lesson-topbar" aria-label="Page navigation">
      <a class="nav-btn" href="${previousHref}"><span aria-hidden="true">←</span> ${page > 1 ? 'Previous Page' : 'Week Home'}</a>
      <span class="page-indicator" aria-current="page">${pageCount > 1 ? `Page ${page} of ${pageCount}` : labels[track]}</span>
      <a class="nav-btn" href="${nextHref}">${page < pageCount ? 'Next Page' : 'Finish'} <span aria-hidden="true">→</span></a>
    </nav>
    <header class="lesson-heading">
      <span class="lesson-heading__icon" aria-hidden="true">${icons[track]}</span>
      <h1>Week ${week} · ${labels[track]}</h1>
      <p>${weekTitles[week]}</p>
    </header>
    ${track === 'literacy' ? `<nav class="week-tools" aria-label="Week tools"><a class="pill-btn orange" href="tpr.html?week=${week}&return=week-${week}.html%23lesson-focus">🎵 Week Song</a><a class="pill-btn blue" href="flashcards.html?week=${week}&return=week-${week}.html%23lesson-focus">🃏 Flashcards</a></nav>` : ''}
    <section class="lesson-card${hasWeekOneTalkSong ? ' talk-song-card' : ''}" id="lesson-focus">
      ${hasWeekOneTalkSong ? `
        <h2>Where are the Bees?</h2>
        <p>Press play, sing, and move along with the song!</p>
        <div class="video-play-shell talk-song-video-shell">
          <video class="lesson-video talk-song-video" controls playsinline preload="metadata" aria-label="Week 1 Week Song, Where are the Bees">
            <source src="../assets/video/week-1/talk-song/where-are-the-bees.mp4" type="video/mp4">
            Your browser does not support this video.
          </video>
          <button class="center-video-play" type="button" aria-label="Play Where are the Bees">▶</button>
        </div>
      ` : `
        <h2>${labels[track]} ${pageCount > 1 ? `Page ${page}` : 'Placeholder'}</h2>
        <p>${descriptions[track]}</p>
        <div class="placeholder-stage">
          <div class="placeholder-stage__inner">
            <span class="placeholder-stage__icon" aria-hidden="true">${track === 'games' ? '🧩' : '🍯'}</span>
            <strong>Content goes here</strong>
            <span>Images, audio, video, and interactions can be added when supplied.</span>
          </div>
        </div>
      `}
    </section>
    <footer class="lesson-footer">
      <a class="home-btn" href="${weekHome}"><span aria-hidden="true">🏠</span> Week ${week} Home</a>
      <a class="all-weeks-btn" href="${root}index.html"><span aria-hidden="true">🐝</span> All Weeks</a>
    </footer>`;

  const talkSongShell = app.querySelector('.talk-song-video-shell');
  if (talkSongShell) {
    const video = talkSongShell.querySelector('video');
    const playButton = talkSongShell.querySelector('.center-video-play');
    const showPlayButton = () => { playButton.hidden = false; };
    const hidePlayButton = () => { playButton.hidden = true; };
    playButton.addEventListener('click', () => video.play().catch(showPlayButton));
    video.addEventListener('play', hidePlayButton);
    video.addEventListener('playing', hidePlayButton);
    video.addEventListener('pause', showPlayButton);
    video.addEventListener('ended', showPlayButton);
  }
})();
