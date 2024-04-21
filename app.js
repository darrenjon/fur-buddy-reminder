const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`My app listening on port ${PORT}!`);
});
