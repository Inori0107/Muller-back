import { Schema, model, ObjectId } from "mongoose";

// products
const productSchema = new Schema({
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

// tickets
const ticketSchema = new Schema({
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
		required: [true, "使用者購物車商品座位資訊必填"]
	},
	use: {
		type: Boolean,
		default: false
	}
});

// users
const schema = new Schema(
	{
		user: {
			type: ObjectId,
			ref: "users",
			required: [true, "訂單使用者必填"]
		},
		cart_P: {
			type: [productSchema],
			default: []
		},
		cart_T: {
			type: [ticketSchema],
			default: []
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);

schema.pre("validate", function (next) {
	if (this.cart_P.length === 0 && this.cart_T.length === 0) {
		this.invalidate("cart_P", "訂單購物車商品或票券必須至少有一項");
		this.invalidate("cart_T", "訂單購物車商品或票券必須至少有一項");
	}
	next();
});

export default model("orders", schema);
