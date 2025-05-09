import { Player } from "./types";
import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { collection } from "./database";

dotenv.config();
const saltRounds: number = parseInt(process.env.SALT!);

export async function createUser(username: string, password: string): Promise<Player | null> {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = {
        username,
        password: hashedPassword,
        blacklistedSkinId: [],
        favoriteSkinId: [],
        selectedSkinId: null,
        selectedItems: [], // max 2
        level: 1,
        wins: 0,
        losses: 0,
        createdAt: new Date(),
        friends: []
    };

    try {
        const result = await collection.insertOne(user);
        console.log(`Gebruiker aangemaakt met id ${result.insertedId}`);
        return { username };
    } catch (error) {
        console.error("Fout bij aanmaken gebruiker:", error);
        return null;
    }
}

// Gebruiker inloggen
export async function loginUser(username: string, password: string): Promise<Player> {
    const user  = await collection.findOne({ username });

    if (!user) {
        throw new Error("Gebruiker niet gevonden");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Ongeldig wachtwoord");
    }

    return {
        username: user.username,
        level: user.level,
        wins: user.wins,
        losses: user.losses,
    };
}

// Haal gebruikersprofiel op
export async function getUserProfile(username: string) {
    const user = await collection.findOne({ username }, { projection: { password: 0 } });
    if (!user) throw new Error("Gebruiker niet gevonden");
    return user;
}

export async function updateSelectedSkin(username: string, skinId: string) {
    await collection.updateOne({ username }, { $set: { selectedSkinId: skinId } });
}

export async function updateSelectedItems(username: string, items: string[]) {
    if (items.length > 2) throw new Error("Je mag maximaal 2 items selecteren");
    await collection.updateOne({ username }, { $set: { selectedItems: items } });
}

export async function addFriend(username: string, friendUsername: string) {
    await collection.updateOne(
        { username },
        { $addToSet: { friends: friendUsername } }
    );
}

export async function addFavoriteSkin(username: string, skinId: string) {
    await collection.updateOne(
        { username },
        { $addToSet: { favoriteSkinId: skinId } }
    );
}

export async function updateGameResult(username: string, didWin: boolean) {
    const update = didWin
        ? { $inc: { wins: 1, level: 1 } }
        : { $inc: { losses: 1 } };
    await collection.updateOne({ username }, update);
}