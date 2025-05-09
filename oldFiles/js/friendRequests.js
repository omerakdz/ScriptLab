/*leaderboard.html*/
const friendRequestBtn = document.getElementById("friendRequestButton");
const friendRequestsMenu = document.getElementById("friendRequestsMenu");

function showFriendRequests() {
    if (friendRequestsMenu.style.display === "flex") {
        friendRequestsMenu.style.display = "none"
    } else {
        friendRequestsMenu.style.display = "flex"
    }
}

friendRequestBtn.addEventListener("click", showFriendRequests)