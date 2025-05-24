import express from "express";
import { Profile } from "../types";
import { profiles } from "../public/json/players.json";

export default function searchRouter() {
  const router = express.Router();

  router.get("/search-profile", (req, res) => {
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

  return router;
}
