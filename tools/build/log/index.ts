import chalk from 'chalk'

export const doneLog = (text: string) => {
  console.log('\n' + chalk.bgGreen.white(' DONE ') + ' ' + text)
}
export const errorLog = (text: string) => {
  console.log('\n ' + chalk.bgRed.white(' ERROR ') + ' ' + text)
}
export const okayLog = (text: string) => {
  console.log('\n ' + chalk.bgBlue.white(' OKAY ') + ' ' + text)
}
export const warningLog = (text: string) => {
  console.log('\n ' + chalk.bgYellow.white(' WARNING ') + ' ' + text)
}
export const infoLog = (text: string) => {
  console.log('\n ' + chalk.bgCyan.white(' INFO ') + ' ' + text)
}
