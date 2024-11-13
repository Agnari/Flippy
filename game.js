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
    // Only close the modal if it is not locked
    if (!modalToClose.classList.contains("locked")) {
      toggleModal(modalToClose);
    }
  });
});

window.addEventListener("click", event => {
  if (event.target.classList.contains("modal") && !event.target.classList.contains("locked")) {
    toggleModal(event.target);
  }
});

function toggleModal(modalElement) {
  modalElement.classList.toggle("show-modal");
}

async function fetchTriviaQuestion() {
  try {
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
  questionText.innerHTML = question;
  optionsContainer.innerHTML = "";

  options.forEach(option => {
    const optionButton = document.createElement("button");
    optionButton.classList.add("option");
    optionButton.innerHTML = option;
    optionButton.addEventListener("click", () => {
      if (option === correctAnswer) {
        handleCorrectAnswer();
      }
      modal.classList.remove("locked");
      toggleModal(modal);
    });
    optionsContainer.appendChild(optionButton);
  });
}

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

// Game Logic
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

function initGame() {
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
      setTimeout(addCard, 550, shuffledCards[i], event.target, cardTest, i);
    });
  });
}

function showCard(card) {
  card.classList.add('show');
}

function addCard(card, cardHTML, testList, pos) {
  if (isRestart) {
    testList.length = 0; // Clear the test list if the game is being restarted
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
    }, 300);
  }
}

function cardsMatch(card1, card2) {
  card1.classList.add('match');
  card2.classList.add('match'); 
  match++;

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
  stats.textContent = `You won with: ${movesCounter} moves and time: ${m}:${s % 60 < 10 ? "0" + s % 60 : s % 60}`;
}

function updateMoveCounter() {
  movesCounter++; 
  document.querySelector(".moves").textContent = "Moves: " + movesCounter; 
}

let s = 0;
let m = 0;
function timer() {
  ++s;
  m = Math.floor(s / 60);
  document.querySelector(".timer").textContent = `Elapsed Time: ${m}:${s % 60 < 10 ? "0" + s % 60 : s % 60}`; 
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
  document.querySelector(".timer").textContent = "Elapsed Time: 0:00";
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

initGame();
