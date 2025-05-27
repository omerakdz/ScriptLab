import express from "express";
import { getItemsByName, usersCollection } from "../database";
import { SortDirection } from "mongodb";
import { fetchItems, fetchShop } from "../api";
import { secureMiddleware } from "../middleware/middleWare";

export default function itemsRouter() {
  const router = express.Router();

  router.get("/items", secureMiddleware, async (req, res) => {
    const searchItem = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const sortField = typeof req.query.sort === "string" ? req.query.sort : "name";
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

router.get("/my-items", secureMiddleware, async (req, res) => {

    const user = await usersCollection.findOne({ username: req.session.username });
    if (!user) {
      return res.redirect("/login");
    }

    const items = await fetchShop(100);

    const myItems = items.filter(item => user.boughtItems.includes(item.devName));

    res.render("my-items", {
      bodyId: "my-items-page",
      title: "Mijn Gekochte Items",
      items: myItems,
    });
});

  return router;
}
