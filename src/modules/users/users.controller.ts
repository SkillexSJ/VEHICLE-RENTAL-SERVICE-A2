import { Request, Response } from "express";
import { userService } from "./user.service";
import { TUserUpdate, TUserResponse } from "./user.types";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result: TUserResponse[] = await userService.getAllUsers();

    const users = result.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    }));
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error.message || error,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const payload: TUserUpdate = req.body;

    const result = await userService.updateUser(userId as string, payload);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        role: result.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error.message || error,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await userService.deleteUser(userId as string);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "User has active bookings") {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        errors: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: error.message || error,
    });
  }
};
