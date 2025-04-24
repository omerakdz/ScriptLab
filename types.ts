// voorlopig
export interface Player{ // gebruiker
    id: string;
    username: string;
    playTime: number;
    level: number;
    wins: number;
    losses: number;
    lastPlayed: Date;
    createdAt: Date;
    friends: string[];
    matches: string[];
}

export interface Skin{
    id: string;
    name: string;
    rarity: string;
    imageUrl: string;
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

export interface FortniteItem { // voor api
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
        value: string; // outfit, item, etc.
    };
  }



