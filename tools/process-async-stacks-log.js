'use strict';

const os = require('os');
const treeify = require('treeify');
const chalk = require('chalk');
const fs = require('fs').promises;

function colorFormat(context) {
  return `${chalk.yellow(context.type)}(${chalk.bold(context.asyncId)})`;

}

async function main() {
  let content = '';
  try {
    content = await fs.readFile(process.argv[2]);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }

  const asyncStacks = new Map();
  const asyncContexts = new Map();
  for (let row of content.toString().split(os.EOL)) {
    if (!row) continue;
    let parsed = {};
    try {
      parsed = await JSON.parse(row);
    } catch (e) {
      console.error(e);
      console.log(`'${row}'`);
      process.exit(1);
    }
    asyncStacks.set(parsed.asyncId, parsed.asyncStack);
    asyncContexts.set(parsed.asyncId, parsed);
  }

  const asyncStackGraph = {};
  const mapMap = new Map();
  for (let currentAsyncId of asyncStacks.keys()) {
    if (!(currentAsyncId in mapMap)) {
      mapMap[currentAsyncId] = {};
      const context = asyncContexts.get(currentAsyncId)
      asyncStackGraph[colorFormat(context)] = mapMap[currentAsyncId];
    }
    const currentAsyncMap = mapMap[currentAsyncId];
    for (let i of asyncStacks.keys()) {
      if (i == currentAsyncId) continue;
      if (asyncStacks.get(i)[asyncStacks.get(i).length - 1] == currentAsyncId) {
        const a = {};
        const j = asyncStacks.get(i).pop();
        const context = asyncContexts.get(i)
        currentAsyncMap[colorFormat(context)] = a;
        mapMap[i] = a;
      }
    }
  }
  console.log(treeify.asTree(asyncStackGraph));
}

main();
