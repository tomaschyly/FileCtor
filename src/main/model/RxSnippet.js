const Base = require ('./Base');
const config = require ('../../../config');

class RxSnippet extends Base {
	/**
	 * RxSnippet initialization.
	 */
	constructor () {
		super (config);

		this.collectionName = 'snippet';
		this.collectionSchema = {
			title: 'Snippet schema',
			version: 0,
			type: 'object',
			properties: {
				id: {
					type: 'string',
					primary: true
				},
				name: {
					type: 'string'
				},
				description: {
					type: 'string'
				},
				script: {
					type: 'string'
				},
				created: {
					type: 'number',
					final: true
				},
				updated: {
					type: 'number'
				}
			}
		};
	}
}

module.exports = RxSnippet;
