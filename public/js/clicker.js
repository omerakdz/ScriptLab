document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("item-grid");
    const target = document.getElementById("target");
    const result = document.getElementById("result");

    // Controleer of items bestaan (uit inline script in HTML)
    if (!Array.isArray(items) || items.length === 0) {
        result.innerText = "⚠️ Geen items beschikbaar!";
        return;
    }

    // Genereer knoppen op basis van items-array
    items.forEach(item => {
        const button = document.createElement("button");
        button.classList.add("item-btn");
        button.dataset.name = item.name;

        button.innerHTML = `
            <img src="${item.images.icon}" alt="${item.name}">
            <span>${item.name}</span>
        `;
        grid.appendChild(button);
    });

    const buttons = document.querySelectorAll(".item-btn");
    const itemNames = items.map(item => item.name);
    let currentIndex = 0;
    let startTime = Date.now();
    let gameOver = false;

    function showNextTarget() {
        if (currentIndex >= itemNames.length) {
            const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
            result.innerText = `🎉 Je hebt gewonnen in ${timeTaken} seconden!`;
            target.innerText = "";
            gameOver = true;
            return;
        }
        target.innerText = `Klik op: ${itemNames[currentIndex]}`;
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            if (gameOver) return;

            const clickedName = button.dataset.name;
            if (clickedName === itemNames[currentIndex]) {
                currentIndex++;
                showNextTarget();
            } else {
                result.innerText = "❌ Verkeerde keuze. Game over.";
                target.innerText = "";
                gameOver = true;
            }
        });
    });

    showNextTarget();

    // Timer van 30 seconden
    setTimeout(() => {
        if (!gameOver && currentIndex < itemNames.length) {
            target.innerText = "";
            result.innerText = "⏱️ Tijd is op! Game over.";
            gameOver = true;
        }
    }, 30000);
});
