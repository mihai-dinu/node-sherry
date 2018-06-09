import { homedir } from 'os'

const home = `${homedir()}/.sherry`

export const constants = Object.freeze({
    SHERRY_HOME: home,
    SHERRY_PID_FILE: `${home}/.pid`,
    SHERRY_CONFIG_FILE: `${home}/config`
})