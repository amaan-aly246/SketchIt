export type ChatMssg = {
  message: string
  authorId: string
  isCorrect: boolean

}

export type Response<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
