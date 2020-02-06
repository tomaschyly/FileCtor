const RxDB = require ('rxdb');
RxDB.plugin (require ('pouchdb-adapter-node-websql'));
const uuidV4 = require ('uuid/v4');
const extend = require ('extend');

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
		} else {
			const old = await collection.findOne (this.id).exec ();

			if (old) {
				this.data = extend (old.toJSON (), this.data);
			}
		}

		this.data.updated = Base.NowTimestamp ();

		await collection.upsert (this.data);

		return this;
	}

	/**
	 * Delete data from DB.
	 */
	async Delete () {
		const collection = await this.InitCollection ();

		if (typeof this.id !== 'undefined') {
			const record = await collection.findOne (this.id).exec ();

			if (record) {
				await record.remove ();

				this.Reset ();

				return true;
			}
		}

		return false;
	}

	/**
	 * Process where selection parameters on query.
	 */
	ProcessParametersWhere (query, parameters = {}) {
		if (typeof parameters.where === 'object') {
			const fields = Object.keys (parameters.where);

			for (let field of fields) {
				const comparison = parameters.where [field].comparison;

				switch (comparison) {
					case 'eq':
						query = query.where (field).eq (parameters.where [field].value);
						break;
					case 'and':
						query = query.where (field).and (parameters.where [field].value);
						break;
					case 'or':
						query = query.where (field).or (parameters.where [field].value);
						break;
					case 'in':
						query = query.where (field).in (parameters.where [field].value);
						break;
					case 'regex':
						query = query.where (field).regex (parameters.where [field].value);
						break;
					default:
						throw new Error ('Unsupported where condition comparison type');
				}
			}
		}

		return query;
	}

	/**
	 * Get count of records in DB.
	 */
	async Count (parameters = {}) {
		const collection = await this.InitCollection ();

		let list = collection.find ();

		list = this.ProcessParametersWhere (list, parameters);

		list = await list.exec ();

		return list.length;
	}

	/**
	 * Get all records from DB.
	 */
	async List (parameters = {}, asObject = undefined) {
		const collection = await this.InitCollection ();

		let list = collection.find ();

		list = this.ProcessParametersWhere (list, parameters);

		if (parameters.limit) {
			list = list.limit (parameters.limit);

			if (parameters.page) {
				list = list.skip (parameters.limit * parameters.page);
			}
		}

		if (parameters.sort) {
			const sortBy = parameters.sortBy || 1;
			const sort = {};
			sort [parameters.sort] = sortBy;

			list = list.sort (sort);
		}

		list = await list.exec ();

		list = list.map (element => {
			if (asObject) {
				const object = new asObject ();
				object.data = element.toJSON ();
				object.id = object.data.id;
				return object;
			} else {
				return element.toJSON ();
			}
		});

		return list;
	}

	/**
	 * Return current time as timestamp.
	 */
	static NowTimestamp () {
		return Math.round (new Date ().getTime () / 1000);
	}
}

module.exports = Base;
