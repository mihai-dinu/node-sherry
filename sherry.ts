#!/usr/bin/env node

import 'source-map-support/register'
import * as cli from 'commander'
import { parseOptsAndStart, parseOptsAndUpload, listFiles, printStatus, stop } from './lib/commands'

const pkg = require('../package.json')

cli.version(pkg.version)
cli.description('Sherry is a cli tool useful for sharing files over a private network.')

cli.command('start')
    .description('Start the server used for sharing the files')
    .option('-p, --port [port]', 'The port to use for the app')
    .action(parseOptsAndStart)

cli.command('upload [files...]')
    .description("Upload a file to the server - starts the server if it's not already started")
    .option('-p, --port [port]', 'The port to use for the app')
    .alias('up')
    .action(parseOptsAndUpload)

cli.command('stop')
    .description('Stop the server')
    .action(async () => {
        await stop()
    })

cli.command('list').description('List the files that are served by the server')
    .alias('ls')
    .action(listFiles)

// TODO: Implement this later
// cli.command('status').description('Print the status of the file server')
//     .action(printStatus)

cli.command('*').action(() => {
    cli.help()
})

cli.parse(process.argv)

if (cli.args.length < 1) {
    cli.help()
}
