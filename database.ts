import mongoose from 'mongoose';
import { fetchItems, fetchSkins } from './api';
import { Collection, SortDirection } from 'mongodb';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { FortniteItem, Player, Skin } from './types';
dotenv.config();

export const CONNECTION_STRING: string = process.env.CONNECTION_STRING ?? ""; 

const client = new MongoClient(CONNECTION_STRING);
export const usersCollection: Collection = client.db("Scriptlab").collection("users");
export const skinsCollection: Collection<Skin> = client.db("Scriptlab").collection("skins");
export const itemsCollection: Collection<FortniteItem> = client.db("Scriptlab").collection("items");


export async function getPlayersByName(q: string = "", sortField: string = "username", sortDirection: SortDirection = 1) {
    const query = q === "" ? {} : { username: { $regex: q, $options: 'i' } };  
    return await usersCollection.find(query).sort({ [sortField]: sortDirection }).toArray();
}

export async function getPlayerById(id: string) {
    return await usersCollection.findOne({ id: id });
}

export async function getSkinsByName(q: string = "", sortField: string = "name", sortDirection: SortDirection = 1) {
    const query = q === "" ? {} : { name: { $regex: q, $options: 'i' } };  
    return await skinsCollection.find(query).sort({ [sortField]: sortDirection }).toArray();
}

export async function getSkinById(id: string) {
    return await skinsCollection.findOne({ id });
}

export async function getItemsByName(q: string = "", sortField: string = "name", sortDirection: SortDirection = 1) {
    const query = q === "" ? {} : { name: { $regex: q, $options: 'i' } };  
    return await itemsCollection.find(query).sort({ [sortField]: sortDirection }).toArray();
}

export async function getItemById(id: string) {
    return await itemsCollection.findOne({ id });
}

export async function getLeaderboard() {
  return await usersCollection.find({})
    .sort({ moves: 1 }) 
    .limit(4)
    .toArray();
}

export async function updatePlayerMovesIfBetter(username: string, newMoves: number) {
  const user = await usersCollection.findOne({ username });

  if (!user) {
    return;
  }

  const currentMoves = user.moves ?? 0;

  if (newMoves < currentMoves) {
    await usersCollection.updateOne(
      { username },
      { $set: { moves: newMoves } }
    );
  }
}

export async function updateGameResult(username: string, didWin: boolean) {
    const user = await usersCollection.findOne({ username });

    if (!user) return;

    const currentWins = user.wins ?? 0;
    const currentLosses = user.losses ?? 0;
    const currentLevel = user.level ?? 1;
    const currentVbucks = user.vbucks ?? 1000;

    const newWins = didWin ? currentWins + 1 : currentWins;
    const newLosses = didWin ? currentLosses : currentLosses + 1;
    const newLevel = didWin ? currentLevel + 1 : currentLevel;
    const newVbucks = didWin ? currentVbucks + 100 : currentVbucks + 50;

     await usersCollection.updateOne(
        { username },
        {
            $set: {
                wins: newWins,
                losses: newLosses,
                level: newLevel,
                vbucks: newVbucks
            }
        }
    );
}

export async function addFriend(username: string, friendUsername: string) {
    const user = await usersCollection.findOne({ username });
    const friend = await usersCollection.findOne({ username: friendUsername });

    if (!user || !friend) return;

    const currentFriends: string[] = user.friends ?? [];
    if (currentFriends.includes(friendUsername)) return;

    currentFriends.push(friendUsername);

    await usersCollection.updateOne(
        { username },
        { $set: { friends: currentFriends } }
    );
}

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
    if ((await usersCollection.countDocuments()) === 0) {
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
                moves: 19 +i,
                createdAt: new Date(),
                friends: [],
                selectedSkin: selectedSkin,
                selectedItems: selectedItems,
                favoriteSkins: [skins[(i + 1) % skins.length]?.id],
                blacklistedSkins: [skins[(i + 2) % skins.length]?.id]
            };
    
            const insertResponse = await usersCollection.insertOne(examplePlayer);
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

        await usersCollection.createIndex({ username: "text" });

    } catch (error) {
        console.error(error);
        process.exit(0); // Stop het proces bij een fout
    }
}