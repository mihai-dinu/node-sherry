import 'source-map-support/register'
import * as Hapi from 'hapi'
import * as Boom from 'boom'
import * as fs from 'fs'
import * as path from 'path'

const args = process.argv.slice(2)
const [port, workingDir] = args

const server = new Hapi.Server({ port })

server.route({
    method: 'GET',
    path: '/files/{fileName}',
    handler: (req) => {
        const filePath = path.join(workingDir, req.params.fileName)

        // [TODO: Remove file link] fs.existsSync returns false if the link exists, but the linked source doesn't
        // Should remove a link if its source doesn't exist anymore
        if (fs.existsSync(filePath)) {
            return fs.createReadStream(filePath)
        } else {
            throw Boom.notFound('File not found')
        }
    },
})

server.route({
    method: 'GET',
    path: '/api/v1/status',
    handler: (req, h) => {
        return h.response().code(200)
    },
})

async function init() {
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()
