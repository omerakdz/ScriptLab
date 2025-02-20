document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", function() {
        document.querySelector(".menu a.active")?.classList.remove("active");
        this.classList.add("active");
    });
});