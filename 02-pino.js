const pino = require('pino')();

pino.info('hello world');
pino.error('this is at error level');
pino.info({ obj: 42 }, 'hello world');
