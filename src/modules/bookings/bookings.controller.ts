import { Request, Response } from "express";
import { bookingService } from "./booking.service";
import { TBookingCreate } from "./booking.types";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const payload: TBookingCreate = req.body;
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors:
          "All fields are required (customer_id, vehicle_id, rent_start_date, rent_end_date)",
      });
    }

    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: "rent_end_date must be after rent_start_date",
      });
    }

    const result = await bookingService.createBooking(payload);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "Vehicle not found") {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error.message || error,
    });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const result = await bookingService.getAllBookings(user.id, user.role);

    const message =
      user.role === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully";

    return res.status(200).json({
      success: true,
      message: message,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error.message || error,
    });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { bookingId } = req.params;
    const { status } = req.body;

    const result = await bookingService.updateBooking(
      user.id,
      user.role,
      bookingId as string,
      status
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "Booking not found",
      });
    }

    const message =
      status === "cancelled"
        ? "Booking cancelled successfully"
        : "Booking marked as returned. Vehicle is now available";

    return res.status(200).json({
      success: true,
      message: message,
      data: result,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You are not authorized to update this booking",
      });
    }

    if (
      error.message === "Only active bookings can be cancelled" ||
      error.message === "Invalid status. Use 'cancelled' or 'returned'" ||
      error.message === "Only admins can mark bookings as returned" ||
      error.message === "Only active bookings can be marked as returned"
    ) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        errors: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error.message || error,
    });
  }
};
