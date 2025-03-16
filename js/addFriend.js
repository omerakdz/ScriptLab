const addBtn = document.getElementById("addUserBtn")

function addFriend() {
    if (addBtn.innerText === "ADD") {
        addBtn.innerText = "ADDED"
    } else {
        addBtn.innerHTML = `<img src="images/add.png" width="25px">ADD`
    }
}

addBtn.addEventListener("click", addFriend)