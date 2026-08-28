(() => {
  const app = document.querySelector('#track-app');
  if (!app) return;

  const week = Math.max(1, Math.min(4, Number(document.body.dataset.week) || 1));
  const track = document.body.dataset.track === 'phonics' ? 'phonics' : 'reading';
  const titles = {
    1: 'Do you keep bees?',
    2: 'What do bees do?',
    3: 'Why do we need bees?',
    4: 'I am Lorenzo Langstroth.'
  };
  const isReading = track === 'reading';
  const label = isReading ? 'Reading' : 'Phonics';
  const heading = isReading ? `Reading \u2014 Week ${week}` : `Week ${week} \u2014 Phonics`;
  const titleIcon = isReading ? '\u{1F4D6}' : '\u{1F524}';
  const activityIcon = isReading ? '\u{1F3C5}' : '\u{1F524}';
  const activityHeading = isReading ? 'Watch and Play!' : 'Check What You Learned';
  const activityCopy = isReading
    ? 'After watching the story, continue to the reading activity.'
    : 'After watching the lesson, try a short phonics activity.';
  const phonicsVideos = {
    1: '../assets/video/week-1/phonics/week-1.mp4',
    2: '../assets/video/week-2/phonics/week-2.mp4',
    3: '../assets/video/week-3/phonics/week-3.mp4',
    4: '../assets/video/week-4/phonics/week-4.mp4'
  };
  const phonicsVideo = isReading ? null : phonicsVideos[week];
  const readingThumbnails = {
    1: '../assets/images/week-1/reading/who-is-the-queen-thumbnail.png'
  };
  const readingThumbnail = isReading ? readingThumbnails[week] : null;
  const phonicsGamesHref = week === 1
    ? '../games/phonics.html?from=phonics'
    : `../games/week-${week}/phonics.html?from=phonics`;

  document.title = `${label} Week ${week} \u2014 Beekeeper`;
  app.className = `page track-shell-page ${track}-page`;
  app.innerHTML = `
    <a class="back-link" href="../week-${week}.html#card-${track}">\u2B05\uFE0F Week ${week} Home</a>
    <header class="track-header">
      <div class="track-title-row">
        <span class="track-title-icon" aria-hidden="true">${titleIcon}</span>
        <h1 class="big-title">${heading}</h1>
      </div>
      <p class="subtitle">${isReading ? titles[week] : 'Watch, listen, and then show what you learned!'}</p>
    </header>
    <section id="lesson-focus" class="track-card" aria-label="Week ${week} ${label} video">
      ${isReading ? `<h2 class="section-title">\u{1F3AC} ${label} Video</h2>` : ''}
      ${phonicsVideo ? `
        <div class="video-play-shell track-video-shell">
          <video
            class="track-video"
            controls
            playsinline
            preload="metadata"
            ${week === 1 ? 'poster="../assets/images/week-1/phonics/week-1-poster.webp"' : ''}
            aria-label="Week ${week} phonics lesson video"
          >
            <source src="${phonicsVideo}" type="video/mp4">
            Your browser does not support this video.
          </video>
          <button class="center-video-play" type="button" aria-label="Play the Week ${week} phonics video">\u25B6</button>
        </div>
      ` : `
        <div class="track-video-placeholder">
          ${readingThumbnail
            ? `<img class="track-reading-thumbnail" src="${readingThumbnail}" alt="Who is the Queen? reading thumbnail">`
            : `<div class="track-video-placeholder__copy">
                <span aria-hidden="true">\u{1F3AC}</span>
                <strong>Week ${week} ${label} video placeholder</strong>
                <small>The lesson video will be added here.</small>
              </div>`}
          <button class="center-video-play-placeholder" type="button" aria-label="${label} video placeholder" disabled>\u25B6</button>
        </div>
      `}
      ${isReading ? '<p class="track-note">Watch the story, then try the reading activity!</p>' : ''}
    </section>
    <section class="track-card track-activity-card" aria-label="Week ${week} ${label} activity placeholder">
      <h2 class="section-title">\u2B50 ${activityHeading}</h2>
      <p>${activityCopy}</p>
      ${isReading
        ? `<button class="track-activity-btn" type="button" disabled><span aria-hidden="true">${activityIcon}</span><span>Activity Placeholder</span></button>`
        : `<a class="track-activity-btn" href="${phonicsGamesHref}"><span aria-hidden="true">${activityIcon}</span><span>Start Activity</span></a>`}
    </section>`;

  // This page is rendered after main.js has already initialized, so attach the
  // video overlay controls here instead of relying on main.js's initial scan.
  const videoShell = app.querySelector('.video-play-shell');
  const video = videoShell?.querySelector('video');
  const playButton = videoShell?.querySelector('.center-video-play');

  if (video && playButton) {
    const showPlayButton = () => { playButton.hidden = false; };
    const hidePlayButton = () => { playButton.hidden = true; };

    playButton.addEventListener('click', async () => {
      playButton.disabled = true;
      try {
        await video.play();
        hidePlayButton();
      } catch (error) {
        showPlayButton();
      } finally {
        playButton.disabled = false;
      }
    });

    video.addEventListener('play', hidePlayButton);
    video.addEventListener('playing', hidePlayButton);
    video.addEventListener('pause', showPlayButton);
    video.addEventListener('ended', showPlayButton);
    video.addEventListener('error', showPlayButton);
  }
})();
