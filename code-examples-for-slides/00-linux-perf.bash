# Expose V8 compiler information to perf
$ node --perf-basic-prof \
       --interpreted-frames-native-stack \
       --no-turbo-inlining \
       server.js

# Sample our server for 10 seconds
# at a frequency of 99Hz
$ perf record -F99 -g -p $(pgrep -x -n node) -- \
  sleep 10
$ perf script > result.perf
