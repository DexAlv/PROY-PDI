import { Router } from "express";
import { sobel } from "../controllers/sobel.controllers.js";

const router = Router();

router.post("/sobel", sobel);

export default router;
