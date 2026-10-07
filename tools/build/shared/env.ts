import { config } from 'dotenv'
import { join } from 'path'
import cliConfig from '../../../apps/desktop/config/index.ts'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))
// 应用包根目录（tools/build 的上两级）
const appRoot = join(import.meta.dirname, '..', '..', '..', 'apps', 'desktop')

export const getEnv = () => argv['m']
export const getArgv = () => argv

const getEnvPath = () => {
  if (
    String(typeof getEnv()) === 'boolean' ||
    String(typeof getEnv()) === 'undefined'
  ) {
    return join(appRoot, 'env/.env')
  }
  return join(appRoot, `env/.${getEnv()}.env`)
}

export const getConfig = () => config({ path: getEnvPath() }).parsed



