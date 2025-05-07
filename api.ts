// verschillende api's om te gebruiken in index.ts en ejs etc
import { FortniteItem, Skin } from "./types";

const BASE_URL = 'https://fortnite-api.com/v2/cosmetics/br';

export async function fetchSkins( limit : number = 40): Promise<Skin[]> {
  const response = await fetch(BASE_URL);
  const data = await response.json();

  return data.data.filter((item: any) => item.type.value === 'outfit').slice(0, limit);
}

export async function fetchItems(limit : number = 40): Promise<FortniteItem[]> {
    const response = await fetch(BASE_URL);
    const data = await response.json();

    
    const validItems = data.data.filter((item: any) => item.images && item.images.icon);
    return validItems.slice(0, limit);
}

export async function fetchShop(limit: number = 40): Promise<FortniteItem[]> {
    const response = await fetch("https://fortnite-api.com/v2/shop");
    const data = await response.json();
    console.log(data); // Voeg deze regel toe om te kijken wat er in de data zit
    if (Array.isArray(data.data)) {
        return data.data.slice(0, limit); // Zorg ervoor dat data.data een array is
    } else {
        console.error("De ontvangen data is geen array:", data.data); 
        return []; // Of een lege array teruggeven als data niet in het verwachte formaat is
    }
}

export async function fetchAll(limit : number = 40): Promise<FortniteItem[]> {
    const response = await fetch(BASE_URL);
    const data = await response.json();
  
    return data.data.filter((item: any) => item.type.value !== 'outfit').slice(0, limit);
}