'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
	/**
	 * Order Resource Routes
	 */
	Route.get('orders', 'OrderController.index').middleware('auth', 'is:( courier )')
	Route.get('orders/:id', 'OrderController.show').middleware('auth', 'is:( courier )')
	Route.put('orders/:id', 'OrderController.update').middleware('auth', 'is:( courier )')
})
	.prefix('api/v1/courier')
	.namespace('Courier')
