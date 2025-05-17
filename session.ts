import session, { MemoryStore } from "express-session";
import dotenv from "dotenv";
import mongoDBsession from "connect-mongodb-session";
import {CONNECTION_STRING} from "./database";
import { Card } from "./types";

dotenv.config();

const MongoDBStore = mongoDBsession(session); // niet uit te leggen

const mongoStore = new MongoDBStore({
    uri: CONNECTION_STRING, // connection string from .env file
    collection: "sessions", // naam van de collectie waar de sessies in worden opgeslagen
    databaseName: "Scriptlab", // naam van de database waar de sessies in worden opgeslagen
});

mongoStore.on("error", (error: any) => {
    console.error(error); // wordt opgeroepen als er een fout is
})

declare module "express-session" {
    export interface SessionData {
        username?: string; // username van de ingelogde speler
        cards?: Card[]; 
        flipped?: number[];
        matched?: number[];
        moves?: number;
        toBeClosed?: boolean;
        gameEnded?: boolean;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: mongoStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
            // leeg = sessie stopt wanneer server dicht gaat
    }
});