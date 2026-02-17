
export type GameMode = 'bubble' | 'chain' | 'color' | 'rush';

export interface Bubble {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type?: 'normal' | 'mega';
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
