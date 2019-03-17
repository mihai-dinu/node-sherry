import * as util from '../lib/helper'
import * as fs from 'fs';

test('getServerPort - no config file returns random port', () => {
    JSON.parse = jest.fn().mockImplementation(() => new Error('File not found'))

    const port = parseInt(util.getServerPort())
    expect(port).toBeGreaterThanOrEqual(49200)
    expect(port).toBeLessThanOrEqual(49300)
})

test('getServerPort - returns config file port if config exists', () => {
    // TODO: Fix this test by mocking fs readFileSync somehow
    // jest.mock('fs')
    // fs.readFileSync = jest.fn()
    //     return JSON.stringify({
    //         port: '3000',
    //     })
    // })
    // expect(util.getServerPort()).toBe('3000')
})

test('getServerPort - returns random port if config file exists, but empty', () => {
    JSON.parse = jest.fn().mockImplementation(() => {
        return {}
    })
    const port = parseInt(util.getServerPort())
    expect(port).toBeGreaterThanOrEqual(49200)
    expect(port).toBeLessThanOrEqual(49300)
})
