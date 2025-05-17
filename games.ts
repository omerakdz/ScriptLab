import { fetchItems } from "./api";
import { getLeaderboard,  updatePlayerMovesIfBetter, usersCollection } from "./database";
import { Card, FortniteItem } from "./types";

// hier komen alle functies voor de games
export function shuffle<T>(array: T[]): T[] { // voor memory card game
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function prepareGameData(fetchItems: (count: number) => Promise<FortniteItem[]>, showLeaderboard: boolean) {
  const items = await fetchItems(10);

  const duplicated = [...items, ...items].map((item, index) => ({
    id: index.toString(),
    name: item.name,
    image: item.images.icon,
    matched: false,
  }));

  const shuffled = shuffle(duplicated);

  let leaderboard : any= [];
  if (showLeaderboard) {
    leaderboard = await getLeaderboard();
  }

  return { shuffled, leaderboard };
}

export async function processCardGameMove(session: any, cardIndex: number, username?: string) {
  if (typeof session.toBeClosed === "undefined") {
    session.toBeClosed = false;
  }

  const cards = session.cards ?? [];
  let flipped = session.flipped ?? [];
  let matched = session.matched ?? [];
  let moves = session.moves ?? 0;
  let toBeClosed = session.toBeClosed ?? false;

  if (toBeClosed) {
    flipped = [];
    toBeClosed = false;
  }

  if (!flipped.includes(cardIndex) && !matched.includes(cardIndex)) {
    flipped.push(cardIndex);
  }

  if (flipped.length === 2) {
    const [i1, i2] = flipped;
    if (cards[i1].name === cards[i2].name) {
      if (!matched.includes(i1)) matched.push(i1);
      if (!matched.includes(i2)) matched.push(i2);
      flipped = [];
    } else {
      toBeClosed = true;
    }
    moves++;
  }

  const gameEnded = cards.length > 0 && matched.length === cards.length;

  if (gameEnded && username) {
    await updatePlayerMovesIfBetter(username, moves);
  }

  // update session
  session.cards = cards;
  session.flipped = flipped;
  session.matched = matched;
  session.moves = moves;
  session.toBeClosed = toBeClosed;

  return { cards, flipped, matched, moves, gameEnded };
}

export async function clearGameSession(session: any) {
  delete session.cards;
  delete session.flipped;
  delete session.matched;
  delete session.moves;
  delete session.toBeClosed;
  delete session.gameEnded;
}

export function resetSessionGameState(session: any) {
  session.cards = [];
  session.flipped = [];
  session.matched = [];
  session.moves = 0;
  session.toBeClosed = false;
}