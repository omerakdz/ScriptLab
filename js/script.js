// Functie voor skins op te halen
function fetchSkins(apiUrl, visibleSkins = 4) {
    const skinsContainer = document.querySelector(".skins-container");
    const prevButton = document.querySelector(".icon-button:first-of-type");
    const nextButton = document.querySelector(".icon-button:last-of-type");
    let startIndex = 0;

    // API Data ophalen
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const skins = data.data.filter(item => item.type.value === "outfit");
            const skinsToDisplay = skins.slice(0, 40); // Maximaal 40 skins tonen

            // Maak de skins in de container
            for (const skin of skinsToDisplay) {
                const skinButton = document.createElement("button");
                skinButton.classList.add("skins-button");

                skinButton.innerHTML = `
                    <img src="${skin.images.icon}" alt="${skin.name}">
                    <span class="skin-name">${skin.name}</span>
                `;

                skinsContainer.appendChild(skinButton);
            }

            const allSkinButtons = Array.from(skinsContainer.querySelectorAll(".skins-button"));

            // tonen van skins met startindex
            function updateSkins() {
                allSkinButtons.forEach((skin, index) => {
                    if (index >= startIndex && index < startIndex + visibleSkins) {
                        skin.style.display = "flex";
                    } else {
                        skin.style.display = "none";
                    }
                });
            }

            // skin selecteren click event
            skinsContainer.addEventListener("click", function (event) {
                const clickedImage = event.target.closest(".skins-button img");
                if (!clickedImage) return;

                const allImages = document.querySelectorAll(".skins-button img");

                
                for (const img of allImages) {
                    img.classList.remove("selected");
                }

                // gekozen afbeelding in selected
                clickedImage.classList.add("selected");
            });

            // pijltjes knoppen links en rechts
            nextButton.addEventListener("click", function () {
                if (startIndex + visibleSkins < allSkinButtons.length) {
                    startIndex++;
                    updateSkins();
                }
            });

            prevButton.addEventListener("click", function () {
                if (startIndex > 0) {
                    startIndex--;
                    updateSkins();
                }
            });

            updateSkins();
        })
        .catch(error => {
            console.error("Error fetching Fortnite skins:", error);
            skinsContainer.innerHTML = "<p>Er is een probleem opgetreden bij het laden van de skins.</p>";
        });
}

// api aanroepen (deze api is alleen voor skins)
const apiUrl = "https://fortnite-api.com/v2/cosmetics/br";
fetchSkins(apiUrl);
