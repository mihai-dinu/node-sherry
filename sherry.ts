#!/usr/bin/env node

import 'source-map-support/register'
import * as cli from 'commander'
import { start } from './lib/start-command'
import { upload } from './lib/upload-command'

const pkg = require('../package.json')

cli.version(pkg.version)

cli.command('start <port>')
    .description('Start the server used for sharing the files')
    .option('-p, --port [port]', 'The port to use for the app')
    .option('-f, --foreground', 'Run the server in the foreground')
    .action(start)

cli.command('upload <file>')
    .description('Upload a file to the server')
    .option('-p, --port [port]', 'The port to use for the app')
    .action(upload)

cli.command('*').action(() => {
    cli.help()
})

// For the stop command I can POST to /api/v1/status with down and that should process.exit(0) on the
// spawned server.js module

cli.parse(process.argv)

if (cli.args.length < 1) {
    cli.help()
}
