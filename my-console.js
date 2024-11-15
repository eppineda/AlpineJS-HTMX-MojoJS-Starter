import chalk from 'chalk'

console.chalk = chalk

const original = {}
original.log = console.log
original.warn = console.warn
original.error = console.error
original.info = console.info
original.debug = console.debug
original.assert = console.assert

console.log = msg => {
	original.log(chalk.white(msg))		
}

console.warn = msg => {
	original.warn(chalk.yellow(warn))
}

console.error = msg => {
	original.error(chalk.red(msg))
}

console.info = msg => {
	original.info(chalk.bgWhite(msg))		
}

console.debug = msg => {
	original.debug(chalk.bgCyan(msg))
}

console.assert = msg => {
	original.assert(chalk.bgMagenta(msg))
}

export default console
