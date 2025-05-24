import express from "express";

export default function guideRouter() {
  const router = express.Router();

  router.get("/guide", (req, res) => {
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
