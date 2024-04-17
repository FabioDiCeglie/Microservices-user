export type MyContext = {
  token: string;
};

export type IUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  token?: string;
};
