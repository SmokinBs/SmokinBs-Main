const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	price: {
		type: String,
		required: true
	},
	shortDescription: {
		type: String,
		required: true
	}
});

const orderSchema = new mongoose.Schema({
	orderContents: {
		type: Array,
		required: true
	},
	customer: {
		type: Object,
		required: true
	},
	personalDetails: {
		type: Object,
		required: true
	},
	totalPrice: {
		type: Number,
		required: true
	},
	isOrderOpen: {
		type: Boolean,
		required: true
	},
	orderDate: {
		type: Date,
		default: Date.now
	}
});

const alertSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	timePosted: {
		type: Date,
		default: Date.now
	}
})

module.exports.foodSchema = mongoose.model("BBQFood", foodSchema);
module.exports.alertSchema = mongoose.model("BBQAlerts", alertSchema);
module.exports.orderSchema = mongoose.model("BBQOrders", orderSchema);
