import "dotenv/config";
import express from "express";
import * as paypal from "./paypal-api.js";
import cors from "cors";

const PORT = process.env.PORT || 8080;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

export let purchase_amount;

// render checkout page with client id & unique client token
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/store", (req, res) => {
  res.render("store");
});

app.get("/cart", (req, res) => {
  res.render("cart");
});

app.get("/success", (req, res) => {
  res.render("success");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/checkout", async (req, res) => {
  const clientId = process.env.CLIENT_ID;
  try {
    const clientToken = await paypal.generateClientToken();
    res.render("checkout", { clientId, clientToken });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create order
app.post("/api/orders", async (req, res) => {
  purchase_amount = req.body.purchaseAmount;
  console.log(purchase_amount);
  try {
    const order = await paypal.createOrder();
    res.json(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// capture payment
app.post("/api/orders/:orderID/capture", async (req, res) => {
  const { orderID } = req.params;
  try {
    const captureData = await paypal.capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT);
