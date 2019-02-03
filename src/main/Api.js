const { app, ipcMain, shell } = require ('electron');
const { promisify } = require ('util');
const fs = require ('fs');
const path = require ('path');
const systemInformation = require ('systeminformation');

const readDirPromise = promisify (fs.readdir);
const statPromise = promisify (fs.stat);

class Api {
	/**
	 * Api initialization.
	 */
	static Init () {
		ipcMain.on ('main-parameters', Api.MainParameters);

		ipcMain.on ('directory-contents', Api.ReadDirectory);

		ipcMain.on ('drives-list', Api.ListDrives);

		ipcMain.on ('file-open', Api.OpenFile);
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
		let stats = typeof (message.statistics) !== 'undefined' && message.statistics ? true : false;

		try {
			let files = await readDirPromise (message.directory);
			
			if (Array.isArray (files) && files.length > 0) {
				for (let index in files) {
					let file = {
						name: files [index]
					};

					try {
						if (stats) {
							let stat = await statPromise (path.join (message.directory, file.name));
	
							file.isDirectory = stat.isDirectory ();
							
							if (stat.isFile ()) {
								file.size = stat.size;
							}
						}
					} catch (error) {
						console.error ('TCH_e API - ReadDirectory - ' + error.message);

						file.statFailed = true;
					}
	
					contents.push (file);
				}
			}
		} catch (error) {
			console.error ('TCH_e API - ReadDirectory - ' + error.message);

			if (error.code === 'ENOENT') {
				contents = [
					{
						error: 'ENOENT'
					}
				];
			}
		}
		
		event.sender.send ('directory-contents', {
			id: message.id,
			directory: message.directory,
			contents
		});
	}

	/**
	 * Get list of drives.
	 */
	static async ListDrives (event, message) {
		let drives = [];

		try {
			let devices = await systemInformation.blockDevices ();

			if (Array.isArray (devices) && devices.length > 0) {
				for (let index in devices) {
					if (devices [index].physical === 'Local') {
						drives.push (devices [index]);
					}
				}
			}
		} catch (error) {
			console.error ('TCH_e API - ListDrives - ' + error.message);
		}

		event.sender.send ('drives-list', {
			drives
		});
	}

	/**
	 * Open file using system default app.
	 */
	static async OpenFile (event, message) {
		try {
			let filePath = message.filePath;
			if (typeof (filePath) === 'undefined' && typeof (message.directory) !== 'undefined' && typeof (message.file) !== 'undefined') {
				filePath = path.join (message.directory, message.file);
			}

			if (typeof (filePath) !== 'undefined') {
				let stat = await statPromise (filePath);

				if (stat.isFile ()) {
					shell.openItem (filePath);
				}
			}
		} catch (error) {
			console.error ('TCH_e API - OpenFile - ' + error.message);
		}
	}
}

module.exports = Api;
