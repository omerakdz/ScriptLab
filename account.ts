import { FortniteItem, Player } from "./types";
import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { usersCollection } from "./database";

dotenv.config();
const saltRounds: number = parseInt(process.env.SALT!);

export async function createUserId(): Promise<number> { // geeft elke user automatisch een id
    // Zoek het huidige hoogste id in de collectie
    const highestUser: Player | null = await usersCollection.findOne<Player>({}, { sort: { id: -1 } });

    // Start bij 1 als er nog geen gebruikers zijn
    let newId: number = 1;
    if (highestUser && typeof highestUser.id === "number") {
        newId = highestUser.id + 1;
    }

    return newId;
}

export async function createUser(username: string, password: string): Promise<Player | null> {
    const id = await createUserId();
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user : Player= {
        id,
        username,
        password: hashedPassword,
        level: 1,
        wins: 0,
        losses: 0,
        bestTime: null,   
        moves: null,            
        createdAt: new Date(),
        friends: [],
        selectedSkinId: undefined,          
        selectedItems: [],             
        favoriteSkins: [],             
        blacklistedSkins: [],          
        vbucks: 1000                  
    };

    try {
        const result = await usersCollection.insertOne(user);
        console.log(`Gebruiker aangemaakt met id ${result.insertedId}`);
        return { id,username};
    } catch (error) {
        console.error("Fout bij aanmaken gebruiker:", error);
        return null;
    }
}

// Gebruiker inloggen
export async function loginUser(username: string, password: string): Promise<Player> {
    const user  = await usersCollection.findOne({ username });

    if (!user) {
        throw new Error("Gebruiker niet gevonden");
    }

    if (!user.password) {
    throw new Error("Wachtwoord ontbreekt voor deze gebruiker");
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
        bestTime: user.bestTime,
    };
}

// Haal gebruikersprofiel op
export async function getUserProfile(username: string) {
    const user = await usersCollection.findOne({ username }, { projection: { password: 0 } });
    if (!user) throw new Error("Gebruiker niet gevonden");
    return user;
}

export async function updateSelectedSkin(username: string, skinId: string) {
    await usersCollection.updateOne({ username }, { $set: { selectedSkinId: skinId } });
}

export async function updateSelectedItems(username: string, items:FortniteItem[]) {
    if (items.length > 2) throw new Error("Je mag maximaal 2 items selecteren");
    await usersCollection.updateOne({ username }, { $set: { selectedItems: items } });
}

export async function addFriend(username: string, friendUsername: string) {
    await usersCollection.updateOne(
        { username },
        { $addToSet: { friends: friendUsername } }
    );
}

export async function addFavoriteSkin(username: string, skinId: string) {
    await usersCollection.updateOne(
        { username },
        { $addToSet: { favoriteSkinId: skinId } }
    );
}

export async function updateGameResult(username: string, didWin: boolean) {
    const update = didWin
        ? { $inc: { wins: 1, level: 1 } }
        : { $inc: { losses: 1 } };
    await usersCollection.updateOne({ username }, update);
}