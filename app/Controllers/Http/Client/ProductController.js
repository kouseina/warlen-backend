'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Product = use('App/Models/Product')
const Image = use('App/Models/Image')
const Transformer = use('App/Transformers/Admin/ProductTransformer')
/**
 * Resourceful controller for interacting with products
 */
class ProductController {
	/**
	 * Show a list of all products.
	 * GET products
	 *
	 * @param {object} ctx
	 * @param {Request} ctx.request
	 * @param {Response} ctx.response
	 * @param {View} ctx.view
	 */
	async index({ request, response, pagination, transform }) {
		const title = request.input('title')

		const query = Product.query()

		if (title) {
			query.where('name', 'LIKE', `${title}`)
		}

		const products = (await query.paginate(pagination.page, pagination.limit)).toJSON()

		let data = []
		for (let product of products.data) {
			let url = 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c31d.png'
			if (product.image_id) {
				url = (await Image.findOrFail(product.image_id)).toJSON().url
			}

			delete product.image_id

			data.push(Object.assign({ url }, product))
		}

		delete products.data

		return Object.assign({ data }, products)
	}

	/**
	 * Display a single product.
	 * GET products/:id
	 *
	 * @param {object} ctx
	 * @param {Request} ctx.request
	 * @param {Response} ctx.response
	 * @param {View} ctx.view
	 */
	async show({ params: { id }, response, transform }) {
		const result = (await Product.findOrFail(id)).toJSON()

		let url = null
		if (result.image_id) {
			url = (await Image.findOrFail(result.image_id)).toJSON().url
		}

		delete result.image_id
		return response.json(Object.assign({ url }, result))
	}
}

module.exports = ProductController
