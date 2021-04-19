'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
	/**
	 * Product Resource Routes
	 */
	Route.get('products', 'ProductController.index')
	Route.get('products/:id', 'ProductController.show')

	/**
	 * Order Resource Routes
	 */
	Route.get('orders', 'OrderController.index').middleware('auth', 'is:( client || admin )')
	Route.get('orders/:id', 'OrderController.show').middleware('auth', 'is:( client || admin )')
	Route.post('orders', 'OrderController.store').middleware('auth', 'is:( client )')
	Route.put('orders/:id', 'OrderController.update').middleware('auth', 'is:( client )')

	/**
	 * Image Resource Routes
	 */

	Route.get('images/:id', 'ImageController.show')
})
	.prefix('api/v1')
	.namespace('Client')
