'use strict';

const fs = require("fs");
const logASyncStacks = require('./utils/log-async-stacks');
logASyncStacks.enable();

fs.readFile('/etc/passwd', (data, err) => {
  fs.writeFile('./lala1.tmp', data, () => {
    fs.writeFile('./lala2.tmp', data, () => {});
  });
  fs.writeFile('./lala3.tmp', data, () => {});
});
