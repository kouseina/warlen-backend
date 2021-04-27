'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
	up() {
		this.create('users', (table) => {
			table.increments()
			table.string('name', 80)
			table.string('surname', 200)
			table.string('email', 254).notNullable().unique()
			table.string('password', 60).notNullable()
			table.integer('image_id').unsigned()
			table.string('referral_code', 10).unique()
			table.string('joined_referral_code', 10)
			table.timestamps()
		})
	}

	down() {
		this.drop('users')
	}
}

module.exports = UserSchema
