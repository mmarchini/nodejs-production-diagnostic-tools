'use strict';

const crypto = require('crypto');

function functionOne(i) {
  for (let j=i; j > 0; j--) {
    crypto.createHash('md5').update(functionTwo(i, j)).digest("hex");
  }
}

function functionTwo(x, y) {
  let data = ((((x * y) + (x / y)) * y) ** (x + 1)).toString();
  if (x % 2 == 0) {
    return crypto.createHash('md5').update(data.repeat((x % 100) + 1)).digest("hex");
  } else {
    return crypto.createHash('md5').update(data.repeat((y % 100) + 1)).digest("hex");
  }
}

function run() {
  for (let i = 0; i < 2000; i++) {
    functionOne(i);
  }
}

module.exports = {
  run
}
