import Product from "../models/product.js";
import { StatusCodes } from "http-status-codes";
import validator from "validator";

// 創建商品 API
export const create = async (req, res) => {
	try {
		req.body.image = req.file.path;
		const result = await Product.create(req.body);
		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
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

// 顯示全部
export const getAll = async (req, res) => {
	try {
		// 排序依據，預設為 'createdAt'
		const sortBy = req.query.sortBy || "createdAt";
		// 排序順序，預設為降序
		const sortOrder = req.query.sortOrder || "desc";
		// 商品類別，預設為空字串
		const category = req.query.category || "";
		// 每頁顯示的項目數量，預設為 10
		const itemsPerPage = req.query.itemsPerPage * 1 || 10;
		// 當前頁數，預設為第 1 頁
		const page = req.query.page * 1 || 1;
		// 搜尋關鍵字，忽略大小寫
		const regex = new RegExp(req.query.search || "", "i");

		const data = await Product.find({
			category,
			$or: [
				{ name: regex }, // 搜尋名稱符合關鍵字的項目
				{ description: regex } // 搜尋描述符合關鍵字的項目
			]
		})
			.sort({ [sortBy]: sortOrder }) // 根據指定欄位排序
			.skip((page - 1) * itemsPerPage) // 跳過前面頁數的項目
			.limit(itemsPerPage); // 限制每頁顯示的項目數量

		// 獲取總項目數量
		const total = await Product.estimatedDocumentCount();
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

// 編輯商品
export const edit = async (req, res) => {
	try {
		// 驗證 ID 是否為有效的 MongoDB ID
		if (!validator.isMongoId(req.params.id)) throw new Error("ID");

		req.body.image = req.file?.path;
		// 更新資訊
		console.log(req.body);
		await Product.findByIdAndUpdate(req.params.id, req.body, { runValidators: true }).orFail(new Error("NOT FOUND"));

		res.status(StatusCodes.OK).json({
			success: true,
			message: ""
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

// 顯示商品
export const get = async (req, res) => {
	try {
		const sortBy = req.query.sortBy || "createdAt";
		const sortOrder = req.query.sortOrder || "desc";
		const category = req.query.category || "";
		const itemsPerPage = req.query.itemsPerPage * 1 || 10;
		const page = req.query.page * 1 || 1;
		const regex = new RegExp(req.query.search || "", "i");

		const data = await Product.find({
			sell: true,
			category,
			$or: [{ name: regex }, { description: regex }]
		})
			.sort({ [sortBy]: sortOrder })
			.skip((page - 1) * itemsPerPage)
			.limit(itemsPerPage);
		// 計算總數量
		const total = await Product.countDocuments({ sell: true });
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

// 查詢商品
export const getId = async (req, res) => {
	try {
		// 驗證 ID 格式
		if (!validator.isMongoId(req.params.id)) throw new Error("ID");
		// 根據 ID 查找商品
		const result = await Product.findById(req.params.id).orFail(new Error("NOT FOUND"));

		res.status(StatusCodes.OK).json({
			success: true,
			message: "",
			result
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
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: "未知錯誤"
			});
		}
	}
};
