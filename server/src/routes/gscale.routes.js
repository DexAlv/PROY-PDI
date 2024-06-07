import { Router } from "express";
import { gScale } from "../controllers/gscale.controllers.js";

const router = Router();

router.post("/gscale", gScale);

export default router;
