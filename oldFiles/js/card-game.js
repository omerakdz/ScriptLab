let moveCount = 0; // aantal moves
let timer = 0; // bijhouden timer
let timerInterval; // De interval voor de timer
let openCards = []; // array voor bijhouden van open kaarten
let gameStarted = false; //kijkt of spel al gestard is

// Functie voor de timer
function startTimer() {
    // starten als timer niet actief is
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            timer++;
            document.getElementById('timer-text').textContent = formatTime(timer);
        }, 1000);
    }
}

// Stop de timer
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// formaat timer
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// functie voor update van aantal moves
function updateMoveCount() {
    moveCount++;
    document.getElementById('move-count').textContent = moveCount;
}


function resetGame() {
    // Reset timer
    stopTimer(); // Stop de timer
    timer = 0; // Reset de timer
    document.getElementById('timer-text').textContent = '00:00'; // Zet de timer terug op 00:00

    // reset aantal moves
    moveCount = 0;
    document.getElementById('move-count').textContent = moveCount;

    // reset kaarten
    openCards = [];
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.remove('open', 'matched');
        const questionMark = card.querySelector('.question-mark');
        if (questionMark) {
            questionMark.style.display = 'block';
        }
    });

    
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';  // maakt de container leeg

    // timer resetten
    gameStarted = false; // zorger ervoor dat de timer niet vanzelf begint

    // kaarten herladen
    fetchCards();
}


function fetchCards() {
    fetch('https://fortnite-api.com/v2/cosmetics/br')
        .then(response => response.json())
        .then(data => {
            const items = data.data.slice(0, 10); // Pak de eerste 10 items
            const gameBoard = document.getElementById('game-board');
            const cards = [];

            // array van kaarten met dubbele kaarten
            items.forEach(item => {
                cards.push({ imgUrl: item.images.icon, element: null });
                cards.push({ imgUrl: item.images.icon, element: null });
            });

            // Shuffle de kaarten
            shuffle(cards);

            // aanmaken van kaarten
            cards.forEach(cardData => {
                const card = document.createElement('div');
                card.classList.add('card');
                const img = document.createElement('img');
                img.src = cardData.imgUrl;
                img.alt = 'Fortnite Item';

                const questionMark = document.createElement('span');
                questionMark.classList.add('question-mark');
                questionMark.textContent = '?';

                card.appendChild(img);
                card.appendChild(questionMark);
                gameBoard.appendChild(card);
                cardData.element = card;
            });

            // event listener om de kaarten te openen
            cards.forEach(({ element, imgUrl }) => {
                element.addEventListener('click', () => {
                    if (!gameStarted) {
                        gameStarted = true;
                        startTimer(); // timer start bij eerste klik
                    }

                    if (openCards.length < 2 && !element.classList.contains('open')) {
                        element.classList.add('open');
                        const questionMark = element.querySelector('.question-mark');
                        if (questionMark) {
                            questionMark.style.display = 'none';
                        }

                        openCards.push({ element, imgUrl });

                        if (openCards.length === 2) {
                            setTimeout(() => {
                                if (openCards[0].imgUrl === openCards[1].imgUrl) {
                                    openCards.forEach(card => card.element.classList.add('matched'));
                                } else {
                                    openCards.forEach(card => {
                                        card.element.classList.remove('open');
                                        const questionMark = card.element.querySelector('.question-mark');
                                        if (questionMark) {
                                            questionMark.style.display = 'block';
                                        }
                                    });
                                }
                                openCards = [];
                                updateMoveCount();
                            }, 1000);
                        }
                    }
                });
            });
        })
        .catch(error => console.error('Error loading API:', error));
}

// Shuffle functie voor de kaarten
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; //elementen wisselen
    }
}

// spel start wanneer de pagina is geladen
window.onload = function() {
    fetchCards();
};
