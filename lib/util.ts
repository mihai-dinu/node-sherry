import * as fs from 'fs'
import { constants } from './constants'
import * as os from 'os'

export interface ServerConfig {
    port: string
    shareDir: string
    [key: string]: string
}

export function getServerPort(): string {
    try {
        const config = JSON.parse(fs.readFileSync(constants.SHERRY_CONFIG_FILE).toString()) as ServerConfig
        return config.port ? config.port : constants.SHERRY_DEFAULT_PORT
    } catch {
        return constants.SHERRY_DEFAULT_PORT
    }
}

export function getServerShareDir(): string {
    try {
        const config = JSON.parse(fs.readFileSync(constants.SHERRY_CONFIG_FILE).toString()) as ServerConfig
        return config.shareDir ? config.shareDir : constants.SHERRY_DEFAULT_SHARE_DIR
    } catch {
        return constants.SHERRY_DEFAULT_SHARE_DIR
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

export function getServerUri(path?: string): string {
    const uri = `http://${getLocalIpAddress()}:${getServerPort()}`
    return path ? `${uri}/${path}` : uri
}

export function setOrUpdateConfig(newConfig: Partial<ServerConfig>) {
    if (!fs.existsSync(constants.SHERRY_CONFIG_FILE)) {
        fs.writeFileSync(constants.SHERRY_CONFIG_FILE, JSON.stringify(newConfig))
    } else {
        const config = JSON.parse(fs.readFileSync(constants.SHERRY_CONFIG_FILE).toString()) as ServerConfig
        for (const key of Object.keys(newConfig)) {
            // [TODO: Typing problem] Need to remove "as string" and handle the TS error in a better way
            config[key] = newConfig[key] as string
        }
        fs.writeFileSync(constants.SHERRY_CONFIG_FILE, JSON.stringify(config))
    }
}
