// verschillende api's om te gebruiken in index.ts en ejs etc
import { FortniteItem } from "./types";

const BASE_URL = 'https://fortnite-api.com/v2/cosmetics/br';

export async function fetchSkins( limit : number = 40): Promise<FortniteItem[]> {
  const response = await fetch(BASE_URL);
  const data = await response.json();

  return data.data.filter((item: any) => item.type.value === 'outfit').slice(0, limit);
}

export async function fetchItems(limit : number = 40): Promise<FortniteItem[]> {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    
    return data.data.filter((item: any) => item.type.value !== 'outfit').slice(0, limit);
}

export async function fetchAll(limit : number = 40): Promise<FortniteItem[]> {
    const response = await fetch(BASE_URL);
    const data = await response.json();
  
    return data.data.filter((item: any) => item.type.value !== 'outfit').slice(0, limit);
}