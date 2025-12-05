import express from "express";
import { deleteUser, getAllUsers, updateUser } from "./users.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth("admin"), getAllUsers);
router.put("/:userId", auth("admin", "customer"), updateUser);
router.delete("/:userId", auth("admin"), deleteUser);

export const userRoutes = router;
