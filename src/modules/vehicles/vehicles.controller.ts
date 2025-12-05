import { Request, Response } from "express";
import { vehicleService } from "./vehicles.service";
import { TVehicleCreate, TVehicleUpdate } from "./vehicles.types";
import { sendError, sendResponse } from "../../helper/responseHandler";
import { HttpStatusCode } from "../../types/httpStatusCodes";

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
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        "Required fields: vehicle_name, type, registration_number, daily_rent_price"
      );
    }

    if (daily_rent_price <= 0) {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        "daily_rent_price must be a positive number"
      );
    }

    if (!validTypes.includes(type)) {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        `Invalid vehicle type. Allowed values: ${validTypes.join(", ")}`
      );
    }

    if (!availability_status) {
      availability_status = "available";
    } else if (!validStatus.includes(availability_status)) {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        `Invalid availability status. Allowed values: ${validStatus.join(", ")}`
      );
    }

    const result = await vehicleService.createVehicle({
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    });
    return sendResponse(
      res,
      HttpStatusCode.CREATED,
      "Vehicle created successfully",
      result
    );
  } catch (error: any) {
    if (error.code === "23505") {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        "Registration number already exists"
      );
    }
    return sendError(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      error.detail || error
    );
  }
};

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getAllVehicles();
    if (result.length === 0) {
      return sendResponse(res, HttpStatusCode.OK, "No vehicles found", result);
    }
    return sendResponse(
      res,
      HttpStatusCode.OK,
      "Vehicles retrieved successfully",
      result
    );
  } catch (error: any) {
    return sendError(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      error.detail || error
    );
  }
};

export const getVehiclesById = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const result = await vehicleService.getVehicleById(vehicleId as string);
    if (!result) {
      return sendError(
        res,
        HttpStatusCode.NOT_FOUND,
        "Not Found",
        "Vehicle not found"
      );
    }
    return sendResponse(
      res,
      HttpStatusCode.OK,
      "Vehicle retrieved successfully",
      result
    );
  } catch (error: any) {
    return sendError(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      error.message || error
    );
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
      return sendError(
        res,
        HttpStatusCode.NOT_FOUND,
        "Not Found",
        "Vehicle not found"
      );
    }

    return sendResponse(
      res,
      HttpStatusCode.OK,
      "Vehicle updated successfully",
      result
    );
  } catch (error: any) {
    return sendError(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      error.message || error
    );
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const result = await vehicleService.deleteVehicle(vehicleId as string);

    if (!result) {
      return sendError(
        res,
        HttpStatusCode.NOT_FOUND,
        "Not Found",
        "Vehicle not found"
      );
    }

    return sendResponse(res, HttpStatusCode.OK, "Vehicle deleted successfully");
  } catch (error: any) {
    if (error.message === "Vehicle has active bookings") {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Bad Request",
        error.message || error
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
