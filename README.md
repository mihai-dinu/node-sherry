# sherry

A minimal file sharing utility for usage within the same network.

## Install
```
$ npm install -g node-sherry
```

## Usage

Sherry will start a node service on your main network interface's IP address and act as a proxy to your local disk files.

### Start the service
```
$ sherry start [-p port]
```
The port parameter is optional. A random port will be used if not specified.

### Upload files
```
$ sherry upload|up [files...]
```

The upload command will auto start the service if it's not already running. You can still specify the port where you want the service to run with the same `-p <port>` switch as for the `start` command.

After the files have been made available by the service, all the links to the files are copied to your clipboard and printed to `stdout`.

> Wildcards are not supported yet for file names

### List available files
```
$ sherry list|ls
```

List all the files that were made available and their links

### Stop the service
```
$ sherry stop
```

## License
MIT
