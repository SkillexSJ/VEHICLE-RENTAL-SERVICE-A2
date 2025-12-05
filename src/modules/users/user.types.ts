export type TUser = {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "customer" | "admin";
};

export type TUserResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
};

export type TUserUpdate = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: "customer" | "admin";
};
