import express from "express";
import { login, signUP } from "./auth.controller";

const router = express.Router();

router.post("/signup", signUP);

router.post("/signin", login);

export const authRoutes = router;
