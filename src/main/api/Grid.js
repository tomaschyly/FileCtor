const { ipcMain } = require ('electron');

class Grid {
	/**
	 * Grid API initialization.
	 */
	static Init () {
		ipcMain.on ('grid-update', this.UpdateData);
	}

	/**
	 * Update grid data based on received parameters.
	 */
	static async UpdateData (event, message) {
		let model = require (`../model/${message.modelName}`);
		model = new model ();

		for (const filter in message.parameters.where) {
			if (message.parameters.where.hasOwnProperty (filter)) {
				message.parameters.where [filter].value = new RegExp (`${message.parameters.where [filter].value}`, 'i');
			}
		}

		const response = {};
		response.count = await model.Count (message.parameters);
		response.pages = Math.ceil (response.count / message.parameters.limit);

		response.items = await model.List (message.parameters);

		event.sender.send ('grid-update', response);
	}
}

module.exports = Grid;
