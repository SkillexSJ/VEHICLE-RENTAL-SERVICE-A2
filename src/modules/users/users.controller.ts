import { Request, Response } from "express";
import { userService } from "./user.service";
import { TUserUpdate, TUserResponse } from "./user.types";
import { sendError, sendResponse } from "../../helper/responseHandler";
import { HttpStatusCode } from "../../types/httpStatusCodes";

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
    return sendResponse(
      res,
      HttpStatusCode.OK,
      "Users retrieved successfully",
      users
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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { userId } = req.params;
    const payload: TUserUpdate = req.body;

    const result = await userService.updateUser(
      user.id,
      user.role,
      userId as string,
      payload
    );

    if (!result) {
      return sendError(
        res,
        HttpStatusCode.NOT_FOUND,
        "Not Found",
        "User not found"
      );
    }

    return sendResponse(res, HttpStatusCode.OK, "User updated successfully", {
      id: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      role: result.role,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return sendError(
        res,
        HttpStatusCode.FORBIDDEN,
        "Forbidden",
        "user can only update his own profile"
      );
    }
    if (error.message === "Only admins can update user roles") {
      return sendError(
        res,
        HttpStatusCode.FORBIDDEN,
        "Forbidden",
        error.message
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

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await userService.deleteUser(userId as string);
    if (!result) {
      return sendError(
        res,
        HttpStatusCode.NOT_FOUND,
        "Not Found",
        "User not found"
      );
    }
    return sendResponse(res, HttpStatusCode.OK, "User deleted successfully");
  } catch (error: any) {
    if (error.message === "User has active bookings") {
      return sendError(
        res,
        HttpStatusCode.BAD_REQUEST,
        "Bad Request",
        error.message
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
