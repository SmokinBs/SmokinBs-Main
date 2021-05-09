require("dotenv").config();
const express = require('express');
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const nodeFetch = require("node-fetch");

const app = express();

// Mongoose
mongoose.connect(process.env.MONGO_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }).catch(err => { console.log("Error[connect]: " + err) })
mongoose.connection.on('error', err => { console.log("Error[onErr]: " + err); });
const { foodSchema, alertSchema } = require("./models/foodSchema");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.set("views", "./views")
app.set('view engine', 'ejs');

let isServerOpen = false;

app.get("*", (req, res) => {
	res.render("noSee")
})

app.route("/")
	.get((req, res) => {
		console.log(`Order #${Math.floor(Math.random() * 7324)}`)
		alertSchema.find({}, (err, alertItem) => {
			!err ? res.render("home", { isOpen: isServerOpen, alerts: alertItem }) : console.log(`Error[find]: ${err}`);
		})
	})
app.get("/open-status", (req, res) => {
	isServerOpen = !isServerOpen
	res.redirect("/")
})

app.get("/menu", (req, res) => {
	foodSchema.find({}, (err, foodItem) => {
		alertSchema.find({}, (err1, alertItem) => {
			!err && !err1 ? res.render("menu", { isOpen: isServerOpen, food: foodItem, alerts: alertItem }) : console.log(`Error[find]: ${err}`);
		})
	})
});

app.get("/contact", (req, res) => {
	alertSchema.find({}, (err, alertItem) => {
		!err ? res.render("contact", { isOpen: isServerOpen, alerts: alertItem }) : console.log(`Error[find]: ${err}`);
	})
});


app.use(function (req, res, next) {
	alertSchema.find({}, (err, alertItem) => {
		!err ? res.status(404).render("404", { isOpen: isServerOpen, alerts: alertItem }) : console.log(`Error[find]: ${err}`);
	})
})

app.listen(process.env.PORT || 9999, () => {
	console.log(`Listening on port ${process.env.PORT}`)
});
