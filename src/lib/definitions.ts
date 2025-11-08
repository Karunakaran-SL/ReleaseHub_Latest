export type User = {
  _id: string;
  email: string;
  password?: string;
};

export type SessionPayload = {
  userId: string;
  email: string;
  expiresAt: Date;
};
