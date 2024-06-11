const Vec3 = require('vec3');
const config = require("./config.json")

//get the current held item speed
function debounce(weaponName) {
  if (!weaponName) return config.combat.cooldowns.other;

  return config.combat.cooldowns[weaponName] || config.combat.cooldowns.other;
}

//turn speed from changedebounce into toMs
function toMs(seconds) {
  return (Math.floor(seconds * 1000 - 0.5));
}

function bestPlayerFilter(entity) {
  return entity.type === "player";
}

const sleep = (toMs) => {
  return new Promise((r) => {
    setTimeout(r, toMs);
  });
};

function sortEntityListByDistance(bot, e1, e2) {
  if (getDistance(e1.position, bot.entity.position) > getDistance(e2.position, bot.entity.position)) {
    return 1;
  } else if (getDistance(e1.position, bot.entity.position) > getDistance(e2.position, bot.entity.position)) {
    return -1;
  } else return 0;
}

function getDistance(pos1, pos2) {
  return pos1.distanceTo(pos2);
}

async function placeBlock(bot, blockName, position) {
  const itemInInv = bot.inventory.itetoMs().find(item => item.name.toLowerCase().includes(blockName));

  if (!itemInInv) {
    if (config.mineflayer.debug) console.log(red, `Block with name ${blockName} not found`)
    return;
  }

  const refrenceBlock = bot.blockAt(position);

  if (!refrenceBlock) {
    if (config.mineflayer.debug) console.log(red, `Block with pos ${position} not found`)
    return
  }

  if (refrenceBlock.name.toLowerCase() == blockName.toLowerCase()) {
    if (config.mineflayer.debug) console.log(red, `Block was and still is ${blockName}`)
    return
  }

  try {
    bot.equip(itemInInv, "hand");
    await bot.placeBlock(refrenceBlock, new Vec3(0, 1, 0));
  } catch (e) {
    if (config.mineflayer.debug) console.log(red, `Error while placing ${blockName}, ${e.message}`);
  }
}

function getAllCrystals() {
  let crystals = Object.values(bot.entities).filter((entity) => entity.name === "end_crystal")
    .sort((a, b) => sortEntityListByDistance(bot, a, b))

  if (crystals) {
    return crystals;
  }
}

function setBlock(pos, block) {
  bot.chat(`/minecraft:setblock ${pos.x} ${pos.y} ${pos.z} ${block}`)
}

function summon(pos, entity) {
  bot.chat(`/minecraft:summon ${entity} ${pos.x} ${pos.y} ${pos.z} `)
}

function extractStrings(obj) {
  let strings = [];

  function traverse(obj) {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        strings.push(obj[key]);
      } else if (typeof obj[key] === "object") {
        traverse(obj[key]);
      }
    }
  }

  traverse(obj);
  return strings;
}

function getKeys(obj) {
  let keys = [];

  function recurse(current) {
    if (typeof current === "object" && current !== null) {
      for (let key in current) {
        if (typeof current[key] === "object") {
          recurse(current[key]);
        } else {
          keys.push(key);
        }
      }
    }
  }

  recurse(obj);
  return keys;
}

function getStartingValues(keys) {
  let result = {};

  keys.forEach(key => {
    result[key] = 0;
  });

  return result;
}

module.exports = {
  debounce,
  toMs,
  bestPlayerFilter,
  sleep,
  sortEntityListByDistance,
  extractStrings,
  getDistance,
  placeBlock,
  getAllCrystals,
  setBlock,
  summon,
  getKeys,
  getStartingValues
}