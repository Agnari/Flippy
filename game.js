// Difficulty selection logic
window.addEventListener("DOMContentLoaded", () => {
  const difficultyModal = document.querySelector(".difficulty-modal");
  const difficultyButtons = document.querySelectorAll(".difficulty-button");

  difficultyButtons.forEach(button => {
      button.addEventListener("click", (e) => {
          const difficulty = e.target.dataset.difficulty;
          setGameTimeLimit(difficulty);
          toggleModal(difficultyModal);
          initGame();
      });
  });
});

function setGameTimeLimit(difficulty) {
  switch (difficulty) {
      case "easy":
          gameTimeLimit = 60;
          break;
      case "normal":
          gameTimeLimit = 45;
          break;
      case "hard":
          gameTimeLimit = 30;
          break;
      default:
          gameTimeLimit = 120;
  }
}

function toggleModal(modalElement) {
  modalElement.classList.toggle("show-modal");
}

// Game Logic
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }
  return array;
}

const modal = document.querySelector(".modal.trivia-modal");
const gameOverModal = document.querySelector(".modal.game-over-modal");
const closeButton = document.querySelectorAll(".close-button");

closeButton.forEach(button => {
  button.addEventListener("click", (e) => {
      const modalToClose = e.target.closest('.modal');
      if (!modalToClose.classList.contains("locked")) {
          toggleModal(modalToClose);
      }
  });
});

window.addEventListener("click", event => {
  if (event.target.classList.contains("modal") && !event.target.classList.contains("locked") && !event.target.classList.contains("difficulty-modal") && !event.target.classList.contains("game-over-modal")) {
      toggleModal(event.target);
  }
});

async function fetchTriviaQuestion() {
  try {
      clearInterval(timerID); // Stop timer when trivia question is triggered
      const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const questionData = data.results[0];
      const question = questionData.question;

      const options = [...questionData.incorrect_answers, questionData.correct_answer].sort(() => Math.random() - 0.5);
      const correctAnswer = questionData.correct_answer;

      displayTriviaQuestion(question, options, correctAnswer);
  } catch (error) {
      console.error('Failed to fetch trivia question:', error);
  }
}

function displayTriviaQuestion(question, options, correctAnswer) {
  toggleModal(modal);
  modal.classList.add("locked");
  const questionText = document.querySelector(".question");
  const optionsContainer = document.querySelector(".options");
  const countdownBar = document.querySelector(".countdown-bar");
  questionText.innerHTML = question;
  optionsContainer.innerHTML = "";

  options.forEach(option => {
      const optionButton = document.createElement("button");
      optionButton.classList.add("option");
      optionButton.innerHTML = option;
      optionButton.addEventListener("click", () => {
          clearTimeout(triviaTimerID); // Clear trivia timer when an answer is selected
          clearInterval(triviaCountdownInterval); // Clear countdown bar interval
          if (option === correctAnswer) {
              handleCorrectAnswer();
          }
          modal.classList.remove("locked");
          toggleModal(modal);
          timerID = setInterval(timer, 1000); // Resume game timer when trivia question is answered
      });
      optionsContainer.appendChild(optionButton);
  });

  let triviaTimeLimit;
  switch (gameTimeLimit) {
      case 60:
          triviaTimeLimit = 20000; // 20 seconds for easy
          break;
      case 45:
          triviaTimeLimit = 15000; // 15 seconds for normal
          break;
      case 30:
          triviaTimeLimit = 10000; // 10 seconds for hard
          break;
      default:
          triviaTimeLimit = 15000;
  }

  // Start timer for trivia question
  triviaTimerID = setTimeout(() => {
      // Consider it a fail if time runs out
      modal.classList.remove("locked");
      toggleModal(modal);
      timerID = setInterval(timer, 1000); // Resume game timer after trivia timer ends
  }, triviaTimeLimit);

  // Set up countdown bar
  countdownBar.style.width = "100%";
  let countdownTime = triviaTimeLimit;
  triviaCountdownInterval = setInterval(() => {
      countdownTime -= 100;
      const percentage = (countdownTime / triviaTimeLimit) * 100;
      countdownBar.style.width = `${percentage}%`;
      if (countdownTime <= 0) {
          clearInterval(triviaCountdownInterval);
      }
  }, 100);
}

let triviaTimerID; // Timer ID for trivia question
let triviaCountdownInterval; // Interval ID for countdown bar

function handleCorrectAnswer() {
  console.log("Correct answer! Showing all unmatched cards for 1 second.");
  const unmatchedCards = document.querySelectorAll('.card:not(.match)');
  unmatchedCards.forEach(card => card.classList.add('show'));
  setTimeout(() => {
      unmatchedCards.forEach(card => card.classList.remove('show'));
  }, 1000);
}

function shuffleUnmatchedCards() {
  const deck = document.querySelector('.deck');
  const unmatchedCards = Array.from(deck.querySelectorAll('.card:not(.match)'));

  const shuffledCards = shuffle(unmatchedCards);

  unmatchedCards.forEach(card => deck.removeChild(card));

  shuffledCards.forEach(card => {
      deck.appendChild(card);
      card.classList.add('show');
  });

  setTimeout(() => {
      shuffledCards.forEach(card => card.classList.remove('show'));
  }, 1500);
}

let cardTest = [];
let cards = ["diamond", "diamond", "plane", "plane", "anchor", "anchor", "bolt", "bolt", "leaf", "leaf", "bicycle", "bicycle", "cube", "cube", "bomb", "bomb"];
let shuffledCards = shuffle(cards);

function createCards() {
  const deck = document.querySelector('.deck');
  shuffledCards.forEach(card => {
      const li = document.createElement("LI");
      li.classList.toggle("card");
      const i = document.createElement("i");
      i.classList.add("fa");
      if (card === "plane") {
          i.classList.add("fa-paper-plane-o");
      } else {
          i.classList.add("fa-" + card);
      }
      li.appendChild(i);
      deck.appendChild(li);
  });
}

let movesCounter = 0;
let match = 0;
let isfirstClick = true;
let timerID;
let isRestart = false;
let remainingTime;
let isFlipping = false; // Prevent new flips during card evaluation

function initGame() {
  remainingTime = gameTimeLimit;
  createCards();
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => card.classList.add('show'));
  setTimeout(() => cards.forEach(card => card.classList.remove('show')), 1500);

  cards.forEach((card, i) => {
      card.addEventListener("click", event => {
          if (isFlipping) return; // Prevent new cards from flipping during evaluation
          if (cards[i] !== event.target) return;
          if (event.target.classList.contains("show")) return;
          if (isfirstClick) {
              timerID = setInterval(timer, 1000);
              isfirstClick = false;
          }
          showCard(event.target);
          setTimeout(() => {
              addCard(shuffledCards[i], event.target, cardTest, i);
          }, 550); // Ensure addCard runs after the card flip animation
      });
  });
}

function showCard(card) {
  card.classList.add('show');
}

function addCard(card, cardHTML, testList, pos) {
  if (isRestart) {
      testList.length = 0;
      isRestart = false;
  }
  testList.push(card, cardHTML, pos);
  if (testList.length === 6) {
      isFlipping = true; // Prevent new flips during evaluation
      updateMoveCounter();
      testCards(testList[0], testList[1], testList[2], testList[3], testList[4], testList[5]);
      testList.length = 0;
  }
}

function testCards(card1, html1, x1, card2, html2, x2) {
  if (card1 === card2 && x1 != x2) {
      cardsMatch(html1, html2);
  } else {
      setTimeout(() => {
          html1.classList.toggle('show');
          html2.classList.toggle('show');
          isFlipping = false; // Allow new flips after evaluation
      }, 1000); // Wait until the card flip animation completes
  }
}

function cardsMatch(card1, card2) {
  card1.classList.add('match');
  card2.classList.add('match');
  match++;
  isFlipping = false; // Allow new flips after evaluation

  if (match === cards.length / 2) {
      win();
  } else {
      const unmatchedCards = document.querySelectorAll('.card:not(.match)');

      if (unmatchedCards.length > 2) {
          const chance = Math.random();
          if (chance < 0.5) {
              fetchTriviaQuestion();
          }
      }
  }
}

function win() {
  clearInterval(timerID);
  toggleModal(gameOverModal);
  const stats = document.querySelector(".stats");
  const heading = document.querySelector(".game-over-modal .modal-heading");
  heading.textContent = "Congratulations! You Won!";
  heading.classList.add('win');
  heading.classList.remove('lose');
  stats.textContent = `You won with: ${movesCounter} moves and time left: ${Math.floor(remainingTime / 60)}:${remainingTime % 60 < 10 ? "0" + remainingTime % 60 : remainingTime % 60}`;
}

function lose() {
  toggleModal(gameOverModal);
  const heading = document.querySelector(".game-over-modal .modal-heading");
  heading.textContent = "Time's Up! Game Over!";
  heading.classList.add('lose');
  heading.classList.remove('win');
  const stats = document.querySelector(".stats");
  stats.textContent = `You lost with: ${movesCounter} moves.`;
}

function updateMoveCounter() {
  movesCounter++;
  document.querySelector(".moves").textContent = "Moves: " + movesCounter;
}

function timer() {
  remainingTime--;
  if (remainingTime <= 0) {
      clearInterval(timerID);
      lose();
  } else {
      document.querySelector(".timer").textContent = `Time Left: ${Math.floor(remainingTime / 60)}:${remainingTime % 60 < 10 ? "0" + remainingTime % 60 : remainingTime % 60}`;
  }
}

document.querySelector(".restart").addEventListener("click", restartGame);
function restartGame() {
  clearInterval(timerID);
  movesCounter = 0;
  match = 0;
  s = 0;
  m = 0;
  isfirstClick = true;
  isRestart = true;
  document.querySelector('.deck').innerHTML = '';
  shuffle(cards);
  document.querySelector(".timer").textContent = "Time Left: 0:00";
  document.querySelector(".moves").textContent = "Moves: 0";
  initGame();
}

document.querySelector(".new-game").addEventListener("click", () => {
  toggleModal(gameOverModal);
  restartGame();
});

function goToMainMenu() {
  window.location.href = "main.html";
}