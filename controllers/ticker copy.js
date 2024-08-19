import Ticket from "../models/ticket.js";
import Session from "../models/session.js";
import { StatusCodes } from "http-status-codes";
import validator from "validator";

// 創建票券 API
export const create = async (req, res) => {
	try {
		// 檢查系列ID是否有效
		if (!validator.isMongoId(req.body.s_id)) throw new Error("INVALID_SESSION_ID");

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
				message: "SID未知錯誤"
			});
		}
	}
};

// 顯示全部票券
export const getAll = async (req, res) => {
	try {
		const sortBy = req.query.sortBy || "createdAt";
		const sortOrder = req.query.sortOrder || "desc";
		const itemsPerPage = req.query.itemsPerPage * 1 || 10;
		const page = req.query.page * 1 || 1;
		const regex = new RegExp(req.query.search || "", "i");

		const filter = {
			$or: [{ name: regex }, { description: regex }]
		};

		if (req.query.price) {
			filter.price = req.query.price;
		}

		const data = await Ticket.find(filter)
			.sort({ [sortBy]: sortOrder })
			.skip((page - 1) * itemsPerPage)
			.limit(itemsPerPage)
			.populate("s_id", "name location date description");

		const total = await Ticket.countDocuments(filter);
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
		if (!validator.isMongoId(req.body.ticket)) throw new Error("ID");

		const ticket = await Ticket.findById(req.body.ticket).orFail(new Error("NOT FOUND"));

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

// 顯示單一票券
export const get = async (req, res) => {
	try {
		const sortBy = req.query.sortBy || "createdAt";
		const sortOrder = req.query.sortOrder || "desc";
		const itemsPerPage = req.query.itemsPerPage * 1 || 10;
		const page = req.query.page * 1 || 1;
		const regex = new RegExp(req.query.search || "", "i");

		const data = await Ticket.find({
			sell: true,
			$or: [{ name: regex }, { description: regex }]
		})
			.sort({ [sortBy]: sortOrder })
			.skip((page - 1) * itemsPerPage)
			.limit(itemsPerPage)
			.populate("s_id", "name location date description");

		const total = await Ticket.countDocuments({ sell: true });
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

// 查詢票券
export const getId = async (req, res) => {
	try {
		// 驗證 ID 格式
		if (!validator.isMongoId(req.params.id)) throw new Error("ID");
		// 根據 ID 查找票券
		const result = await Ticket.findById(req.params.id).populate("s_id", "name location date description").orFail(new Error("NOT FOUND"));

		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result
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
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: "未知錯誤"
			});
		}
	}
};
