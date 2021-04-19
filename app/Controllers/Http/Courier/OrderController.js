'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')
const Database = use('Database')
const Service = use('App/Services/Order/OrderService')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')
const Transformer = use('App/Transformers/Admin/OrderTransformer')
/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
	/**
	 * Show a list of all orders.
	 * GET orders
	 *
	 * @param {object} ctx
	 * @param {Request} ctx.request
	 * @param {Response} ctx.response
	 * @param { object } ctx.paginate
	 */
	async index({ request, response, pagination, transform }) {
		const { status, id } = request.only(['status', 'id '])
		var order = await Order.query().with('items.product').fetch()

		if (status && id) {
			order = await Order.query()
				.where('status', status)
				.orWhere('id', 'LIKE', `%${id}%`)
				.with('items.product')
				.fetch()
		} else if (status) {
			order = await Order.query().where('status', status).with('items.product').fetch()
		} else if (id) {
			order = await Order.query().where('id', 'LIKE', `%${id}%`).with('items.product').fetch()
		}

		// var orders = await query.paginate(pagination.page, pagination.limit)
		// orders = await transform.paginate(orders, Transformer)
		return response.send(order)
	}

	/**
	 * Display a single order.
	 * GET orders/:id
	 *
	 * @param {object} ctx
	 * @param {Request} ctx.request
	 * @param {Response} ctx.response
	 * @param {View} ctx.view
	 */
	async show({ params: { id }, response, transform }) {
		// var order = await Order.findOrFail(id)
		var order = await Order.query().where('id', id).with('items.product').fetch()
		// var orderTransform = await transform.include('items,user,discounts').item(order, Transformer)
		return response.send(order)
	}

	/**
	 * Update order details.
	 * PUT or PATCH orders/:id
	 *
	 * @param {object} ctx
	 * @param {Request} ctx.request
	 * @param {Response} ctx.response
	 */
	async update({ params: { id }, request, response, auth, transform }) {
		// const client = await auth.getUser()
		var order = await Order.query().where('id', id).firstOrFail()
		const trx = await Database.beginTransaction()
		try {
			const { status } = request.all()

			if (!status.toLowerCase().includes('ongoing') && !status.toLowerCase().includes('done')) {
				await trx.rollback()
				return response.status(400).send({
					message: 'We were unable to update your order!'
				})
			}

			order.merge({ status })
			await order.save(trx)
			await trx.commit()
			order = await transform.include('items,coupons,discounts').item(order, Transformer)
			return response.send(order)
		} catch (error) {
			await trx.rollback()
			return response.status(400).send({
				message: 'We were unable to update your order!'
			})
		}
	}
}

module.exports = OrderController
