// environment.js
class Environment {
  constructor(size) {
    this.size = size;
    this.state = [0, 0];
    this.goal = [size - 1, size - 1];
  }

  reset() {
    this.state = [0, 0];
    return this.state;
  }

  step(action) {
    const [x, y] = this.state;
    if (action === 0 && x > 0) this.state[0]--; // Left
    if (action === 1 && x < this.size - 1) this.state[0]++; // Right
    if (action === 2 && y > 0) this.state[1]--; // Up
    if (action === 3 && y < this.size - 1) this.state[1]++; // Down

    const reward = this.state[0] === this.goal[0] && this.state[1] === this.goal[1] ? 1 : 0;
    const done = reward === 1;
    return { state: this.state, reward, done };
  }

  getState() {
    return this.state;
  }
}

module.exports = Environment;