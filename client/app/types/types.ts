import { SkPath } from "@shopify/react-native-skia";
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

export type DrawPath = {
  path: SkPath;
  tool: "pen" | "eraser";
};

export type Stroke = {
  points: { x: number; y: number }[];
  tool: "pen" | "eraser";
};
export type Participant = {
  userId: string;
  userName: string;
  score: number;
  foundAnswer?: boolean;
};

type PlayerRole = "guesser" | "artist";

export type UserData = {
  userId: string | null;
  userName: string | null;
  roomName: string | null;
  roomCode: string | null;
  canvasHistory: Stroke[];
  foundAnswer: boolean;
  score: number;
  role: PlayerRole;
};
