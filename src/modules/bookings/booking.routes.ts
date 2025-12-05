import express from "express";
import {
  createBooking,
  getAllBookings,
  updateBooking,
} from "./bookings.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth("admin", "customer"), getAllBookings);

router.post("/", auth("admin", "customer"), createBooking);

router.put("/:bookingId", auth("admin", "customer"), updateBooking);

export const bookingRoutes = router;
