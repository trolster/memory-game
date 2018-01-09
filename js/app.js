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

// CACHED ELEMENTS
const scorePanelStarElements = document.querySelectorAll(
  '.score-panel .stars .fa'
);
const timerElement = document.querySelector('.timer');
const movesElement = document.querySelector('.moves');
const restartElement = document.querySelector('.restart');
const deckElement = document.querySelector('.deck');
const modalElement = document.querySelector('.modal');
const modalStarElements = document.querySelectorAll('.modal-stars .fa');
const modalTimeElement = document.querySelector('.time');
const modalScoreElement = document.querySelector('.score');
const newGameButton = document.querySelector('.new-game');

// Icons for the card faces
const cardIcons = [
  'fa-diamond',
  'fa-paper-plane-o',
  'fa-anchor',
  'fa-bolt',
  'fa-cube',
  'fa-leaf',
  'fa-bicycle',
  'fa-bomb',
];

// The checkpoints correspond to what the value of game.move is when we update
// the star rating. So you get three stars up until the 11th move, then two
// stars until the 20th move, and finally zero stars at the 30th move.
const starCheckpoints = [0, 12, 20, 30];

const game = {};
let timer;

function startTimer() {
  // Remove the event listener from all the cards so it only starts on the
  // first click.
  game.deck.forEach((card) => {
    card.removeEventListener('click', startTimer);
  });

  timer = setInterval(() => {
    game.time += 1;
    game.timeDisplay = createTimeDisplayString();
    timerElement.innerHTML = game.timeDisplay;
  }, 1000);
}

function flipStarIcons() {
  // It game.move isn't equal to one of our checkpoints, we return out.
  if (!starCheckpoints.includes(game.moves)) return;

  game.stars = game.moves === 0 ? game.stars : (game.stars -= 1);

  function flip(icon, i) {
    icon.classList = i >= game.stars ? 'fa fa-star-o' : 'fa fa-star';
  }
  // Flip all the star icons in the page.
  scorePanelStarElements.forEach(flip);
  modalStarElements.forEach(flip);
}

function endGame() {
  // Scroll to the top of the window and display the modal.
  window.scrollTo(0, 0);
  modalElement.style.display = 'flex';

  window.clearInterval(timer);

  modalTimeElement.innerHTML = game.timeDisplay;
  modalScoreElement.innerHTML = game.moves;
}

function checkForMatch() {
  // We are checking if the icons class names match:
  const [card1, card2] = game.activeCards;
  const cardIcon = card1.firstChild.classList.item(1);
  const isMatch = card2.firstChild.classList.contains(cardIcon);

  if (isMatch) {
    game.matchedPairs += 1;
    card1.classList.add('match');
    card2.classList.add('match');
    // Check if game has ended.
    if (game.matchedPairs === cardIcons.length) {
      endGame();
    }
    game.activeCards = [];
  } else {
    // Avoid card interactions while two cards are being shown.
    game.isShowingTwoCards = true;
    window.setTimeout(() => {
      game.activeCards.forEach((card) => {
        card.classList.toggle('show');
      });
      game.activeCards = [];
      game.isShowingTwoCards = false;
    }, 750);
  }
}

function handleCardClick(e) {
  // Ignore clicks when two cards are being shown.
  if (game.isShowingTwoCards) return;

  const card = e.target.tagName === 'I' ? e.target.parentElement : e.target;

  // Ignore click if the card is already open.
  if (card.classList.contains('show') || card.classList.contains('match')) {
    return;
  }

  card.classList.toggle('show');
  game.activeCards.push(card);

  if (game.activeCards.length === 2) {
    game.moves += 1;
    movesElement.innerHTML = game.moves;
    flipStarIcons();
    checkForMatch();
  }
}

function createDeck() {
  // Double the number of cardIcons in the list.
  const cardFaces = [...cardIcons, ...cardIcons];

  const deck = cardFaces.map((cardFaceName) => {
    const icon = document.createElement('i');
    icon.classList.add('fa', cardFaceName);

    const card = document.createElement('li');
    card.classList.add('card');
    card.append(icon);

    card.addEventListener('click', handleCardClick);
    card.addEventListener('click', startTimer);

    return card;
  });
  return shuffle(deck);
}

function init() {
  window.clearInterval(timer);
  modalElement.style.display = 'none';

  game.time = 0;
  game.moves = 0;
  game.stars = 3;
  game.timeDisplay = '00:00';
  game.deck = createDeck();
  game.matchedPairs = 0;
  game.activeCards = [];

  // Reset DOM elements and add a deck
  flipStarIcons();
  movesElement.innerHTML = game.moves;
  timerElement.innerHTML = game.timeDisplay;

  deckElement.innerHTML = '';
  game.deck.forEach((card) => {
    deckElement.appendChild(card);
  });
}

newGameButton.addEventListener('click', init);
restartElement.addEventListener('click', init);

document.addEventListener('DOMContentLoaded', init);
