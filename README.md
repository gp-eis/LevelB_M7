# LevelB_M7 — Beekeeper

Static learning-site scaffold based on the navigation pattern of `LevelA_M7`.

## Main pages

- `index.html` — weekly selection
- `week-1.html` through `week-4.html` — lesson selection for each week
- `lessons/week-N-page-01.html` through `lessons/week-N-page-06.html` — six physical Literacy pages for each week
- `reading/week-1.html` through `reading/week-4.html` — LevelA-style Reading video and activity shells
- `phonics/week-1.html` through `phonics/week-4.html` — LevelA-style Phonics video and activity shells
- `games/index.html` — five-choice Games hub for the selected week
- `games/phonics.html` and `games/week-N/phonics.html` — LevelA-style four-choice Phonics Games hubs with return links to each Phonics lesson
- `lesson.html` — backwards-compatible reusable lesson shell

## Updating content

- Weekly card titles are stored in `index.html`, `js/week-home.js`, `js/lesson.js`, and `js/games.js`.
- Reading and Phonics placeholder copy: edit `js/reading-phonics.js`.
- Weekly 3D card icons are stored in `assets/images/ui/weekly/`.
- Replace the emoji inside `.learning-card__art` or `.lesson-heading__icon` when the lesson-selection artwork arrives.
- Store future artwork, audio, and video in the matching folders under `assets/`.

## GP Friends character rule

- If an icon would otherwise show a person, use an appropriate company GP Friend instead.
- For Level B Month 7, choose from the penguin, lion, eagle, or beaver.
- Week 1 uses the beaver GP Friend as the beekeeper.
- Week 2 uses a crowned Queen Bee so its card is visually distinct from Week 3's pollination scene.
- The approved character reference sheet is stored at `assets/images/reference/gp-characters.png`.
- Individual GP Friends profile sheets are stored in `assets/images/reference/gp-friends/`: Wanda (eagle), Penny (girl), Gerry (boy), Syd (koala), Ria (penguin), Don (lion), and Coover (beaver).
- Beekeeper lesson-card guides: Gerry for Literacy, Penny for Reading, Coover combining “a” + “d” for Phonics, and Wanda for Games.

Week 1 currently includes six Literacy pages, one Reading lesson shell, one Phonics lesson shell, and one Games placeholder.
