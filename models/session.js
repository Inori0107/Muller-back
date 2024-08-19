import { Schema, model } from "mongoose";

const schema = new Schema(
	{
		name: {
			type: String,
			required: [true, "系列名稱必填"]
		},
		location: {
			type: String,
			required: [true, "系列位置必填"]
		},
		date: {
			type: Date,
			required: [true, "系列日期必填"]
		},
		description: {
			type: String,
			required: [true, "系列描述必填"]
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);

export default model("sessions", schema);
