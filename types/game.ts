
export type GameMode = 'bubble' | 'chain' | 'pattern' | 'rush';

export interface Bubble {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type?: 'normal' | 'mega';
}

export interface Tile {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  row: number;
  col: number;
  matched: boolean;
}

export interface PatternCard {
  id: string;
  x: number;
  y: number;
  size: number;
  row: number;
  col: number;
  symbol: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface UnlockedItem {
  id: string;
  type: 'skin' | 'color' | 'pattern';
  name: string;
  color?: string;
  unlocked: boolean;
}

export interface GameStats {
  totalPops: number;
  longestChain: number;
  favoriteMode: GameMode;
  unlockedItems: UnlockedItem[];
}
