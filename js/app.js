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
  "fa-diamond",
  "fa-paper-plane-o",
  "fa-anchor",
  "fa-bolt",
  "fa-cube",
  "fa-leaf",
  "fa-bicycle",
  "fa-bomb"
];
let timer;
// The checkpoints correspond to what the value of game.move is when we update
const starCheckpoints = new Set([0, 1, 2, 3]);

// Cached elements
const scorePanelElement = document.querySelector(".score-panel");
const timerElement = document.querySelector(".timer");
const movesElement = document.querySelector(".moves");
const restartElement = document.querySelector(".restart");
const deckElement = document.querySelector(".deck");
// Modal
const modalElement = document.querySelector(".modal");
const modalStarsElement = document.querySelector(".modal-stars");
const modalTimeElement = document.querySelector(".time");
const modalScoreElement = document.querySelector(".score");
const newGameButton = document.querySelector(".new-game");

function startTimer() {
  // Make sure only one timer exists at a time
  window.clearInterval(timer);
  timer = setInterval(() => {
    game.time += 1;
    game.timeDisplay = createTimeDisplayString();
    timerElement.innerHTML = game.timeDisplay;
  }, 1000);
}

function handleCardClick(e) {
  if (game.time === 0) {
    startTimer();
  }
  const card = e.target.tagName === "I" ? e.target.parentElement : e.target;
  matchCards(card);
}

function createDeck() {
  // Double the number of icons so it's ready to become a game deck.
  const icons = [...cardIcons, ...cardIcons];

  // Create the different card types as <li> elements
  const deck = icons.map(iconClassName => {
    const icon = document.createElement("i");
    icon.classList.add("fa", iconClassName);

    const card = document.createElement("li");
    card.classList.add("card");
    card.append(icon);

    card.addEventListener("click", handleCardClick);

    return card;
  });

  return shuffle(deck);
}

function addDeckToPage() {
  deckElement.innerHTML = "";
  game.deck.forEach(card => {
    deckElement.appendChild(card);
  });
}

function flipStarIcons(starIcons) {
  starIcons.forEach((icon, index) => {
    if (index + 1 > game.stars) {
      icon.classList.replace("fa-star", "fa-star-o");
    } else {
      icon.classList.replace("fa-star-o", "fa-star");
    }
  });
}

function updateStarElements(init = false) {
  // Only check the stars if the game.moves corresponds to a checkpoint
  if (!starCheckpoints.has(game.moves)) return;
  game.stars = init ? game.stars : (game.stars -= 1);

  const starIcons = scorePanelElement
    .querySelector(".stars")
    .querySelectorAll(".fa");
  flipStarIcons(starIcons);
}

function countMove() {
  game.moves += 1;
  movesElement.innerHTML = game.moves;
  updateStarElements();
}

function flipCard(card) {
  card.classList.toggle("show");
  card.classList.toggle("open");
}

function hideCards(cards) {
  window.setTimeout(() => {
    cards.forEach(card => {
      flipCard(card);
    });
  }, 750);
}

function openModal() {
  // Scroll to the top of the window and display the modal
  window.scrollTo(0, 0);
  modalElement.style.display = "flex";

  // Set the star rating
  const starIcons = modalStarsElement.querySelectorAll(".fa");
  flipStarIcons(starIcons);

  modalTimeElement.innerHTML = game.timeDisplay;
  modalScoreElement.innerHTML = game.moves;
}

function endGame() {
  window.clearInterval(timer);
  openModal();
}

function checkForMatch() {
  // We are checking if the icons class names match:
  const cardIcon = game.activeCards[0].firstChild.classList.item(1);
  const matched = game.activeCards[1].firstChild.classList.contains(cardIcon);

  if (matched) {
    game.matchedPairs += 1;
    game.activeCards.forEach(card => {
      card.classList.add("match");
    });
    // Check if game has ended
    if (game.matchedPairs === cardIcons.length) {
      endGame();
    }
  } else {
    hideCards(game.activeCards);
  }
  game.activeCards = [];
}

function matchCards(card) {
  // Ignore clicks in certain cases:
  if (
    game.activeCards.length === 2 ||
    card.classList.contains("open") ||
    card.classList.contains("match")
  ) {
    return;
  }

  flipCard(card);
  game.activeCards.push(card);

  // If two cards are face up we count it as a move and check for a match
  if (game.activeCards.length === 2) {
    countMove();
    checkForMatch();
  }
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
  updateStarElements(true);
  movesElement.innerHTML = game.moves;
  timerElement.innerHTML = game.timeDisplay;
  addDeckToPage();
}

newGameButton.addEventListener("click", init);
restartElement.addEventListener("click", init);

init();
