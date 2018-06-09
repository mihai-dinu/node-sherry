import * as fs from 'fs'
import { constants } from './constants'
import * as os from 'os'

export function getServerPort(): string {
    try {
        const config = JSON.parse(fs.readFileSync(constants.SHERRY_CONFIG_FILE).toString())
        return config.port.toString()
    } catch {
        return constants.SHERRY_DEFAULT_PORT
    }
}

export function getServerShareDir(): string {
    try {
        const config = JSON.parse(fs.readFileSync(constants.SHERRY_CONFIG_FILE).toString())
        return config.shareDir
    } catch {
        return constants.SHERRY_DEFAULT_SHARE_DIR
    }
}

export function getLocalIpAddress(): string {
    const ifaces = os.networkInterfaces()

    return Object.keys(ifaces)
        .map(
            (ifname) =>
                ifaces[ifname]
                    .filter((iface) => iface.family === 'IPv4' && !iface.internal)
                    .map((iface) => iface.address)[0]
        )
        .filter((ip) => ip)[0]
}
