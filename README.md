# sherry

A minimal file sharing utility for usage within the same network.

## Install
```
$ npm install -g sherry
```
## Usage

Sherry will start a node service on your main network interface's IP address and act as a proxy to your local disk files.

### Start the service
```
$ sherry start [-p port]
```

### Upload a file
```
$ sherry upload \<filename>
```

The upload command will auto start the service if it's not already running. You can still specify the port where you want the service to run with the same `-p <port>` switch as for the `start` command.

After the file is made available by the service, a link to the file is copied to your clipboard and printed to `stdout`.

### Stop the service
```
$ sherry stop
```

## License
MIT