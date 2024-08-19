import { Router } from "express";
import * as auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";
import { create, getAll, edit, get } from "../controllers/ticker.js";

const router = Router();

// 創建新產品
router.post("/", auth.jwt, admin, create);
// 獲取產品列表
router.get("/", get);
router.get("/all", auth.jwt, getAll);
// router.get("/:id", getId);
// 更新特定產品
router.patch("/:id", auth.jwt, admin, edit);

export default router;
