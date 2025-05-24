import express from "express";
import {
  addFavoriteSkinToDB,
  addSkinToBlacklistDB,
  getBlacklistFromDB,
  getFavoriteSkinById,
  getFavoriteSkinIds,
  getFavSkinsDB,
  getSkinById,
  getSkinsByName,
  removeFavoriteSkinFromDB,
  skinsCollection,
  updateBlacklist,
  updateSkinStats,
} from "../database";
import { fetchSkins } from "../api";
import { BlacklistedSkin, Skin } from "../types";

export default function skinsRouter() {
  const router = express.Router();

  //  tonen van skins (zoeken + favorieten)
  router.get("/skins", async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    const username = req.session.username;

    const fetchedSkins = await fetchSkins(40);
    const databaseSkins = await getSkinsByName(query);

    const filteredFetchedSkins = fetchedSkins.filter((skin) =>
      skin.name.toLowerCase().includes(query.toLowerCase())
    );

    const skins = [...filteredFetchedSkins, ...databaseSkins];

    const favoriteSkinIds = await getFavoriteSkinIds(username);

    res.render("skins", {
      bodyId: "skins-page",
      title: "Skins",
      skins,
      searchQuery: query,
      favoriteSkinIds,
    });
  });

  //  toevoegen/verwijderen favoriet
  router.post("/skins", async (req, res) => {
    const username = req.session.username;
    const skinId = req.body.skinId;

    if (!username) {
      res.status(401).send("Niet ingelogd");
      return;
    }

    const favoriteSkinIds = await getFavoriteSkinIds(username);

    if (favoriteSkinIds.includes(skinId)) {
      await removeFavoriteSkinFromDB(username, skinId);
    } else {
      await addFavoriteSkinToDB(username, skinId);
    }

    res.redirect("/skins");
  });

  //  edit pagina van een skin
  router.get("/skins/edit/:id", async (req, res) => {
    const id = req.params.id;

    const skin: any = await skinsCollection.findOne({ id });

    if (!skin) {
      res.status(404).send("Skin niet gevonden");
      return;
    }

    res.render("edit-skin", {
      title: `Edit Skin - ${skin.name}`,
      skin,
      bodyId: "edit-skin-page",
    });
  });

  // opslaan wijzigingen skin stats
  router.post("/skins/edit/:id", async (req, res) => {
    const id = req.params.id;
    const wins = req.body.wins;
    const losses = req.body.losses;

    const winsNum = parseInt(wins, 10);
    const lossesNum = parseInt(losses, 10);

    if (isNaN(winsNum) || isNaN(lossesNum) || winsNum < 0 || lossesNum < 0) {
      res.status(400).send("Ongeldige invoer voor wins of losses.");
      return;
    }

    await updateSkinStats(id, winsNum, lossesNum);
    res.redirect("/favorite");
  });

  //  tonen blacklist
  router.get("/blacklist", async (req, res) => {
    const username: any = req.session.username;
    const blacklistItems = await getBlacklistFromDB(username);
    res.render("blacklist", {
      title: "Blacklist",
      bodyId: "blacklistPage",
      blacklistItems: blacklistItems,
    });
  });

  // formulier toevoegen aan blacklist
  router.get("/add-blacklist/:skinId", async (req, res) => {
    const skinId = req.params.skinId;
    const skin = await getSkinById(skinId);

    res.render("add-blacklist", {
      skin,
      title: "Blacklist toevoegen",
      bodyId: "add-blacklist-page",
    });
  });

  //  opslaan van blacklist item
  router.post("/add-blacklist", async (req, res) => {
    const username: any = req.session.username;

    const skinId = req.body.skinId;
    const reason: string = req.body.reason;

    if (!reason) {
      res.status(400).send("Reden is verplicht in te vullen");
      return;
    }

    await addSkinToBlacklistDB(username, skinId, reason);
    res.redirect("/blacklist");
  });

  //formulier bewerken blacklist item
  router.get("/blacklist/:skinId/edit", async (req, res) => {
    const username = req.session.username;
    const skinId = req.params.skinId;

    if (!username || !skinId) {
      res.status(400).send("Ongeldige aanvraag: ontbrekende username of skinId");
      return;
    }

    const blacklistItems = await getBlacklistFromDB(username);
    const itemToEdit = blacklistItems.find((b: BlacklistedSkin) => b.id === skinId);

    if (!itemToEdit) {
      res.status(404).send("Skin niet gevonden in de blacklist");
      return;
    }

    res.render("edit-blacklist", {
      skin: itemToEdit.skin,
      reason: itemToEdit.reason,
      skinId,
      title: `Blacklist bewerken - ${itemToEdit.skin?.name || skinId}`,
      bodyId: "edit-blacklist-page",
    });
  });

  // opslaan bewerkte blacklist
  router.post("/blacklist/:skinId/edit", async (req, res) => {
    const username = req.session.username;
    const skinId = req.params.skinId;
    const newReason: string = req.body.reason;
    const remove = req.body.remove === "true";

    if (!username) {
      res.status(401).send("Niet ingelogd");
      return;
    }

    const success = await updateBlacklist(username, skinId, newReason, remove);

    if (!success) {
      res.status(404).send("Gebruiker niet gevonden");
      return;
    }

    res.redirect("/blacklist");
  });

  // favoriete skins tonen
  router.get("/favorite", async (req, res) => {
    const username: any = req.session.username;
    const skins: Skin[] = await getFavSkinsDB(username);

    res.render("favorite", {
      title: "Favorieten",
      bodyId: "favorites-page",
      skins,
    });
  });

  //  toevoegen favoriet
  router.post("/favorites", async (req, res) => {
    const skinId = req.body.skinId;
    const username: any = req.session.username;

    await addFavoriteSkinToDB(username, skinId);
    res.redirect("/favorite");
  });

  // verwijderen favoriet
  router.post("/favorites/:skinId/delete", async (req, res) => {
    const skinId = req.params.skinId;
    const username: any = req.session.username;

    await removeFavoriteSkinFromDB(username, skinId);

    res.redirect("/favorite");
  });

  //  detailpagina favoriet
  router.get("/favorites/:id/detail", async (req, res) => {
    const skinId = req.params.id;
    const username: any = req.session.username;

    const skin = await getFavoriteSkinById(username, skinId);

    if (!skin) {
      res.status(404).send("Skin niet gevonden");
      return;
    }

    const backstory = `De skin "${skin.name}" werd voor het eerst gebruikt tijdens een legendarisch toernooi in Neo-Tilted. Volgens de overlevering werd het gecreëerd door een mysterieuze hacker om chaos te zaaien in het Fortnite-universum.`;

    res.render("skin-detail", {
      title: "Skin Detail",
      skin,
      backstory,
      bodyId: "skin-detail",
    });
  });

  return router;
}
