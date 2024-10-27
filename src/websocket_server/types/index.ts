export enum MessageType {
  USER_LOGIN='reg',
};

export type User = {
  name: string;
  password: string;
  id?: string;
};

export type Message = {
  type: string;
  data: string;
  id: number;
};
