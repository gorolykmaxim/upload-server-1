## API

### Log Watcher

#### HTTP

```
GET /api/log-watcher/log
```

Get list of all log files, that can be watched.

```
POST /api/log-watcher/log

{"absolutePath": <path to log>}
```

Allow watching the log file with the specified "absolutePath".
This endpoint is only available while running the server in `-insecure` mode.

```
DELETE /api/log-watcher/log?absolutePath=<path to log>
```

Disallow watching the log file with the specified "absolutePath".
This endpoint is only available while running the server in `-insecure` mode.

```
GET /api/log-watcher/log/size?absolutePath=<path to log>
```

Get size of the log file with the specified "absolutePath". Only size of log files,
returned by `GET /api/log-watcher/log`, can be obtained.

```
GET /api/log-watcher/log/content?absolutePath=<path to log>&noSplit=<true/false>
```
Get content of the log file with the specified "absolutePath". Only content of log files,
returned by `GET /api/log-watcher/log`, can be obtained. By default, returned content
is split into an array of lines. To return content as a single string, specify "noSplit=true".
Otherwise, "noSplit" parameter is optional and can be omitted.

#### Web Socket

##### Legacy

```
/
```

Works just like in the previous versions. 

Connect to the endpoint. Send "watch" message to watch changes in a log file:

```json
{
  "type": "watch",
  "file": "<absolute path to log file>",
  "fromStart": true
}
```

"fromStart" parameter is optional and can be omitted. Specify it set to "true" if you want
to read existing contents of the file before receiving updates about changes in it.

Only log files, returned by `GET /api/log-watcher/log`, can be watched.

To stop watching changes in a log file - use "unwatch" message:

```json
{
  "type": "unwatch",
  "file": "<absolute path to log file>"
}
```

##### Default

Connect to the endpoint of the log file, you want watch.

```
/api/log-watcher/log?absolutePath=<path to log>&fromStart=<true/false>
```

"fromStart" parameter is optional and can be omitted. Specify it set to "true" if you want
to read existing contents of the file before receiving updates about changes in it.

Only log files, returned by `GET /api/log-watcher/log`, can be watched.

### Command Executor

#### HTTP

```
GET /api/command-executor/command
```

Get list of all commands, that can be executed.

```
POST /api/command-executor/command

{"name": "<name of the command>", "script": "<actual shell script command>"}
```

Create a new command.
This endpoint is only available while running the server in `-insecure` mode.

```
DELETE /api/command-executor/command
```

Delete a command. History of all of this command's executions will be deleted as well.
This endpoint is only available while running the server in `-insecure` mode.

```
GET /api/command-executor/command/<command ID>/execution
```

Get history of all executions of the specified command. Command execution output is
not returned by this endpoint.

```
POST /api/command-executor/command/<command ID>/execution
```

Execute specified command.

```
GET /api/command-executor/command/<command ID>/execution/<execution start time>?noSplit=<true/false>
```

Get information about the specified command execution. The response will contain
executions output.
"noSplit" parameter is optional and can be omitted. Be default output of the command
is returned as an array of lines. Specify "noSplit=true" in order to return the output
as a single string.

```
DELETE /api/command-executor/command/<command ID>/execution/<execution start time>
```

Delete information about the specified command execution.

```
POST /api/command-executor/command/<command ID>/execution/<execution start time>/terminate
```

Gracefully terminate specified execution of the command.

```
POST /api/command-executor/command/<command ID>/execution/<execution start time>/halt
```

Forcefully terminate specified execution of the command.

#### Web Socket

```
/api/command-executor/event
```

Connect to this endpoint if you want to receive notifications about all command-related
events.

```
/api/command-executor/command/<command ID>/execution/<execution start time>
```

Connect to this endpoint if you want to receive notifications about all events,
related to the specified command execution.

```
/api/command-executor/command/<command ID>/execution/<execution start time>/status
```

Connect to this endpoint if you want to receive notifications about status change
of the specified command execution.

```
/api/command-executor/command/<command ID>/execution/<execution start time>/output?fromStart=<true/false>
```

Connect to to this endpoint if you want to receive notifications about changes in
the output (STDOUT and STDERR) of the specified command execution.
"fromStart" parameter is optional and can be omitted. Specify it set to "true" if you want
to read existing output of the command before receiving updates about changes in it.