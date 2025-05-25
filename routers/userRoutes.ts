import express from "express";
import { Profile } from "../types";
import { profiles } from "../public/json/players.json";
import { secureMiddleware } from "../middleware/middleWare";

export default function profileRouter() {
  const router = express.Router();

  router.get("/user/:username", secureMiddleware, (req, res) => {
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

  router.get("/profile-settings", secureMiddleware, (req, res) => {
    res.render("profile-settings", {
      title: req.session.username ?? null,
      bodyId: "settings-page",
    });
  });

  router.get("/account-settings", secureMiddleware, (req, res) => {
    res.render("account-settings", {
      title: "Account-instellingen",
      bodyId: "settings-page",
    });
  });

  return router;
}
