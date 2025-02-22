document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.card img, .skins-button img');

    images.forEach(image => {
        image.addEventListener('click', function() {
            images.forEach(img => img.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const skinsContainer = document.querySelector(".landing-page-main");
    const skins = Array.from(document.querySelectorAll(".skins-button"));
    const prevButton = document.querySelector(".icon-button:first-of-type");
    const nextButton = document.querySelector(".icon-button:last-of-type");
    
    let visibleSkins = 4; // Aantal zichtbare skins
    let startIndex = 0;
    
    function updateSkins() {
        skins.forEach((skin, index) => {
            if (index >= startIndex && index < startIndex + visibleSkins) {
                skin.style.display = "flex";
            } else {
                skin.style.display = "none";
            }
        });
    }
    
    nextButton.addEventListener("click", function () {
        if (startIndex + visibleSkins < skins.length) {
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
});
