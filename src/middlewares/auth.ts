import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { NextFunction, Request, Response } from "express";

const auth = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          errors: "No token provided",
        });
      }

      const decode = jwt.verify(
        token,
        config.jwt_secret as string
      ) as JwtPayload;
      req.user = decode;

      if (roles.length && !roles.includes(decode.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "You are not authorized",
        });
      }

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Invalid token",
      });
    }
  };
};

export default auth;
