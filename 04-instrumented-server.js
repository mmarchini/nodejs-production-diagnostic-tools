'use strict';

const app = require('fastify')();
const pino = require('pino')();
const cpuProfiler = require('./utils/v8-cpu-profiler');
const heapProfiler = require('heap-profile');
heapProfiler.start();

const heavyComputation = require('./utils/heavy-computation');
app.get('/slow/', function slowHandler(req, res) {
  heavyComputation.run();
  res.send({});
});

const memoryLeaker = require('./utils/memory-leaker');
app.get('/leaker/', function leakerHandler(req, res) {
  memoryLeaker.run();
  res.send({});
});

const crasher = require('./utils/crasher');
app.get('/crash/', function crashHandler(req, res) {
  crasher.run();
  res.json({});
});

app.get('/healthy/', function (req, res) {
  res.send({});
});

app.addHook('preHandler', async function preHandler(request, reply) {
  const route = request.req.url.replace(new RegExp(/\//, 'g'), "");
  cpuProfiler.startProfiling();
  heapProfiler.write(`./out/${route}-${request.id}-before.heapprofile`);
  pino.info(request.req);
});
app.addHook('onSend', async function onSend(request, reply, payload) {
  const route = request.req.url.replace(new RegExp(/\//, 'g'), "");
  pino.info(reply.res);
  heapProfiler.write(`./out/${route}-${request.id}-after.heapprofile`);
  cpuProfiler.stopProfiling(`./out/${route}-${request.id}.cpuprofile`);
});

app.listen(3000, () => { });
