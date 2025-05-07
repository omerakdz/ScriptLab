import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { FortniteItem, Skin, Player, Card, GameCard } from "./types";
import { fetchSkins, fetchItems, fetchAll, fetchShop } from "./api";
import { loginUser } from "./account";
import { error } from "console";



dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("port", process.env.PORT ?? 3000);



app.get("/", (req, res) => {
    res.render("menu", {
            bodyId : "menuBody",
            title   : "Menu"
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        bodyId : "login-page",
        title   : "Login"
    });
}); 

app.post("/login", async(req, res) => {
    // const username = req.body.username;
    // const password = req.body.password;
    
    // const user : Player = await loginUser(username, password); 
    res.redirect("/landing");
    // if (user) {
    //     res.redirect("/landing");
    // }   
});

app.get("/register", (req, res) => {
    res.render("register", {
        bodyId : "register-page",
        title   : "Register"
    });
});

app.get("/landing", async(req, res) => {
        const skins = await fetchSkins(40);
        const selectedSkinImage = req.query.selectedSkinImage
        res.render("landing", {
            bodyId: "landing-page",
            title: "Landing",
            skins,
            errorMessage: undefined,
            selectedSkinImage
        });
    
});

app.post("/landing", async (req, res) => {
    const skins : Skin[] = await fetchSkins(40); 
    const selectedSkin  = req.body.selectedSkin;
    
    console.log("Gekozen skin:", selectedSkin);

    if (!selectedSkin) {
        return res.render("landing", {
            errorMessage: "Geen skin geselecteerd!",
            title: "Landing",
            bodyId: "landing-page",
            skins: skins ,
        });
    }

    res.redirect('choose-item')
});

app.get("/choose-item", async (req, res) => {
    const items = await fetchItems(20);
    console.log("Items:", items); // Controle
    res.render("choose-item", {
        bodyId: "item-pagina",
        title: "Kies Items", 
        items,
        errorMessage: undefined, 
        selectedItems: [] 
    });
});

app.post("/select-items", async (req, res) => {
    const selectedItems = req.body.selectedItems || []; // Gekozen items op de item pagina
    if (selectedItems.length === 2) {
        console.log("Geselecteerde items:", selectedItems); // Controle
        res.redirect("/index"); 
    } else {
        const items = await fetchItems(20);  
        res.render("choose-item", {
            bodyId: "item-pagina",
            title: "Kies Items", 
            errorMessage: "Je moet precies twee items kiezen.", 
            items,
            selectedItems: selectedItems || [], 
        });
    }
});


app.get("/index", (req, res) => {
    res.render("index", {
        bodyId : "home-page",
        title   : "home pagina"
    });
});

app.get("/items", async(req, res) => {
    const searchItem  = typeof req.query.q === "string" ? req.query.q : "";
    
    const items = await fetchItems(40); 

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchItem.toLowerCase())
    );
    res.render("search-item", {
        bodyId: "search-item-body",
        title: "Items Pagina",
        items: items, 
        searchItem : searchItem,
        filteredItems: filteredItems
    });
})

app.get("/skins", async(req, res) => {
    const skins : Skin[] = await fetchSkins(40);
    res.render("skins", {
        bodyId : "skins-page",
        title   : "skins",
        skins: skins
    });
});


app.get("/shop", async(req, res) => {
    const items = await fetchShop(40); 
    res.render("shop", {
        bodyId: "shop-page",
        title: "Shop",
        items 
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


