'use strict'

const Database = use('Database')
const User = use('App/Models/User')
const Role = use('Role')
const Ws = use('Ws')

class AuthController {
	async register({ request, response }) {
		const trx = await Database.beginTransaction()
		try {
			const { name, surname, email, password, role, joined_referral_code } = request.all()

			const getRandomString = (length) => {
				var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
				var result = ''
				for (var i = 0; i < length; i++) {
					result += randomChars.charAt(Math.floor(Math.random() * randomChars.length))
				}
				return result
			}

			var resultRandomString = getRandomString(5)
			const userHasReferralCode = await Database.from('users').where(
				'referral_code',
				'LIKE',
				`%${resultRandomString}%`
			)
			const ifJoinedSameWithReferral = await Database.from('users').where(
				'referral_code',
				'LIKE',
				`%${joined_referral_code}%`
			)

			if (
				ifJoinedSameWithReferral.length < 1 &&
				joined_referral_code !== null &&
				joined_referral_code !== undefined
			) {
				await trx.rollback()
				return response.status(400).send({
					message: 'Referral code is wrong!'
				})
			}

			if (userHasReferralCode.length > 0) {
				while (resultRandomString === userHasReferralCode[0].referral_code) {
					resultRandomString = `${getRandomString(5)}`
				}
			}

			if (!role.toLowerCase().includes('client') && !role.toLowerCase().includes('courier')) {
				return response.status(400).send({
					message: 'Error while registering!'
				})
			}

			const user = await User.create(
				{ name, surname, email, password, referral_code: resultRandomString, joined_referral_code },
				trx
			)
			const userRole = await Role.findBy('slug', role.toLowerCase())
			await user.roles().attach([userRole.id], null, trx)
			await trx.commit()

			const topic = Ws.getChannel('notifications').topic('notifications')
			if (topic) {
				topic.broadcast('new:user')
			}

			return response.status(201).send({ data: user })
		} catch (error) {
			await trx.rollback()
			return response.status(400).send({
				message: 'Error while registering!' + error
			})
		}
	}

	async login({ request, response, auth }) {
		const { email, password } = request.all()

		let data = await auth.withRefreshToken().attempt(email, password)

		return response.send({ data })
	}

	async refresh({ request, response, auth }) {
		var refresh_token = request.input('refresh_token')

		if (!refresh_token) {
			refresh_token = request.header('refresh_token')
		}

		const user = await auth.newRefreshToken().generateForRefreshToken(refresh_token)

		return response.send({ data: user })
	}

	async logout({ request, response, auth }) {
		let refresh_token = request.input('refresh_token')

		if (!refresh_token) {
			refresh_token = request.header('refresh_token')
		}

		await auth.authenticator('jwt').revokeTokens([refresh_token], true)
		return response.status(204).send({})
	}

	async forgot({ request, response }) {
		//
	}

	async remember({ request, response }) {
		//
	}

	async reset({ request, response }) {
		//
	}
}

module.exports = AuthController
