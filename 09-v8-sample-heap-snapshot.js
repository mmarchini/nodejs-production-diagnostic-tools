'use strict';

const heapProfile = require('heap-profile');
const MemoryLeaker = require('./utils/memory-leaker');

heapProfile.start();
MemoryLeaker.run();
heapProfile.write();
