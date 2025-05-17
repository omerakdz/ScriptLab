let seconds = 0;
let minutes = 0;
let timerStarted = false;
let timerInterval;

const timerText = document.getElementById("timer-text");
const resetBtn = document.getElementById("reset-btn");
const cards = document.querySelectorAll(".card");

function updateTimer() {
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");
    timerText.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

// Timer starten 
function startTimer() {
    if (!timerStarted) {
        timerStarted = true;
        timerInterval = setInterval(updateTimer, 1000);
    }
}

// Timer resetten
function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    minutes = 0;
    timerStarted = false;
    timerText.textContent = "00:00";
}

resetBtn.addEventListener("click", () => {
    resetTimer();
});

// Event listener voor kaarten
cards.forEach(card => {
    card.addEventListener("click", (e) => {
        startTimer();
    });
});


const form = document.querySelector("form");
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
    });
}
