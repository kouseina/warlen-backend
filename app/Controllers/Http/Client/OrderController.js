'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')
const Transformer = use('App/Transformers/Admin/OrderTransformer')
const Database = use('Database')
const Service = use('App/Services/Order/OrderService')
const Ws = use('Ws')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')
const { validate } = use('Validator')

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
	 * @param {View} ctx.view
	 */
	async index({ request, response, transform, pagination, auth }) {
		// order number
		const client = await auth.getUser()
		const number = request.input('number')
		let order = await Order.query()
			.where('user_id', client.id)
			.with('user')
			.with('items.product')
			.fetch()

		if (number) {
			order = await Order.query()
				.where('id', 'LIKE', `${number}`)
				.with('user')
				.with('items.product')
				.fetch()
		}

		// const results = await query.orderBy('id', 'DESC').paginate(pagination.page, pagination.limit)

		// const orders = await transform.paginate(results, Transformer)

		return response.send(order)
	}

	async showUsingReferral({ request, response, transform, pagination, auth }) {
		// order number
		const client = await auth.getUser()
		let order = await Order.query()
			.where('referral_code', client.referral_code)
			.with('user')
			.with('items.product')
			.fetch()

		return response.send(order)
	}

	/**
	 * Create/save a new order.
	 * POST orders
	 *
	 * @param {object} ctx
	 * @param {Request} ctx.request
	 * @param {Response} ctx.response
	 */
	async store({ request, response, auth, transform }) {
		const trx = await Database.beginTransaction()
		const { v4: uuidv4 } = require('uuid')
		const rules = {
			items: 'required',
			location: 'required',
			phone: 'required',
			location_id: 'required'
		}
		try {
			const items = request.input('items') // array
			const location = request.input('location') // string
			const phone = request.input('phone') // string
			const location_id = request.input('location_id') // string
			const client = await auth.getUser()
			const validation = await validate(request.all(), rules)

			if (validation.fails()) {
				return response.status(400).send({
					message: 'Please fill in all the fields'
				})
			}

			var order = await Order.create(
				{
					user_id: client.id,
					status: 'booked',
					location,
					phone,
					invoice_number: uuidv4(),
					location_id,
					referral_code: client.joined_referral_code
				},
				trx
			)

			const service = new Service(order, trx)

			if (items.length > 0) {
				await service.syncItems(items)
			}

			await trx.commit()
			// instancia os hooks de cálculos dos subtotais
			order = await Order.find(order.id)
			order = await transform.include('items').item(order, Transformer)
			// emite um broadcast no websocket
			const topic = Ws.getChannel('notifications').topic('notifications')
			if (topic) {
				topic.broadcast('new:order', order)
			}
			return response.status(201).send(order)
		} catch (error) {
			await trx.rollback()
			return response.status(400).send({
				message: 'We were unable to place your order!'
			})
		}
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
	async show({ params: { id }, response, transform, auth }) {
		const client = await auth.getUser()
		const result = await Order.query()
			.where('user_id', client.id)
			.where('id', id)
			.with('items.product')
			.fetch()
		// const order = await transform.item(result, Transformer)
		return response.send(result)
	}

	async applyDiscount({ params: { id }, request, response, transform, auth }) {
		const { code } = request.all()
		const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
		const client = await auth.getUser()
		var order = await Order.query().where('user_id', client.id).where('id', id).firstOrFail()

		var discount,
			info = {}
		try {
			const service = new Service(order)
			const canAddDiscount = await service.canApplyDiscount(coupon)
			const orderDiscounts = await order.coupons().getCount()

			const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)
			if (canAddDiscount && canApplyToOrder) {
				discount = await Discount.findOrCreate({
					order_id: order.id,
					coupon_id: coupon.id
				})

				info.message = 'Coupon successfully applied!'
				info.success = true
			} else {
				info.message = 'The coupon could not be applied!'
				info.success = false
			}
			order = await transform.include('coupons,items,discounts').item(order, Transformer)
			return response.send({ order, info })
		} catch (error) {
			return response.status(400).send({
				message: 'Unknown error!'
			})
		}
	}

	async removeDiscount({ request, response }) {
		const { discount_id } = request.all()
		const discount = await Discount.findOrFail(discount_id)
		await discount.delete()
		return response.status(204).send()
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

			if (!status.toLowerCase().includes('booked') && !status.toLowerCase().includes('done')) {
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
