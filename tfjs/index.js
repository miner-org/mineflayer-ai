// main.js
const Environment = require('./environment');
const QLearningAgent = require("./qlearning");

const env = new Environment(5);
const agent = new QLearningAgent(2, 4); // state size = 2 (x, y), action size = 4 (left, right, up, down)

async function train(episodes) {
  for (let e = 0; e < episodes; e++) {
    let state = env.reset();
    let done = false;
    let totalReward = 0;

    while (!done) {
      const action = await agent.act(state);
      const { state: nextState, reward, done: episodeDone } = env.step(action);
      await agent.train(state, action, reward, nextState, episodeDone);

      state = nextState;
      totalReward += reward;

      if (episodeDone) {
        console.log(`Episode: ${e + 1}, Total Reward: ${totalReward}, Epsilon: ${agent.epsilon}`);
      }
    }
  }
}

train(1000);
