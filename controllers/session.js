import Session from "../models/session.js";
import { StatusCodes } from "http-status-codes";
import validator from "validator";

// 創建場次
export const create = async (req, res) => {
	try {
		const result = await Session.create(req.body);
		console.log(result);
		res.status(StatusCodes.OK).json({
			success: true,
			message: "場次創建成功",
			result
		});
	} catch (error) {
		if (error.name === "ValidationError") {
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

// 獲取所有場次
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

		const data = await Session.find(filter)
			.sort({ [sortBy]: sortOrder })
			.skip((page - 1) * itemsPerPage)
			.limit(itemsPerPage);

		const total = await Session.countDocuments(filter);
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result: {
				data,
				total
			}
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "未知錯誤"
		});
	}
};

// 更新場次
export const edit = async (req, res) => {
	try {
		if (!validator.isMongoId(req.params.id)) throw new Error("ID");

		await Session.findByIdAndUpdate(req.params.id, req.body, { runValidators: true }).orFail(new Error("NOT FOUND"));
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

		await Session.findByIdAndDelete(req.params.id).orFail(new Error("NOT FOUND"));
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

// 根據 ID 獲取場次
export const getById = async (req, res) => {
	try {
		if (!validator.isMongoId(req.params.id)) throw new Error("ID");

		const result = await Session.findById(req.params.id).orFail(new Error("NOT FOUND"));
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result
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
