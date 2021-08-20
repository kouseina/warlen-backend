'use strict'

const Database = use('Database')
const User = use('App/Models/User')

const UserTransformer = use('App/Transformers/Admin/UserTransformer')
class UserController {
	async me({ response, transform, auth }) {
		var user = await auth.getUser()
		const userData = await transform.item(user, UserTransformer)
		userData.roles = await user.getRoles()

		return response.send(userData)
	}

	async joined({ request, response, transform, auth }) {
		var user = await auth.getUser()
		const userData = await transform.item(user, UserTransformer)
		const trx = await Database.beginTransaction()

		try {
			const { joined_referral_code } = request.all()
			const userHasReferral = await Database.from('users').where(
				'referral_code',
				'LIKE',
				`%${joined_referral_code}%`
			)

			if (userHasReferral.length < 1) {
				await trx.rollback()
				return response.status(400).send({
					message: 'We were unable to add your referral code!'
				})
			} else if (user.joined_referral_code !== null) {
				await trx.rollback()
				return response.status(400).send({
					message: 'We were unable to add your referral code!'
				})
			}

			user.merge({ joined_referral_code })
			await user.save(trx)
			await trx.commit()
			user = await transform.include('user').item(user, UserTransformer)

			return response.send(user)
		} catch (error) {
			await trx.rollback()
			return response.status(400).send({
				message: 'We were unable to add your referral code!' + error
			})
		}
	}
}

module.exports = UserController
