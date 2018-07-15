'use strict';

const inspector = require('inspector');
const fs = require('fs');
const session = new inspector.Session();

function startProfiling() {
  session.connect();
  session.post('Profiler.enable', () => { session.post('Profiler.start'); });
}

function stopProfiling(path='./', filename='profile.cpuprofile') {
  session.post('Profiler.stop', (err, { profile }) => {
    if (!err) {
      fs.writeFileSync(`${path}${filename}`, JSON.stringify(profile));
    }
  });
}

module.exports = {
  startProfiling,
  stopProfiling,
}
