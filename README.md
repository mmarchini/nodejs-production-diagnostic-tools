# State of Diagnostic Tools for Production Environment in the Node.js Ecosystem

## Examples

All examples are available as a Docker image. You can get it by running:

```bash
docker pull mmarchini/nodejs-production-diagnostic-tools:latest
```

And then you can access the container with:

```
mkdir -p out
docker run -it --privileged \
    --mount src="$(pwd)/out",dst=/examples/out,type=bind \
    mmarchini/nodejs-production-diagnostic-tools:latest
```

This will create a directory `out` in the current directory, which will be
accessible from inside the container and from the host machine.
`--privileged` is required, otherwise Linux perf won't work.

The examples below assume you're using the setup described above.

### 00 - The problem

```
node 00-defectuous-server.js
```

```
curl localhost:3000/healthy/
sleep 3 && time curl localhost:3000/slow/
sleep 3 && repeat 100 curl localhost:3000/leaker/
curl localhost:3000/crash/
```

### 01 - Linux `perf`

```
node --perf-basic-prof --interpreted-frames-native-stack \
     --no-turbo-inlining 00-defectuous-server.js
```

```
perf -F99 -a -g -p $(pgrep -x -n node) -- sleep 10
perf script > result.perf
./tools/FlameGraph/stackcollapse-perf.pl result.perf | ./tools/FlameGraph/flamegraph.pl --color=js > flamegraph.svg
```

```
time curl localhost:3000/slow/
```

### 02 - V8 CpuProfiler

```
node --no-turbo-inlining 01-v8-cpu-profiler.js
```

### 03 - llnode (Memory Analysis)

```
node 00-defectuous-server.js
```

```
repeat 10 curl localhost:3000/leaker/
gcore $(pgrep -x -n node)
npx llnode node -c core.$(pgrep -x -n node)
```

### 04 - V8 SamplingHeapProfiler

```
node --no-turbo-inlining 01-sample-heap-profiler.js
```

```
repeat 10 curl localhost:3000/leaker/
```

### 05 - `node-report`

```
node --require node-report 00-defectuous-server.js
```

```
curl localhost:3000/crash/
```

### 06 - `llnode` (Crash Analysis)

```
ulimit -c unlimited
node --abort-on-uncaught-exception 00-defectuous-server.js
npx llnode node -c core
```

```
curl localhost:3000/crash/
```

### 07 - Structured Logs with `pino`

```
node 03-structured-logs.js
```

```
curl localhost:3000/healthy/
sleep 3 && time curl localhost:3000/slow/
sleep 3 && repeat 100 curl localhost:3000/leaker/
curl localhost:3000/crash/
```

### 08 - Combining all tools on every request

```
node 04-instrumented-server.js
```

### 09 - Make all tools available, enable when necessary

```
node 05-configurable-instrumentation.js
```
