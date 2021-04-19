'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * Returns the currently logged in user
 */
Route.get('api/v1/me', 'UserController.me').as('me').middleware('auth')
/**
 * Imports authentication routes
 */
require('./auth')

/**
 * Imports admin routes
 */
require('./admin')

/**
 * Imports client routes
 */
require('./client')

/**
 * Imports courier routes
 */
require('./courier')
