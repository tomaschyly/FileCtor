const { app, ipcMain } = require ('electron');

class Api {
	/**
	 * Api initialization.
	 */
	static Init () {
		ipcMain.on ('main-parameters', Api.MainParameters);
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
}

module.exports = Api;
