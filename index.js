const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];
  //the mode must be subscribe and the verification token must be sent from whatsapp
  if (mode && token) {
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});
app.post("/webhook", (req, res) => {
  let bodyParams = req.body;
  console.log(JSON.stringify(bodyParams, null, 2));
  if (bodyParams.object) {
    if (
      bodyParams.entry &&
      bodyParams.entry[0].changes &&
      bodyParams.entry[0].changes[0].value.messages &&
      bodyParams.entry[0].changes[0].value.messages[0]
    ) {
      let phoneNumberId =
        bodyParams.entry[0].changes[0].value.metadata.phone_number_id;
      let from = bodyParams.entry[0].changes[0].value.messages[0].from;
      let message = bodyParams.entry[0].changes[0].value.messages[0].text.body;
      axios({
        method: "POST",
        url: ` https://graph.facebook.com/v18.0/${phoneNumberId}/messages?access_token=${process.env.ACCESS_TOKEN}`,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "Your message: " + message,
          },
        },
        header: {
          "Content-Type": "application/json",
        },
      });
      console.log(phoneNumberId + from + message);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Webhook" });
});
app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
