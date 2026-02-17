
export type GameMode = 'bubble' | 'chain' | 'color' | 'rush';

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

export interface ColorCell {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  row: number;
  col: number;
  intensity: number;
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
