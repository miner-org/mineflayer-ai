const mineflayer = require("mineflayer");
const config = require("./config.json");

function createBot() {
  const bot = mineflayer.createBot({
    username: config.mineflayer.username,
    port: config.mineflayer.port,
    host: config.mineflayer.host,
    version: config.mineflayer.version
  });

  bot.on("spawn", () => {
    console.log("Bot has spawned");
  });

  bot.on("message", (msg) => {
    console.log(msg.toAnsi());
    msg = msg.toString();

    if (msg.includes("register")) {
      console.log("Registered")
      bot.chat(`/register ${process.env.PASSWORD}`)
    } else if (msg.includes("login")) {
      console.log("Logged in")
      bot.chat(`/login ${process.env.PASSWORD}`)
    }
  });

  bot.on("chat", (username, message) => {
    if (username === bot.username) return;
    bot.chat(message);
  });

  bot.on("error", (err) => console.log(err));
  bot.on("end", () => console.log("Bot disconnected"));

  return bot;
}

module.exports = { createBot };