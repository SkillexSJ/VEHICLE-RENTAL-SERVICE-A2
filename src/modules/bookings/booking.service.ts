import { pool } from "../../config/db";
import { formatDate } from "../../helper/formatDate";
import { calculatePrice } from "../../helper/priceCalculator";
import { TBookingCreate, TBookingResponse } from "./booking.types";

const autoReturnBookings = async () => {
  const expiredBookings = await pool.query(
    `SELECT id, vehicle_id FROM bookings WHERE status = $1 AND rent_end_date < CURRENT_DATE`,
    ["active"]
  );

  if (expiredBookings.rowCount && expiredBookings.rowCount > 0) {
    for (const booking of expiredBookings.rows) {
      await pool.query(`UPDATE bookings SET status = $1 WHERE id = $2`, [
        "returned",
        booking.id,
      ]);

      await pool.query(
        `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
        ["available", booking.vehicle_id]
      );
    }
  }
};

const createBooking = async (
  payload: TBookingCreate
): Promise<TBookingResponse> => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const vehicleResult = await pool.query(
    `SELECT vehicle_name, daily_rent_price, availability_status FROM vehicles WHERE id = $1`,
    [vehicle_id]
  );

  if (vehicleResult.rowCount === 0) {
    throw new Error("Vehicle not found");
  }

  const { vehicle_name, daily_rent_price, availability_status } =
    vehicleResult.rows[0];

  if (availability_status === "booked") {
    throw new Error("Vehicle is already booked");
  }

  const total_price = calculatePrice(
    rent_start_date,
    rent_end_date,
    daily_rent_price
  );

  const result = await pool.query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      "active",
    ]
  );

  await pool.query(
    `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
    ["booked", vehicle_id]
  );

  const booking = result.rows[0];

  return {
    ...booking,
    rent_start_date: formatDate(booking.rent_start_date),
    rent_end_date: formatDate(booking.rent_end_date),
    vehicle: {
      vehicle_name,
      daily_rent_price,
    },
  };
};

const getAllBookings = async (userId: number, userRole: string) => {
  await autoReturnBookings();

  let result;

  if (userRole === "admin") {
    result = await pool.query(
      `SELECT 
        b.id, 
        b.customer_id, 
        b.vehicle_id, 
        b.rent_start_date, 
        b.rent_end_date, 
        b.total_price, 
        b.status,
        u.name as customer_name,
        u.email as customer_email,
        v.vehicle_name,
        v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id DESC`
    );

    return result.rows.map((booking) => ({
      id: booking.id,
      customer_id: booking.customer_id,
      vehicle_id: booking.vehicle_id,
      rent_start_date: formatDate(booking.rent_start_date),
      rent_end_date: formatDate(booking.rent_end_date),
      total_price: booking.total_price,
      status: booking.status,
      customer: {
        name: booking.customer_name,
        email: booking.customer_email,
      },
      vehicle: {
        vehicle_name: booking.vehicle_name,
        registration_number: booking.registration_number,
      },
    }));
  } else {
    result = await pool.query(
      `SELECT 
        b.id, 
        b.vehicle_id, 
        b.rent_start_date, 
        b.rent_end_date, 
        b.total_price, 
        b.status,
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id DESC`,
      [userId]
    );

    return result.rows.map((booking) => ({
      id: booking.id,
      vehicle_id: booking.vehicle_id,
      rent_start_date: formatDate(booking.rent_start_date),
      rent_end_date: formatDate(booking.rent_end_date),
      total_price: booking.total_price,
      status: booking.status,
      vehicle: {
        vehicle_name: booking.vehicle_name,
        registration_number: booking.registration_number,
        type: booking.type,
      },
    }));
  }
};

const updateBooking = async (
  userId: number,
  userRole: string,
  bookingId: string,
  status: string
) => {
  const bookingResult = await pool.query(
    `SELECT * FROM bookings WHERE id = $1`,
    [bookingId]
  );

  if (bookingResult.rowCount === 0) {
    return null;
  }

  const booking = bookingResult.rows[0];

  if (status === "cancelled") {
    if (booking.customer_id !== userId) {
      throw new Error("Unauthorized");
    }

    if (booking.status !== "active") {
      throw new Error("Only active bookings can be cancelled");
    }

    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      ["cancelled", bookingId]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
      ["available", booking.vehicle_id]
    );

    const updatedBooking = result.rows[0];
    return {
      ...updatedBooking,
      rent_start_date: formatDate(updatedBooking.rent_start_date),
      rent_end_date: formatDate(updatedBooking.rent_end_date),
    };
  }

  if (status === "returned") {
    if (userRole !== "admin") {
      throw new Error("Only admins can mark bookings as returned");
    }

    if (booking.status !== "active") {
      throw new Error("Only active bookings can be marked as returned");
    }

    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      ["returned", bookingId]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
      ["available", booking.vehicle_id]
    );

    const vehicleResult = await pool.query(
      `SELECT availability_status FROM vehicles WHERE id = $1`,
      [booking.vehicle_id]
    );

    const updatedBooking = result.rows[0];
    return {
      ...updatedBooking,
      rent_start_date: formatDate(updatedBooking.rent_start_date),
      rent_end_date: formatDate(updatedBooking.rent_end_date),
      vehicle: {
        availability_status: vehicleResult.rows[0].availability_status,
      },
    };
  }

  throw new Error("Invalid status. Use 'cancelled' or 'returned'");
};

export const bookingService = {
  createBooking,
  autoReturnBookings,
  getAllBookings,
  updateBooking,
};
