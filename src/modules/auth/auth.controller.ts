import { Request, Response } from "express";
import { TAuth, TLogin } from "./auth.types";
import { authService } from "./auth.service";

export const signUP = async (req: Request, res: Response) => {
  try {
    let payload: TAuth = req.body;

    if (
      !payload.name ||
      !payload.email ||
      !payload.password ||
      !payload.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: "Required fields: name, email, password, phone",
      });
    }

    if (payload.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: "Password must be at least 6 characters",
      });
    }

    payload.email = payload.email.toLowerCase();

    if (!payload.role) {
      payload.role = "customer";
    } else if (payload.role !== "customer" && payload.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: "Invalid role. Allowed values: customer, admin",
      });
    }

    const result = await authService.signUP(payload);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        role: result.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error.message || error,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: TLogin = req.body;
    let loginEmail = email;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: "Email and password are required",
      });
    }

    // Convert email to lowercase
    loginEmail = email.toLowerCase();

    const result = await authService.login(loginEmail, password);

    if (result === null) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: "No user found with the provided details",
      });
    }
    if (result === false) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Invalid credentials",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token: result.token,
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        role: result.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error.message,
    });
  }
};
