import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { FortniteItem, Skin, Player, Card, GameCard } from "./types";
import { fetchSkins, fetchItems, fetchAll, fetchShop } from "./api";
import { loginUser, createUser } from "./account";
import session from "./session";
import { collection, connect } from "./database";
import { SessionData } from "express-session";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";


dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(session);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("port", process.env.PORT ?? 3000);

// export async function secureMiddleware(req: Request, res: Response, next: NextFunction) {
//     console.log("Session username:", req.session.username); // controle
//     if (req.session.username) {
//         next();
//     } else {
//         res.redirect("/"); 
//     }
// };

app.use(async(req, res, next) => {
    if (req.session.username) {
        res.locals.username = req.session.username;

        const user = await collection.findOne({ username: req.session.username });

        if (user) {
            res.locals.level = user.level || 1;
            res.locals.wins = user.wins || 0;
            res.locals.losses = user.losses || 0;
            res.locals.vbucks = 1000;

            if (user.selectedSkinId) {
                const skins = await fetchSkins();
                res.locals.selectedSkin = skins.find(skin => skin.id === user.selectedSkinId);
            } else {
                res.locals.selectedSkin = null;
            }
        }
    } else {
        res.locals.username = null;
        res.locals.selectedSkin = null;
    }

    next();
});

app.get("/", (req, res) => {
    res.render("menu", {
        bodyId: "menuBody",
        title: "Menu",
        username: req.session.username ?? null 
    });
});

app.get("/login", (req, res) => {
    const message = "";
    res.render("login", {
        title: "Login",
        bodyId: "login-page",
        errorMessage: message
    });
});

app.post("/login", async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user: Player = await loginUser(username, password);
        req.session.username = user.username;
        console.log("Sessies gebruikersnaam:", req.session.username);

        const userExists = await collection.findOne({ username });
        
        if (userExists) {
            res.redirect("/index");
        } else {
            res.redirect("/landing");
        }

    } catch (error) {
        res.render("login", {
            errorMessage: "Ongeldige login",
            title: "Login",
            bodyId: "login-page"
        });
    }
});

app.get("/logout", (req, res) => {
        req.session.destroy((err) => {
        if (err) {
        console.error("Fout bij het vernietigen van de sessie:", err);
        return res.status(500).send("Er is een fout opgetreden.");
        }
        res.redirect("/login"); 
        });
});

app.get("/register", (req, res) => {
    const errorMessage = "";
    res.render("register", {
        bodyId: "register-page",
        title: "Register",
        errorMessage: errorMessage
    });
});

app.post("/signup", async (req, res) => {
    const { username,email, password, confirmPassword } = req.body;

    const existingUser = await collection.findOne({ username });
    if (existingUser) {
        return res.render("register", {
            errorMessage: "Gebruikersnaam is al in gebruik.",
            title: "Register",
            bodyId: "register-page"
        });
    }

    if (password !== confirmPassword) {
        return res.render("register", {
            errorMessage: "De wachtwoorden komen niet overeen.",
            title: "Register",
            bodyId: "register-page"
        });
    }

    const user = await createUser(username, password);

    if (!user) {
        return res.render("register", {
            errorMessage: "Er is een fout opgetreden bij het aanmaken van het account.",
            title: "Register",
            bodyId: "register-page"
        });
    }

    req.session.username = user.username;
    res.redirect("/landing");
});

// secureMiddleware
app.get("/landing",  async(req, res) => {
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

await collection.updateOne(
    { username: req.session.username },
    { $set: { selectedSkinId: selectedSkin } }
);

res.redirect('choose-item')
});

// secureMiddleware
app.get("/choose-item",async (req, res) => {
    const items = await fetchItems(20);
    res.render("choose-item", {
        bodyId: "item-pagina",
        title: "Kies Items", 
        items,
        errorMessage: undefined, 
        selectedItems: [] 
    });
});

app.post("/select-items", async (req, res) => {
    const selectedItems = req.body.selectedItems || []; 
    if (selectedItems.length === 2) {
        console.log("Geselecteerde items:", selectedItems.length); // Controle

        await collection.updateOne(
            { username: req.session.username },
            { $set: { selectedItems: selectedItems } }
        );

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


app.get("/index", async(req, res) => {
    res.render("index", {
        bodyId: "home-page",
        title: "Home pagina",
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


app.get("/shop", async (req, res) => {
    const items = await fetchShop(10); 
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

app.listen(app.get("port"), async() => {
    await connect();
    console.log("Server started on http://localhost/:" + app.get("port"));
});


