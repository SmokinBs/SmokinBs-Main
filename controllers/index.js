import { config } from "dotenv";
import Stripe from "stripe";
import _ from "lodash";
import fetch, { Headers } from "node-fetch";
import { alertSchema, orderSchema } from "../models/schema.js";
config();

let isServerOpen = false;
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET, { apiVersion: "2020-08-27" });

function toTitleCase(str) {
	if (str.includes("order/success")) {
		return "Placed Order";
	}
	return str.replace(/\w\S*/g, function (txt) {
		if (txt.includes("-")) txt[txt.indexOf("-")] = " ";
		if (!["", "order/success", "contact", "success", "menu", "install"].includes(str.toLowerCase())) {
			return "404";
		}
		return _.startCase(txt);
	});
}

// Locals
export const locals = async (req, res, next) => {
	const { data } = await (await fetch(`${process.env.API_ENDPOINT}/api/alerts`)).json();
	const { data: attributes } = await (await fetch(`${process.env.API_ENDPOINT}/api/business-open`)).json();
	res.locals.alerts = data;
	res.locals.openPage = toTitleCase(req.originalUrl.replace("/", ""));
	res.locals.isOpen = attributes.isOpen;
	next();
};

// Homepage
export const index = async (req, res, next) => {
	res.render("home");
};

// Post here to change the status of the website
export const businessStatus = async (req, res, next) => {
	isServerOpen = !isServerOpen;
	res.redirect("/");
};

let checkoutCart = [];
let hasOrdered = false;
let personalDetails = {};
export const checkoutComplete = async (req, res, next) => {
	const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
	const customer = await stripe.customers.retrieve(session.customer);

	let totalPrice = 0;

	checkoutCart.forEach((order) => {
		if (order.total) totalPrice += Number(order.total);
	});

	const data = await (
		await fetch(`${process.env.API_ENDPOINT}/api/orders`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.API_KEY}`,
			},
			body: JSON.stringify({
				data: {
					OrderContents: checkoutCart,
					Customer: customer,
					PersonalDetails: personalDetails,
					TotalPrice: totalPrice,
					FinishedOrder: false,
				},
			}),
		})
	).json();

	// await fetch("https://api.xibakon.repl.co/v0/emails/send?authId=A%273m}Q6NIqULW6(a%276ZoYxv", {
	// 	method: "POST",
	// 	headers: {
	// 		"Content-Type": "application/json",
	// 	},
	// 	body: JSON.stringify({ order: data.attributes }),
	// });
	res.render("success", { customer });
};

export const checkout = async (req, res, next) => {
	checkoutCart = req.body;

	let cart = [];
	req.body.forEach((order) => {
		if (order.phoneNumber) {
			personalDetails.phoneNumber = order.phoneNumber;
			personalDetails.timeToDeliver = order.timeToDeliver;
			personalDetails.additionalComments = order.additionalComments;
			return;
		}
		let newCart = {
			price_data: {
				currency: "usd",
				product_data: {
					name: order.name,
					images: [`${process.env.SITE_ENDPOINT}/img/images/logo.png`],
				},
				unit_amount: Number(order.price * 100),
			},
			quantity: order.count,
		};
		cart.push(newCart);
	});

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		shipping_rates: ["shr_1J9aiCHFwwWXSb6aaY4rrOSv"],
		shipping_address_collection: {
			allowed_countries: ["US"],
		},
		line_items: cart,
		mode: "payment",
		success_url: `${process.env.SITE_ENDPOINT}/order/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${process.env.SITE_ENDPOINT}/menu`,
	});

	res.json({ id: session.id });
};

// Business Menu
export const renderMenu = async (req, res, next) => {
	const { data } = await (await fetch(`${process.env.API_ENDPOINT}/api/products`)).json();
	res.render("menu", { food: data });
};

// Contact
export const renderContact = async (req, res, next) => {
	res.render("contact");
};

export const getInstall = async (req, res, next) => {
	res.render("install");
};

// 404
export const render404 = async (req, res, next) => {
	res.status(404).render("404");
};
