# 2048-Game

This repository is reserved only for the assessment interview of Qlik and self-learning.

This project is a web-based implementation of the classic 2048 game, built with React. It features a clean interface, smooth animation and several features of Vu Nguyen.

## Included features

- Classic 2048 Gameplay: 4x4 grid ưhere you slide and merge tiles.

  - Move tiles when player presses arrow keys (prevent scrolling)
  - Generate new tiles for every turn
  - Merge two colliding tiles into one
  - Depending on the values, a tile has different color (up to 2048)

- Win/Loss condition:
  - Win: If the player reaches the 2048 tile, a message is displayed with an option to continue to achieve a higher score or to start a new game.
  - Loss: When the board is full _and_ no more moves are possible
- Score and Best Score: Tracking your current Score and Best Score (saved to `localStorage`)
- Animations/Transitions: Tiles slide and merge smoothly across the board. Merge tiles have "pop" animation, new tiles fade in nicely.
- Touch/mobile support - swipe to move the tiles (prevent scrolling)
- Sound effects: (Optional) sounds for tiles sliding and merging.

- Game Controls:
  - Pause/Resume: Pause the game at anytime
  - Mute/Unmute: Toggle sound effects on or off
  - Restart: Start a new game at any point
  - Dark Mode: A dark theme for comfortable playing in low-light conditions.

## Remaining work-items

Towards Scalability and Maintenance

- Modularisation
  - Extract JSX in App.jsx into Header, Game, Overlay...
  - Extract Game logic in App.jsx
- Responsive display

## Technologies

This project is built with modern web technologies:

- Framework: [React](https://react.dev/)
- Build Tool: [Vite](https://vite.dev/)
- Language: Javascript
- Styling: CSS
- Icons: [react-icons](https://react-icons.github.io/react-icons/)

## Requirements

To run this project locally, you need

- Node.js (v18.x or higher)
- npm

### Installation & Setup

The game is deployed on Netlify (from this repository). Click here [link-to-deployment](https://vuqlik-2048.netlify.app/)

For local installment:

1. Clone the repository:
   2.Install dependencies:
2. Run the development server:

## Core logic.

1. Stage Management ()
2. Game Mechanics ()
3. Animation Flow
