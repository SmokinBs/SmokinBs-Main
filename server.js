import { config } from "dotenv";
import express from "express";
import cors from "cors";
import { locals, index, businessStatus, renderMenu, renderContact, getInstall, checkout, checkoutComplete, render404 } from "./controllers/index.js";

const app = express();
config();

// Mongoose
// mongoose.connect(process.env.MONGO_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
// mongoose.connection.on("error", (err) => {
// 	console.log("Error[connection]: " + err);
// });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./public"));
app.use(cors());
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(locals);
app.get("/", index);
app.get("/open-status", businessStatus);
app.get("/menu", renderMenu);
app.get("/contact", renderContact);
app.get("/install", getInstall);

app.post("/checkout", checkout);
app.get("/order/success", checkoutComplete);

app.use(render404);

app.listen(process.env.PORT || 9999, () => {
	console.log(`Listening on port ${process.env.PORT}`);
});
