'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')
/**
 * UserTransformer class
 *
 * @class UserTransformer
 * @constructor
 */
class UserTransformer extends TransformerAbstract {
	defaultInclude() {
		return ['image']
	}
	/**
	 * This method is used to transform the data.
	 */
	transform(model) {
		return {
			id: model.id,
			name: model.name,
			surname: model.surname,
			email: model.email,
			referral_code: model.referral_code,
			joined_referral_code: model.joined_referral_code
		}
	}

	includeImage(user) {
		return this.item(user.getRelated('image'), ImageTransformer)
	}
}

module.exports = UserTransformer
