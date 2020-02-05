const RxDB = require ('rxdb');
RxDB.plugin (require ('pouchdb-adapter-node-websql'));
const uuidV4 = require ('uuid/v4');

const Base_static = {
	rxDB: undefined,
	collections: {}
};

class Base {
	/**
     * Base initialization.
     */
	constructor (config) {
		this.config = config;

		this.collectionName = '';
		this.collectionSchema = {};

		this.data = {};
		this.id = undefined;
	}

	/**
	 * Reset data.
	 */
	Reset () {
		this.data = [];
		this.id = undefined;
	}

	/**
	 * Initialize RxDB collection if not yet for collectionName.
	 */
	async InitCollection () {
		if (typeof Base_static.rxDB === 'undefined') {
			Base_static.rxDB = await RxDB.create ({
				name: this.config.rxDB.name,
				adapter: 'websql'
			});
		}

		if (typeof Base_static.collections [this.collectionName] === 'undefined') {
			Base_static.collections [this.collectionName] = await Base_static.rxDB.collection ({
				name: this.collectionName,
				schema: this.collectionSchema
			});
		}

		return Base_static.collections [this.collectionName];
	}

	/**
	 * Load data by id from DB.
	 */
	async Load (id) {
		this.Reset ();

		const collection = await this.InitCollection ();

		const record = await collection.findOne (this.id).exec ();

		if (record) {
			this.id = id;
			this.data = record.toJSON ();
		}

		return this;
	}

	/**
	 * Save data to DB, insert/update is used depending on ID.
	 */
	async Save () {
		const collection = await this.InitCollection ();

		if (typeof this.id === 'undefined') {
			this.id = uuidV4 ();
			this.data.id = this.id;

			this.data.created = Base.NowTimestamp ();
		}

		this.data.updated = Base.NowTimestamp ();

		await collection.upsert (this.data);

		return this;
	}

	/**
	 * Return current time as timestamp.
	 */
	static NowTimestamp () {
		return Math.round (new Date ().getTime () / 1000);
	}
}

module.exports = Base;
