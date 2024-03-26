const mineflayer = require("mineflayer");
const config = require("./config.json");
const { extractStrings } = require("./utils");
require("dotenv").config();

let spawned = false;
let currentReward = false;
let previousTarget;
let target;

const actionIDs = {
  attack: "attack",
  move: {
    start: {
      forward: "forward start",
      back: "back start",
      left: "left start",
      right: "right start"
    },
    stop: {
      forward: "forward stop",
      back: "back stop",
      left: "left stop",
      right: "right stop"
    }
  }
};

const actionList = extractStrings(actionIDs);

const bot = mineflayer.createBot({
  username: config.mineflayer.username,
  port: config.mineflayer.port,
  host: config.mineflayer.host,
  version: config.mineflayer.version
});

function getState(bot, opponent) {
  const targHealth = opponent.health || 0;
  const targDist = bot.entity.position.distanceTo(opponent.position);

  const botPosx = bot.entity.position.x
  const botPosy = bot.entity.position.y
  const botPosz = bot.entity.position.z
  const botHealth = bot.health

  return {
    targHealth,
    targDist,

    botPosx,
    botPosy,
    botPosz,
    botHealth,
  };
}

// Q-table for storing Q-values
const qTable = {};

// Parameters
const learningRate = 0.1;
const discountFactor = 0.9;
const explorationRate = 0.1;

// Exploration vs Exploitation
function chooseAction(state) {
  if (Math.random() < explorationRate || !qTable[state]) {
    // Explore (random action)
    return actionList[Math.floor(Math.random())];
  } else {
    // Exploit (choose action with the highest Q-value)
    const attack = qTable[state][actionIDs.attack];
    const moveForward = qTable[state][actionIDs.move.start.forward];

    console.clear()
    console.log(qTable)
    return attack > moveForward ? actionIDs.attack : actionIDs.move.start.forward;
  }
}

// Update Q-values using Q-learning
function updateQValues(state, action, reward, nextState) {
  if (!qTable[state]) qTable[state] = { attack: 0, forward: 0 };
  if (!qTable[nextState]) qTable[nextState] = { attack: 0, forward: 0 };

  const currentQValue = qTable[state][action];
  const maxNextQValue = Math.max(qTable[nextState][action], qTable[nextState][actionIDs.move.start.forward]);

  const newQValue = currentQValue + learningRate * (reward + discountFactor * maxNextQValue - currentQValue);
  qTable[state][action] = newQValue;
}

// Training loop
bot.on("physicTick", () => {
  if (!spawned) return;
  previousTarget = target;
  target = bot.nearestEntity(entity => entity.type.toLowerCase() === "player");

  if (!target) return;

  // Obtain current state
  const currentState = getState(bot, target);

  // Choose action
  const action = chooseAction(currentState);

  // Perform action and obtain reward
  const reward = performAction(bot, action, target);

  // Obtain new state after the action
  const nextState = getState(bot, target);

  // Update Q-values using Q-learning
  updateQValues(currentState, action, reward, nextState);
});

// Function to perform actions (attack, forward)
async function performAction(bot, desiredAction, target) {
  currentReward = false

  if (desiredAction == actionIDs.attack) {
    await bot.lookAt(target.position)
    bot.attack(target)
  } else if (desiredAction == actionIDs.move.start.forward) {
    bot.setControlState("forward", true)
  } else if (desiredAction == actionIDs.move.start.back) {
    bot.setControlState("backwards", true)
  } else if (desiredAction == actionIDs.move.start.left) {
    bot.setControlState("left", true)
  } else if (desiredAction == actionIDs.move.start.right) {
    bot.setControlState("right", true)
  }
  return currentReward;
}

bot.on("entityCriticalEffect", (entity) => {
  if (entity == target) currentReward = currentReward + config.rewards.crit
});

bot.on("entityDead", (entity) => {
  if (entity == target || entity == previousTarget) currentReward = currentReward + config.rewards.crit
});

// Handle bot events
bot.on("spawn", () => {
  console.log("Bot spawned in");
  spawned = true;
});

bot.on("error", (err) => {
  console.error("Bot error:", err);
});

bot.on("end", (reason) => {
  console.log("Bot disconnected\n", reason);
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