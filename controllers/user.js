import User from "../models/user.js";
import Product from "../models/product.js";
import Ticket from "../models/ticket.js";
import Session from "../models/session.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
// 驗證購物車
import validator from "validator";

// 創建
export const create = async (req, res) => {
	try {
		// 建立一個新的使用者
		await User.create(req.body);
		res.status(StatusCodes.OK).json({
			success: true,
			message: ""
		});
	} catch (error) {
		if (error.name === "ValidationError") {
			const key = Object.keys(error.errors)[0];
			const message = error.errors[key].message;
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message
			});
		} else if (error.name === "MongoServerError" && error.code === 11000) {
			res.status(StatusCodes.CONFLICT).json({
				success: false,
				message: "帳號已註冊"
			});
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: "未知錯誤"
			});
		}
	}
};

// 登入
export const login = async (req, res) => {
	try {
		// 生成 token 包含 _id 和 JWT_SECRET 七天後過期
		const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7 days" });
		req.user.tokens.push(token);
		// 保存到資料庫
		await req.user.save();
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: {
				token,
				account: req.user.account,
				role: req.user.role,
				cart_P: req.user.productQuantity,
				cart_T: req.user.ticketQuantity
			}
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};

// 延長使用者登入
export const extend = async (req, res) => {
	try {
		// 尋找使用者 token
		const idx = req.user.tokens.findIndex((token) => token === req.token);
		// 建立新的 token
		const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7 days" });
		req.user.tokens[idx] = token;
		await req.user.save();
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: token
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};

// 回傳使用者資料
export const profile = (req, res) => {
	try {
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			// 資料內容
			result: {
				account: req.user.account,
				role: req.user.role,
				cart_P: req.user.productQuantity,
				cart_T: req.user.ticketQuantity
			}
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};

// 登出
export const logout = async (req, res) => {
	try {
		// 過濾與使用者相同的 token
		req.user.tokens = req.user.tokens.filter((token) => token !== req.token);
		await req.user.save();
		res.status(StatusCodes.OK).json({
			success: true,
			message: ""
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};

// 編輯商品購物車
export const editCart_P = async (req, res) => {
	try {
		if (!validator.isMongoId(req.body.product)) throw new Error("ID");
		const idx = req.user.cart_P.findIndex((item) => item.p_id.toString() === req.body.product);
		if (idx > -1) {
			// 購物車內有這個商品，檢查修改後的數量
			const quantity = req.user.cart_P[idx].quantity + parseInt(req.body.quantity);
			if (quantity <= 0) {
				// 修改後小於等於 0，刪除
				req.user.cart_P.splice(idx, 1);
			} else {
				// 修改後還有，修改
				req.user.cart_P[idx].quantity = quantity;
			}
		} else {
			// 購物車內沒這個商品，檢查商品是否存在
			const product = await Product.findById(req.body.product).orFail(new Error("NOT FOUND"));
			if (!product.sell) throw new Error("SELL");

			req.user.cart_P.push({
				p_id: product._id,
				quantity: req.body.quantity
			});
		}

		await req.user.save();
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: req.user.productQuantity
		});
	} catch (error) {
		if (error.name === "CastError" || error.message === "ID") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "商品 ID 格式錯誤"
			});
		} else if (error.message === "NOT FOUND") {
			res.status(StatusCodes.NOT_FOUND).json({
				success: false,
				message: "查無商品"
			});
		} else if (error.message === "SELL") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "商品已下架"
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
				message: "編輯未知錯誤"
			});
		}
	}
};

// 取得商品購物車
export const getCart_P = async (req, res) => {
	try {
		const result = await User.findById(req.user._id, "cart_P").populate("cart_P.p_id");
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: result.cart_P
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "取得未知錯誤"
		});
	}
};

// 編輯票券購物車
export const editCart_T = async (req, res) => {
	try {
		console.log(req.body.ticket);
		if (!validator.isMongoId(req.body.ticket)) throw new Error("ID");
		const idx = req.user.cart_T.findIndex((item) => item.t_id.toString() === req.body.ticket);
		if (idx > -1) {
			// 購物車內有這個商品，檢查修改後的數量
			const quantity = req.user.cart_T[idx].quantity + parseInt(req.body.quantity);
			if (quantity <= 0) {
				// 修改後小於等於 0，刪除
				req.user.cart_T.splice(idx, 1);
			} else {
				// 修改後還有，修改
				req.user.cart_T[idx].quantity = quantity;
			}
		} else {
			// 購物車內沒這個商品，檢查商品是否存在
			const ticket = await Ticket.findById(req.body.ticket).orFail(new Error("NOT FOUND"));

			req.user.cart_T.push({
				t_id: ticket._id,
				quantity: req.body.quantity,
				seat_info: req.body.seat_info
			});
		}

		await req.user.save();
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: req.user.ticketQuantity
		});
	} catch (error) {
		console.log(error);
		if (error.name === "CastError" || error.message === "ID") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "商品 ID 格式錯誤"
			});
		} else if (error.message === "NOT FOUND") {
			res.status(StatusCodes.NOT_FOUND).json({
				success: false,
				message: "查無商品"
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

// 取得票券購物車
export const getCart_T = async (req, res) => {
	try {
		const result = await User.findById(req.user._id, "cart_T").populate("cart_T.t_id");
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: result.cart_T
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤111"
		});
	}
};

// 取得用戶的場次資訊
export const getSessions = async (req, res) => {
	try {
		const sessions = await Session.find();
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: sessions
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};

// 修改已存在的場次資訊
export const editSession = async (req, res) => {
	try {
		if (!validator.isMongoId(req.params.id)) throw new Error("ID");

		await Session.findByIdAndUpdate({ _id: req.params.id, u_id: req.user._id }, req.body, { runValidators: true }).orFail(new Error("NOT FOUND"));

		res.status(StatusCodes.OK).json({
			success: true,
			message: "場次更新成功"
		});
	} catch (error) {
		if (error.name === "CastError" || error.message === "ID") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "場次 ID 格式錯誤"
			});
		} else if (error.message === "NOT FOUND") {
			res.status(StatusCodes.NOT_FOUND).json({
				success: false,
				message: "查無此場次"
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

// 刪除場次
export const deleteSession = async (req, res) => {
	try {
		if (!validator.isMongoId(req.params.id)) throw new Error("ID");

		await Session.findByIdAndDelete({ _id: req.params.id, u_id: req.user._id }).orFail(new Error("NOT FOUND"));
		res.status(StatusCodes.OK).json({
			success: true,
			message: "場次刪除成功"
		});
	} catch (error) {
		if (error.name === "CastError" || error.message === "ID") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "場次 ID 格式錯誤"
			});
		} else if (error.message === "NOT FOUND") {
			res.status(StatusCodes.NOT_FOUND).json({
				success: false,
				message: "查無此場次"
			});
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: "未知錯誤"
			});
		}
	}
};
