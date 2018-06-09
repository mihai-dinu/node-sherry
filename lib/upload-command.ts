import 'source-map-support/register'
import { start } from './start-command'

export function upload(file: string, opts: any) {
    if (!isServerStarted) {
        start(opts.port)
    }
}

function isServerStarted() {
    return false
}
