'use strict';

const fs = require("fs");
const CpuProfiler = require('./utils/v8-cpu-profiler');
const HeavyComputation = require('./utils/heavy-computation');

CpuProfiler.startProfiling();
HeavyComputation.run();
CpuProfiler.stopProfiling();
