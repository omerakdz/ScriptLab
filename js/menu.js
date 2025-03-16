const games = document.querySelectorAll('.game-card');

games.forEach(game => {
    game.addEventListener('mouseenter', () => {
        const imgSrc = game.querySelector('img').getAttribute('src');
        document.body.style.backgroundImage = `url('${imgSrc}')`;
    });

    game.addEventListener('mouseleave', () => {
        document.body.style.backgroundImage = '';
    });
});

const gameGrid = document.querySelector(".game-grid");
const gamesList = Array.from(document.querySelectorAll(".game-card"));
let currentIndex = 0;
const gamesPerPage = 2;

const leftButton = document.createElement("button");
leftButton.innerHTML = "&#9664;";
leftButton.classList.add("scroll-btn", "left");
document.body.appendChild(leftButton);

const rightButton = document.createElement("button");
rightButton.innerHTML = "&#9654;";
rightButton.classList.add("scroll-btn", "right");
document.body.appendChild(rightButton);

function updateGames() {
    gameGrid.innerHTML = "";
    const isMobile = window.innerWidth <= 768;
    let visibleGames;

    if (isMobile) {
        visibleGames = gamesList.slice(currentIndex, currentIndex + gamesPerPage);
    } else {
        visibleGames = gamesList;
    }
    
    visibleGames.forEach(game => gameGrid.appendChild(game));

    if (isMobile) {
        leftButton.style.display = "block";
        rightButton.style.display = "block";
    } else {
        leftButton.style.display = "none";
        rightButton.style.display = "none";
    }
}

leftButton.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - gamesPerPage);
    updateGames();
});

rightButton.addEventListener("click", () => {
    currentIndex = Math.min(gamesList.length - (gamesList.length % gamesPerPage || gamesPerPage), currentIndex + gamesPerPage);
    updateGames();
});

updateGames();
window.addEventListener("resize", updateGames);

const gameCards = document.querySelectorAll(".game-card");

gameCards.forEach(gameCard => {
    gameCard.addEventListener("click", function () {
        const gameName = gameCard.querySelector("p").textContent.trim();

        if (gameName !== "Fortnite") {
            alert("Spel niet beschikbaar, probeer Fortnite");
        }
    });
});
