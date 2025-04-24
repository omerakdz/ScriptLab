import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { FortniteItem, Skin, Player, Card, GameCard } from "./types";
import { fetchSkins, fetchItems, fetchAll } from "./api";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("port", process.env.PORT ?? 3000);


app.get("/", (req, res) => {
    res.render("index", {
            bodyId : "home-page",
            title   : "Home"
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        bodyId : "login-page",
        title   : "Login"
    });
}); 

app.get("/register", (req, res) => {
    res.render("register", {
        bodyId : "register-page",
        title   : "Register"
    });
});

app.get("/landing", async(req, res) => {
    try {
        const skins = await fetchSkins(40);
        res.render("landing", {
            bodyId: "landing-page",
            title: "Landing",
            skins,
        });
    } catch (error) {
        console.error("Fout bij ophalen skins:", error);
        res.status(500).send("Fout bij ophalen van skins");
    }
});

app.get("/item", async(req, res) => {
    try {
        const items = await fetchItems(40);
        res.render("item", {
            bodyId: "item-pagina",
            title: "item",
            items 
        });
    } catch (error) {
        console.error("Fout bij ophalen items:", error);
        res.status(500).send("Fout bij ophalen van items");
    }
});


app.get("/menu", (req, res) => {
    res.render("menu", {
        bodyId : "menuBody",
        title   : "Menu"
    });
});

app.get("/shop", (req, res) => {
    res.render("shop", {
        bodyId : "shop-page",
        title   : "Shop"
    });
});

app.get("/guide", (req, res) => {
    res.render("guide", {
        bodyId : "guide-page",
        title   : "Guide"
    });
});

app.get("/card-game", async(req, res) => {
    try {
        const items: FortniteItem[] = await fetchItems(10);
    
        const duplicated = [...items, ...items]; // kopie van array
    
        // kaarten schudden
        for (let i = duplicated.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
        }
    
        res.render("card-game", {
          title: "Memory Game",
          bodyId: "card-game",
          items: duplicated
        });
    
      } catch (error) {
        console.error("Fout bij ophalen van kaartjes:", error);
        res.status(500).send("Fout bij ophalen van items.");
      }
});

app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost/:" + app.get("port"));
});