const { foodSchema, alertSchema } = require("../models/foodSchema");

let isServerOpen = false;

// Locals
exports.locals = async (req, res, next) => {
	res.locals.isOpen = isServerOpen;
	next()
}


// Homepage
exports.index = async (req, res, next) => {
	alertSchema.find({}, (err, alerts) => {
		!err ? res.render("home", { alerts }) : console.log(`Error[find]: ${err}`);
	})
}


// Post here to change the status of the website
exports.businessStatus = async (req, res, next) => {
	isServerOpen = !isServerOpen
	res.redirect("/")
}


// Business Menu
exports.renderMenu = async (req, res, next) => {
	foodSchema.find({}, (err, foodItem) => {
		alertSchema.find({}, (err1, alerts) => {
			!err && !err1 ? res.render("menu", { food: foodItem, alerts }) : console.log(`Error[find]: ${err}`);
		})
	})
}


// Contact
exports.renderContact = async (req, res, next) => {
	alertSchema.find({}, (err, alerts) => {
		!err ? res.render("contact", { alerts }) : console.log(`Error[find]: ${err}`);
	})
}


// 404
exports.render404 = async (req, res, next) => {
	alertSchema.find({}, (err, alerts) => {
		!err ? res.status(404).render("404", { alerts }) : console.log(`Error[find]: ${err}`);
	})
}
