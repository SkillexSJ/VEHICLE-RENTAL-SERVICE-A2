import { Request, Response } from "express";
import { bookingService } from "./booking.service";
import { TBookingCreate } from "./booking.types";
import { sendError, sendResponse } from "../../helper/responseHandler";
import { HttpStatusCode } from "../../types/httpStatusCodes";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const payload: TBookingCreate = req.body;
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        "All fields are required (customer_id, vehicle_id, rent_start_date, rent_end_date)"
      );
    }

    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);

    if (endDate <= startDate) {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        "rent_end_date must be after rent_start_date"
      );
    }

    const result = await bookingService.createBooking(payload);
    return sendResponse(
      res,
      HttpStatusCode.CREATED,
      "Booking created successfully",
      result
    );
  } catch (error: any) {
    if (error.message === "Vehicle not found") {
      return sendError(
        res,
        HttpStatusCode.NOT_FOUND,
        "Not Found",
        error.message
      );
    }
    if (error.message === "Vehicle is already booked") {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Bad Request",
        error.message
      );
    }
    return sendError(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      error.message || error
    );
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

    return sendResponse(res, HttpStatusCode.OK, message, result);
  } catch (error: any) {
    return sendError(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      error.message || error
    );
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
      return sendError(
        res,
        HttpStatusCode.NOT_FOUND,
        "Not Found",
        "Booking not found"
      );
    }

    const message =
      status === "cancelled"
        ? "Booking cancelled successfully"
        : "Booking marked as returned. Vehicle is now available";

    return sendResponse(res, HttpStatusCode.OK, message, result);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return sendError(
        res,
        HttpStatusCode.FORBIDDEN,
        "Forbidden",
        "You are not authorized to update this booking"
      );
    }

    if (
      error.message === "Only active bookings can be cancelled" ||
      error.message === "Invalid status. Use 'cancelled' or 'returned'" ||
      error.message === "Only admins can mark bookings as returned" ||
      error.message === "Only active bookings can be marked as returned" ||
      error.message === "Cannot cancel booking after start date"
    ) {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Bad Request",
        error.message
      );
    }

    return sendError(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      error.message || error
    );
  }
};
