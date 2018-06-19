import * as util from '../lib/util'
import { constants } from '../lib/constants'

test('getServerPort - no config file returns the default port', () => {
    JSON.parse = jest.fn().mockImplementation(() => new Error('File not found'))
    expect(util.getServerPort()).toBe(constants.SHERRY_DEFAULT_PORT)
})

test('getServerPort - returns config file port if config exists', () => {
    JSON.parse = jest.fn().mockImplementation(() => {
        return {
            port: '3000',
        }
    })
    expect(util.getServerPort()).toBe('3000')
})

test('getServerPort - returns default port if config file exists, but empty', () => {
    JSON.parse = jest.fn().mockImplementation(() => {
        return {}
    })
    expect(util.getServerPort()).toBe(constants.SHERRY_DEFAULT_PORT)
})
