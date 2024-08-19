import { Schema, model, ObjectId, Error } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import UserRole from "../enums/UserRole.js";

// 商品購物車
const productSchema = Schema({
	p_id: {
		type: ObjectId,
		ref: "products",
		required: [true, "使用者購物車商品必填"]
	},
	quantity: {
		type: Number,
		required: [true, "使用者購物車商品數量必填"],
		min: [1, "使用者購物車商品數量不符"]
	}
});
// 票購物車
const ticketSchema = Schema({
	t_id: {
		type: ObjectId,
		ref: "tickets",
		required: [true, "使用者購物車票券必填"]
	},
	quantity: {
		type: Number,
		required: [true, "使用者購物車商品數量必填"],
		min: [1, "使用者購物車商品數量不符"]
	},
	seat_info: {
		type: [String],
		required: [true, "使用者購物車票券座位資訊必填"]
	}
});

// 使用者資料
const schema = new Schema(
	{
		account: {
			type: String,
			required: [true, "使用者帳號必填"],
			minlength: [4, "使用者帳號長度不符"],
			maxlength: [20, "使用者帳號長度不符"],
			unique: true,
			validate: {
				validator(value) {
					return validator.isAlphanumeric(value);
				},
				message: "使用者帳號格式錯誤"
			}
		},
		password: {
			type: String,
			required: [true, "使用者密碼必填"]
		},
		email: {
			type: String,
			required: [true, "使用者信箱必填"],
			unique: true,
			validate: {
				validator(value) {
					return validator.isEmail(value);
				},
				message: "使用者信箱格式錯誤"
			}
		},
		tokens: {
			type: [String]
		},
		cart_P: {
			type: [productSchema]
		},
		cart_T: {
			type: [ticketSchema]
		},
		// 管理者權限
		role: {
			type: String,
			// 初始身分
			default: UserRole.USER
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);

// 確認使用者密碼是否有修改，有的話就加密
schema.pre("save", function (next) {
	const user = this;
	if (user.isModified("password")) {
		if (user.password.length < 4 || user.password.length > 20) {
			const error = new Error.ValidationError();
			error.addError("password", new Error.ValidatorError({ message: "使用者密碼長度不符" }));
			next(error);
			return;
		} else {
			user.password = bcrypt.hashSync(user.password, 10);
		}
	}
	next();
});

// 回傳商品總數
schema.virtual("productQuantity").get(function () {
	const user = this;
	return user.cart_P.reduce((total, current) => {
		return total + current.quantity;
	}, 0);
});

// 回傳票券總數
schema.virtual("ticketQuantity").get(function () {
	const user = this;
	return user.cart_T.reduce((total, current) => {
		return total + current.quantity;
	}, 0);
});

export default model("users", schema);
