import Ticket from "../models/ticket.js";
import Session from "../models/session.js";
import { StatusCodes } from "http-status-codes";
import validator from "validator";

// 創建票券 API
export const create = async (req, res) => {
	try {
		// 檢查系列ID是否有效
		if (!validator.isMongoId(req.body.s_id)) throw new Error("INVALID_SESSION_ID");
		console.log(req.body);
		// 檢查系列是否存在
		const session = await Session.findById(req.body.s_id);
		if (!session) throw new Error("SESSION_NOT_FOUND");

		// 創建票券
		const ticket = await Ticket.create(req.body);

		res.status(StatusCodes.OK).json({
			success: true,
			message: "票券創建成功",
			result: ticket
		});
	} catch (error) {
		if (error.message === "INVALID_SESSION_ID") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "無效的系列ID"
			});
		} else if (error.message === "SESSION_NOT_FOUND") {
			res.status(StatusCodes.NOT_FOUND).json({
				success: false,
				message: "找不到對應的系列"
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

// 顯示全部票券
export const getAll = async (req, res) => {
	try {
		const regex = new RegExp(req.query.search || "", "i");

		// 構建篩選條件
		const filter = {
			$or: [{ name: regex }]
		};

		// 如果有指定的 s_id，則添加到篩選條件
		if (req.query.s_id) {
			filter.s_id = req.query.s_id;
		}

		// 查詢票券數據
		const data = await Ticket.find(filter).populate("s_id", "name location date description");

		// 計算符合條件的總數量
		const total = await Ticket.countDocuments(filter);

		// 返回查詢結果
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: {
				data,
				total
			}
		});
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};

// 編輯票券
export const edit = async (req, res) => {
	try {
		if (!validator.isMongoId(req.params.id)) throw new Error("ID");

		const ticket = await Ticket.findById(req.params.id).orFail(new Error("NOT FOUND"));

		Object.assign(ticket, req.body);
		await ticket.save();

		res.status(StatusCodes.OK).json({
			success: true,
			message: "票券更新成功",
			result: ticket
		});
	} catch (error) {
		if (error.name === "CastError" || error.message === "ID") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "票券 ID 格式錯誤"
			});
		} else if (error.message === "NOT FOUND") {
			res.status(StatusCodes.NOT_FOUND).json({
				success: false,
				message: "查無票券"
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

// 顯示特定場次的票券或單一票券
export const get = async (req, res) => {
	try {
		const { id, s_id } = req.query;

		if (id && !validator.isMongoId(id)) throw new Error("ID");
		if (s_id && !validator.isMongoId(s_id)) throw new Error("SID");

		let filter = {};

		if (id) {
			// 根據 ID 查找單一票券
			const ticket = await Ticket.findById(id).populate("s_id", "name location date description").orFail(new Error("NOT FOUND"));
			return res.status(StatusCodes.OK).json({
				success: true,
				message: "",
				result: ticket
			});
		}

		if (s_id) {
			// 根據 s_id 查找票券
			filter.s_id = s_id;
		}

		// 查找符合條件的票券
		const tickets = await Ticket.find(filter).populate("s_id", "name location date description");
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: tickets
		});
	} catch (error) {
		if (error.name === "CastError" || error.message === "ID") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "票券 ID 格式錯誤"
			});
		} else if (error.message === "NOT FOUND") {
			res.status(StatusCodes.NOT_FOUND).json({
				success: false,
				message: "查無票券"
			});
		} else if (error.message === "SID") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: "系列 ID 格式錯誤"
			});
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: "未知錯誤"
			});
		}
	}
};
