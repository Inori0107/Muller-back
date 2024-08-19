import { Schema, model, ObjectId } from "mongoose";

const schema = new Schema(
	{
		s_id: {
			type: ObjectId,
			ref: "sessions",
			required: [true, "系列資訊必填"]
		},
		name: {
			type: String,
			required: [true, "票券名稱必填"]
		},
		price: {
			type: Number,
			required: [true, "票券價格必填"],
			min: [0, "票價價格不能小於 0"]
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);

export default model("tickets", schema);
