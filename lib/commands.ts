import 'source-map-support/register'
import * as fs from 'fs'
import * as path from 'path'
import * as request from 'request-promise-native'
import * as helper from './helper'
import * as clipboardy from 'clipboardy'

export async function parseOptsAndStart(...args: any[]): Promise<void> {
    const newPort = helper.getNamedOption('port', ...args)
    await start(newPort)
}

// TODO: Don't print to stdout from this function if called from upload
async function start(port?: string): Promise<void> {
    const configPort = helper.getServerPort()
    let serverPort = port ? port : configPort

    // Check if there's a server instance already running
    if (await helper.isServerRunning(configPort)) {
        if (serverPort !== configPort) {
            // Server is running but requested to start on different port --> restart the server
            await stop(configPort)
        } else {
            // Server is running and no port was specified --> nothing more to do
            return
        }
    }

    helper.createSherryHomeDir()
    helper.runSherryServer(serverPort)
    helper.setOrUpdateConfigParameter({ port: serverPort })
    console.log(`Started on port ${serverPort}...`)
}

export async function parseOptsAndUpload(...args: any[]) {
    const newPort = helper.getNamedOption('port', ...args)
    const file = helper.getUnnamedOption(...args).pop() // gets one file only
    await upload(file, newPort)
}

async function upload(file: string, port?: string) {
    await start(port)

    const uploadFileAbsolutePath = path.isAbsolute(file) ? file : path.normalize(path.join(process.cwd(), file))
    const fileName = path.basename(uploadFileAbsolutePath)
    const shareFilePath = path.join(helper.getServerShareDir(), fileName)

    // If another file with the same name exists in the share directory
    // remove it before creating another one
    try {
        fs.lstatSync(shareFilePath)
        fs.unlinkSync(shareFilePath)
    } catch (err) {
        // If there is no file with that name, ignore
        if (err.code !== 'ENOENT') {
            throw err
        }
    }

    // Create a symlink to the "uploaded" file rather than copying the file to the share folder
    fs.symlinkSync(uploadFileAbsolutePath, shareFilePath)

    const uri = helper.getServerUri(port) + `/files/${fileName}`
    clipboardy.write(uri)
    console.log(`Your file is accessible at: ${uri}`)
}

export async function stop(port?: string) {
    const options = {
        method: 'POST',
        uri: helper.getServerUri(port) + '/api/v1/status',
        body: {
            state: 'down',
        },
        json: true,
    }

    await request(options)
        .then(() => {
            console.log('Stopped...')
        })
        .catch(() => {})
}
