const mineflayer = require("mineflayer");
const config = require("./config.json")
const {} = require("./utils.js")

const bot = mineflayer.createBot({
  host: config.mineflayer.host,
  port: config.mineflayer.port,
  username: config.mineflayer.username,
});

let dead = true
let attacking = null
let inputs = {}

bot.on('spawn', () => {
  console.log('Bot has spawned.');
  dead = false
});

bot.on('chat', (username, message) => {
  if(message.toLowerCase() == "attack" && !dead == true) {
    attacking = bot.players[username]
    loop()
  }
});

bot.on('death', () => {
  dead = false
  //Reward -
});

function loop() {
  if(!attacking == null) {
    
  }

  setTimeout(loop, 1)
}