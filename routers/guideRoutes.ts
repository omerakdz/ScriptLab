import express from "express";
import { secureMiddleware } from "../middleware/middleWare";

export default function guideRouter() {
  const router = express.Router();

  router.get("/guide", secureMiddleware, (req, res) => {
    const section: string =
      typeof req.query.section === "string" ? req.query.section : "";
    res.render("guide", {
      bodyId: "guide-page",
      title: "Guide",
      section: section,
    });
  });

  return router;
}
