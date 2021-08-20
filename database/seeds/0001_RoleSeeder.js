'use strict'

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Role = use('Role')

class RoleSeeder {
	async run() {
		for (let slug of ['admin', 'manager', 'client', 'courier']) {
			const name = slug.charAt(0).toUpperCase() + slug.substring(1)
			await Role.create({
				slug,
				name
			})
		}
	}
}

module.exports = RoleSeeder
