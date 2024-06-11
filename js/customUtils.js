function sortByQVal(bot, q1, q2) {
  if (q1 > q2) {
    return 1;
  } else if (q1 < q2) {
    return -1;
  } else return 0;
}

module.exports = {
  sortByQVal
}