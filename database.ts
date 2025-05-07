// hier komt mongoDB connectie
import mongoose from 'mongoose';
import { Collection } from 'mongodb';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const CONNECTION_STRING = process.env.MONGO_URI || "";

const client = new MongoClient(CONNECTION_STRING);

export const collection:Collection = client.db("Scriptlab").collection("users")

export async function exit() {
    try {
        await client.close();
        console.log("Database connection closed.");
    } catch (error) {
        console.log("error")
    } finally{
        process.exit(0); // exit the process
    }

}

export async function connect() {
    try {
        await client.connect();
        console.log("Connected to the database");
        process.on("SIGINT", exit ); // listen for the SIGINT signal (Ctrl+C)

    } catch (error) {
        console.error(error);
        process.exit(0); // exit the process with an error code
    }
}