import 'source-map-support/register'
import * as path from 'path'
import {ChildProcess, spawn} from 'child_process'
import { constants } from './constants'

let server: ChildProcess

export function start(port: string, opts?: any) {
    const serverFile = path.join(__dirname, 'server.js')
    server = spawn(`node ${serverFile}`,
        [port, '../../'],
        {
            detached: true,
            stdio: 'ignore'
        })

    server.unref()
}

function isAlreadyRunning() {
    // GET the /api/v1/status page in order to check if the server is up or not
    return false
}

start('8080')