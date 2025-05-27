import express from "express";
import { fetchShop } from "../api";
import { secureMiddleware } from "../middleware/middleWare";
import { usersCollection } from "../database";

export default function shopRouter() {
  const router = express.Router();

 router.get("/shop", secureMiddleware, async (req, res) => {
  const error = req.query.error;
  const items = await fetchShop(10);

  const user = await usersCollection.findOne({ username: req.session.username });
  const boughtItems = user?.boughtItems || [];

  res.render("shop", {
    bodyId: "shop-page",
    title: "Shop",
    items,
    boughtItems: user?.boughtItems || [], 
    error,
  });
});

router.post("/shop/buy", secureMiddleware ,async (req, res) => {
  if (!req.session.username) return res.redirect("/login");

  const { itemId, itemPrice } = req.body;
  const price = parseInt(itemPrice);

  const user = await usersCollection.findOne({ username: req.session.username });
  if (!user) return res.redirect("/shop");

  const alreadyBought = user.boughtItems?.includes(itemId);
  if (alreadyBought) return res.redirect("/shop");

  if (user.vbucks >= price) {
    await usersCollection.updateOne(
      { username: req.session.username },
      {
        $inc: { vbucks: -price },
        $push: { boughtItems: itemId },
      }
    );
  }
  if (user.vbucks < price) {
  return res.redirect("/shop?error=notEnoughVbucks");
}

  res.redirect("/shop");
});

  return router;
}
