const {ENGINE_TYPES} = require ('tch-database');
const path = require ('path');

module.exports = {
	storageSystem: ENGINE_TYPES.NeDB,
	nedb: {
		directory: path.join ('var', 'nedb')
	}
};
