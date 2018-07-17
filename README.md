tk4100-rfid-reader
==================

Read cards from a USB TK4100 / EM4100 card reader

Only tested on Raspberry PI but should work on any Linux OS

Usage
-----

### As a module

First, install the module

    npm install tk4100-rfid-reader

Then use it like:

``` js
var RFIDReader = require('tk4100-rfid-reader');

var rr = new RFIDReader({
   device: '/dev/input/event0', // input device to read
   maxLength: 32 // max key length, defaults to 32, set to 0 to disable
});

rr.on('tag', function (tag) {
    // tag as a hex string
    // tag => "abcd1234"
});

rr.on('error', function (err) {
    // error was encountered while reading
    // currently this is only fired if the key is greater than maxLength
});
```

### As a command line tool

The `tk4100-rfid-reader` command will listen for new tags being read by the
reader, and then fork an external command for each new tag ran in order.

Install the tool globally

    npm install -g tk4100-rfid-reader

Then create a JSON config file

``` json
{
    "device": "/dev/input/event0",
    "exec": {
        "file": "./new-tag",
        "options": {
            "timeout": 30000,
            "uid": 1000,
            "gid": 1000
        }
    },
    "log": {
        "level": "debug",
        "name": "rfid-reader"
    }
}
```

- `device`: the `device` passed to the `RFIDReader` constructor to listen for events
- `exec.file`: command to execute for each new tag detected
- `exec.options`: exec options - passed directly to `child_process.execFile`
- `log`: passed directly to the [bunyan](https://github.com/trentm/node-bunyan) constructor for logging

And finally create the `./new-tag` script - this will be executed whenever a
new tag is read.

``` bash
#!/usr/bin/env bash
tag=$RFID_TAG_ID
echo "running command as $(whoami) for tag $tag"
```

This program will be executed with the environmental variable `RFID_TAG_ID` set.

Example

```
# tk4100-rfid-reader config.json
[2018-07-16T21:03:06.269Z]  INFO: rfid-reader/5970 on garage-pi.rapture.com: watching for events on /dev/input/event0
[2018-07-16T21:03:08.605Z] DEBUG: rfid-reader/5970 on garage-pi.rapture.com: read tag "abcd1234"
[2018-07-16T21:03:08.615Z] DEBUG: rfid-reader/5970 on garage-pi.rapture.com: executing "./new-tag"
    opts: {
      "env": {
        "TERM": "xterm-256color",
        "SSH_AUTH_SOCK": "/tmp/ssh-P0FEDWaaeL/agent.1566",
        "PATH": "/opt/custom/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/dave/bin",
        "TZ": "US/Eastern",
        "HOME": "/home/dave",
        "SHELL": "/bin/bash",
        "MAIL": "/var/mail/root",
        "LOGNAME": "root",
        "USER": "root",
        "USERNAME": "root",
        "SUDO_COMMAND": "./tk4100-rfid-reader config.json",
        "SUDO_USER": "dave",
        "SUDO_UID": "1001",
        "SUDO_GID": "1003",
        "RFID_TAG_ID": "abcd1234"
      },
      "encoding": "utf8",
      "timeout": 30000,
      "uid": 1000,
      "gid": 1000
    }
[2018-07-16T21:03:08.658Z] DEBUG: rfid-reader/5970 on garage-pi.rapture.com: execution succeeded (stderr="")
    stdout: running command as pi for tag abcd1234

```

License
-------

MIT License
