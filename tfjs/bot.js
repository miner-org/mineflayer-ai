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

  bot.on("chat", (username, message) => {
    if (username === bot.username) return;
    bot.chat(message);
  });

  bot.on("error", (err) => console.log(err));
  bot.on("end", () => console.log("Bot disconnected"));

  return bot;
}

module.exports = { createBot };