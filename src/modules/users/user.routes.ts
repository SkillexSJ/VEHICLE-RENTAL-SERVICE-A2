import express from "express";
import { deleteUser, getAllUsers, updateUser } from "./users.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", getAllUsers);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

export const userRoutes = router;
