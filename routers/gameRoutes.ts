import express from "express";
import { clearGameSession } from "../games";
import { fetchItems, fetchSkins } from "../api";
import { usersCollection } from "../database";
import { Skin } from "../types";
import { secureMiddleware } from "../middleware/middleWare";

export default function gameRouter() {
  const router = express.Router();

  router.get("/landing", secureMiddleware, async (req, res) => {
    const skins = await fetchSkins(40);
    const selectedSkinImage = req.query.selectedSkinImage;
    res.render("landing", {
      bodyId: "landing-page",
      title: "Landing",
      skins,
      errorMessage: undefined,
      selectedSkinImage,
    });
  });

  router.post("/landing", async (req, res) => {
    const skins: Skin[] = await fetchSkins(40);
    const selectedSkin = req.body.selectedSkin;

    console.log("Gekozen skin:", selectedSkin);

    if (!selectedSkin) {
      return res.render("landing", {
        errorMessage: "Geen skin geselecteerd!",
        title: "Landing",
        bodyId: "landing-page",
        skins: skins,
      });
    }

    await usersCollection.updateOne(
      { username: req.session.username },
      { $set: { selectedSkinId: selectedSkin } }
    );

    res.redirect("choose-item");
  });

  // secureMiddleware
  router.get("/choose-item", secureMiddleware, async (req, res) => {
    const items = await fetchItems(20);
    res.render("choose-item", {
      bodyId: "item-pagina",
      title: "Kies Items",
      items,
      errorMessage: undefined,
      selectedItems: [],
    });
  });

  router.post("/select-items", secureMiddleware, async (req, res) => {
    const selectedItems = req.body.selectedItems || [];
    if (selectedItems.length === 2) {
      console.log("Geselecteerde items:", selectedItems.length); // Controle

      await usersCollection.updateOne(
        { username: req.session.username },
        { $set: { selectedItems: selectedItems } }
      );

      res.redirect("/index");
    } else {
      const items = await fetchItems(20);
      res.render("choose-item", {
        bodyId: "item-pagina",
        title: "Kies Items",
        errorMessage: "Je moet precies twee items kiezen.",
        items,
        selectedItems: selectedItems || [],
      });
    }
  });

  router.get("/index", secureMiddleware, async (req, res) => {
    await clearGameSession(req.session);
    res.render("index", {
      bodyId: "home-page",
      title: "Home pagina",
    });
  });

  return router;
}
