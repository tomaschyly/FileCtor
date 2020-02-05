const electron = require ('electron');
const {ENGINE_TYPES} = require ('tch-database');
const path = require ('path');

module.exports = {
	storageSystem: ENGINE_TYPES.NeDB,
	nedb: {
		directory: path.join ('var', 'nedb')
	},
	rxDB: {
		name: path.join ((electron.app || electron.remote.app).getPath ('userData'), 'var', 'rxDB')
	},
	api: {
		url: 'https://tomas-chyly.com/wp-admin/admin-ajax.php'
	}
};
