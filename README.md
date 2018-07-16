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

Result:

![flamegraph example](/assets/flamegraph.svg "Flamegraph Example")

### 02 - V8 CpuProfiler

```
node --no-turbo-inlining 01-v8-cpu-profiler.js
```

Result:

![v8 cpu profile example](/assets/cpuprofile.png "V8 CpuProfiler Example")

### 03 - llnode (Memory Analysis)

```
node 00-defectuous-server.js
```

```
repeat 10 curl localhost:3000/leaker/
gcore $(pgrep -x -n node)
npx llnode node -c core.$(pgrep -x -n node)
```

Result:

![llnode first example](/assets/llnode1.png)

![llnode second example](/assets/llnode2.png)

### 04 - V8 SamplingHeapProfiler

```
node --no-turbo-inlining 01-sample-heap-profiler.js
```

```
repeat 10 curl localhost:3000/leaker/
```

Result:

![v8 sampling heap profiler example](/assets/heapprofile.png "V8 Sampling Heap Profiler Example")

### 05 - `node-report`

```
node --require node-report 00-defectuous-server.js
```

```
curl localhost:3000/crash/
```

Result:

```
================================================================================
==== Node Report ===============================================================

Event: exception, location: "OnUncaughtException"
Filename: node-report.20180716.201127.357.001.txt
Dump event time:  2018/07/16 20:11:27
Module load time: 2018/07/16 20:11:25
Process ID: 357
Command line: node --require node-report 00-defectuous-server.js

Node.js version: v10.6.0
(http_parser: 2.8.0, v8: 6.7.288.46-node.13, uv: 1.21.0, zlib: 1.2.11,
 ares: 1.14.0, modules: 64, nghttp2: 1.32.0, napi: 3, openssl: 1.1.0h, icu: 61.1,
 unicode: 10.0, cldr: 33.0, tz: 2018c)

node-report version: 2.2.1 (built against Node.js v10.6.0, glibc 2.24, 64 bit)

OS version: Linux 4.9.87-linuxkit-aufs #1 SMP Wed Mar 14 15:12:16 UTC 2018
(glibc: 2.24)

Machine: 17de814eee9c x86_64

================================================================================
==== JavaScript Stack Trace ====================================================

Object.run (/examples/utils/crasher.js:1:1)
Object.crashHandler (/examples/00-defectuous-server.js:1:1)
preHandlerCallback (/examples/node_modules/fastify/lib/handleRequest.js:1:1)
handler (/examples/node_modules/fastify/lib/handleRequest.js:1:1)
handleRequest (/examples/node_modules/fastify/lib/handleRequest.js:1:1)
onRunMiddlewares (/examples/node_modules/fastify/fastify.js:1:1)
middlewareCallback (/examples/node_modules/fastify/fastify.js:1:1)
Object.routeHandler [as handler] (/examples/node_modules/fastify/fastify.js:1:1)
Router.lookup (/examples/node_modules/find-my-way/index.js:1:1)
Server.emit (events.js:1:1)
parserOnIncoming (_http_server.js:1:1)
HTTPParser.parserOnHeadersComplete (_http_common.js:1:1)

================================================================================
==== Native Stack Trace ========================================================

 0: [pc=0x7fe072bf4213] nodereport::OnUncaughtException(v8::Isolate*) [/examples/node_modules/node-report/api.node]
 1: [pc=0xf2fba2] v8::internal::Isolate::Throw(v8::internal::Object*, v8::internal::MessageLocation*) [node]
 2: [pc=0xee6d8a] v8::internal::IC::ReferenceError(v8::internal::Handle<v8::internal::Name>) [node]
 3: [pc=0xeedf2b] v8::internal::LoadIC::Load(v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Name>) [node]
 4: [pc=0xef0392]  [node]
 5: [pc=0xef116f] v8::internal::Runtime_LoadGlobalIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [node]
 6: [pc=0x33c491d841bd]

================================================================================
==== JavaScript Heap and Garbage Collector =====================================

Heap space name: read_only_space
    Memory size: 0 bytes, committed memory: 0 bytes
    Capacity: 0 bytes, used: 0 bytes, available: 0 bytes
Heap space name: new_space
    Memory size: 8,388,608 bytes, committed memory: 6,636,224 bytes
    Capacity: 4,124,672 bytes, used: 2,379,376 bytes, available: 1,745,296 bytes
Heap space name: old_space
    Memory size: 7,610,368 bytes, committed memory: 7,211,360 bytes
    Capacity: 7,319,072 bytes, used: 7,080,800 bytes, available: 238,272 bytes
Heap space name: code_space
    Memory size: 2,621,440 bytes, committed memory: 1,863,904 bytes
    Capacity: 2,237,696 bytes, used: 1,781,984 bytes, available: 455,712 bytes
Heap space name: map_space
    Memory size: 1,073,152 bytes, committed memory: 740,584 bytes
    Capacity: 714,552 bytes, used: 714,472 bytes, available: 80 bytes
Heap space name: large_object_space
    Memory size: 1,572,864 bytes, committed memory: 1,572,864 bytes
    Capacity: 1,505,700,544 bytes, used: 249,024 bytes, available: 1,505,451,520 bytes

Total heap memory size: 21,266,432 bytes
Total heap committed memory: 18,024,936 bytes
Total used heap memory: 12,205,656 bytes
Total available heap memory: 1,507,890,880 bytes

Heap memory limit: 1,526,909,922

================================================================================
==== Resource Usage ============================================================

Process total resource usage:
  User mode CPU: 0.220000 secs
  Kernel mode CPU: 0.020000 secs
  Average CPU Consumption : 12%
  Maximum resident set size: 43,708,416 bytes
  Page faults: 4 (I/O required) 6222 (no I/O required)
  Filesystem activity: 968 reads 16 writes

Event loop thread resource usage:
  User mode CPU: 0.210000 secs
  Kernel mode CPU: 0.020000 secs
  Average CPU Consumption : 11.5%
  Filesystem activity: 968 reads 16 writes

================================================================================
==== Node.js libuv Handle Summary ==============================================

(Flags: R=Ref, A=Active)
Flags  Type      Address             Details
[-A]   async     0x0000000003f955a0
[-A]   check     0x00007fffc6185b18
[R-]   idle      0x00007fffc6185b90
[--]   prepare   0x00007fffc6185c08
[--]   check     0x00007fffc6185c80
[-A]   async     0x000000000237d4e0
[R-]   tty       0x0000000003f9f7b8  width: 120, height: 18, file descriptor: 9, write queue size: 0, writable
[-A]   signal    0x0000000003f9f980  signum: 28 (SIGWINCH)
[R-]   tty       0x0000000003fc21b8  width: 120, height: 18, file descriptor: 11, write queue size: 0, writable
[-A]   async     0x00007fe072dfccc0
[RA]   tcp       0x0000000003fe7d08  localhost:3000 (not connected), send buffer size: 16384, recv buffer size: 87380, file descriptor: 12, write queue size: 0
[RA]   tcp       0x0000000003ff5b38  localhost:3000 connected to localhost:58454, send buffer size: 2626560, recv buffer size: 1062000, file descriptor: 13, write queue size: 0, readable, writable
[-A]   timer     0x0000000003ff5940  repeat: 0, timeout in: 119999 ms

================================================================================
==== System Information ========================================================

Environment variables
  HOME=/root
  HOSTNAME=17de814eee9c
  LANG=en_US.UTF-8
  LC_CTYPE=en_US.UTF-8
  LESS=-R
  LOGNAME=root
  LSCOLORS=Gxfxcxdxbxegedabagacad
  LS_COLORS=rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.Z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:
  NODE_VERSION=10.6.0
  OLDPWD=/examples
  PAGER=less
  PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
  PWD=/examples
  SHLVL=2
  TERM=screen
  TMUX=/tmp/tmux-0/default,100,0
  TMUX_PANE=%0
  YARN_VERSION=1.7.0
  ZSH=/root/.oh-my-zsh
  _=/usr/local/bin/node
  SHELL=/bin/zsh

Resource limits                        soft limit      hard limit
  core file size (blocks)               unlimited       unlimited
  data seg size (kbytes)                unlimited       unlimited
  file size (blocks)                    unlimited       unlimited
  max locked memory (bytes)              83968000        83968000
  max memory size (kbytes)              unlimited       unlimited
  open files                              1048576         1048576
  stack size (bytes)                      8388608       unlimited
  cpu time (seconds)                    unlimited       unlimited
  max user processes                    unlimited       unlimited
  virtual memory (kbytes)               unlimited       unlimited

Loaded libraries
  linux-vdso.so.1
  /lib/x86_64-linux-gnu/libdl.so.2
  /lib/x86_64-linux-gnu/librt.so.1
  /usr/lib/x86_64-linux-gnu/libstdc++.so.6
  /lib/x86_64-linux-gnu/libm.so.6
  /lib/x86_64-linux-gnu/libgcc_s.so.1
  /lib/x86_64-linux-gnu/libpthread.so.0
  /lib/x86_64-linux-gnu/libc.so.6
  /lib64/ld-linux-x86-64.so.2
  /examples/node_modules/node-report/api.node
  /lib/x86_64-linux-gnu/libnss_files.so.2

================================================================================
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

![llnode third example](/assets/llnode3.png)

![llnode fourth example](/assets/llnode4.png)

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

Result:

```
{"level":30,"time":1531772226337,"pid":417,"hostname":"17de814eee9c","req":{"id":1,"method":"GET","url":"/healthy/","headers":{"host":"localhost:3000","user-agent":"curl/7.52.1","accept":"*/*"},"remoteAddress":"127.0.0.1","remotePort":58466},"v":1}
{"level":30,"time":1531772226353,"pid":417,"hostname":"17de814eee9c","res":{"statusCode":200,"header":"HTTP/1.1 200 OK\r\ncontent-type: application/json; charset=utf-8\r\ncontent-length: 2\r\nDate: Mon, 16 Jul 2018 20:17:06 GMT\r\nConnection: keep-alive\r\n\r\n"},"v":1}
{"level":30,"time":1531772226366,"pid":417,"hostname":"17de814eee9c","req":{"id":2,"method":"GET","url":"/healthy/","headers":{"host":"localhost:3000","user-agent":"curl/7.52.1","accept":"*/*"},"remoteAddress":"127.0.0.1","remotePort":58468},"v":1}
{"level":30,"time":1531772226368,"pid":417,"hostname":"17de814eee9c","res":{"statusCode":200,"header":"HTTP/1.1 200 OK\r\ncontent-type: application/json; charset=utf-8\r\ncontent-length: 2\r\nDate: Mon, 16 Jul 2018 20:17:06 GMT\r\nConnection: keep-alive\r\n\r\n"},"v":1}
{"level":30,"time":1531772226382,"pid":417,"hostname":"17de814eee9c","req":{"id":3,"method":"GET","url":"/healthy/","headers":{"host":"localhost:3000","user-agent":"curl/7.52.1","accept":"*/*"},"remoteAddress":"127.0.0.1","remotePort":58470},"v":1}
{"level":30,"time":1531772226383,"pid":417,"hostname":"17de814eee9c","res":{"statusCode":200,"header":"HTTP/1.1 200 OK\r\ncontent-type: application/json; charset=utf-8\r\ncontent-length: 2\r\nDate: Mon, 16 Jul 2018 20:17:06 GMT\r\nConnection: keep-alive\r\n\r\n"},"v":1}
{"level":30,"time":1531772226400,"pid":417,"hostname":"17de814eee9c","req":{"id":4,"method":"GET","url":"/healthy/","headers":{"host":"localhost:3000","user-agent":"curl/7.52.1","accept":"*/*"},"remoteAddress":"127.0.0.1","remotePort":58472},"v":1}
{"level":30,"time":1531772226401,"pid":417,"hostname":"17de814eee9c","res":{"statusCode":200,"header":"HTTP/1.1 200 OK\r\ncontent-type: application/json; charset=utf-8\r\ncontent-length: 2\r\nDate: Mon, 16 Jul 2018 20:17:06 GMT\r\nConnection: keep-alive\r\n\r\n"},"v":1}
{"level":30,"time":1531772226417,"pid":417,"hostname":"17de814eee9c","req":{"id":5,"method":"GET","url":"/healthy/","headers":{"host":"localhost:3000","user-agent":"curl/7.52.1","accept":"*/*"},"remoteAddress":"127.0.0.1","remotePort":58474},"v":1}
{"level":30,"time":1531772226418,"pid":417,"hostname":"17de814eee9c","res":{"statusCode":200,"header":"HTTP/1.1 200 OK\r\ncontent-type: application/json; charset=utf-8\r\ncontent-length: 2\r\nDate: Mon, 16 Jul 2018 20:17:06 GMT\r\nConnection: keep-alive\r\n\r\n"},"v":1}
```

### 08 - Combining all tools on every request

```
node 04-instrumented-server.js
```

### 09 - Make all tools available, enable when necessary

```
node 05-configurable-instrumentation.js
```
