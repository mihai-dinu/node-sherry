import { homedir } from 'os'
import { join } from 'path'

const home = `${homedir()}/.sherry`

export const constants = Object.freeze({
    SHERRY_HOME: home,
    SHERRY_CONFIG_FILE: join(home, 'config'),
    SHERRY_DEFAULT_FILES_DIR: join(home, 'files'),
})
