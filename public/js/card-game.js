"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var moveCount = 0;
var timer = 0;
var timerInterval = null;
var openCards = [];
var gameStarted = false;
var gameEnded = false;
var gameBoard = document.getElementById('game-board');
var timerText = document.getElementById('timer-text');
var moveCountText = document.getElementById('move-count');
function formatTime(time) {
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;
    return "".concat(String(minutes).padStart(2, '0'), ":").concat(String(seconds).padStart(2, '0'));
}
function startTimer() {
    if (!timerInterval) {
        timerInterval = window.setInterval(function () {
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
    var finalTime = formatTime(timer);
    document.getElementById('final-time').textContent = "Tijd: ".concat(finalTime);
    document.getElementById('final-moves').textContent = "Aantal zetten: ".concat(moveCount);
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
    var allMatched = !openCards.some(function (_a) {
        var card = _a.card;
        return !card.matched;
    }); // Zorg ervoor dat alle kaarten gematcht zijn
    if (allMatched) {
        endGame();
    }
}
function shuffle(array) {
    var _a;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
    }
    return array;
}
function createCardElement(card) {
    var cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    var img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    var questionMark = document.createElement('span');
    questionMark.classList.add('question-mark');
    questionMark.textContent = '?';
    cardDiv.appendChild(img);
    cardDiv.appendChild(questionMark);
    return cardDiv;
}
function fetchCards() {
    fetch('https://fortnite-api.com/v2/cosmetics/br')
        .then(function (res) { return res.json(); })
        .then(function (data) {
        var rawCards = data.data
            .filter(function (item) { var _a; return (_a = item.images) === null || _a === void 0 ? void 0 : _a.icon; })
            .slice(0, 10)
            .map(function (item) { return ({
            id: item.id,
            name: item.name,
            image: item.images.icon,
            matched: false,
        }); });
        var doubledCards = shuffle(__spreadArray(__spreadArray([], rawCards, true), rawCards, true));
        var fullDeck = doubledCards.map(function (card) {
            var element = createCardElement(card);
            gameBoard.appendChild(element);
            return { card: card, element: element };
        });
        fullDeck.forEach(function (_a) {
            var card = _a.card, element = _a.element;
            element.addEventListener('click', function () {
                if (!gameStarted) {
                    gameStarted = true;
                    startTimer();
                }
                if (openCards.length < 2 &&
                    !element.classList.contains('open') &&
                    !element.classList.contains('matched')) {
                    element.classList.add('open');
                    var questionMark = element.querySelector('.question-mark');
                    if (questionMark)
                        questionMark.style.display = 'none';
                    openCards.push({ card: card, element: element });
                    if (openCards.length === 2) {
                        setTimeout(function () {
                            var first = openCards[0], second = openCards[1];
                            if (first.card.image === second.card.image) {
                                openCards.forEach(function (_a) {
                                    var element = _a.element;
                                    return element.classList.add('matched');
                                });
                            }
                            else {
                                openCards.forEach(function (_a) {
                                    var element = _a.element;
                                    element.classList.remove('open');
                                    var qm = element.querySelector('.question-mark');
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
        .catch(function (err) { return console.error('Error fetching cards:', err); });
}
(window.onload = function () {
    fetchCards();
    var resetBtn = document.querySelector('#reset button');
    resetBtn.addEventListener('click', resetGame);
    var retryBtn = document.getElementById('retry-game');
    retryBtn.addEventListener('click', function () {
        window.location.reload(); // Laad de pagina opnieuw, start het spel opnieuw
    });
    var homeBtn = document.getElementById('home-button');
    homeBtn.addEventListener('click', function () {
        window.location.href = '/'; // Verwijst naar de homepagina
    });
})();
