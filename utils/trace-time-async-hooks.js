'use strict';

const asyncHooks = require('async_hooks' );
const { performance } = require("perf_hooks");

const hooks = {
  before: (asyncId) => {
    performance.mark(`before:${asyncId}`);
  },
  after: (asyncId) => {
    performance.mark(`after:${asyncId}`);
    performance.measure(`async hook ${asyncId}`, `before:${asyncId}`, `after:${asyncId}`);
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
