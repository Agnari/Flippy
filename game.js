let triviaTimerID; // Timer ID for trivia question
let triviaCountdownInterval; // Interval ID for countdown bar
let triviaTimeLimit;
let difficultyLevel;
let points = 0;
let cardTest = [];
let cards = ["diamond", "diamond", "plane", "plane", "anchor", "anchor", "bolt", "bolt", "leaf", "leaf", "bicycle", "bicycle", "cube", "cube", "bomb", "bomb"];
let shuffledCards = shuffle(cards);
let movesCounter = 0;
let match = 0;
let isfirstClick = true;
let timerID;
let isRestart = false;
let remainingTime;
let triviaQuestions = 0;
let answeredQuestions = 0;

const modal = document.querySelector(".modal.trivia-modal");
const gameOverModal = document.querySelector(".modal.game-over-modal");

// Difficulty selection logic
window.addEventListener("DOMContentLoaded", () => {
  const difficultyModal = document.querySelector(".difficulty-modal");
  const difficultyButtons = document.querySelectorAll(".difficulty-button");

  difficultyButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const difficulty = e.target.dataset.difficulty;
      setGameSettings(difficulty);
      toggleModal(difficultyModal);
      initGame();
    });
  });
});

function setGameSettings(difficulty) {
  switch (difficulty) {
    case "easy":
      gameTimeLimit = 60;
      triviaTimeLimit = 20000;
      difficultyLevel = 1;
      break;
    case "normal":
      gameTimeLimit = 45;
      triviaTimeLimit = 15000;
      difficultyLevel = 2;
      break;
    case "hard":
      gameTimeLimit = 30;
      triviaTimeLimit = 10000;
      difficultyLevel = 3;
      break;
    default:
      gameTimeLimit = 120;
      triviaTimeLimit = 20000;
      difficultyLevel = 1;
  }
}

function updatePoints(pointsToAdd) {
  points += pointsToAdd * difficultyLevel;
  document.querySelector(".points-count").textContent = points;
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
  triviaQuestions++;
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
        updatePoints(500);
        answeredQuestions++;
      } else {
        updatePoints(-5);
      }
      modal.classList.remove("locked");
      toggleModal(modal);
      timerID = setInterval(timer, 1000); // Resume game timer when trivia question is answered
    });
    optionsContainer.appendChild(optionButton);
  });


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

function handleCorrectAnswer() {
  console.log("Correct answer! Showing all unmatched cards for 1 second.");
  const unmatchedCards = document.querySelectorAll('.card:not(.match)');
  unmatchedCards.forEach(card => card.classList.add('show'));
  setTimeout(() => {
    unmatchedCards.forEach(card => card.classList.remove('show'));
  }, 1000);
}

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

function initGame() {
  remainingTime = gameTimeLimit;
  createCards();
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => card.classList.add('show'));
  setTimeout(() => cards.forEach(card => card.classList.remove('show')), 1500);

  cards.forEach((card, i) => {
    card.addEventListener("click", event => {
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
      updatePoints(-5);
    }, 1000); // Wait until the card flip animation completes
  }
}

function cardsMatch(card1, card2) {
  card1.classList.add('match');
  card2.classList.add('match');
  match++;
  updatePoints(250);
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

async function postGameData(gameData) {
  try {
    const token = localStorage.getItem("authToken"); // Retrieve the token from localStorage
    if (!token) {
      console.log("User is not logged in. Saving score in session storage.");
      saveScoreInSessionStorage(gameData.score);
      displayTopScores();
      return;
    }

    const response = await fetch("https://localhost:7045/api/Game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` // Include the token in the Authorization header
      },
      body: JSON.stringify(gameData) // Send the game data as JSON
    });

    if (response.ok) {
      console.log("Game data posted successfully!");
    } else {
      const errorData = await response.json();
      console.error("Failed to post game data:", errorData);
    }
  } catch (error) {
    console.error("Error posting game data:", error.message);
  }
}

function saveScoreInSessionStorage(score) {
  let scores = JSON.parse(sessionStorage.getItem("topScores")) || [];
  scores.push(score);
  scores.sort((a, b) => b - a); // Sort scores in descending order
  if (scores.length > 3) {
    scores = scores.slice(0, 3); // Keep only the top 3 scores
  }
  sessionStorage.setItem("topScores", JSON.stringify(scores));
}

function displayTopScores() {
  const scores = JSON.parse(sessionStorage.getItem("topScores")) || [];
  console.log("Top 3 Scores:");
  scores.forEach((score, index) => {
    console.log(`#${index + 1}: ${score}`);
  });
  
  // Display top scores in the HTML
  const topScoresSection = document.querySelector(".top-scores");
  topScoresSection.innerHTML = "<h2>Top 3 Scores</h2>";
  scores.forEach((score, index) => {
    const scoreElement = document.createElement("p");
    scoreElement.textContent = `#${index + 1}: ${score}`;
    topScoresSection.appendChild(scoreElement);
  });
}

// Add event listener to display top scores in game over modal
document.addEventListener("DOMContentLoaded", () => {
  const gameOverModal = document.querySelector(".game-over-modal");
  const topScoresContainer = document.createElement("div");
  topScoresContainer.classList.add("top-scores");
  gameOverModal.querySelector(".modal-content").appendChild(topScoresContainer);
});

function win() {
  clearInterval(timerID);

  const completionBonus = remainingTime * 10 * difficultyLevel;
  points += completionBonus;

  let winLoseStatus = 'win';
  toggleModal(gameOverModal);
  const timeConsumed = gameTimeLimit - remainingTime;

  document.querySelector(".final-moves").textContent = movesCounter;
  document.querySelector(".final-time").textContent = `${Math.floor(timeConsumed / 60)}:${timeConsumed % 60 < 10 ? "0" + timeConsumed % 60 : timeConsumed % 60}`;
  document.querySelector(".bonus-points").textContent = completionBonus;
  document.querySelector(".final-points").textContent = points;

  const heading = document.querySelector(".game-over-modal .modal-heading");
  heading.textContent = "Congratulations! You Won!";
  heading.classList.add('win');
  heading.classList.remove('lose');

  // Prepare game data for posting
  const gameData = {
    score: points,
    startedAt: new Date(Date.now() - timeConsumed * 1000).toISOString(), // Approximate start time
    endedAt: new Date().toISOString(),
    movesTaken: movesCounter,
    triviaQuestions: triviaQuestions,
    answeredTriviaQuestions: answeredQuestions,
    winLoseStatus: winLoseStatus,
  };

  // Post game data
  postGameData(gameData);
}

function lose() {
  clearInterval(timerID);

  let winLoseStatus = 'lose';
  toggleModal(gameOverModal);
  const timeConsumed = gameTimeLimit;

  const heading = document.querySelector(".game-over-modal .modal-heading");
  heading.textContent = "Time's Up! Game Over!";
  heading.classList.add('lose');
  heading.classList.remove('win');

  document.querySelector(".final-moves").textContent = movesCounter;
  document.querySelector(".final-points").textContent = points;

  // Hide the elements that should not be displayed
  document.querySelector(".final-time").parentElement.style.display = "none";
  document.querySelector(".bonus-points").parentElement.style.display = "none";

  // Prepare game data for posting
  const gameData = {
    score: points,
    startedAt: new Date(Date.now() - timeConsumed * 1000).toISOString(), // Approximate start time
    endedAt: new Date().toISOString(),
    movesTaken: movesCounter,
    triviaQuestions: triviaQuestions,
    answeredTriviaQuestions: answeredQuestions,
    winLoseStatus: winLoseStatus,
  };

  // Post game data
  postGameData(gameData);
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
  isfirstClick = true;
  isRestart = true;
  points = 0;
  triviaQuestions = 0;
  answeredQuestions = 0;
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