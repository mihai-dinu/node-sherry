import 'source-map-support/register'
import * as fs from 'fs'
import * as path from 'path'
import * as request from 'request-promise-native'
import * as util from './util'

export async function parseOptsAndStart(...args: any[]): Promise<void> {
    const newPort = util.getNamedOption('port', ...args)
    await start(newPort)
}

// TODO: Don't print to stdout from this function if called from upload
async function start(port?: string): Promise<void> {
    const configPort = util.getServerPort()
    let serverPort = port ? port : configPort

    // Check if there's a server instance already running
    if (await util.isServerRunning(configPort)) {
        if (serverPort !== configPort) {
            // Server is running but requested to start on different port --> restart the server
            await stop(configPort)
        } else {
            // Server is running and no port was specified --> nothing more to do
            console.log('Server is already running...')
            return
        }
    }

    util.createSherryHomeDir()
    util.runSherryServer(serverPort)
    util.setOrUpdateConfigParameter({ port: serverPort })
    console.log(`Started on port ${serverPort}...`)
}

export async function parseOptsAndUpload(...args: any[]) {
    const newPort = util.getNamedOption('port', ...args)
    const file = util.getUnnamedOption(...args)
    await upload(file.pop(), newPort)
}

async function upload(file: string, port?: string) {
    await start(port)

    const uploadFileAbsolutePath = path.isAbsolute(file) ? file : path.normalize(path.join(process.cwd(), file))
    const fileName = path.basename(uploadFileAbsolutePath)
    const shareFilePath = path.join(util.getServerShareDir(), fileName)

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

    const uri = util.getServerUri(port) + `/files/${fileName}`
    console.log(`Your file is accessible at: ${uri}`)
}

export async function stop(port?: string) {
    const options = {
        method: 'POST',
        uri: util.getServerUri(port) + '/api/v1/status',
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
