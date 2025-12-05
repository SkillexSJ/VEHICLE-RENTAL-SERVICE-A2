import { pool } from "../../config/db";
import { TUser, TUserResponse, TUserUpdate } from "./user.types";

const getAllUsers = async (): Promise<TUserResponse[]> => {
  const result = await pool.query(`SELECT * FROM users`);
  return result.rows;
};

const updateUser = async (
  userId: string,
  payload: TUserUpdate
): Promise<TUserResponse | null> => {
  const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);

  if (user.rowCount === 0) {
    return null;
  }

  const oldUser = user.rows[0];

  const name = payload.name !== undefined ? payload.name : oldUser.name;
  const email = payload.email !== undefined ? payload.email : oldUser.email;
  const password =
    payload.password !== undefined ? payload.password : oldUser.password;
  const phone = payload.phone !== undefined ? payload.phone : oldUser.phone;
  const role = payload.role !== undefined ? payload.role : oldUser.role;

  const result = await pool.query(
    `UPDATE users SET name = $1, email = $2, password = $3, phone = $4, role = $5 WHERE id = $6 RETURNING *`,
    [name, email, password, phone, role, userId]
  );

  return result.rows[0];
};

const deleteUser = async (userId: string): Promise<TUserResponse | null> => {
  const activeBookings = await pool.query(
    `SELECT * FROM bookings WHERE customer_id = $1 AND status = $2`,
    [userId, "active"]
  );

  if (activeBookings.rowCount && activeBookings.rowCount > 0) {
    throw new Error("User has active bookings");
  }

  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [userId]
  );

  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
};

export const userService = {
  getAllUsers,
  updateUser,
  deleteUser,
};
