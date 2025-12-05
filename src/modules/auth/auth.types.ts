export type TAuth = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: "customer" | "admin";
};

export type TLogin = {
  email: string;
  password: string;
};

export type TAuthResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  token?: string;
};
