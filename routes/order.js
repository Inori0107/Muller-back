import { Router } from "express";
import * as auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";
import { create as createProductOrder, getAll as getAllProductOrders, get as getProductOrder } from "../controllers/productOrder.js";
import { create as createTicketOrder, getAll as getAllTicketOrders, get as getTicketOrder, validateTicket } from "../controllers/ticketOrder.js";
const router = Router();

// Product Orders
router.post("/product", auth.jwt, createProductOrder);
router.get("/product", auth.jwt, getProductOrder);
router.get("/product/all", auth.jwt, admin, getAllProductOrders);

// Ticket Orders
router.post("/ticket", auth.jwt, createTicketOrder);
router.get("/ticket", auth.jwt, getTicketOrder);
router.get("/ticket/all", auth.jwt, getAllTicketOrders);
router.post("/ticket/validate", auth.jwt, validateTicket); // 驗證 QR Code 並更新票券狀態

export default router;
