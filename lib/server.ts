import 'source-map-support/register'
import * as Hapi from '@hapi/hapi'
import * as fs from 'fs'
import * as path from 'path'

const args = process.argv.slice(2)
const [port, workingDir] = args

const server = new Hapi.Server({ port })

server.route([
    {
        method: 'GET',
        path: '/files/{fileName}',
        handler: (req: Hapi.Request) => {
            const filePath = path.join(workingDir, req.params.fileName)

            // [TODO: Remove file link] fs.existsSync returns false if the link exists, but the linked source doesn't
            // Should remove a link if its source doesn't exist anymore
            if (fs.existsSync(filePath)) {
                return fs.createReadStream(filePath)
            } else {
                throw new Error('File not found')
            }
        },
    },
    {
        method: 'GET',
        path: '/api/v1/status',
        handler: (req: Hapi.Request, reply: Hapi.ResponseToolkit) => {
            return reply.response().code(200)
        },
    },
    {
        method: 'POST',
        path: '/api/v1/status',
        handler: (req: Hapi.Request, reply: Hapi.ResponseToolkit) => {
            const data = req.payload as { state: string }
            if (data.hasOwnProperty('state') && data.state === 'down') {
                // [TODO: Stop server] Can this be done better?
                stop()
                return reply.response().code(200)
            }
        },
    },
])

async function start(): Promise<void> {
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
}

async function stop(): Promise<void> {
    server.stop()
}

process.on('unhandledRejection', (err) => {
    fs.writeFileSync('sherry_server.log', err)
    process.exit(1)
})

start()
