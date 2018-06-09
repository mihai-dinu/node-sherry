import 'source-map-support/register'
import * as fs from 'fs'
import * as path from 'path'
import * as request from 'request-promise-native'
import { ChildProcess, spawn } from 'child_process'
import { constants } from './constants'
import { getServerPort, getServerShareDir } from './util'

let server: ChildProcess

export async function start(port: string = getServerPort(), opts?: any): Promise<void> {
    if (await isServerAlreadyRunning(port)) {
        console.log('Sherry server is already running on port', port)
        return
    }

    createSherryHomeDir()

    const serverFile = path.join(__dirname, 'server.js')
    runNodeProcess(serverFile, port)
}

export function isServerAlreadyRunning(port: string): Promise<boolean> {
    return request
        .get(`http://localhost:${port}/api/v1/status`)
        .then(() => true)
        .catch(() => false)
}

function createSherryHomeDir(): void {
    if (!fs.existsSync(constants.SHERRY_HOME)) {
        fs.mkdirSync(constants.SHERRY_HOME)
        fs.mkdirSync(getServerShareDir())
    }
}

function runNodeProcess(file: string, port: string): void {
    // [TODO: Check port is open] Add a port checker function here where we first check if the
    // port is open or being used by any other process
    server = spawn('node', [file, port, getServerShareDir()], {
        detached: true,
        stdio: 'ignore',
    })

    server.unref()
}

if (!module.parent) {
    start()
}
