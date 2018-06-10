import 'source-map-support/register'
import { start, isServerAlreadyRunning } from './start-command'
import * as util from './util'
import * as fs from 'fs'
import * as path from 'path'

export async function upload(...args: any[]) {
    const opts = args.pop()
    const file = args.shift()
    const port = opts.hasOwnProperty('port') ? opts.port : util.getServerPort()
    if (!(await isServerAlreadyRunning())) {
        await start(port)
    }

    const fileAbsolutePath = path.isAbsolute(file) ? file : path.normalize(path.join(process.cwd(), file))
    const fileName = path.basename(fileAbsolutePath)
    const sharePath = path.join(util.getServerShareDir(), fileName)

    // If another file with the same name exists in the share directory
    // remove it before creating another one
    try {
        fs.lstatSync(sharePath)
        fs.unlinkSync(sharePath)
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err
        }
    }

    // Create a symlink to save disk space
    fs.symlinkSync(fileAbsolutePath, sharePath)

    const uri = util.getServerUri(`files/${fileName}`)
    console.log(`Your file is accessible at: ${uri}`)
}

if (!module.parent) {
    upload(process.argv[2])
}
