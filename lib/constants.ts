import { homedir } from 'os'
import { join } from 'path'

const home = `${homedir()}/.sherry`

export const constants = Object.freeze({
    SHERRY_HOME: home,
    SHERRY_PID_FILE: join(home, '.pid'),
    SHERRY_CONFIG_FILE: join(home, 'config'),
    SHERRY_DEFAULT_SHARE_DIR: join(home, 'share'),
    SHERRY_DEFAULT_PORT: '8080',
})
