import express from "express";
import { getItemsByName } from "../database";
import { SortDirection } from "mongodb";
import { fetchItems } from "../api";

export default function itemsRouter() {
  const router = express.Router();

  router.get("/items", async (req, res) => {
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

  return router;
}
