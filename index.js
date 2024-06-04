const mineflayer = require("mineflayer");
const config = require("./config.json");
const { extractStrings, getKeys, getStartingValues, sleep } = require("./utils");
require("dotenv").config();

let spawned = false;
let currentReward = false;
let previousTarget;
let previousDistance = 0;
let target;
let targetDistance;

const actionIDs = {
  attack: "attack",
  lookAtTarget: "lookTarget",
  move: {
    start: {
      startJump: "jumpStart",
      startForward: "forwardStart",
      startBack: "backStart",
      startLeft: "leftStart",
      startRight: "rightStart"
    },
    stop: {
      stopJump: "jumpStop",
      stopForward: "forwardStop",
      stopBack: "backStop",
      stopLeft: "leftStop",
      stopRight: "rightStop"
    }
  }
}; // add here

const actionList = extractStrings(actionIDs);

const bot = mineflayer.createBot({
  username: config.mineflayer.username,
  port: config.mineflayer.port,
  host: config.mineflayer.host,
  version: config.mineflayer.version
});

function getState(bot, opponent) {
  const targHealth = opponent.health || 0;

  const botPosx = bot.entity.position.x
  const botPosy = bot.entity.position.y
  const botPosz = bot.entity.position.z
  const botHealth = bot.health

  return {
    targHealth,
    targDist: targetDistance,
    previousDist: previousDistance,

    botPosx,
    botPosy,
    botPosz,
    botHealth,
  };
}

// Q-table for storing Q-values
let qTable = {};

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
    
    console.clear()
    let maxQValue = -Infinity;
    let bestAction;
    for (const action in qTable[state]) {
      if (qTable[state][action] > maxQValue) {
        maxQValue = qTable[state][action];
        bestAction = action;
      }
    }

    console.log(qTable[state], bestAction)
    return bestAction;
  }
}

// Update Q-values using Q-learning
function updateQValues(state, action, reward, nextState) {
  const startingValues = getStartingValues(getKeys(actionIDs));

  if (!qTable[state]) qTable[state] = startingValues;
  if (!qTable[nextState]) qTable[nextState] = startingValues;

  const currentQValue = qTable[state][action];
  const maxNextQValue = Math.max(...Object.values(qTable[nextState]));

  const newQValue = currentQValue + learningRate * (reward + discountFactor * maxNextQValue - currentQValue);
  qTable[state][action] = newQValue;
}

// Training loop
bot.on("physicTick", async () => {
  if (!spawned) return;

  const newTarget = bot.nearestEntity(entity => entity.type.toLowerCase() === "player");
  if (target !== newTarget) {
    previousTarget = target
    target = bot.nearestEntity(entity => entity.type.toLowerCase() === "player");
  }

  if (!target) return;
  targetDistance = Math.round(bot.entity.position.distanceTo(target.position));
  previousDistance = targetDistance;

  // Obtain current state
  const currentState = getState(bot, target);

  // Choose action
  const action = chooseAction(currentState);

  // Perform action and obtain reward
  const reward = await performAction(bot, action, target);

  // Obtain new state after the action
  const nextState = getState(bot, target);

  // Update Q-values using Q-learning
  updateQValues(currentState, action, reward, nextState);
});

// Function to perform actions (attack, forward)
async function performAction(bot, desiredAction, target) { // add here
  if (desiredAction == actionIDs.attack) {
    if (Math.round(bot.entity.position.distanceTo(target.position)) < config.combat.reach) {
      await bot.lookAt(target.position.offset(0, target.height, 0), true);
      bot.attack(target);
    } else {
      return 0;
    }
  } else if (desiredAction == actionIDs.lookAtTarget) {
    await bot.lookAt(target.position.offset(0, target.height, 0), true)
  } else if (desiredAction == actionIDs.move.start.startForward) {// Start movement
    bot.setControlState("forward", true)
  } else if (desiredAction == actionIDs.move.start.startBack) {
    bot.setControlState("backwards", true)
  } else if (desiredAction == actionIDs.move.start.startLeft) {
    bot.setControlState("left", true)
  } else if (desiredAction == actionIDs.move.start.startRight) {
    bot.setControlState("right", true)
  } else if (desiredAction == actionIDs.move.stop.stopForward) {// Stop movement
    bot.setControlState("forward", true)
  } else if (desiredAction == actionIDs.move.stop.stopBack) {
    bot.setControlState("backwards", true)
  } else if (desiredAction == actionIDs.move.stop.stopLeft) {
    bot.setControlState("left", true)
  } else if (desiredAction == actionIDs.move.stop.stopRight) {
    bot.setControlState("right", true)
  } else if (desiredAction == actionIDs.move.start.startJump) {
    bot.setControlState("jump", true)
  } else if (desiredAction == actionIDs.move.stop.stopJump) {
    bot.setControlState("jump", false)
  }

  async function loop() {
    if (currentReward !== false) {
      currentReward = false;
      if (targetDistance > previousDistance) currentReward = currentReward + config.rewards.closerReward;
      return currentReward;
    } else {
      await sleep(2)
      loop()
    }
  }

  return await loop()
}

bot.on("entityCriticalEffect", (entity) => {
  if (entity == target || entity == previousTarget) currentReward = currentReward + config.rewards.crit;
});

bot.on("entityDead", (entity) => {
  if (entity == target || entity == previousTarget) currentReward = currentReward + config.rewards.kill;
});

bot.on("entityHurt", (entity) => {
  if (entity == target || entity == previousTarget) currentReward = currentReward + config.rewards.damage
});

// Handle bot events
bot.on("spawn", () => {
  console.log("Bot spawned");
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