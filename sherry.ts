#!/usr/bin/env node

import 'source-map-support/register'
import * as cli from 'commander'
import { start } from './lib/start-command'
import { upload } from './lib/upload-command'
import { stop } from './lib/stop-command'

const pkg = require('../package.json')

cli.version(pkg.version)

cli.command('start')
    .description('Start the server used for sharing the files')
    .option('-p, --port [port]', 'The port to use for the app')
    // TODO: Not implemented yet
    // .option('-f, --foreground', 'Run the server in the foreground')
    .action(start)

cli.command('upload <file>')
    .description("Upload a file to the server - starts the server if it's not already started")
    .option('-p, --port [port]', 'The port to use for the app')
    .action(upload)

cli.command('stop')
    .description('Stop the server')
    .action(stop)

cli.command('list').description('List the files that are served by the server')
// .action(list)

cli.command('*').action(() => {
    cli.help()
})

cli.parse(process.argv)

if (cli.args.length < 1) {
    cli.help()
}
