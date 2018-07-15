'use strict';

const asyncHooks = require('async_hooks' );

const asyncStacks = new Map();

const hooks = {
  init: (asyncId, type, triggerAsyncId, resource) => {
    if (!asyncStacks[triggerAsyncId]) {
      asyncStacks[triggerAsyncId] = {
        asyncId: triggerAsyncId,
        type: 'root',
        resource: {},
        asyncStack: [],
      };
      process._rawDebug(JSON.stringify(asyncStacks[triggerAsyncId]));
    }
    const stack = asyncStacks[triggerAsyncId].asyncStack.slice();
    stack.push(triggerAsyncId);
    asyncStacks[asyncId] = {
      asyncId: asyncId,
      type: type,
      triggerAsyncId: triggerAsyncId,
      asyncStack: stack,
    };
  },
  before: (asyncId) => {
    if (!(asyncId in asyncStacks)) return;
    process._rawDebug(JSON.stringify(asyncStacks[asyncId]));
  },
  destroy: (asyncId) => {
    if (!(asyncId in asyncStacks)) return;
    delete asyncStacks[asyncId];
  },
};

const asyncHook = asyncHooks.createHook(hooks);
module.exports = {
  enable: () => {
    asyncHook.enable();
  },
  disable: () => {
    asyncHook.disable();
  },
}
