import 'source-map-support/register'
import * as express from 'express'

const app = express()
const args = process.argv.slice(2)
const [port, workingDir]  = args

app.use(express.static(workingDir))
app.listen(parseInt(port), () => {
    console.log('Started server on', port, 'with working dir', workingDir)
})

// Should probably use something else other than express or just plain http/https for
// creating the routes to /api/v1/status and /files/<some-file>
