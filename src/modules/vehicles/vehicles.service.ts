import { pool } from "../../config/db";
import { TVehicle, TVehicleCreate, TVehicleUpdate } from "./vehicles.types";

const createVehicle = async (payload: TVehicleCreate): Promise<TVehicle> => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;
  const result = await pool.query(
    `INSERT INTO vehicles (vehicle_name , type , registration_number , daily_rent_price , availability_status) VALUES ($1 , $2 , $3 , $4 , $5) RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );
  return result.rows[0];
};

const getAllVehicles = async (): Promise<TVehicle[]> => {
  const result = await pool.query(`SELECT * FROM vehicles`);
  return result.rows;
};

const getVehicleById = async (id: string): Promise<TVehicle | null> => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
};

const updateVehicle = async (
  id: string,
  payload: TVehicleUpdate
): Promise<TVehicle | null> => {
  const vehicle = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
    id,
  ]);

  if (vehicle.rowCount === 0) {
    return null;
  }
  const oldVehicle = vehicle.rows[0];

  const vehicle_name =
    payload.vehicle_name !== undefined
      ? payload.vehicle_name
      : oldVehicle.vehicle_name;
  const type = payload.type !== undefined ? payload.type : oldVehicle.type;
  const registration_number =
    payload.registration_number !== undefined
      ? payload.registration_number
      : oldVehicle.registration_number;
  const daily_rent_price =
    payload.daily_rent_price !== undefined
      ? payload.daily_rent_price
      : oldVehicle.daily_rent_price;
  const availability_status =
    payload.availability_status !== undefined
      ? payload.availability_status
      : oldVehicle.availability_status;

  const result = await pool.query(
    `UPDATE vehicles SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5 WHERE id = $6 RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
      id,
    ]
  );

  return result.rows[0];
};

const deleteVehicle = async (id: string): Promise<TVehicle | null> => {
  const activeBookings = await pool.query(
    `SELECT * FROM bookings WHERE vehicle_id = $1 AND status = $2`,
    [id, "active"]
  );

  if (activeBookings.rowCount && activeBookings.rowCount > 0) {
    throw new Error("Vehicle has active bookings");
  }

  const result = await pool.query(
    `DELETE FROM vehicles WHERE id = $1 RETURNING *`,
    [id]
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
};

export const vehicleService = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
