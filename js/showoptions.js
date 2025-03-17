let optionsButton = document.getElementById("optionsBtn");
optionsButton.addEventListener("click", showMenu, false)

function showMenu() {
    let menu = document.getElementById("leftBtns");
    if (menu.style.display === "flex") {
        menu.style.display = "none";
    } else {
        menu.style.display = "flex";
        optionsButton.style.display = "none";
    }
}
