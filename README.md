# FLIPPY

Welcome to the **Flippy**! This game combines the fun of matching cards with the challenge of answering trivia questions. Match all the pairs and test your trivia knowledge!

## Table of Contents

- [Game Description](#game-description)
- [Features](#features)
- [Installation](#installation)
- [How to Play](#how-to-play)
- [Code Overview](#code-overview)
- [License](#license)

## Game Description

This project is a simple yet entertaining card memory game where players need to match pairs of cards. After successfully matching a pair, a trivia question might pop up, offering an added layer of challenge. If answered correctly, unmatched cards are revealed for a moment to assist the player in remembering their positions.

## Features

- **Card Matching**: Flip and match pairs of cards.
- **Trivia Questions**: Randomly triggered trivia questions after each successful match. Correct answers give players a peek at all unmatched cards.
- **Timer and Move Counter**: Keep track of your game duration and number of moves.
- **Responsive UI**: Modals for trivia and game-over events, along with user-friendly prompts.

## Installation

1. Clone this repository to your local machine.
   ```bash
   git clone <repository-url>
   ```
2. Open the `index.html` file in your browser to start the game.

No additional dependencies are required.

## How to Play

1. **Start the Game**: Click on a card to begin. The timer will start after your first click.
2. **Match Cards**: Try to find and match pairs of cards.
3. **Trivia Challenge**: After matching a pair, a trivia question may appear. Answer correctly to reveal all unmatched cards for a moment.
4. **Win Condition**: Match all pairs to win the game. Your statistics, such as the number of moves and time taken, will be displayed upon winning.
5. **Restart the Game**: You can restart at any time using the "Restart" button, or start a new game after finishing by clicking the "New Game" button.

## Code Overview

This project is built with JavaScript, HTML, and CSS. Here is a brief overview of the main functions:

### JavaScript Functions

- **Shuffle Function**: Randomizes the card order.
  ```js
  function shuffle(array) { ... }
  ```
- **Modals and Event Listeners**: Manages the trivia and game-over modals, and closes them when necessary.
  ```js
  const modal = document.querySelector(".modal.trivia-modal");
  closeButton.forEach(button => { ... });
  ```
- **Trivia Fetching**: Retrieves a trivia question from the Open Trivia Database API.
  ```js
  async function fetchTriviaQuestion() { ... }
  ```
- **Display Trivia Question**: Presents the trivia question to the player and evaluates their answer.
  ```js
  function displayTriviaQuestion(question, options, correctAnswer) { ... }
  ```
- **Game Initialization and Restart**: Initializes the game and handles restart functionality.
  ```js
  function initGame() { ... }
  function restartGame() { ... }
  ```
- **Card Handling**: Functions to handle card flipping, matching, and displaying unmatched cards.
  ```js
  function addCard(card, cardHTML, testList, pos) { ... }
  function cardsMatch(card1, card2) { ... }
  ```

## License

This project is open source and available under the [MIT License](LICENSE). Feel free to use, modify, and distribute this game as you see fit.

---

Happy matching and good luck with the trivia!

