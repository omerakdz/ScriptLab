import express from "express";
import { secureMiddleware } from "../middleware/middleWare";
import { fetchItems } from "../api";
import { shuffle } from "../games";


export default function cardGameRouter() {
    const router = express.Router();

    router.get("/clicker-game", secureMiddleware, async (req, res) => {
        const items = await fetchItems(12);

        // Genereer een willekeurige volgorde van itemnamen
        const itemNames = items.map(item => item.name);
        shuffle(itemNames);

        // Start timer en sla in sessie op
        req.session.clickerGame = {
            items: itemNames,           // ← deze moet erbij!
            targetOrder: itemNames,     // of geshuffelde versie ervan
            currentIndex: 0,
            startTime: Date.now()
        };

        res.render("clicker-game", {
            title: "Clicker Game",
            items,
            target: itemNames[0],
            result: null,
            bodyId: "clicker-game-body"
        });
    });

    router.post("/clicker-game", secureMiddleware, async (req, res) => {
        const { clickerGame } = req.session;
        const { selectedItem } = req.body;

        if (!clickerGame) {
            return res.redirect("/clicker-game"); // sessie verlopen
        }

        const items = await fetchItems(12); 

        if (Date.now() - clickerGame.startTime > 30000) {
            req.session.clickerGame = undefined;
            return res.render("clicker-game", {
                title: "Clicker Game",
                items,
                target: null,
                result: "⏱️ Tijd is op! Game over.",
                bodyId: "clicker-game-body"
            });
        }

        const correctItem = clickerGame.targetOrder[clickerGame.currentIndex];
        if (selectedItem === correctItem) {
            clickerGame.currentIndex++;

            if (clickerGame.currentIndex >= clickerGame.targetOrder.length) {
                const timeTaken = ((Date.now() - clickerGame.startTime) / 1000).toFixed(1);
                req.session.clickerGame = undefined;
                return res.render("clicker-game", {
                    title: "Clicker Game",
                    items,
                    target: null,
                    result: `🎉 Je hebt gewonnen in ${timeTaken} seconden!`,
                    bodyId: "clicker-game-body"
                });
            }

            // Volgende item
            const nextTarget = clickerGame.targetOrder[clickerGame.currentIndex];
            return res.render("clicker-game", {
                title: "Clicker Game",
                items,
                target: nextTarget,
                result: null,
                bodyId: "clicker-game-body"
            });
        } else {
            req.session.clickerGame = undefined; // Reset de sessie
            return res.render("clicker-game", {
                title: "Clicker Game",
                items,
                target: null,
                result: "❌ Verkeerde keuze. Game over.",
                bodyId: "clicker-game-body"
            });
        }
    });

    return router;
}

