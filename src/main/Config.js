const electron = require ('electron');
const path = require ('path');
const fse = require ('fs-extra');
const writeFileAtomic = require ('write-file-atomic');

class Config {
	/**
	 * Config initialization.
	 */
	constructor () {
		this.fileDir = path.join ((electron.app || electron.remote.app).getPath ('userData'), 'var', 'config');
		this.filePath = path.join ((electron.app || electron.remote.app).getPath ('userData'), 'var', 'config', 'default.json');
		this.data = {};
	}

	/**
	 * Load saved config from file.
	 */
	async Load () {
		try {
			let fileData = await fse.readFile (this.filePath);

			this.data = JSON.parse (fileData);
		} catch (error) {
			console.error ('TCH_e Config - Load - ' + error.message);

			this.data = {};

			try {
				await fse.ensureDir (this.fileDir);
			} catch (error2) {
				console.error ('TCH_e Config - Load.2 - ' + error.message);
			}
		}
	}

	/**
	 * Save config data to file.
	 */
	Save () {
		try {
			writeFileAtomic (this.filePath, JSON.stringify (this.data), error => {
				if (error) {
					console.error ('TCH_e Config - Save - ' + error.message);
				}
			});
		} catch (error) {
			console.error ('TCH_e Config - Save - ' + error.message);
		}
	}

	/**
	 * Get value or all data from config.
	 */
	Get (key = null) {
		if (key !== null && typeof (this.data [key]) !== 'undefined') {
			return this.data [key];
		} else if (key === null) {
			return this.data;
		}

		return null;
	}

	/**
	 * Set value to config and save.
	 */
	Set (key, value) {
		this.data [key] = value;

		this.Save ();
	}

	/**
	 * Delete value from config and save.
	 */
	Delete (key) {
		if (typeof (this.data [key]) !== 'undefined') {
			delete this.data [key];

			this.Save ();
		}
	}
}

module.exports = Config;
