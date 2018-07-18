const session = new require('inspector').Session();
session.connect();
const post = require('util').promisify(session.post);

app.get('/slow/', function slowHandler(req, res) {
  // Start Profiling
  await post('Profile.enable');
  await post('Profile.start');

  heavyComputation.run();
  res.send({});

  // Stop Profiling and Write to File
  const { profile } = await post('Profile.stop');
  fs.writeFileSync(`slow.cpuprofile`, JSON.stringify(profile));
});
