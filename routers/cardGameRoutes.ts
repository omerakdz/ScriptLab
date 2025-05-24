import express from "express";
import { getLeaderboard, updatePlayerMovesIfBetter } from "../database";
import { prepareGameData, processCardGameMove, resetSessionGameState } from "../games";
import { fetchItems } from "../api";

export default function cardGameRouter() {
  const router = express.Router();

  router.get("/card-game", async (req, res) => {
    const reset = req.query.reset === "true";
    const showLeaderboard = req.query.leaderboard === "true";

    if (reset || !req.session.cards) {
      await resetSessionGameState(req.session);
      const { shuffled } = await prepareGameData(fetchItems, false);
      req.session.cards = shuffled;
    }

    const gameEnded =
      req.query.gameEnded === "true" ||
      (req.session.cards && req.session.matched
        ? req.session.cards.length === req.session.matched.length
        : false);

    const leaderboard = showLeaderboard ? await getLeaderboard() : [];

    res.render("card-game", {
      cards: req.session.cards,
      flipped: req.session.flipped,
      matched: req.session.matched,
      moves: req.session.moves ?? 0,
      title: "Kaartspel",
      bodyId: "card-game-page",
      showLeaderboard,
      leaderboard,
      gameEnded,
    });
  });

  router.post("/card-game", async (req, res) => {
    const cardIndex = parseInt(req.body.cardIndex);

    const gameState = await processCardGameMove(req.session, cardIndex, req.session.username);

    req.session.gameEnded = gameState.gameEnded;

    const showLeaderboard = false;
    const leaderboard: any[] = [];

    if (gameState.gameEnded && req.session.username) {
      await updatePlayerMovesIfBetter(req.session.username, gameState.moves);
    }

    res.render("card-game", {
      cards: gameState.cards,
      flipped: gameState.flipped,
      matched: gameState.matched,
      moves: gameState.moves,
      title: "Kaartspel",
      bodyId: "card-game-page",
      gameEnded: gameState.gameEnded,
      showLeaderboard,
      leaderboard,
    });
  });

  return router;
}
