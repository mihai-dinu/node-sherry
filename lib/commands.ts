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
    const files = helper.getUnnamedOption(...args).pop() // gets all files as an array
    await upload(files, newPort)
}

async function upload(files: string[], port?: string) {
    await start(port)

    const fileURIs = []
    const fileMappings = helper.uploadFilesToSymLinks(files) // abs path for upload file and symlink
    for (const [uploadFilePath, shareFilePath] of fileMappings) {
        // Create a symlink to the "uploaded" file rather than copying the file to the share folder
        fs.symlinkSync(uploadFilePath, shareFilePath)
        fileURIs.push(helper.getServerUri(port) + `/files/${path.basename(uploadFilePath)}`)
    }

    const uris = fileURIs.join('\n')
    await clipboardy.write(uris)
    const multipleFiles = fileURIs.length > 1
    if (multipleFiles) {
        console.log(`Your files are accessible at:\n${uris}`)
    } else {
        console.log(`Your file is accessible at: ${uris}`)
    }
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
