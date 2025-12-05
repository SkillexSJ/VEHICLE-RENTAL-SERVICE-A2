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

router.post("/", createVehicle);

router.get("/:vehicleId", getVehiclesById);

router.put("/:vehicleId", updateVehicle);

router.delete("/:vehicleId", deleteVehicle);

export const vehiclesRoutes = router;
