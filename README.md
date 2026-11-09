# Dodge the Falling Blocks

A small, static arcade game for CS 1101. It uses plain HTML, CSS, and JavaScript, with no packages, build step, external assets, backend, or database.

## Open and play

1. Open `index.html` in a modern browser. No server or installation is needed.
2. Choose **Start Game**.
3. Hold **← / →** or **A / D** to move the blue rectangular player. On a phone, hold the visible **LEFT / RIGHT** buttons.
4. Avoid the red falling block. Each block that passes the bottom earns one point. A collision ends the round.
5. Enter a nickname and choose **Save Score**, then choose **Play Again** or press **R** to restart. Save before restarting if you want to keep that round's score. Keyboard shortcuts do not run while typing a nickname.

The game pauses when its tab becomes hidden and resumes without counting time spent away. Movement and falling speeds use elapsed time and do not increase during a round.

The leaderboard shows the ten highest submitted scores. Nicknames must contain 1–20 characters after surrounding spaces are removed. Each completed round can be submitted once, using its actual final score. Ties retain submission order.

**Scores are stored only in this browser tab. Refreshing the page clears them.** Scores survive game restarts, but are not shared with classmates or other tabs. There is no browser storage or other persistence. This classroom starter does not prevent someone from changing their own JavaScript in developer tools.

## Files

- `index.html`: page structure, canvas, instructions, buttons, and leaderboard form.
- `style.css`: arcade colors, typography, responsive layout, and canvas scaling.
- `game.js`: settings, gameplay, drawing, keyboard/touch input, and the in-memory leaderboard.
- `.gitignore`: ignores common operating-system and editor files.
- `README.md`: setup, play instructions, and customization notes.

## GitHub Pages

Keep these files together in the published directory of a GitHub repository. In the repository's **Settings → Pages**, select the branch and folder containing `index.html`. All asset links are relative, so the game also works under a repository's Pages subpath. No build step is needed.

## Safe customization

Change the title and instructional wording in `index.html`, the colors and borders in `style.css`, or the drawing colors in `renderGame()` in `game.js`. Keep text readable, buttons clearly labeled, and the canvas aspect ratio at 6:5.

For class competition, everyone should use the same gameplay settings near the top of `game.js`: canvas size, player dimensions, player speed, block size, and block speed. Changing those values changes difficulty and makes scores harder to compare. Keep the small time step consistent too.


