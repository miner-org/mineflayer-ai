class Environment {
  constructor(position, health) {
    this.size = size;
    this.state = [position.x, position.y, health]; // [x, y, health]
    this.goal = [size - 1, size - 1];
  }

  reset() {
    this.state = [0, 0, 100];
    return this.state;
  }

  step(action) {
    let [x, y, health] = this.state;
    if (action === 0 && x > 0) x--; // Left
    if (action === 1 && x < this.size - 1) x++; // Right
    if (action === 2 && y > 0) y--; // Up
    if (action === 3 && y < this.size - 1) y++; // Down
    if (action === 4) health = Math.min(health + 10, 100); // Heal

    const reward = (x === this.goal[0] && y === this.goal[1]) ? 10 : -1;
    const done = (x === this.goal[0] && y === this.goal[1]);
    this.state = [x, y, health];
    return { state: this.state, reward, done };
  }

  getState() {
    return this.state;
  }
}

module.exports = Environment;