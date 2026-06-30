import express from "express";

import {

    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskCheckList,
    getDashboardData,
    

} from "../controller/task.controller.js";

import { verifyToken } from "../utils/verifyUser.js";


const router = express.Router();

router.post("/create", verifyToken, createTask);

router.get("/", verifyToken, getTasks);

router.get("/dashboard-data", verifyToken, getDashboardData);

router.get("/:id", verifyToken, getTaskById);

router.put("/:id", verifyToken, updateTask);

router.delete("/:id", verifyToken, deleteTask);

router.patch("/:id/status", verifyToken, updateTaskStatus);

router.get("/:id/todo", verifyToken, updateTaskCheckList)

export default router;