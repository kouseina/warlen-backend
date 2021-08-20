'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Image = use('App/Models/Image')
const { manage_single_upload, manage_multiple_uploads } = use('App/Helpers')
const fs = use('fs')
const Transformer = use('App/Transformers/Admin/ImageTransformer')
const Helpers = use('Helpers')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
	/**
	 * Display a single image.
	 * GET images/:id
	 *
	 * @param {object} ctx
	 * @param {Request} ctx.request
	 * @param {Response} ctx.response
	 * @param {View} ctx.view
	 */
	async show({ params: { id }, request, response, transform }) {
		var image = await Image.findOrFail(id)
		return response.send(image)
	}
}

module.exports = ImageController
