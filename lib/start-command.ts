import 'source-map-support/register'
import * as fs from 'fs'
import * as path from 'path'
import * as request from 'request-promise-native'
import { ChildProcess, spawn } from 'child_process'
import { constants } from './constants'
import * as util from './util'

let server: ChildProcess

export async function start(...args: any[]): Promise<void> {
    const configPort = util.getServerPort()
    const port = args.pop().port || configPort

    if (await isServerAlreadyRunning()) {
        console.log('Sherry server is already running on port', configPort)
        return
    }

    createSherryHomeDir()

    const serverFile = path.join(__dirname, 'server.js')
    runNodeProcess(serverFile, port)

    if (port !== configPort) {
        util.setOrUpdateConfig({ port })
    }
}

export function isServerAlreadyRunning(): Promise<boolean> {
    return request
        .get(util.getServerUri(`api/v1/status`))
        .then(() => true)
        .catch(() => false)
}

function createSherryHomeDir(): void {
    if (!fs.existsSync(constants.SHERRY_HOME)) {
        fs.mkdirSync(constants.SHERRY_HOME)
        fs.mkdirSync(util.getServerShareDir())
    }
}

function runNodeProcess(module: string, port: string): void {
    // [TODO: Check port is open] Add a port checker function here where we first check if the
    // port is open or being used by any other process
    server = spawn('node', [module, port, util.getServerShareDir()], {
        detached: true,
        stdio: 'ignore',
    })

    server.unref()
}

if (!module.parent) {
    start()
}
