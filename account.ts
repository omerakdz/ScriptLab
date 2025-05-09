import { Player } from "./types";

export async function loginUser(username : string, password : string):Promise<Player> {
    if (username === 'admin' && password === '1234') {
        return { username: username}; 
    } else {
        throw new Error('Ongeldige login');
    }
}