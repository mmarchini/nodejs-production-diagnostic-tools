'use static';

const hugeArray = [];
const crypto = require('crypto');

class LeakedClass {
  constructor(i) {
    const s = crypto.createHash('md5').update(i.toString()).digest("hex");
    this.hugeString = s.repeat(i * 50)
  }
}

function firstAllocator(i) {
  const newObject = new LeakedClass(i);
  hugeArray.push(newObject);

  secondAllocator(i / 2);
  thirdAllocator(i * 2);
}

function secondAllocator(i) {
  const newObject = new LeakedClass(i);
  hugeArray.push(newObject);
  thirdAllocator(i * 3);
}

function thirdAllocator(i) {
  const newObject = new LeakedClass(i);
  hugeArray.push(newObject);
}

function run() {
  for (let i = 0; i < 1500; i++) {
    firstAllocator(i);
  }
}

module.exports = {
  run
}
