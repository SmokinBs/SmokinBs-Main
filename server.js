require("dotenv").config();
const express = require('express');
const mongoose = require("mongoose");
const controllers = require("./controllers");

const app = express();

// Mongoose
mongoose.connect(process.env.MONGO_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
mongoose.connection.on('error', err => { console.log("Error[onErr]: " + err); });


app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("body-parser").json());
app.use(express.static("./public"));
app.set("views", "./views");
app.set('view engine', 'ejs');


app.use(controllers.locals);
app.get("/", controllers.index);
app.get("/open-status", controllers.businessStatus);
app.get("/menu", controllers.renderMenu);
app.get("/contact", controllers.renderContact);

app.post("/checkout", controllers.checkout);
app.get("/order/success", controllers.checkoutComplete)


app.use(controllers.render404);


app.listen(process.env.PORT || 9999, () => {
	console.log(`Listening on port ${process.env.PORT}`)
});
