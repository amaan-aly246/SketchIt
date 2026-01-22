export type ChatMssg = {
  message: string;
  authorId: string;
  isCorrect: boolean;
  authorName: string;
};

export type Response<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Stroke = {
  points: { x: number; y: number }[];
  tool: "pen" | "eraser" | "none";
};
export type Participant = {
  userId: string;
  userName: string;
  score: number;
  foundAnswer?: boolean;
};

export type PlayerRole = "guesser" | "artist";

export type UserData = {
  userId: string | null;
  userName: string | null;
  roomName: string | null;
  roomCode: string | null;
  canvasHistory: Stroke[];
  foundAnswer: boolean;
  score: number;
  role: PlayerRole;
  isAdmin: boolean;
};
export interface GameState {
  currentRound: number;
  totalRounds: number;
  roundTime: number;
  isRoundActive: boolean;
  isGameActive: boolean;
  gameAdminId: string | null;
  currentArtistId: string | null;
  currentArtistName: string | null;
  // gameAdminName : string | null ;
}
export interface ChooseWordPayload {
  currentRound: number;
  totalRounds: number;
  nextArtist: Participant;
  roundTime: number;
  words: string[];
}
export interface RoundOverPayload {
  participants: Participant[];
  roundTime: number; // The reset time for the next round
}

export interface EndGamePayload {
  participants: Participant[];
}

export interface RoundStartedPayload {
  currentRound: number;
  totalRounds: number;
  roundTime: number;
  word: string; // The word to be drawn
}
