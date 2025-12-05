import { Request, Response } from "express";
import { TAuth, TLogin } from "./auth.types";
import { authService } from "./auth.service";
import { sendError, sendResponse } from "../../helper/responseHandler";
import { HttpStatusCode } from "../../types/httpStatusCodes";

export const signUP = async (req: Request, res: Response) => {
  try {
    let payload: TAuth = req.body;

    if (
      !payload.name ||
      !payload.email ||
      !payload.password ||
      !payload.phone
    ) {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        "Required fields: name, email, password, phone"
      );
    }

    if (payload.password.length < 6) {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        "Password must be at least 6 characters"
      );
    }

    payload.email = payload.email.toLowerCase();

    if (!payload.role) {
      payload.role = "customer";
    } else if (payload.role !== "customer" && payload.role !== "admin") {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        "Invalid role. Allowed values: customer, admin"
      );
    }

    const result = await authService.signUP(payload);

    return sendResponse(
      res,
      HttpStatusCode.CREATED,
      "User registered successfully",
      {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        role: result.role,
      }
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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: TLogin = req.body;
    let loginEmail = email;

    if (!email || !password) {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        "Email and password are required"
      );
    }

    loginEmail = email.toLowerCase();

    const result = await authService.login(loginEmail, password);

    if (result === null) {
      return sendError(
        res,
        HttpStatusCode.NOT_FOUND,
        "User not found",
        "No user found with the provided details"
      );
    }
    if (result === false) {
      return sendError(
        res,
        HttpStatusCode.UNAUTHORIZED,
        "Unauthorized",
        "Invalid credentials"
      );
    }

    return sendResponse(res, HttpStatusCode.OK, "Login successful", {
      token: result.token,
      id: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      role: result.role,
    });
  } catch (error: any) {
    return sendError(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      error.detail || error
    );
  }
};
