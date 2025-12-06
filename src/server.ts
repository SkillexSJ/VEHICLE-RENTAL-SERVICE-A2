import express, { Request, Response } from "express";
import config from "./config";
import { vehiclesRoutes } from "./modules/vehicles/vehicles.routes";
import { initDB } from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/users/user.routes";
import { bookingRoutes } from "./modules/bookings/booking.routes";
import { bookingService } from "./modules/bookings/booking.service";

const app = express();
app.use(express.json());

initDB();
bookingService.autoReturnBookings();
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehiclesRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("WELCOME TO VEHICLE RENTAL SERVICE");
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

export default app;
