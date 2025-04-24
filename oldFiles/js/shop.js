const shopApiUrl = "https://fortnite-api.com/v2/shop";

// desktop versie
function fetchShopItems(apiUrl, visibleItems = 8) {
    const shopContainer = document.querySelector(".shop-container");
    const prevButton = document.querySelector(".shop-button:first-of-type");
    const nextButton = document.querySelector(".shop-button:last-of-type");
    let startIndex = 0;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => { 
            if (!data.data || !data.data.entries) {
                console.error("Onverwachte API-structuur:", data);
                shopContainer.innerHTML = "<p>Geen shop-items beschikbaar.</p>";
                return; // stopt als niet gevonden
            }

            let shopItems = data.data.entries;

            if (shopItems.length === 0) {
                shopContainer.innerHTML = "<p>Geen shop-items beschikbaar.</p>";
                return;
            }

            // Filter voor skins en items (je kunt hier ook andere filters toevoegen)
            shopItems = shopItems.filter(item => 
                item.bundle && item.bundle.name && item.bundle.image && item.finalPrice && item.finalPrice > 0
            );
            
            const itemsToDisplay = shopItems.slice(0, 40); 

            // Voeg de items toe aan de shop-container
            itemsToDisplay.forEach(item => {
                const shopButton = document.createElement("button");
                shopButton.classList.add("shop-item-button");

                let imageUrl = "images/items/placeholder.png";
                if (item.bundle && item.bundle.image) {
                    imageUrl = item.bundle.image;
                }

                let itemName = "Onbekend item";

                if (item.bundle) {
                    for (let key in item.bundle) {
                        if (key === "name") {
                            itemName = item.bundle[key];
                            break; // Stop de loop zodra de naam is gevonden
                        }
                    }
                }

                shopButton.innerHTML = `
                    <img class= "shop-img" src="${imageUrl}" alt="${itemName}">
                    <span class="item-name">${itemName}</span>
                    <span class="item-price">${item.finalPrice} <img src="/images/items/coin.png" alt="Coin" class="coin-icon"></span>
                    <button class="buy-button">Koop</button>
                `;

                shopContainer.appendChild(shopButton);
            });

            const allShopButtons = [...shopContainer.querySelectorAll(".shop-item-button")];

            function updateShopItems() {
                allShopButtons.forEach((item, index) => {
                    if (index >= startIndex && index < startIndex + visibleItems) {
                        item.style.display = "flex";
                    } else {
                        item.style.display = "none";
                    }
                });
            }

            nextButton.addEventListener("click", function (event) {
                event.preventDefault(); // voorkomt verspringen
                if (startIndex + visibleItems < allShopButtons.length) {
                    startIndex++;
                    updateShopItems();
                }
            });
            
            prevButton.addEventListener("click", function (event) {
                event.preventDefault(); // voorkomt verspringen
                if (startIndex > 0) {
                    startIndex--;
                    updateShopItems();
                }
            });

            updateShopItems();
        })
        .catch(error => {
            console.error("Error fetching Fortnite shop items:", error);
            shopContainer.innerHTML = "<p>Er is een probleem opgetreden bij het laden van de shop-items.</p>";
        });
}

// mobile versie (moest in 2 aparte funties anders werkte buttons niet)
function fetchShopItemsMobile(apiUrl, visibleItems = 8) {
    const shopContainer = document.querySelector(".shop-container");
    const prevButtonMobile = document.querySelector(".shop-button-mobile.prev-button");
    const nextButtonMobile = document.querySelector(".shop-button-mobile.next-button");
    let startIndex = 0;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (!data.data || !data.data.entries) {
                console.error("Onverwachte API-structuur:", data);
                shopContainer.innerHTML = "<p>Geen shop-items beschikbaar.</p>";
                return;
            }

            let shopItems = data.data.entries;

            if (shopItems.length === 0) {
                shopContainer.innerHTML = "<p>Geen shop-items beschikbaar.</p>";
                return;
            }

            shopItems = shopItems.filter(item => 
                item.bundle && item.bundle.name && item.bundle.image && item.finalPrice && item.finalPrice > 0
            );
            
            const itemsToDisplay = shopItems.slice(0, 40); 

            itemsToDisplay.forEach(item => {
                const shopButton = document.createElement("button");
                shopButton.classList.add("shop-item-button");

                let imageUrl = "images/items/placeholder.png";
                if (item.bundle && item.bundle.image) {
                    imageUrl = item.bundle.image;
                }

                let itemName = "Onbekend item";

                    if (item.bundle) {
                        for (let key in item.bundle) {
                            if (key === "name") {
                                itemName = item.bundle[key];
                                break; // Stop de loop zodra de naam is gevonden
                            }
                        }
                    }

                shopButton.innerHTML = `
                    <img src="${imageUrl}" alt="${itemName}">
                    <span class="item-name">${itemName}</span>
                    <span class="item-price">${item.finalPrice} <img src="/images/items/coin.png" alt="Coin" class="coin-icon"></span>
                    <button class="buy-button">Koop</button>
                `;

                shopContainer.appendChild(shopButton);
            });

            const allShopButtons = [...shopContainer.querySelectorAll(".shop-item-button")];

            function updateShopItems() {
                allShopButtons.forEach((item, index) => {
                    if (index >= startIndex && index < startIndex + visibleItems) {
                        item.style.display = "flex";
                    } else {
                        item.style.display = "none";
                    }
                });
            }

            nextButtonMobile.addEventListener("click", function (event) {
                event.preventDefault(); // Voorkomt onnodige scroll of refresh
                if (startIndex + visibleItems < allShopButtons.length) {
                    startIndex++;
                    updateShopItems();
                }
            });

            prevButtonMobile.addEventListener("click", function (event) {
                event.preventDefault(); // Voorkomt onnodige scroll of refresh
                if (startIndex > 0) {
                    startIndex--;
                    updateShopItems();
                }
            });

            updateShopItems();
        })
        .catch(error => {
            console.error("Error fetching Fortnite shop items:", error);
            shopContainer.innerHTML = "<p>Er is een probleem opgetreden bij het laden van de shop-items.</p>";
        });
}

// Aanroepen van beide functies
fetchShopItems(shopApiUrl); // Desktop versie
fetchShopItemsMobile(shopApiUrl); // Mobiele versie
