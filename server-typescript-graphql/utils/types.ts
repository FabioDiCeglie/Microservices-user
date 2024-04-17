export type MyContext = {
  token: string;
  user: IUser;
};

export type IUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  token?: string;
};
