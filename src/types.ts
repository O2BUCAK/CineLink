export enum GameStage {
  HOME = 'HOME',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
  LEADERBOARD = 'LEADERBOARD',
}

export type LinkType = 'PERSON' | 'MOVIE';

export interface LinkStep {
  type: LinkType;
  name: string;
}

export interface GameState {
  startNode: string;
  endNode: string;
  currentChain: LinkStep[];
  isFinished: boolean;
  score: number;
  shortestPathSteps: number;
  warning?: string;
}

export interface LeaderboardEntry {
  id?: string;
  nickname: string;
  score: number;
  date: string;
  chain: string[];
  playCount: number; // Kaçıncı oynayışında o puanı aldığı
  userId?: string;   // Google kullanıcı id'si (kalıcı ise)
  isTemporary?: boolean; // Misafir ise geçici rekor
}
