// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Displays time in the format MM:SS
function createTimeDisplayString() {
  const seconds = game.time % 60;
  const minutes = Math.floor(game.time / 60);
  const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
  const minutesDisplay = minutes < 10 ? `0${minutes}` : minutes;
  return `${minutesDisplay}:${secondsDisplay}`;
}

// Game data
const game = {};
const cardIcons = [
  // "fa-diamond",
  // "fa-paper-plane-o",
  // "fa-anchor",
  // "fa-bolt",
  // "fa-cube",
  // "fa-leaf",
  "fa-bicycle",
  "fa-bomb"
];
let timer;
// The checkpoints correspond to what the value of game.move is when we update
const starCheckpoints = [0, 1, 3, 4];

// Cached elements
const scorePanelStarElements = document.querySelectorAll(
  ".score-panel .stars .fa"
);
const timerElement = document.querySelector(".timer");
const movesElement = document.querySelector(".moves");
const restartElement = document.querySelector(".restart");
const deckElement = document.querySelector(".deck");
// Modal
const modalElement = document.querySelector(".modal");
const modalStarsElement = document.querySelector(".modal-stars");
const modalStarElements = document.querySelectorAll(".modal-stars .fa");
const modalTimeElement = document.querySelector(".time");
const modalScoreElement = document.querySelector(".score");
const newGameButton = document.querySelector(".new-game");

function startTimer() {
  game.deck.forEach(card => {
    card.removeEventListener("click", startTimer);
  });

  timer = setInterval(() => {
    game.time += 1;
    game.timeDisplay = createTimeDisplayString();
    timerElement.innerHTML = game.timeDisplay;
  }, 1000);
}

function flipStarIcons() {
  if (!starCheckpoints.includes(game.moves)) return;
  game.stars = game.moves === 0 ? game.stars : (game.stars -= 1);

  function flip(icon, i) {
    icon.classList = i >= game.stars ? "fa fa-star-o" : "fa fa-star";
  }
  // Flip all the star icons in the page
  scorePanelStarElements.forEach(flip);
  modalStarElements.forEach(flip);
}

function flipCard(card) {
  card.classList.toggle("show");
  card.classList.toggle("open");
}

function hideCards(cards) {
  game.freeze = true;
  window.setTimeout(() => {
    cards.forEach(card => {
      flipCard(card);
    });
    game.freeze = false;
  }, 750);
}

function endGame() {
  // Scroll to the top of the window and display the modal
  window.scrollTo(0, 0);
  modalElement.style.display = "flex";

  window.clearInterval(timer);

  modalTimeElement.innerHTML = game.timeDisplay;
  modalScoreElement.innerHTML = game.moves;
}

function checkForMatch() {
  // We are checking if the icons class names match:
  const [card1, card2] = game.activeCards;
  const icon = card1.firstChild.classList.item(1);
  const isMatch = card2.firstChild.classList.contains(icon);

  if (isMatch) {
    game.matchedPairs += 1;
    card1.classList.add("match");
    card2.classList.add("match");
    // Check if game has ended.
    if (game.matchedPairs === cardIcons.length) {
      endGame();
    }
  } else {
    hideCards(game.activeCards);
  }
  game.activeCards = [];
}

function handleCardClick(e) {
  if (game.freeze) return;
  const card = e.target.tagName === "I" ? e.target.parentElement : e.target;

  // Ignore click if the card is already open or the cards are being hidden.
  if (card.classList.contains("open") || card.classList.contains("match")) {
    return;
  }

  flipCard(card);
  game.activeCards.push(card);

  if (game.activeCards.length === 2) {
    game.moves += 1;
    movesElement.innerHTML = game.moves;
    flipStarIcons();
    checkForMatch();
  }
}

function createDeck() {
  // Double the number of icons so it's ready to become a game deck.
  const icons = [...cardIcons, ...cardIcons];

  // Create the different card types as <li> elements.
  const deck = icons.map(iconClassName => {
    const icon = document.createElement("i");
    icon.classList.add("fa", iconClassName);

    const card = document.createElement("li");
    card.classList.add("card");
    card.append(icon);

    card.addEventListener("click", handleCardClick);
    card.addEventListener("click", startTimer);

    return card;
  });

  return shuffle(deck);
}

function init() {
  window.clearInterval(timer);
  modalElement.style.display = "none";

  game.time = 0;
  game.moves = 0;
  game.stars = 3;
  game.timeDisplay = "00:00";
  game.deck = createDeck();
  game.matchedPairs = 0;
  game.activeCards = [];

  // Reset DOM elements and add a deck
  flipStarIcons();
  movesElement.innerHTML = game.moves;
  timerElement.innerHTML = game.timeDisplay;

  deckElement.innerHTML = "";
  game.deck.forEach(card => {
    deckElement.appendChild(card);
  });
}

newGameButton.addEventListener("click", init);
restartElement.addEventListener("click", init);

init();
