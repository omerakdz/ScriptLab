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
});
