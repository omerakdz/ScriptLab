import express from "express";

export default function menuRouter() {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.render("menu", {
      bodyId: "menuBody",
      title: "Menu",
      username: req.session.username ?? null,
    });
  });

  router.post("/choose-game", (req, res) => {
    const chosenGame = req.body.game;

    if (chosenGame === "fortnite") {
      return res.redirect("/login");
    }

    res.render("menu", {
      errorMessage: `Spel "${chosenGame}" niet beschikbaar, probeer Fortnite!`,
    });
  });

  return router;
}
