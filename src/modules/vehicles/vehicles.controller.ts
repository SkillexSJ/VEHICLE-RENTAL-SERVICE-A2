import { Request, Response } from "express";
import { vehicleService } from "./vehicles.service";
import { TVehicleCreate, TVehicleUpdate } from "./vehicles.types";

const validTypes = ["car", "bike", "van", "SUV"];
let validStatus = ["available", "booked"];

export const createVehicle = async (req: Request, res: Response) => {
  try {
    let {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    }: TVehicleCreate = req.body;

    if (
      !vehicle_name ||
      !type ||
      !registration_number ||
      daily_rent_price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors:
          "Required fields: vehicle_name, type, registration_number, daily_rent_price",
      });
    }

    if (daily_rent_price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: "daily_rent_price must be a positive number",
      });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: `Invalid vehicle type. Allowed values: ${validTypes.join(
          ", "
        )}`,
      });
    }

    if (!availability_status) {
      availability_status = "available";
    } else if (!validStatus.includes(availability_status)) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: `Invalid availability status. Allowed values: ${validStatus.join(
          ", "
        )}`,
      });
    }

    const result = await vehicleService.createVehicle({
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    });
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Validation Error",
        errors: "Registration number already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error.message || error,
    });
  }
};

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getAllVehicles();
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: result,
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error,
    });
  }
};

export const getVehiclesById = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    console.log(vehicleId);
    const result = await vehicleService.getVehicleById(vehicleId as string);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "Vehicle not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error,
    });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { vehicleId } = req.params;

    const result = await vehicleService.updateVehicle(
      vehicleId as string,
      payload
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error,
    });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const result = await vehicleService.deleteVehicle(vehicleId as string);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Vehicle has active bookings") {
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
