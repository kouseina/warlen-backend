'use strict'

/*
|--------------------------------------------------------------------------
| LocationSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Location = use('App/Models/Location')

class LocationSeeder {
	async run() {
		for (let slug of ['bandung', 'purwokerto']) {
			const name = slug.charAt(0).toUpperCase() + slug.substring(1)
			await Location.create({
				slug,
				name
			})
		}
	}
}

module.exports = LocationSeeder
