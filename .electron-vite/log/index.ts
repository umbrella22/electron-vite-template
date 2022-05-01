import chalk from 'chalk'

export const doneLog = chalk.bgGreen.white(' DONE ') + ' '
export const errorLog = chalk.bgRed.white(' ERROR ') + ' '
export const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
export const warningLog = chalk.bgYellow.white(' WARNING ') + ' '
export const infoLog = chalk.bgCyan.white(' INFO ') + ' '