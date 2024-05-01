"use strict";

const express = require("express");
const line = require("@line/bot-sdk");
const schedule = require("node-schedule");
const dayjs = require("dayjs");

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

// get user name
async function getUserName (userId) {
  const profile = await client.getProfile(userId);
  return profile.displayName;
}

// event handler
async function handleEvent (event) {
  if (event.type !== "message" || (event.message.type !== "text" && event.message.type !== "sticker")) {
    return Promise.resolve(null);
  }

  const userName = await getUserName(event.source.userId);

  const greetings = [
    `Hello ${userName}! Ready to take the best care of your furry friend today?`,
    `Hi ${userName}! Let's ensure your pet gets all the care they need today.`,
    `Greetings ${userName}! Let's make today a great day for your pet.`,
    `Hey ${userName}! Let's keep your fur buddy happy and healthy today.`
  ];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  const greetingMsg = {
    type: "text",
    text: randomGreeting
  };

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [greetingMsg]
  });
}

// set schedule to send reminder
async function sendReminder () {
  const userId = process.env.USER_ID;
  const userName = await getUserName(userId);
  const message = {
    type: "text",
    text: `Hi ${userName} 提醒你～就是今天 ${dayjs().format("YYYY/MM/DD")} ，要記得給 Emma 吃 寵愛食剋3號 (>10- 20公斤狗狗使用) ，有效預防體外寄生蟲喔！`
  };

  client.pushMessage({
    to: userId,
    messages: [message]
  })
    .then(() => console.log("Reminder sent successfully!"))
    .catch(err => console.error("Failed to send reminder:", err));
}

schedule.scheduleJob("*/10 * * * *", sendReminder);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`My app listening on port ${PORT}!`);
});
