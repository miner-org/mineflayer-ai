const actions = ["attack", "retreat", "left", "right", "forward", "backward"];

function getState(bot) {
  const player = bot.entity;
  const nearestEntity = bot.nearestEntity();
  const distance = nearestEntity ? player.position.distanceTo(nearestEntity.position) : 0;

  return [
    player.position.x,
    player.position.y,
    player.position.z,
    nearestEntity ? nearestEntity.position.x : 0,
    nearestEntity ? nearestEntity.position.y : 0,
    nearestEntity ? nearestEntity.position.z : 0,
    nearestEntity ? nearestEntity.health : 0,
    bot.health,
    distance
  ];
}

module.exports = { actions, getState };