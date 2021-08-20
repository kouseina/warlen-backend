'use strict'

/*
|--------------------------------------------------------------------------
| ClientSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */

const Factory = use('Factory')
const Role = use('Role')
const User = use('App/Models/User')

class ClientSeeder {
	async run() {
		for (let slug of ['admin', 'manager', 'client', 'courier']) {
			const surname = slug.charAt(0).toUpperCase() + slug.substring(1)
			const user = await User.create({
				name: 'Carefood',
				surname,
				email: `${slug}@mail.com`,
				password: 'password'
			})

			await user.roles().attach([(await Role.findBy('slug', slug)).id])
		}
	}
}

module.exports = ClientSeeder
