# Generate core.$PID of a running process
$ gcore $PID

# Will create a `core` file when node aborts
$ ulimit -c unlimited
# Tell node to abort on uncaught exceptions
$ node --abort-on-uncaught-exception \
       server.js

# Open llnode
$ npx llnode node -c CORE-FILE
