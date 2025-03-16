const menuImages = document.querySelectorAll(".menu li img"); 

const firstImage = document.querySelector(".menu li img");
firstImage.classList.add("active");

const textContent = document.querySelector(".text-content");

const textOptions = {
    "how-to-play": [
        "In dit spel kies jij je eigen avatar en stel je favorietenlijst samen.",
        "Koppel items, houd je wins en losses bij en voeg notities toe.",
        "Niet tevreden over een personage? Blacklist hem met een reden!",
        "Maar let op: als een personage drie keer zoveel verliest als wint, wordt het automatisch geblacklist.",
        "Tijd om je favorieten te kiezen en de strijd aan te gaan!"
    ],
    "skin-uitleg": [
        "Skins geven je personage een unieke uitstraling.",
        "Je kunt skins verzamelen en ruilen met andere spelers.",
        "Exclusieve skins zijn zeldzaam en moeilijk te verkrijgen.",
        "Sommige skins geven extra bonussen in speciale evenementen."
    ],
    "items-uitleg": [
        "Items helpen je strategisch voordeel te behalen.",
        "Gebruik items om tegenstanders te verslaan of jezelf te versterken.",
        "Verzamel zeldzame items om je speelstijl te verbeteren.",
        "Items kunnen worden gecombineerd voor speciale effecten."
    ],
    "profiel-uitleg": [
        "Je profiel bevat je statistieken en favoriete personages.",
        "Bekijk je overwinningen, verliezen en prestaties.",
        "Pas je profiel aan met een unieke avatar en achtergrond.",
        "Vergelijk je profiel met andere spelers in het klassement."
    ]
};


menuImages.forEach(img => {
    img.addEventListener("click", function() {

        const activeImage = document.querySelector(".menu li img.active");

        if (activeImage) {
            activeImage.classList.remove("active");
        }

      this.classList.add("active");

      const key = this.getAttribute("id");

      if (textOptions[key]) {
          textContent.innerHTML = textOptions[key].map(p => `<p>${p}</p>`).join("");
      }
    });
});
    // automatisch eerste afbeelding selecteren
    const firstImg = menuImages[0]; 
    firstImg.click(); 

