'use strict';
const app = require('fastify')();
const pino = require('pino')();

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
  res.send({});
});

app.get('/healthy/', function (req, res) {
  res.send({});
});

app.addHook('onRequest', async (req, res) => { pino.info(req); });
app.addHook('onResponse', async (res) => { pino.info(res); });

app.listen(3000, (err, address) => { pino.info({address: address, status: 'running'}); });
