"use strict";

const express = require("express");
const line = require("@line/bot-sdk");

// create LINE SDK config from env variables
const config = {
  channelSecret: process.env.CHANNEL_SECRET
};

// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

// create Express app
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

// event handler
function handleEvent (event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create an echoing text message
  const echo = { type: "text", text: event.message.text };

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo]
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`My app listening on port ${PORT}!`);
});
