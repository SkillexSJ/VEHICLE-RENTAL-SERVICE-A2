import express from "express";
import {
  createBooking,
  getAllBookings,
  updateBooking,
} from "./bookings.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth("admin", "customer"), getAllBookings);

router.post("/", createBooking);

router.put("/:bookingId", auth("admin", "customer"), updateBooking);

// router.get("/:vehicleId", getVehiclesById);

// router.put("/:vehicleId", updateVehicle);

// router.delete("/:vehicleId", deleteVehicle);

export const bookingRoutes = router;
