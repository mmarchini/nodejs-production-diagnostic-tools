'use strict';

const pino = require('pino')();
const cpuProfiler = require('./v8-cpu-profiler');
const heapProfiler = require('heap-profile');

class InstrumentationMiddleware {
  constructor(app) {
    this.app = app;
    this.app.addHook('preHandler', async (request, reply) => {
      const route = request.req.url.replace(new RegExp(/\//, 'g'), "");
      if (this.isCpuProfiling(request.req.url))
        cpuProfiler.startProfiling();
      if (this.isMemoryProfiling(request.req.url))
        heapProfiler.write(`${route}-${request.id}-before.heapprofile`);
      if (this.isLogging(request.req.url))
        pino.info(request.req);
    });
    this.app.addHook('onSend', async (request, reply, payload) => {
      const route = request.req.url.replace(new RegExp(/\//, 'g'), "");
      if (this.isLogging(request.req.url))
        pino.info(reply.res);
      if (this.isMemoryProfiling(request.req.url))
        heapProfiler.write(`${route}-${request.id}-after.heapprofile`);
      if (this.isCpuProfiling(request.req.url))
        cpuProfiler.stopProfiling(`${route}-${request.id}.cpuprofile`);
    });
    this.app.addHook('onRoute', (routeOptions) => {
      if (routeOptions.url in this.routes) return;
      this.routes.push(routeOptions.url);
    })

    this.routes = []
    this.instrumenting = {};

    this.setupServer = require('express')();
    this.setupServer.use(require('express').json());
    this.setupServer.get('/', (req, res) => {
      res.json(this.routes.map((route) => {
        return {
          path: route,
          instrumented: this.instrumenting[route] || [],
          instrumentations: this.availableInstrumentations(),
        }
      }));
    });
    this.setupServer.post('/', (req, res) => {
      this.instrumenting = req.body;
      res.send();
    });
    this.setupServer.listen('/tmp/instrumentation.sock')
  }

  isCpuProfiling(route) {
    return this.isInstrumenting(route, 'cpu-profiler');
  }

  isMemoryProfiling(route) {
    return this.isInstrumenting(route, 'memory-profiler');
  }

  isLogging(route) {
    return this.isInstrumenting(route, 'logging');
  }

  isInstrumenting(route, instrumentation) {
    return (this.instrumenting[route] || []).includes(instrumentation);
  }

  availableInstrumentations() {
    return [
      'cpu-profiler',
      'memory-profiler',
      'logging',
    ];
  }
}

module.exports = {
  InstrumentationMiddleware
}
