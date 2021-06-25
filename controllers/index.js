const stripe = require("stripe")(process.env.STRIPE_SECRET)
const { foodSchema, alertSchema, orderSchema } = require("../models/schema");

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

let checkoutCart = [];
exports.checkoutComplete = async (req, res, next) => {
	console.log(checkoutCart)
	const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
	const customer = await stripe.customers.retrieve(session.customer);

	let totalPrice = 0;
	let personalDetails = {};

	alertSchema.find({}, (err, alerts) => {
		!err ? res.render("success", { customer, alerts }) : console.log(`Error[find]: ${err}`);
	})

	checkoutCart.forEach(order => {
		if (order.total) totalPrice += Number(order.total);

		personalDetails.phoneNumber = order?.phoneNumber;
		personalDetails.timeToDeliver = order?.timeToDeliver;
		personalDetails.additionalComments = order?.additionalComments;
	})

	let newOrder = new orderSchema({
		orderContents: checkoutCart,
		customer,
		personalDetails,
		totalPrice,
		isOrderOpen: true,
	})
	await newOrder.save(err => {
		!err ? "none" : console.log(err)
	})
}


exports.checkout = async (req, res, next) => {
	checkoutCart = req.body;

	let cart = [];
	req.body.forEach(order => {
		if (order.phoneNumber) return;

		let newCart = {
			price_data: {
				currency: "usd",
				product_data: {
					name: order.name,
					images: ["https://smokinbsbbq.tk/img/images/logo.png"],
				},
				unit_amount: Number((order.price * 100))
			},
			quantity: order.count
		}
		cart.push(newCart)
	})

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		shipping_rates: ["shr_1J5iIqJGx760bm8xEspPLgyT"],
		shipping_address_collection: {
			allowed_countries: ["US"],
		},
		line_items: cart,
		mode: "payment",
		success_url: "http://localhost:9999/order/success?session_id={CHECKOUT_SESSION_ID}",
		cancel_url: "http://localhost:9999/menu"
	})


	res.json({ id: session.id })
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
