'use strict'

const Location = use('App/Models/Location')

class LocationController {
	async index({ request, response }) {
		// order number
		let location = await Location.query().pluck('name')

		return response.send(location)
	}
}

module.exports = LocationController
