document.addEventListener("DOMContentLoaded", () => {
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
}); document.addEventListener("DOMContentLoaded", () => {
    const gameGrid = document.querySelector(".game-grid");
    const games = Array.from(document.querySelectorAll(".game-card")); // Verkrijg alle game-cards
    let currentIndex = 0;
    const gamesPerPage = 2;

    // Functie om de juiste games weer te geven
    function showGames() {
        gameGrid.innerHTML = ""; // Verwijdert alle games uit de grid

        // Op desktop worden alle games getoond, anders slechts een paar
        const visibleGames = window.innerWidth <= 768 ? games.slice(currentIndex, currentIndex + gamesPerPage) : games;
        visibleGames.forEach(game => gameGrid.appendChild(game));
    }

    // Functie om de pijltjesknoppen toe te voegen voor mobiel
    function addScrollButtons() {
        const leftButton = document.createElement("button");
        leftButton.innerHTML = "&#9664;";
        leftButton.classList.add("scroll-btn", "left");
        leftButton.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex -= gamesPerPage;
                showGames();
            }
        });

        const rightButton = document.createElement("button");
        rightButton.innerHTML = "&#9654;";
        rightButton.classList.add("scroll-btn", "right");
        rightButton.addEventListener("click", () => {
            if (currentIndex + gamesPerPage < games.length) {
                currentIndex += gamesPerPage;
                showGames();
            }
        });

        document.body.appendChild(leftButton);
        document.body.appendChild(rightButton);
    }

    // Controleer of het scherm kleiner is dan 768px
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            addScrollButtons();
        } else {
            // Verwijder de pijltjesknoppen als het scherm groter is dan 768px
            const scrollButtons = document.querySelectorAll('.scroll-btn');
            scrollButtons.forEach(button => button.remove());
        }
        showGames(); // Update de weergave na de wijziging van de schermgrootte
    }

    // Start met de juiste games
    showGames();

    // Voeg de scrollknoppen toe indien nodig bij de eerste laad
    checkScreenSize();

    // Voeg een event listener toe om de knoppen toe te voegen of te verwijderen bij wijziging van het scherm
    window.addEventListener("resize", checkScreenSize);
});
