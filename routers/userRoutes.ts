import express from "express";
import { Profile } from "../types";
import { profiles } from "../public/json/players.json";
import { secureMiddleware } from "../middleware/middleWare";
import {getSearchResults, getUserProfile} from  "../account";
import { usersCollection } from "../database";
import { fetchSkins } from "../api";

export default function profileRouter() {
  const router = express.Router();

  router.get("/search",secureMiddleware , async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const results = await getSearchResults(q);
  let noResults: boolean = false;
  if (q.trim() === "" || results.length === 0) {
    noResults = true;
  }
  console.log(results)
  res.render("search-profile", {
    title: "Zoekresultaten...",
    bodyId: "profile-search-page",
    results: results,
    q: q,
    noResults,
  });
});

router.get("/search/:username", secureMiddleware ,async (req, res) => {
  const username =
    typeof req.params.username === "string" ? req.params.username : "";
    if (username === req.session.username) {
      res.redirect("/profile-settings")
    }
  const currentUser = await usersCollection.findOne({ username: req.session.username });
  const profile = await getUserProfile(username);
  const skins = await fetchSkins();
  let alreadyFriends : boolean = false;
  if (currentUser === null) {
    return 
  }
    if (currentUser.friends.includes(username)) {
      alreadyFriends = true;
    }
  const selectedSkinUser = skins.find((skin) => skin.id === profile.selectedSkinId);
  res.render("user-profile", {
    title: `Profiel van ${username}`,
    bodyId: "user-profile-page",
    profile,
    selectedSkinUser,
    alreadyFriends
  });
});

router.post("/search/:username",secureMiddleware,async (req, res) => {
  const currentUsername = req.session.username;
  const friendUsername = req.body.friendUsername
  if (!friendUsername || friendUsername === currentUsername) {
     res.status(400).send("Invalid friend username.");
     return;  
  }

  const currentUser = await usersCollection.findOne({ username: currentUsername });
  const friendUser = await usersCollection.findOne({ username: friendUsername });

  if (!currentUser || !friendUser) {
    res.status(404).send("User not found.");
     return;
  }

  await usersCollection.updateOne(
    { username: currentUsername },
    { $push: { friends: friendUsername } }
  );

  await usersCollection.updateOne(
    { username: friendUsername },
    { $push: { friends: currentUsername } } as any
  );
  res.redirect('back');
});

router.post("/remove-friend/:username",secureMiddleware,async(req, res)=>{
const currentUsername = req.session.username;
  const friendUsername = req.body.friendUsername

  if (!friendUsername || friendUsername === currentUsername) {
     res.status(400).send("Invalid friend username.");
     return;  
  }

  const currentUser = await usersCollection.findOne({ username: currentUsername });
  const friendUser = await usersCollection.findOne({ username: friendUsername });

  if (!currentUser || !friendUser) {
    res.status(404).send("User not found.");
     return;
  }

  await usersCollection.updateOne(
    { username: currentUsername },
    { $pull: { friends: friendUsername } }
  );

  await usersCollection.updateOne(
    { username: friendUsername },
    { $pull: { friends: currentUsername } } as any
  );
  res.redirect('back');
})

router.get("/friends",secureMiddleware,async (req, res) => {
  const user = await usersCollection.findOne({
    username: req.session.username,
  });
  if (!user) {
    res.status(404).send("Gebruiker niet gevonden");
    return;
  }
  const friends = await usersCollection
    .find({
      username: { $in: user.friends },
    })
    .toArray();

  let noResults: boolean = false;
  if (friends.length === 0) {
    noResults = true;
  }

  res.render("friends", {
    title: "Vrienden",
    friends,
    bodyId: "friends-page",
    noResults
  });
});

router.get("/profile-settings",secureMiddleware,async(req, res) => {
  const user = await usersCollection.findOne({
    username: req.session.username,
  });
  res.render("profile-settings", {
    title: req.session.username ?? null,
    bodyId: "settings-page",
    user
  });
});

router.get("/account-settings",secureMiddleware,(req, res) => {
  res.render("account-settings", {
    title: "Account-instellingen",
    bodyId: "settings-page",
  });
});

router.get("/leaderboard",secureMiddleware,async (req, res) => {
  const user = await usersCollection.findOne({
    username: req.session.username,
  });
  if (!user) {
    res.status(404).send("Er is een fout opgetreden");
    return;
  }
  const friends = await usersCollection
    .find({
      username: { $in: user.friends },
    })
    .sort({
      moves : 1
    })
    .toArray();
    
  res.render("leaderboard", {
    title: "Account-instellingen",
    bodyId: "friends-page",
    profiles: friends,
  });
});

  return router;
}
