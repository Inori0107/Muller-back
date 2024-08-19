import Order from "../models/order.js";
import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
// 新增訂單
export const create = async (req, res) => {
	try {
		// 檢查購物車有沒有東西
		if (req.user.cart_T.length === 0) throw new Error("EMPTY");
		// 取得座位資訊
		const seat_info = await User.findById(req.user._id, "cart_T").populate("cart_T.seat_info");
		// 建立訂單
		await Order.create({
			user: req.user._id,
			cart_T: req.user.cart_T,
			seat_info: seat_info
		});
		// 清空購物車
		req.user.cart_T = [];
		await req.user.save();

		res.status(StatusCodes.OK).json({
			success: true,
			message: ""
		});
	} catch (error) {
		if (error.name === "EMPTY") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: true,
				message: "購物車是空的"
			});
		} else if (error.name === "ValidationError") {
			const key = Object.keys(error.errors)[0];
			const message = error.errors[key].message;
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message
			});
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: "未知錯誤"
			});
		}
	}
};

// 取得票券訂單
export const get = async (req, res) => {
	try {
		0;
		const orders = await Order.find({ user: req.user._id }).populate("cart_T.t_id");
		const result = orders.filter((order) => order.cart_T && order.cart_T.length > 0);
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};

// 取得所有訂單
export const getAll = async (req, res) => {
	try {
		// 只選取 user 的 account 欄位。
		const orders = await Order.find().populate("user", "account").populate("cart_T.t_id");
		const result = orders.filter((order) => order.cart_T && order.cart_T.length > 0);
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};

// 驗證 QR Code 並更新票券狀態
export const validateTicket = async (req, res) => {
	try {
		const { t_id } = req.body;
		const ticket = await Ticket.findOne({ t_id: t_id, use: false });

		if (!ticket) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "票券無效或已使用"
			});
		}

		ticket.use = true;
		await ticket.save();

		res.status(StatusCodes.OK).json({
			success: true,
			message: "票券已成功驗證"
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};
