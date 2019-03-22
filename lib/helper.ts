import * as fs from 'fs'
import * as path from 'path'
import { constants } from './constants'
import * as os from 'os'
import * as request from 'request-promise-native'
import { spawn } from 'child_process'

const PORT_RANGE = [49200, 49300]

export interface ServerConfig {
    port: string
    shareDir: string
    [key: string]: string
}

export function isServerRunning(port: string): Promise<boolean> {
    return request
        .get(getServerUri(port) + '/api/v1/status')
        .then(() => true)
        .catch(() => false)
}

export function createSherryHomeDir(): void {
    if (!fs.existsSync(constants.SHERRY_HOME)) {
        fs.mkdirSync(constants.SHERRY_HOME)
    }
    const sharedFilesDir = getServerShareDir()
    if (!fs.existsSync(sharedFilesDir)) {
        fs.mkdirSync(sharedFilesDir)
    }
}

export function runSherryServer(port: string): void {
    // [TODO: Check port is open] Add a port checker function here where we first check if the
    // port is open or being used by any other process
    const serverFile = path.join(__dirname, 'server.js')
    try {
        const server = spawn('node', [serverFile, port, getServerShareDir()], {
            detached: true,
            stdio: 'ignore',
        })
        server.unref()
    } catch (err) {
        console.log('Something went wrong while starting the server :(')
        throw err
    }
}

export function getNamedOption(option: string, ...args: any[]): string | undefined {
    const namedOpts = args.pop()
    return namedOpts.hasOwnProperty(option) ? namedOpts[option] : undefined
}

export function getUnnamedOption(...args: any[]): any[] {
    args.pop()
    return args
}

export function getServerPort(): string {
    try {
        const config = getConfig()
        return config.port
    } catch {
        // Return a random port if none if given
        return Math.floor(PORT_RANGE[0] + (Math.random() * (PORT_RANGE[1] - PORT_RANGE[0]))).toString()
    }
}

export function getServerShareDir(): string {
    try {
        const config = getConfig()
        return config.shareDir ? config.shareDir : constants.SHERRY_DEFAULT_FILES_DIR
    } catch {
        return constants.SHERRY_DEFAULT_FILES_DIR
    }
}

function getLocalIpAddress(): string | undefined {
    const ifaces = os.networkInterfaces()

    return Object.keys(ifaces)
        .map((ifname) =>
            ifaces[ifname]
                .filter((iface) => iface.family === 'IPv4' && !iface.internal)
                .map((iface) => iface.address)
                .pop()
        )
        .filter((ip) => ip)
        .pop()
}

export function getServerUri(port?: string): string {
    if (!port) {
        port = getServerPort()
    }
    return `http://${getLocalIpAddress()}:${port}`
}

export function setOrUpdateConfigParameter(newConfig: Partial<ServerConfig>) {
    if (!fs.existsSync(constants.SHERRY_CONFIG_FILE)) {
        fs.writeFileSync(constants.SHERRY_CONFIG_FILE, JSON.stringify(newConfig))
    } else {
        const config = getConfig()
        for (const opt of Object.keys(newConfig)) {
            // [TODO: Typing problem] Need to remove "as string" and handle the TS error in a better way
            config[opt] = newConfig[opt] as string
        }
        fs.writeFileSync(constants.SHERRY_CONFIG_FILE, JSON.stringify(config))
    }
}

function getConfig(): ServerConfig {
    return JSON.parse(fs.readFileSync(constants.SHERRY_CONFIG_FILE).toString())
}

function getFileAbsolutePath(file: string): string {
    return path.isAbsolute(file) ? file : path.normalize(path.join(process.cwd(), file))
}

export function uploadFilesToSymLinks(filesToUpload: string[]): Array<[string, string]> {
    const fileMappings: Array<[string, string]> = []
    for (const file of filesToUpload) {
        const uploadFileAbsolutePath = getFileAbsolutePath(file)
        const fileName = path.basename(uploadFileAbsolutePath) // aux var
        const fileSymLink = path.join(getServerShareDir(), fileName)

        // If another file with the same name exists in the share directory
        // remove it before creating another one
        try {
            fs.lstatSync(fileSymLink)
            fs.unlinkSync(fileSymLink)
        } catch (err) {
            // If there is no file with that name, ignore
            if (err.code !== 'ENOENT') {
                throw err
            }
        }
        fileMappings.push([uploadFileAbsolutePath, fileSymLink])
    }
    return fileMappings
}
