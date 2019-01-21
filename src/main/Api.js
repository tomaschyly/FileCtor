const { app, ipcMain } = require ('electron');
const { promisify } = require ('util');
const fs = require ('fs');

const readDirPromise = promisify (fs.readdir);

class Api {
	/**
	 * Api initialization.
	 */
	static Init () {
		ipcMain.on ('main-parameters', Api.MainParameters);

		ipcMain.on ('directory-contents', Api.ReadDirectory);
	}

	/**
	 * Send main process (Electron) parameters to renderer.
	 */
	static MainParameters (event, message) {
		let parameters = {
			platform: process.platform,
			directory: {
				documents: app.getPath ('documents')
			}
		};

		switch (process.platform) {
			case 'linux':
				parameters.osIsLinux = true;
				break;
			case 'darwin':
				parameters.osIsDarwin = true;
				break;
			default:
				break;
		}

		event.sender.send ('main-parameters', parameters);
	}

	/**
	 * Read contents of directory.
	 */
	static async ReadDirectory (event, message) {
		let contents = [];

		try {
			let files = await readDirPromise (message.directory);
			
			if (Array.isArray (files) && files.length > 0) {
				for (let index in files) {
					contents.push ({
						name: files [index]
					});
				}
			}
		} catch (error) {
			console.error ('TCH_e API - ReadDirectory - ' + error.message);
		}

		event.sender.send ('directory-contents', {
			id: message.id,
			contents: contents
		});
	}
}

module.exports = Api;
