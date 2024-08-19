import { Router } from "express";
import { create, login, extend, profile, logout, editCart_P, getCart_P, editCart_T, getCart_T } from "../controllers/user.js";
import * as auth from "../middlewares/auth.js";

const router = Router();

router.post("/", create);
router.post("/login", auth.login, login);
router.patch("/extend", auth.jwt, extend);
router.get("/profile", auth.jwt, profile);
router.delete("/logout", auth.jwt, logout);
// 商品
router.patch("/cart_P", auth.jwt, editCart_P);
router.get("/cart_P", auth.jwt, getCart_P);
// 票券
router.patch("/cart_T", auth.jwt, editCart_T);
router.get("/cart_T", auth.jwt, getCart_T);

export default router;
