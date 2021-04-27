'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LocationSchema extends Schema {
	up() {
		this.create('locations', (table) => {
			table.increments()
			table.string('slug').notNullable().unique()
			table.string('name').notNullable().unique()
			table.timestamps()
		})
	}

	down() {
		this.drop('locations')
	}
}

module.exports = LocationSchema
