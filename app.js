"use strict";

const express = require("express");
const line = require("@line/bot-sdk");

// create LINE SDK config from env variables
const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
};

// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken
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
  if (event.type !== "message" || (event.message.type !== "text" && event.message.type !== "sticker")) {
    return Promise.resolve(null);
  }

  console.log("User ID:", event.source.userId);
  console.log("Event:", event);
  const remindedMsg = {
    type: "text",
    text: `Hi Darren Lin 提醒你～就是今天 ${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(new Date().getDate()).padStart(2, "0")} ，要記得給 Emma 吃 寵愛食剋3號 (>10- 20公斤狗狗使用) ，有效預防體外寄生蟲喔！`
  };

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [remindedMsg]
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`My app listening on port ${PORT}!`);
});
