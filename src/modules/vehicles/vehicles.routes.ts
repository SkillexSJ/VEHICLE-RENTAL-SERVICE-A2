import express from "express";
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehiclesById,
  updateVehicle,
} from "./vehicles.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", getAllVehicles);

router.post("/", auth("admin"), createVehicle);

router.get("/:vehicleId", getVehiclesById);

router.put("/:vehicleId", auth("admin"), updateVehicle);

router.delete("/:vehicleId", auth("admin"), deleteVehicle);

export const vehiclesRoutes = router;
