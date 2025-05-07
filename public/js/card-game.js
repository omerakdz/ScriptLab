"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let moveCount = 0;
let timer = 0;
let timerInterval = null;
let openCards = [];
let gameStarted = false;
let gameEnded = false;
const gameBoard = document.getElementById('game-board');
const timerText = document.getElementById('timer-text');
const moveCountText = document.getElementById('move-count');
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
function startTimer() {
    if (!timerInterval) {
        timerInterval = window.setInterval(() => {
            timer++;
            timerText.textContent = formatTime(timer);
        }, 1000);
    }
}
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}
function endGame() {
    stopTimer();
    gameEnded = true;
    document.getElementById('game-end-container').style.display = 'block';
    const finalTime = formatTime(timer);
    document.getElementById('final-time').textContent = `Tijd: ${finalTime}`;
    document.getElementById('final-moves').textContent = `Aantal zetten: ${moveCount}`;
}
function updateMoveCount() {
    moveCount++;
    moveCountText.textContent = moveCount.toString();
}
function resetGame() {
    stopTimer();
    timer = 0;
    timerText.textContent = '00:00';
    moveCount = 0;
    moveCountText.textContent = '0';
    openCards = [];
    gameStarted = false;
    gameBoard.innerHTML = '';
    fetchCards();
}
// Controleer of alle kaarten zijn gematcht
function checkGameEnd() {
    const allMatched = !openCards.some(({ card }) => !card.matched); // Zorg ervoor dat alle kaarten gematcht zijn
    if (allMatched) {
        endGame();
    }
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    const questionMark = document.createElement('span');
    questionMark.classList.add('question-mark');
    questionMark.textContent = '?';
    cardDiv.appendChild(img);
    cardDiv.appendChild(questionMark);
    return cardDiv;
}
function fetchCards() {
    fetch('https://fortnite-api.com/v2/cosmetics/br')
        .then(res => res.json())
        .then(data => {
        const rawCards = data.data
            .filter((item) => { var _a; return (_a = item.images) === null || _a === void 0 ? void 0 : _a.icon; })
            .slice(0, 10)
            .map((item) => ({
            id: item.id,
            name: item.name,
            image: item.images.icon,
            matched: false,
        }));
        const doubledCards = shuffle([...rawCards, ...rawCards]);
        const fullDeck = doubledCards.map(card => {
            const element = createCardElement(card);
            gameBoard.appendChild(element);
            return { card, element };
        });
        fullDeck.forEach(({ card, element }) => {
            element.addEventListener('click', () => {
                if (!gameStarted) {
                    gameStarted = true;
                    startTimer();
                }
                if (openCards.length < 2 &&
                    !element.classList.contains('open') &&
                    !element.classList.contains('matched')) {
                    element.classList.add('open');
                    const questionMark = element.querySelector('.question-mark');
                    if (questionMark)
                        questionMark.style.display = 'none';
                    openCards.push({ card, element });
                    if (openCards.length === 2) {
                        setTimeout(() => {
                            const [first, second] = openCards;
                            if (first.card.image === second.card.image) {
                                openCards.forEach(({ element }) => element.classList.add('matched'));
                            }
                            else {
                                openCards.forEach(({ element }) => {
                                    element.classList.remove('open');
                                    const qm = element.querySelector('.question-mark');
                                    if (qm)
                                        qm.style.display = 'block';
                                });
                            }
                            updateMoveCount();
                            openCards = [];
                        }, 1000);
                    }
                }
            });
        });
    })
        .catch(err => console.error('Error fetching cards:', err));
}
(window.onload = () => {
    fetchCards();
    const resetBtn = document.querySelector('#reset button');
    resetBtn.addEventListener('click', resetGame);
    const retryBtn = document.getElementById('retry-game');
    retryBtn.addEventListener('click', function () {
        window.location.reload(); // Laad de pagina opnieuw, start het spel opnieuw
    });
    const homeBtn = document.getElementById('home-button');
    homeBtn.addEventListener('click', function () {
        window.location.href = '/'; // Verwijst naar de homepagina
    });
})();
