import 'source-map-support/register'
import * as request from 'request-promise-native'
import * as util from './util'

export async function stop() {
    const options = {
        method: 'POST',
        uri: util.getServerUri('api/v1/status'),
        body: {
            state: 'down',
        },
        json: true,
    }

    request(options)
        .then(() => {
            console.log('OK')
        })
        .catch(() => {
            console.log('Server is already stopped...')
            process.exit(1)
        })
}
