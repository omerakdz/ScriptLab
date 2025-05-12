// verschillende api's om te gebruiken in index.ts en ejs etc
import { FortniteItem, Skin } from "./types";

const BASE_URL = 'https://fortnite-api.com/v2/cosmetics/br';

export async function fetchSkins(limit: number = 40): Promise<Skin[]> {
  const response = await fetch(BASE_URL);
  const data = await response.json();



  return data.data
    .filter((item: any) =>
      item.type.value === 'outfit' &&
      item.images?.icon
    )
    .slice(0, limit);

}

export async function fetchItems(limit: number = 40): Promise<FortniteItem[]> {
  const response = await fetch(BASE_URL);
  const data = await response.json();


  const validItems = data.data.filter((item: any) => item.images && item.images.icon);
  return validItems.slice(0, limit);
}

export async function fetchShop(limit: number = 40): Promise<FortniteItem[]> {
  const response = await fetch("https://fortnite-api.com/v2/shop");
  const data = await response.json();

  if (!data || !data.data || !data.data.entries) {
    console.error("Geen gegevens gevonden");
    return [];
  }
  const shopItems: FortniteItem[] = data.data.entries;

  const filterImage = shopItems.filter(item => item.bundle?.image);

  return filterImage.slice(0, limit);
}



export async function fetchAll(limit: number = 40): Promise<FortniteItem[]> {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  return data.data
    .filter((item: any) =>
      item.type.value !== 'outfit' &&
      item.images?.icon
    )
    .slice(0, limit);

}