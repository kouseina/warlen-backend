'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderSchema extends Schema {
	up() {
		this.create('orders', (table) => {
			table.increments()
			table.decimal('total', 12, 2).defaultTo(0.0)
			table.integer('user_id').unsigned()
			table.enu('status', ['booked', 'ongoing', 'done'])
			table.uuid('invoice_number').notNullable()
			table.integer('location_id').unsigned()
			table.string('location', 255)
			table.string('phone', 255)
			table.string('referral_code', 10)
			table.timestamps()

			table.foreign('user_id').references('id').inTable('users').onDelete('cascade')
			table.foreign('location_id').references('id').inTable('locations').onDelete('cascade')
		})
	}

	down() {
		this.drop('orders')
	}
}

module.exports = OrderSchema
