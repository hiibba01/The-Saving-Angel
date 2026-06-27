import express from "express";
import { handleTriagePanic } from "../controller/gemAI.controller.js";

const router = express.Router();

// This handles: POST http://localhost:5000/api/triage/panic
router.post("/panic", handleTriagePanic);

export default router;