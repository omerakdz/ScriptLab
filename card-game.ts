import { Card, GameCard } from './types';

let moveCount: number = 0;
let timer: number = 0;
let timerInterval: number | null = null;
let openCards: GameCard[] = [];
let gameStarted: boolean = false;
let gameEnded: boolean = false;

const gameBoard = document.getElementById('game-board') as HTMLElement;
const timerText = document.getElementById('timer-text')!;
const moveCountText = document.getElementById('move-count')!;

function formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer(): void {
    if (!timerInterval) {
        timerInterval = window.setInterval(() => {
            timer++;
            timerText.textContent = formatTime(timer);
        }, 1000);
    }
}

function stopTimer(): void {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function endGame(): void {
    stopTimer();
    gameEnded = true;
    document.getElementById('game-end-container')!.style.display = 'block'; 

    const finalTime = formatTime(timer);
    document.getElementById('final-time')!.textContent = `Tijd: ${finalTime}`;

    document.getElementById('final-moves')!.textContent = `Aantal zetten: ${moveCount}`;
}

function updateMoveCount(): void {
    moveCount++;
    moveCountText.textContent = moveCount.toString();
}

function resetGame(): void {
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
function checkGameEnd(): void {
    const allMatched = !openCards.some(({ card }) => !card.matched); // Zorg ervoor dat alle kaarten gematcht zijn
    if (allMatched) {
        endGame();
    }
}

function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCardElement(card: Card): HTMLDivElement {
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

function fetchCards(): void {
    fetch('https://fortnite-api.com/v2/cosmetics/br')
        .then(res => res.json())
        .then(data => {
            const rawCards = data.data
                .filter((item: any) => item.images?.icon)
                .slice(0, 10)
                .map((item: any): Card => ({
                    id: item.id,
                    name: item.name,
                    image: item.images.icon,
                    matched: false,
                }));

            const doubledCards: Card[] = shuffle([...rawCards, ...rawCards]);
            const fullDeck: GameCard[] = doubledCards.map(card => {
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

                    if (
                        openCards.length < 2 &&
                        !element.classList.contains('open') &&
                        !element.classList.contains('matched')
                    ) {
                        element.classList.add('open');
                        const questionMark = element.querySelector('.question-mark') as HTMLElement;
                        if (questionMark) questionMark.style.display = 'none';

                        openCards.push({ card, element });

                        if (openCards.length === 2) {
                            setTimeout(() => {
                                const [first, second] = openCards;
                                if (first.card.image === second.card.image) {
                                    openCards.forEach(({ element }) => element.classList.add('matched'));
                                } else {
                                    openCards.forEach(({ element }) => {
                                        element.classList.remove('open');
                                        const qm = element.querySelector('.question-mark') as HTMLElement;
                                        if (qm) qm.style.display = 'block';
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

    const resetBtn = document.querySelector('#reset button') as HTMLButtonElement;
    resetBtn.addEventListener('click', resetGame);

      
      const retryBtn = document.getElementById('retry-game') as HTMLButtonElement;
      retryBtn.addEventListener('click', function () {
          window.location.reload(); // Laad de pagina opnieuw, start het spel opnieuw
      });
  
      const homeBtn = document.getElementById('home-button') as HTMLButtonElement;
      homeBtn.addEventListener('click', function () {
          window.location.href = '/'; // Verwijst naar de homepagina
      });
})();
