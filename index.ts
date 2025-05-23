import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { FortniteItem, Skin, Player, Card, Profile, BlacklistedSkin } from "./types";
import { fetchSkins, fetchItems, fetchAll, fetchShop } from "./api";
import { profiles } from "./public/json/players.json";
import { error } from "console";
import { title } from "process";
import { loginUser, createUser, addFavoriteSkin } from "./account";
import session from "./session";
import {usersCollection,connect,  getPlayersByName,getSkinById,getItemsByName,getSkinsByName,itemsCollection,getLeaderboard, updatePlayerMovesIfBetter, skinsCollection, getPlayerById, addFavoriteSkinToDB, getFavSkinsDB, getBlacklistFromDB, addSkinToBlacklistDB, updateSkinStats, updateBlacklist, removeFavoriteSkinFromDB,
} from "./database";
import { SessionData } from "express-session";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { SortDirection } from "mongodb";
import { clearGameSession, prepareGameData, processCardGameMove,  resetSessionGameState,  shuffle } from "./games";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(session);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("port", process.env.PORT ?? 3000);

// export async function secureMiddleware(req: Request, res: Response, next: NextFunction) {
//     console.log("Session username:", req.session.username); // controle
//     if (req.session.username) {
//         next();
//     } else {
//         res.redirect("/");
//     }
// };

app.use(async (req, res, next) => {
  if (req.session.username) {
    res.locals.username = req.session.username;

    const user = await usersCollection.findOne({
      username: req.session.username,
    });

    if (user) {
      res.locals.level = user.level || 1;
      res.locals.wins = user.wins || 0;
      res.locals.losses = user.losses || 0;
      res.locals.vbucks = 1000;

      if (user.selectedSkinId) {
        const skins = await fetchSkins();
        res.locals.selectedSkin = skins.find(
          (skin) => skin.id === user.selectedSkinId
        );
      } else {
        res.locals.selectedSkin = null;
      }
    }
  } else {
    res.locals.username = null;
    res.locals.selectedSkin = null;
  }

  next();
});

app.get("/", (req, res) => {
  res.render("menu", {
    bodyId: "menuBody",
    title: "Menu",
    username: req.session.username ?? null,
  });
});

app.post("/choose-game", (req, res) => {
  const chosenGame = req.body.game;

  if (chosenGame === "fortnite") {
    return res.redirect("/login");
  } else {
    res.render("menu", {
      errorMessage: `Spel "${chosenGame}" niet beschikbaar, probeer Fortnite!`
    });
  }
});

app.get("/login", (req, res) => {
  const message = "";
  res.render("login", {
    title: "Login",
    bodyId: "login-page",
    errorMessage: message,
  });
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user: Player = await loginUser(username, password);
    req.session.username = user.username;
    console.log("Sessies gebruikersnaam:", req.session.username);

    const userExists = await usersCollection.findOne({ username });

    if (userExists) {
      res.redirect("/index");
    } else {
      res.redirect("/landing");
    }
  } catch (error) {
    res.render("login", {
      errorMessage: "Ongeldige login",
      title: "Login",
      bodyId: "login-page",
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Fout bij het vernietigen van de sessie:", err);
      return res.status(500).send("Er is een fout opgetreden.");
    }
    res.redirect("/login");
  });
});

app.get("/register", (req, res) => {
  const errorMessage = "";
  res.render("register", {
    bodyId: "register-page",
    title: "Register",
    errorMessage: errorMessage,
  });
});

app.post("/signup", async (req, res) => {
  const { id,username, email, password, confirmPassword } = req.body;

  const existingUser = await usersCollection.findOne({ username });
  if (existingUser) {
    return res.render("register", {
      errorMessage: "Gebruikersnaam is al in gebruik.",
      title: "Register",
      bodyId: "register-page",
    });
  }

  if (password !== confirmPassword) {
    return res.render("register", {
      errorMessage: "De wachtwoorden komen niet overeen.",
      title: "Register",
      bodyId: "register-page",
    });
  }

  const user = await createUser(username, password);

  if (!user) {
    return res.render("register", {
      errorMessage:
        "Er is een fout opgetreden bij het aanmaken van het account.",
      title: "Register",
      bodyId: "register-page",
    });
  }

  req.session.username = user.username;
  res.redirect("/landing");
});

// secureMiddleware
app.get("/landing", async (req, res) => {
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

app.post("/landing", async (req, res) => {
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
app.get("/choose-item", async (req, res) => {
  const items = await fetchItems(20);
  res.render("choose-item", {
    bodyId: "item-pagina",
    title: "Kies Items",
    items,
    errorMessage: undefined,
    selectedItems: [],
  });
});

app.post("/select-items", async (req, res) => {
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

app.get("/index", async (req, res) => {
  await clearGameSession(req.session);
  res.render("index", {
    bodyId: "home-page",
    title: "Home pagina",

  });
});

app.get("/items", async (req, res) => {
  const searchItem = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const sortField =
    typeof req.query.sort === "string" ? req.query.sort : "name";
  const sortDirection: SortDirection = req.query.dir === "desc" ? -1 : 1;

  let items;

  if (searchItem !== "") {
    items = await getItemsByName(searchItem, sortField, sortDirection);
  } else {
    items = await fetchItems(40);
  }

  res.render("search-item", {
    bodyId: "search-item-body",
    title: "Items Pagina",
    items,
    searchItem,
  });
});

app.get("/skins", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q : "";

  const fetchedSkins = await fetchSkins(40);
  const databaseSkins = await getSkinsByName(query);

  const filteredFetchedSkins = fetchedSkins.filter((skin) =>
    skin.name.toLowerCase().includes(query.toLowerCase())
  );

  const skins = [...filteredFetchedSkins, ...databaseSkins];

  res.render("skins", {
    bodyId: "skins-page",
    title: "Skins",
    skins,
    searchQuery: query,
  });
});

app.get("/skins/edit/:id", async (req, res) => {
  const id = req.params.id;

  const skin : any= await skinsCollection.findOne({ id });

  if (!skin) {
     res.status(404).send("Skin niet gevonden");
  }

  res.render("edit-skin", {
    title: `Edit Skin - ${skin.name}`,
    skin,
    bodyId: "edit-skin-page",
  });
});

app.post("/skins/edit/:id", async (req, res) => {
  const id = req.params.id;
  const wins = req.body.wins;
  const losses = req.body.losses;

  const winsNum = parseInt(wins, 10);
  const lossesNum = parseInt(losses, 10);

  if (isNaN(winsNum) || isNaN(lossesNum) || winsNum < 0 || lossesNum < 0) {
     res.status(400).send("Ongeldige invoer voor wins of losses.");
  }

  await updateSkinStats(id, winsNum, lossesNum);
  res.redirect("/favorite");
  
});


app.get("/shop", async (req, res) => {
  const items = await fetchShop(10);
  res.render("shop", {
    bodyId: "shop-page",
    title: "Shop",
    items,
  });
});

app.get("/guide", (req, res) => {
  const section: string =
    typeof req.query.section === "string" ? req.query.section : "";
  res.render("guide", {
    bodyId: "guide-page",
    title: "Guide",
    section: section,
  });
});

app.get("/card-game", async (req, res) => {
    const reset = req.query.reset === "true";
   const showLeaderboard = req.query.leaderboard === "true";
 
  if (reset || !req.session.cards) {
     if (reset || !req.session.cards) {
    await resetSessionGameState(req.session); // hier reset je correct
    const { shuffled } = await prepareGameData(fetchItems, false);
    req.session.cards = shuffled;
  }
  }

   const gameEnded = req.query.gameEnded === "true" || (
    req.session.cards && req.session.matched
      ? req.session.cards.length === req.session.matched.length
      : false
  );

  let leaderboard : any = [];
  if (showLeaderboard) {
    leaderboard = await getLeaderboard();
  }

  res.render("card-game", {
    cards: req.session.cards,
    flipped: req.session.flipped,
    matched: req.session.matched,
    moves: req.session.moves ?? 0 ,
    title: "Kaartspel",
    bodyId: "card-game-page",
    showLeaderboard,
    leaderboard: showLeaderboard ? await getLeaderboard() : [],
    gameEnded,
  });
});

app.post("/card-game", async (req, res) => {
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

app.get("/search-profile", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const results: Profile[] = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(q.toLowerCase())
  );
  res.render("search-profile", {
    title: "Zoekresultaten...",
    bodyId: "profile-search-page",
    results: results,
    q: q,
  });
});

app.get("/user/:username", (req, res) => {
  const username = typeof req.params.username === "string" ? req.params.username : "";
  const profile: Profile | undefined = profiles.find(
    (profile) => profile.name === username
  );
  res.render("user-profile", {
    title: `Profiel van ${username}`,
    bodyId: "user-profile-page",
    profile: profile,
  });
});

app.get("/blacklist", async (req, res) => {
  const username: any = req.session.username;  // pak username uit sessie of auth
  const blacklistItems = await getBlacklistFromDB(username);
  res.render("blacklist", {
    title: "Blacklist",
    bodyId: "blacklistPage",
    blacklistItems: blacklistItems,
  });
});


app.get("/add-blacklist/:skinId", async (req, res) => {
    const skinId = req.params.skinId;
    const skin = await getSkinById(skinId);

    res.render("add-blacklist", {
       skin,
       title: "blacklist toevoegen", 
       bodyId: "add-blacklist-page", 
      });
});

app.post("/add-blacklist", async (req, res) => {
    const username : any = req.session.username;
 
    const skinId  = req.body.skinId;
    const reason : string = req.body.reason;

    if (!reason) {
       res.status(400).send("reden is verplicht in te vullen");
    }

    await addSkinToBlacklistDB(username, skinId, reason);
    res.redirect("/blacklist");
});

app.get("/blacklist/:skinId/edit", async (req, res) => {
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
    bodyId: "edit-blacklist-page"
  });
});


app.post("/blacklist/:skinId/edit", async (req, res) => {
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

app.get("/favorite", async (req, res) => {
  const username : any = req.session.username;
 
  const skins = await getFavSkinsDB(username);

  res.render("favorite", {
    title: "Favorieten",
    bodyId: "favorites-page",
    skins,
  });
});


app.post("/favorites", async (req, res) => {
  const skinId = req.body.skinId;
  const username : any = req.session.username;

  await addFavoriteSkinToDB(username, skinId);
  res.redirect("/favorite");
  
});

app.post("/favorites", async (req, res) => {
  const skinId = req.body.skinId;
  const username: any = req.session.username;

  await addFavoriteSkinToDB(username, skinId);
  res.redirect("/favorite");
});

app.post("/favorites/:skinId/delete", async (req, res) => {
  const skinId = req.params.skinId;
  const username: any = req.session.username;


  await removeFavoriteSkinFromDB(username, skinId);

  res.redirect("/favorite");
});


app.get("/profile-settings", (req, res) =>{
    res.render("profile-settings", {
        title : req.session.username ?? null, 
        bodyId : "settings-page"})
})

app.get("/account-settings", (req, res) => {
  res.render("account-settings", {
    title: "Account-instellingen",
    bodyId : "settings-page"}
  )
})

app.get("/leaderboard", (req, res) => {
   
  res.render("leaderboard", {
    title: "Account-instellingen",
    bodyId : "friends-page",
  profiles: profiles}
  )
})

app.listen(app.get("port"), async () => {
  await connect();
  console.log("Server started on http://localhost/:" + app.get("port"));
});

