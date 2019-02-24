const Base = require ('tch-database/model/Base');
const config = require ('../../../config');

class Snippet extends Base {
	/**
	 * Snippet initialization.
	 */
	constructor () {
		super (config);

		this.table = 'snippet';
	}

	/**
	 * Data defaults.
	 */
	Defaults () {
		return {
			name: '',
			description: '',
			script: '',
			created: 0,
			updated: 0
		};
	}
}

module.exports = Snippet;
