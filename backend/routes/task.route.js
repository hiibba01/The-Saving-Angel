import express from "express";

import {

    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus

} from "../controller/task.controller.js";

import { verifyToken } from "../utils/verifyUser.js";


const router = express.Router();

router.post("/create", verifyToken, createTask);

router.get("/", verifyToken, getTasks);

router.get("/:id", verifyToken, getTaskById);

router.put("/:id", verifyToken, updateTask);

router.delete("/:id", verifyToken, deleteTask);

router.patch("/:id/status", verifyToken, updateTaskStatus);

export default router;