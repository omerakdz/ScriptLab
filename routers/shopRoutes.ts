import express from "express";
import { fetchShop } from "../api";

export default function shopRouter() {
  const router = express.Router();

  router.get("/shop", async (req, res) => {
    const items = await fetchShop(10);
    res.render("shop", {
      bodyId: "shop-page",
      title: "Shop",
      items,
    });
  });

  return router;
}
