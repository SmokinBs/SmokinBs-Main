import mongoose from "mongoose";

const exorderSchema = new mongoose.Schema({
	orderContents: {
		type: Array,
		required: true,
	},
	customer: {
		type: Object,
		required: true,
	},
	personalDetails: {
		type: Object,
		required: true,
	},
	totalPrice: {
		type: Number,
		required: true,
	},
	finishedOrder: {
		type: Boolean,
		required: true,
		default: false,
	},
	orderDate: {
		type: Date,
		default: Date.now,
	},
});

const exalertSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	timePosted: {
		type: Date,
		default: Date.now,
	},
});

export const alertSchema = mongoose.model("BBQAlerts", exalertSchema);
export const orderSchema = mongoose.model("BBQOrders", exorderSchema);
