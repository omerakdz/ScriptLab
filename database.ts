import mongoose from 'mongoose';
import { fetchItems, fetchSkins } from './api';
import { Collection } from 'mongodb';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { Player } from './types';
dotenv.config();

export const CONNECTION_STRING: string = process.env.CONNECTION_STRING ?? ""; 

const client = new MongoClient(CONNECTION_STRING);
export const collection: Collection = client.db("Scriptlab").collection("users");

// Functie om verbinding af te sluiten
async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

// Functie om de collectie te vullen met een voorbeeldspeler als deze leeg is
async function seed() {
    if ((await collection.countDocuments()) === 0) {
        const skins = await fetchSkins();
        const items = await fetchItems();
    
        // Voeg minstens 3 spelers toe
        for (let i = 1; i <= 3; i++) {
            const selectedSkin = skins[i % skins.length];  // Zorg ervoor dat we niet buiten de array gaan
            const selectedItems = items.slice(i * 2, i * 2 + 2);  // Kies twee verschillende items voor elke speler
    
            const examplePlayer: Player = {
                username: `Player${i}`,
                password: "password",
                level: 5 + i,  // Voor elk speler verhoog je het niveau
                wins: 12 + i,
                losses: 8 + i,
                createdAt: new Date(),
                friends: [],
                selectedSkin: selectedSkin,
                selectedItems: selectedItems,
                favoriteSkins: [skins[(i + 1) % skins.length]?.id],
                blacklistedSkins: [skins[(i + 2) % skins.length]?.id]
            };
    
            const insertResponse = await collection.insertOne(examplePlayer);
        }
    }
}

// Functie om de databaseverbinding te maken
export async function connect() {
    try {
        await client.connect();
        console.log("Connected to the database");
        
        // Zorg ervoor dat de verbinding wordt afgesloten bij afsluiten van het proces
        process.on("SIGINT", exit); 

        // await collection.dropIndex("*"); 
        // await collection.deleteMany({}); 
        await seed();

        await collection.createIndex({ username: "text" });

    } catch (error) {
        console.error(error);
        process.exit(0); // Stop het proces bij een fout
    }
}