// pvp_agent.js
const tf = require("@tensorflow/tfjs");
const { actions, getState } = require("./actions");

class PVPRLAgent {
  constructor(stateSize, actionSize) {
    this.stateSize = stateSize;
    this.actionSize = actionSize;
    this.learningRate = 0.01;
    this.discountFactor = 0.95;
    this.epsilon = 1.0;
    this.epsilonDecay = 0.995;
    this.epsilonMin = 0.1;

    this.model = this.buildModel();
  }

  buildModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [this.stateSize], units: 24, activation: "relu" }));
    model.add(tf.layers.dense({ units: 24, activation: "relu" }));
    model.add(tf.layers.dense({ units: this.actionSize, activation: "linear" }));
    model.compile({ optimizer: tf.train.adam(this.learningRate), loss: "meanSquaredError" });
    return model;
  }

  async act(state) {
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * this.actionSize);
    }
    const qValues = this.model.predict(tf.tensor2d([state]));
    return qValues.argMax(-1).dataSync()[0];
  }

  async train(state, action, reward, nextState, done) {
    const target = reward + (done ? 0 : this.discountFactor * (await this.model.predict(tf.tensor2d([nextState]))).max().dataSync()[0]);
    const targetQValues = await this.model.predict(tf.tensor2d([state]));
    targetQValues.dataSync()[action] = target;

    await this.model.fit(tf.tensor2d([state]), tf.tensor2d([targetQValues.dataSync()]), { epochs: 1 });

    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }
  }
}

module.exports = PVPRLAgent;