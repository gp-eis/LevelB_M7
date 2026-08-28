(() => {
  const week = Math.max(1, Math.min(4, Number(document.body.dataset.week) || 1));
  const page = Math.max(1, Math.min(6, Number(document.body.dataset.page) || 1));
  const app = document.querySelector('#literacy-app');
  if (!app) return;

  const weekTitles = {
    1: 'Do you keep bees?',
    2: 'What do bees do?',
    3: 'Why do we need bees?',
    4: 'I am Lorenzo Langstroth.'
  };

  const pageContent = {
    1: {
      icon: '🎬', heading: 'Reading Time',
      description: 'Watch and listen to the Week 1 story.',
      body: '<div class="literacy-media-slot">Opening video placeholder</div>'
    },
    2: {
      icon: '✨', heading: 'Learning',
      description: 'The main learning video and tap-to-hear vocabulary will go here.',
      body: '<div class="literacy-media-slot">Learning video placeholder</div><div class="literacy-placeholder-buttons"><button class="pill-btn" type="button" disabled>🔊 Word 1</button><button class="pill-btn orange" type="button" disabled>🔊 Word 2</button><button class="pill-btn blue" type="button" disabled>🔊 Word 3</button></div>'
    },
    3: {
      icon: '💬', heading: 'Guided Practice',
      description: 'A listen-and-answer activity with an image or scene will go here.',
      body: '<div class="literacy-media-slot">Question activity board placeholder</div><button class="placeholder-start-btn" type="button" disabled>▶ Start Activity</button>'
    },
    4: {
      icon: '🧩', heading: 'Matching Activity',
      description: 'A drag, tap, or line-matching activity will go here.',
      body: '<div class="literacy-media-slot">Matching board placeholder</div><button class="placeholder-start-btn" type="button" disabled>▶ Start Activity</button>'
    },
    5: {
      icon: '🔊', heading: 'Listen and Choose',
      description: 'A listening question and answer choices will go here.',
      body: '<div class="literacy-media-slot">Listening activity image placeholder</div><div class="literacy-choice-row"><button class="pill-btn" type="button" disabled>Choice A</button><button class="pill-btn orange" type="button" disabled>Choice B</button><button class="pill-btn blue" type="button" disabled>Choice C</button></div><button class="placeholder-start-btn" type="button" disabled>▶ Start Activity</button>'
    },
    6: {
      icon: '⭐', heading: 'Review',
      description: 'The final Week review and completion activity will go here.',
      body: '<div class="literacy-media-slot">Review activity board placeholder</div><button class="placeholder-start-btn" type="button" disabled>▶ Start Review</button>'
    }
  };

  const content = pageContent[page];
  const weekFourActivities = {
    3: ['../assets/images/week-4/literacy/page-03-who-am-i.png', 'Choose the sentence that identifies Lorenzo Langstroth'],
    4: ['../assets/images/week-4/literacy/page-04-match-clean.png', 'Match Lorenzo Langstroth facts to four bee pictures'],
    5: ['../assets/images/week-4/literacy/page-05-background-clean.png', 'Choose whether Lorenzo Langstroth was a fireman, beekeeper, or nurse'],
    6: ['../assets/images/week-4/literacy/page-06-background-clean.png', 'Choose what would disappear without bees']
  };
  const hasWeekOneReadingVideo = week === 1 && page === 1;
  const previousHref = page === 1 ? `../week-${week}.html#card-literacy` : `week-${week}-page-${String(page - 1).padStart(2, '0')}.html#lesson-focus`;
  const nextHref = page < 6 ? `week-${week}-page-${String(page + 1).padStart(2, '0')}.html#lesson-focus` : '';
  const completionMarkup = week === 1 && page >= 3 ? `
    <div id="literacy-completion" class="activity-completion-overlay" hidden>
      <div class="activity-completion-frame">
        <button id="literacy-completion-close" class="activity-completion-close" type="button" aria-label="Close the celebration">×</button>
        <video id="literacy-good-job-video" class="activity-completion-video" src="../assets/video/week-1/literacy/solve-the-problem.mp4" playsinline preload="metadata"></video>
        <div class="activity-completion-actions"><button id="literacy-completion-try-again" class="pill-btn blue" type="button">↻ Try Again</button></div>
      </div>
    </div>` : '';

  document.title = `Literacy Week ${week} — Page ${page} — Beekeeper`;
  app.className = 'page literacy-shell-page';
  app.innerHTML = `
    <nav class="top-page-nav" aria-label="Page navigation">
      <a class="back-link" href="${previousHref}">⬅️ ${page === 1 ? `Week ${week} Home` : 'Previous Page'}</a>
      <span class="page-indicator" aria-current="page">📖 Page ${page} of 6</span>
      ${nextHref ? `<a class="back-link next-page-link" href="${nextHref}">Next Page ➡️</a>` : ''}
    </nav>
    ${page > 1 ? `<a class="literacy-list-link" href="../week-${week}.html#card-literacy">🏠 Week ${week} Home</a>` : ''}
    <header class="literacy-header">
      <h1 class="big-title">Week ${week} — ${weekTitles[week]}</h1>
      <nav class="week-tools" aria-label="Week tools">
        <a class="pill-btn orange" href="tpr.html?week=${week}&return=week-${week}-page-${String(page).padStart(2, '0')}.html%23lesson-focus&from=${page}">🎵 Week Song</a>
        <a class="pill-btn blue" href="flashcards.html?week=${week}&return=week-${week}-page-${String(page).padStart(2, '0')}.html%23lesson-focus&from=${page}">🃏 Flashcards</a>
        <a class="pill-btn green" href="conversation.html?week=${week}&return=week-${week}-page-${String(page).padStart(2, '0')}.html%23lesson-focus&from=${page}">💬 Conversation</a>
      </nav>
    </header>
    <section id="lesson-focus" class="card literacy-shell-card" aria-label="Week ${week} Literacy page ${page} content area">
      <h2 class="section-title">${content.icon} ${content.heading}</h2>
      <p>${content.description}</p>
      <div class="literacy-placeholder${hasWeekOneReadingVideo ? ' literacy-video-lesson' : ''}">
        <div class="literacy-placeholder__content">
          ${hasWeekOneReadingVideo ? `
            <div class="literacy-reading-video-shell">
              <video
                id="week-1-reading-time-video"
                class="lesson-video literacy-reading-video"
                controls
                playsinline
                preload="metadata"
                poster="../assets/images/week-1/literacy/page-01-reading-time-poster.webp"
                aria-label="Week 1 Reading Time video"
              >
                <source src="../assets/video/week-1/literacy/page-01-reading-time.mp4" type="video/mp4">
                Your browser does not support this video.
              </video>
              <button
                id="week-1-reading-time-play"
                class="literacy-center-video-play"
                type="button"
                aria-label="Play the Week 1 Reading Time video"
              >▶</button>
            </div>
            <p class="literacy-video-tip">Tap the play button to begin Reading Time.</p>
          ` : `
            <span class="literacy-placeholder__icon" aria-hidden="true">${content.icon}</span>
            <strong>Page ${page} content placeholder</strong>
            <p>Ready for the Week ${week} lesson content.</p>
            ${content.body}
          `}
        </div>
        ${completionMarkup}
      </div>
    </section>`;

  const weekFourActivity = week === 4 ? weekFourActivities[page] : null;
  if (weekFourActivity) {
    const activityCard = app.querySelector('#lesson-focus');
    activityCard.classList.add('w4-activity-card');
    activityCard.setAttribute('aria-label', weekFourActivity[1]);
    activityCard.innerHTML = `
      <div class="activity-sheet-wrap">
        <img class="activity-sheet-image" src="${weekFourActivity[0]}" alt="${weekFourActivity[1]}" loading="eager" decoding="async">
      </div>
      <p class="activity-build-note">Loading activity…</p>`;
  }

  const readingVideo = document.getElementById('week-1-reading-time-video');
  const readingPlayButton = document.getElementById('week-1-reading-time-play');
  if (readingVideo && readingPlayButton) {
    const showReadingPlayButton = () => { readingPlayButton.hidden = false; };
    const hideReadingPlayButton = () => { readingPlayButton.hidden = true; };

    readingPlayButton.addEventListener('click', () => {
      readingVideo.play().catch(showReadingPlayButton);
    });
    readingVideo.addEventListener('play', hideReadingPlayButton);
    readingVideo.addEventListener('playing', hideReadingPlayButton);
    readingVideo.addEventListener('pause', showReadingPlayButton);
    readingVideo.addEventListener('ended', showReadingPlayButton);
  }

  const completion = document.getElementById('literacy-completion');
  if (completion) {
    const completionVideo = document.getElementById('literacy-good-job-video');
    const hideCompletion = () => {
      completionVideo.pause();
      completionVideo.currentTime = 0;
      completion.hidden = true;
    };
    window.showLiteracyCompletion = () => {
      completion.hidden = false;
      completionVideo.currentTime = 0;
      completionVideo.play().catch(() => {});
    };
    document.getElementById('literacy-completion-close').addEventListener('click', hideCompletion);
    document.getElementById('literacy-completion-try-again').addEventListener('click', () => {
      hideCompletion();
      document.dispatchEvent(new CustomEvent('literacy:try-again'));
    });
  }
})();
