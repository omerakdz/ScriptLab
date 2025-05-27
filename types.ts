export interface Player {
    id?: number;
    username: string;
    password?: string;
    email?: string;
    blacklistedSkins?: BlacklistedSkin[];
    favoriteSkins?: FavoriteSkin[];
    selectedSkinId?: Skin;
    selectedItems?: FortniteItem[]; // max 2
    level?: number;
    wins?: number;
    losses?: number;
    createdAt?: Date;
    friends?: string[];
    bestTime?: number | null;
    moves?: number | null;
    vbucks?: number;
    boughtItems?: string[];
  }

export interface Skin{
    id: string;
    name: string;
    rarity: string;
    images: {
        icon: string; 
        featured: string;
    };
    description: string;
    matches: string[];
    stats: {
        wins: number;
        losses: number;
        kills: number;
        deaths: number;
    };
    items?: FortniteItem[];
}

export interface BlacklistedSkin {
  id: string;
  reason: string;
}

export interface FavoriteSkin {
  id: string;
}

export interface Card {
    id: string;
    name: string;
    image: string;
    matched: boolean;
}

export interface FortniteItem {
    devName: string;
    finalPrice: number;
    offerTag: any;
    bundle: any;
    id: string;
    name: string;
    images: {
      icon: string;
    };
    rarity: {
        value: string; // epic, legendary, etc.
    };
    description: string;
    type: {
        id(id: any): unknown;
        value: string; // outfit, item, etc.
    };
  }

  export interface Profile{
      name: string;
      skinIconUrl: string;
  }