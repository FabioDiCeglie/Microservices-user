export type MyContext = {
  token: string | undefined;
  user: IUser | undefined;
};

export type IUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  token?: string;
};
