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

		let response = {};
		response.count = await model.Count (message.filter);
		response.pages = Math.ceil (response.count / message.pageSize);

		Object.keys (message.filter).map (key => {
			message.filter [key].value = encodeURIComponent (message.filter [key].value);
		});

		response.items = await model.Collection (message.filter, {
			index: message.sort,
			direction: message.sortDirection
		}, {
			limit: message.pageSize,
			offset: (message.page - 1) * message.pageSize
		});

		event.sender.send ('grid-update', response);
	}
}

module.exports = Grid;
