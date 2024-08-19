import { Router } from "express";
import * as auth from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import admin from "../middlewares/admin.js";
import { create, getAll, edit, get, getId } from "../controllers/product.js";

const router = Router();

// 創建新產品
router.post("/", auth.jwt, admin, upload, create);
// 獲取產品列表
router.get("/", get);
router.get("/all", auth.jwt, admin, getAll);
router.get("/:id", getId);
// 更新特定產品
router.patch("/:id", auth.jwt, admin, upload, edit);

export default router;
