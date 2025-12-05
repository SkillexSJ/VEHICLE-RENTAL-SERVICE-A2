import config from "../../config";
import { pool } from "../../config/db";
import { TAuth, TAuthResponse } from "./auth.types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signUP = async (payload: TAuth): Promise<TAuthResponse> => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [payload.name, payload.email, hashedPassword, payload.phone, payload.role]
  );

  return result.rows[0];
};

const login = async (
  email: string,
  password: string
): Promise<TAuthResponse | null | false> => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  const isPassValid = await bcrypt.compare(password, user.password);
  if (!isPassValid) {
    return false;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwt_secret as string,
    { expiresIn: "7d" }
  );

  return { ...user, token };
};

export const authService = {
  signUP,
  login,
};
