export type User = {
  _id: string;
  username: string;
  password?: string;
};

export type SessionPayload = {
  userId: string;
  username: string;
  expiresAt: Date;
};
