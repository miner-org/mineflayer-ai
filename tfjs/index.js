// main.js
const { createBot } = require("./bot");
const PVPRLAgent = require("./pvp_agent");
const { actions, getState } = require("./actions");

const bot = createBot();
const agent = new PVPRLAgent(9, actions.length); // state size = 9, action size = number of actions

bot.on("spawn", async () => {
  await train(1000);
});

async function train(episodes) {
  for (let e = 0; e < episodes; e++) {
    bot.chat("Starting episode " + (e + 1));
    let state = getState(bot);
    let done = false;
    let totalReward = 0;

    while (!done) {
      const actionIndex = await agent.act(state);
      const action = actions[actionIndex];

      performAction(action);
      await bot.waitForTicks(20); // Wait for 1 second

      const nextState = getState(bot);
      const reward = getReward(bot);
      done = checkDone(bot);

      await agent.train(state, actionIndex, reward, nextState, done);

      state = nextState;
      totalReward += reward;

      if (done) {
        bot.chat(`Episode ${e + 1} ended with total reward: ${totalReward}`);
      }
    }
  }
}

function performAction(action) {
  switch (action) {
    case "attack":
      const entity = bot.nearestEntity();
      if (entity) bot.attack(entity);
      break;
    case "retreat":
      bot.setControlState("back", true);
      setTimeout(() => bot.setControlState("back", false), 1000);
      break;
    case "left":
      bot.setControlState("left", true);
      setTimeout(() => bot.setControlState("left", false), 1000);
      break;
    case "right":
      bot.setControlState("right", true);
      setTimeout(() => bot.setControlState("right", false), 1000);
      break;
    case "forward":
      bot.setControlState("forward", true);
      setTimeout(() => bot.setControlState("forward", false), 1000);
      break;
    case "backward":
      bot.setControlState("back", true);
      setTimeout(() => bot.setControlState("back", false), 1000);
      break;
  }
}

function getReward(bot) {
  // Define your reward function
  // Example: positive reward for being close to an enemy, negative reward for low health
  const entity = bot.nearestEntity();
  if (entity && entity.displayName) {
    return 10 - bot.entity.position.distanceTo(entity.position); // Closer to enemy gives higher reward
  }
  return bot.health > 0 ? 1 : -10; // Alive gives small reward, dying gives large negative reward
}

function checkDone(bot) {
  // Define your termination condition
  // Example: episode ends if bot health is zero or enemy is defeated
  return bot.health <= 0 || (bot.nearestEntity() && bot.nearestEntity().health <= 0);
}
