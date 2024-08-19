import { Router } from "express";
import * as auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";
import { create, getAll, edit, getById, deleteSession } from "../controllers/session.js";

const router = Router();

// 創建新場次
router.post("/", auth.jwt, admin, create);
// 獲取場次列表
router.get("/", getAll);
// 根據 ID 獲取場次
router.get("/:id", getById);
// 更新特定場次
router.patch("/:id", auth.jwt, admin, edit);
// 刪除特定場次
router.delete("/:id", auth.jwt, admin, deleteSession);

export default router;
