const heapProfiler = require('heap-profile');
// Start sampling
heapProfiler.start();

app.get('/leaker/', function leakerHandler(req, res) {
  memoryLeaker.run();
  res.send({});

  // Write the current heap sample to leaker.heapprofile
  heapProfiler.write(`./leaker.heapprofile`);
});
