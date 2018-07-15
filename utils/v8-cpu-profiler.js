'use strict';

const inspector = require('inspector');
const fs = require('fs');
const session = new inspector.Session();
session.connect();

function startProfiling() {
  session.post('Profiler.enable', () => { session.post('Profiler.start'); });
}

function stopProfiling(filename) {
  filename = filename || `cpu-profile-${Date.now()}.cpuprofile`;
  session.post('Profiler.stop', (err, { profile }) => {
    if (!err) {
      fs.writeFileSync(filename, JSON.stringify(profile));
    }
  });
}

module.exports = {
  startProfiling,
  stopProfiling,
}
