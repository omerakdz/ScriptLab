// voorlopig
export interface Player{ // gebruiker
    id?: number;
    username: string;
    password?: string;
    playTime?: number;
    level?: number;
    wins?: number;
    losses?: number;
    lastPlayed?: Date;
    createdAt?: Date;
    friends?: string[];
    matches?: string[];
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
    playerId: string;
    player: Player;
    matches: string[];
    stats: {
        wins: number;
        losses: number;
        kills: number;
        deaths: number;
    };
}

export interface Card {
    id: string;
    name: string;
    image: string;
    matched: boolean;
}

export interface GameCard {
    card: Card;
    element: HTMLDivElement;
}

export interface FortniteItem {
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


