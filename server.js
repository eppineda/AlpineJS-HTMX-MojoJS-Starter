import chalk from 'chalk'
import { readdir } from 'fs/promises'
import console from './my-console.js'
import route from './routing/index.js'

const startup = mojo => new Promise((resolve, reject) => {
	const port = process.env.PORT
	const app = mojo()

	mapRoutes(app)
	resolve({ app })
}); const start = startup

const handleExit = (signal = 0) => {
	console.log(`\n--Received ${ signal }. App will stop listening.`)
	process.exit(signal)
}
const shutdown = () => {
	handleExit()
}; const stop = shutdown

const listFilesAsync = async (path, wildcards) => {
	const found = []
	const options = {
	}

	try {
// identify all files in the specified directory that match the wildcards, rewritten as being relative to the root (/) www directory
		const all = (await readdir(path, options))
			.filter(f => {
				let match = false

				wildcards.forEach(pattern => {
					if (pattern.test(f)) match = true
				})

				return match
			})
			.forEach(f => found.push(`${ path }/${ f }`.replace('./public', ''))) // rewrite the path relative to public/ 
	} catch (err) {
    		console.error(err)
  	}

	//console.log(found)
	return found
}

const mapRoutes = async app => {
	const router = app.router

	app.get('/', async ctx => {
		await ctx.sendFile(ctx.home.child('public', 'index.html')) // default response for root aka public/
	})
	route(app)

// all static web files under public/
	new Promise((resolve, reject) => {
		const promises = []
		const dirs = [
			'./public',
		].forEach(async path => {
			const allowed = [
				/.html/,
				/.css$/,
				/.js$/,
				/.min.js$/,
				/.jpg/,
				/.png/,
				/.gif/,
			]

			promises.push(new Promise((resolve, reject) => {
				resolve(listFilesAsync(path, allowed))
			}))
		})

		Promise.all(promises).then(result => {
			let toBeServed = []

			result.forEach(list => {
				toBeServed = toBeServed.concat(list)
			})// ; console.log(toBeServed)

			resolve(toBeServed)
		})
	}).then(www => {
		www.forEach(request => {
			const response = request.replace('/', '')//; console.log(`requesting ${ request } responds with ${ response }`)
			app.get(request, async ctx => {
				await ctx.sendFile(ctx.home.child('public', response))
			})
		})
	})
}

const server = { startup, shutdown, start, stop }
export default server

process.on('SIGINT', shutdown)
process.on('SIGQUIT', shutdown)
process.on('SIGTERM', shutdown)
