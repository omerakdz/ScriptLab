import mongoose from 'mongoose';
import { fetchItems, fetchSkins } from './api';
import { Collection, ObjectId, SortDirection } from 'mongodb';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { BlacklistedSkin, FortniteItem, Player, Skin, FavoriteSkin } from './types';
import { createUserId } from './account';
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

export async function getFavoriteSkinById(username: string, skinId: string): Promise<Skin | null> { // was nodig voor fav detail want deed moeilijk
  const user = await usersCollection.findOne({ username });
  if (!user?.favoriteSkins?.length) {
    return null;
  }

  const isFavorite = user.favoriteSkins.some((fav: FavoriteSkin) => fav.id === skinId);
  if (!isFavorite) {
    return null;
  }

  const skin = await skinsCollection.findOne({ id: skinId });

  return skin || null;
}

export async function getFavoriteSkinIds(username: string | undefined): Promise<string[]> { // voor skin pagina ster
  if (!username) return [];
  const favSkins = await getFavSkinsDB(username);
  return favSkins.map(skin => skin.id.toString());
}


export async function getItemsByName(q: string = "", sortField: string = "name", sortDirection: SortDirection = 1) {
    const query = q === "" ? {} : { name: { $regex: q, $options: 'i' } };  
    return await itemsCollection.find(query).sort({ [sortField]: sortDirection }).toArray();
}

export async function getItemById(id: string) {
    return await itemsCollection.findOne({ id });
}

export async function getLeaderboard() {
  return await usersCollection.find({
    moves: { $ne: null }  // alleen spelers die moves hebben
  })
  .sort({ moves: 1 })
  .limit(4)
  .toArray();
}

export async function updatePlayerMovesIfBetter(username: string, newMoves: number) {
  const user = await usersCollection.findOne({ username });

  if (!user) {
    return;
  }

  const currentMoves = user.moves ?? Infinity; // Als moves niet bestaat, beschouwen we het als oneindig

  if (newMoves < currentMoves) {
    await usersCollection.updateOne(
      { username },
      { $set: { moves: newMoves } }
    );
  }
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

export async function updateSkinStats(id: string, wins: number, losses: number): Promise<void> {
  await skinsCollection.updateOne(
    { id },
    { $set: { "stats.wins": wins, "stats.losses": losses } }
  );
}

export async function addFavoriteSkinToDB(username: string, skinId: string): Promise<void> {
  const user = await usersCollection.findOne({ username });
  if (!user) return;

  const currentFavorites: FavoriteSkin[] = user.favoriteSkins ?? [];

  if (currentFavorites.find(entry => entry.id === skinId)) {
    console.log(`Skin ${skinId} staat al in de favorieten van ${username}.`);
    return;
  }

  currentFavorites.push({ id: skinId });

  await usersCollection.updateOne(
    { username },
    { $set: { favoriteSkins: currentFavorites } }
  );
}

export async function getFavSkinsDB(username: string): Promise<Skin[]> {
  const user = await usersCollection.findOne({ username });
  if (!user?.favoriteSkins?.length) return [];

  const ids = user.favoriteSkins.map((fav: FavoriteSkin) => fav.id);
  const skins = await skinsCollection.find({ id: { $in: ids } }).toArray();

  return user.favoriteSkins.map((fav: FavoriteSkin) => ({
    ...fav,
    skin: skins.find((s) => s.id === fav.id) || null,
  }));
}

export async function addSkinToBlacklistDB(username: string, skinId: string, reason: string): Promise<void> {
    const user = await usersCollection.findOne({ username });

    if (!user) {
        console.error(`Gebruiker met username "${username}" niet gevonden.`);
        return;
    }

    const currentBlacklist: BlacklistedSkin[] = user.blacklistedSkins ?? [];

    if (currentBlacklist.find(entry => entry.id === skinId)) {
        console.log(`Skin ${skinId} staat al op de blacklist van ${username}.`);
        return;
    }

    currentBlacklist.push({ id: skinId, reason });

    await usersCollection.updateOne(
        { username },
        { $set: { blacklistedSkins: currentBlacklist } }
    );
}

export async function getBlacklistFromDB(username: string) {
  const user = await usersCollection.findOne({ username });

  if (!user?.blacklistedSkins?.length) return [];

  const ids = user.blacklistedSkins.map((b : BlacklistedSkin) => b.id);
  const skins = await skinsCollection.find({ id: { $in: ids } }).toArray();

  return user.blacklistedSkins.map((b : BlacklistedSkin) => ({
    ...b,
    skin: skins.find((s) => s.id === b.id) || null,
  }));
}

export async function updateBlacklist(
  username: string,
  skinId: string,
  newReason: string,
  remove: boolean
): Promise<boolean> {
  const user = await usersCollection.findOne({ username });
  if (!user) return false;

  let currentBlacklist = user.blacklistedSkins ?? [];

  if (remove) {
    currentBlacklist = currentBlacklist.filter((skin: Skin) => skin.id !== skinId);
  } else {
    currentBlacklist = currentBlacklist.map((skin: Skin) =>
      skin.id === skinId ? { ...skin, reason: newReason } : skin
    );
  }

  await usersCollection.updateOne(
    { username },
    { $set: { blacklistedSkins: currentBlacklist } }
  );

  return true;
}

export async function removeFavoriteSkinFromDB(username: string, skinId: string): Promise<void> {
 const user = await usersCollection.findOne({ username });
if (!user) return;

const updatedFavorites = (user.favoriteSkins ?? []).filter((fav : Skin) => fav.id !== skinId);

await usersCollection.updateOne(
  { username },
  { $set: { favoriteSkins: updatedFavorites } }
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

    if ((await skinsCollection.countDocuments()) === 0) {
        try {
        const insertResult = await skinsCollection.insertMany(skins);
        console.log(`Inserted ${insertResult.insertedCount} skins.`);
        } catch (error) {
        console.error("Fout bij het invoegen van skins:", error);
        }
    }

    
        // 3 spelers toegevoegd
        for (let i = 1; i <= 3; i++) {
             const id = await createUserId();
            const selectedSkin = skins[i % skins.length];  
            const selectedItems = items.slice(i * 2, i * 2 + 2);  // Kies twee verschillende items voor elke speler
    
            const examplePlayer: Player = {
                id,
                username: `Player${i}`,
                password: "password",
                level: 5 + i,  // Voor elk speler verhoog je het niveau
                wins: 12 + i,
                losses: 8 + i,
                bestTime: null,
                moves: 29 + i,
                createdAt: new Date(),
                friends: [],
                selectedSkinId: selectedSkin,
                selectedItems: selectedItems,
                favoriteSkins: [{ id: skins[(i + 1) % skins.length]?.id }],
                blacklistedSkins: [{
                id: skins[(i + 2) % skins.length]?.id,
                reason: "Ik vind deze skin niet mooi"  // Voorbeeld reden
                }]
            };
    
            const insertResponse = await usersCollection.insertOne(examplePlayer);
        }
    }
}

async function seedSkins() { // skin collectie wou niet toegevoegd worden dus dit gemaakt
    const count = await skinsCollection.countDocuments();
    if (count === 0) {
      const skins = await fetchSkins();
      const result = await skinsCollection.insertMany(skins);
      console.log(`Inserted ${result.insertedCount} skins`);
    } else {
      console.log("Skins collection is not empty, skipping seed.");
    }
}

// Functie om de databaseverbinding te maken
export async function connect() {
    try {
        await client.connect();
        console.log("Connected to the database");
        
        // Zorg ervoor dat de verbinding wordt afgesloten bij afsluiten van het proces
        process.on("SIGINT", exit); 

        // await usersCollection.dropIndex("*"); // gebruik deze 2 om collectie te resetten en updaten (niewe veld toevoegen)
        // await usersCollection.deleteMany({}); // gebruik deze 2 om collectie te resetten en updaten (niewe veld toevoegen)
        await seed();
        await seedSkins();
        console.log("Database seeded");

        await usersCollection.createIndex({ username: "text" });

    } catch (error) {
        console.error(error);
        process.exit(0); // Stop het proces bij een fout
    }
}