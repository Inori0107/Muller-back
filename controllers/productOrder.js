import Order from "../models/order.js";
import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";

// 新增訂單
export const create = async (req, res) => {
	try {
		// 檢查購物車有沒有東西
		if (req.user.cart_P.length === 0) throw new Error("EMPTY");
		// 取得使用者購物車
		const user = await User.findById(req.user._id, "cart_P").populate("cart_P.p_id");
		// 檢查有沒有下架商品
		const ok = user.cart_P.every((item) => item.p_id.sell);
		if (!ok) throw new Error("SELL");
		// 建立訂單
		await Order.create({
			user: req.user._id,
			cart_P: req.user.cart_P
		});
		// 清空購物車
		req.user.cart_P = [];
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
		} else if (error.name === "SELL") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: true,
				message: "包含下架商品"
			});
		} else if (error.name === "SELL") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: true,
				message: "包含下架商品"
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

// 取得商品訂單
export const get = async (req, res) => {
	try {
		// populate('cart.p_id') 關聯資料庫
		const orders = await Order.find({ user: req.user._id }).populate("cart_P.p_id");
		const result = orders.filter((order) => order.cart_P && order.cart_P.length > 0);
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
		const orders = await Order.find().populate("user", "account").populate("cart_P.p_id");
		// 過濾掉 cart_P 為空的訂單
		const result = orders.filter((order) => order.cart_P && order.cart_P.length > 0);
		console.log(result);
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
