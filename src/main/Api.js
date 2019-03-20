const { app, ipcMain, shell } = require ('electron');
const { promisify } = require ('util');
const fs = require ('fs');
const path = require ('path');
const systemInformation = require ('systeminformation');
const consoleApi = require ('./api/Console');
const gridApi = require ('./api/Grid');
const ConsoleWindow_static = require ('./Console').Console_static;
const ReferenceWindow_static = require ('./Reference').Reference_static;
const opn = require ('opn');
const axios = require ('axios');
const Snippet = require ('./model/Snippet');

const readDirPromise = promisify (fs.readdir);
const statPromise = promisify (fs.stat);
const config = require ('../../config');

let Main = undefined;

class Api {
	/**
	 * Api initialization.
	 */
	static Init (main) {
		ipcMain.on ('main-parameters', Api.MainParameters);

		ipcMain.on ('directory-contents', Api.ReadDirectory);

		ipcMain.on ('drives-list', Api.ListDrives);

		ipcMain.on ('file-open', Api.OpenFile);

		ipcMain.on ('main-open', Api.OpenMain);

		ipcMain.on ('window-reset', Api.ResetWindow);

		ipcMain.on ('config-get', Api.GetConfig);

		ipcMain.on ('config-set', Api.SetConfig);

		ipcMain.on ('app-settings-save', Api.SaveAppSettings);

		ipcMain.on ('app-reset', Api.ResetApp);

		ipcMain.on ('url-open', Api.OpenUrl);

		ipcMain.on ('contact-message-send', Api.SendMessage);

		Main = main;
		consoleApi.Init (main);
		gridApi.Init ();
	}

	/**
	 * Send main process (Electron) parameters to renderer.
	 */
	static MainParameters (event) {
		const appPackage = require ('../../package');

		let parameters = {
			apiUrl: config.api.url,
			directory: {
				documents: app.getPath ('documents')
			},
			platform: process.platform,
			name: appPackage.productName,
			version: appPackage.version,
			settings: Main.config.Get ('app-settings')
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
		let stats = typeof (message.statistics) !== 'undefined' && message.statistics;

		try {
			let files = await readDirPromise (message.directory);
			
			if (Array.isArray (files) && files.length > 0) {
				for (let index in files) {
					if (files.hasOwnProperty (index)) {
						let file = {
							name: files [index]
						};

						if (typeof (message.query) !== 'undefined' && !new RegExp (message.query, 'i').test (file.name)) {
							continue;
						}

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
	static async ListDrives (event) {
		let drives = [];

		try {
			switch (process.platform) {
				case 'linux': {
					//TODO
					break;
				}
				case 'darwin': {
					let files = await readDirPromise ('/Volumes');

					if (Array.isArray (files) && files.length > 0) {
						for (let index in files) {
							if (files.hasOwnProperty (index)) {
								let stat = await statPromise (path.join ('/Volumes', files [index]));

								if (stat.isDirectory ()) {
									drives.push ({
										identifier: encodeURIComponent (path.join ('/Volumes', files [index])),
										mount: path.join ('/Volumes', files [index]),
										label: files [index]
									});
								}
							}
						}
					}
					break;
				} 
				default: {
					let devices = await systemInformation.blockDevices ();

					if (Array.isArray (devices) && devices.length > 0) {
						for (let index in devices) {
							if (devices [index].physical === 'Local') {
								drives.push (devices [index]);
							}
						}
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

	/**
	 * Tell other windows the main window was closed.
	 */
	static ClosedMain () {
		if (ConsoleWindow_static.window !== null) {
			ConsoleWindow_static.window.send ('main-closed');
		}

		if (ReferenceWindow_static.window !== null) {
			ReferenceWindow_static.window.send ('main-closed');
		}
	}

	/**
	 * Open main window if it was closed.
	 */
	static OpenMain () {
		if (Main.window === null) {
			Main.CreateWindow ();

			if (ConsoleWindow_static.window !== null) {
				ConsoleWindow_static.window.send ('main-opened');
			}

			if (ReferenceWindow_static.window !== null) {
				ReferenceWindow_static.window.send ('main-opened');
			}
		}
	}

	/**
	 * Reset window do default.
	 */
	static ResetWindow (event, message) {
		switch (message.window) {
			case 'main':
				if (Main.window !== null) {
					Main.window.setSize (Main.default.width, Main.default.height);
					Main.window.center ();
				}
				break;
			case 'console':
				if (ConsoleWindow_static.window !== null) {
					ConsoleWindow_static.window.setSize (ConsoleWindow_static.default.width, ConsoleWindow_static.default.height);
					ConsoleWindow_static.window.center ();
				}
				break;
			case 'reference':
				if (ReferenceWindow_static.window !== null) {
					ReferenceWindow_static.window.setSize (ReferenceWindow_static.default.width, ReferenceWindow_static.default.height);
					ReferenceWindow_static.window.center ();
				}
				break;
			default:
				//do nothing
				break;
		}
	}

	/**
	 * Get all or some value from config.
	 */
	static GetConfig (event, message) {
		if (typeof (message.key) !== 'undefined') {
			let value = Main.config.Get (message.key);

			event.sender.send ('config-get', {
				key: message.key,
				value: value
			});
		} else {
			let data = Main.config.Get ();

			event.sender.send ('config-get', {
				data: data
			});
		}
	}

	/**
	 * Set value to config.
	 */
	static SetConfig (event, message) {
		if (typeof (message.key) !== 'undefined' && typeof (message.value) !== 'undefined') {
			Main.config.Set (message.key, message.value);
		}
	}

	/**
	 * Save app settings to config.
	 */
	static SaveAppSettings (event, message) {
		Main.config.Set ('app-settings', message);

		if (Main.window !== null) {
			Main.window.send ('app-settings-save', message);
		}
		if (ConsoleWindow_static.window !== null) {
			ConsoleWindow_static.window.send ('app-settings-save', message);
		}
		if (ReferenceWindow_static.window !== null) {
			ReferenceWindow_static.window.send ('app-settings-save', message);
		}
	}

	/**
	 * Reset the app config and relaunch.
	 */
	static async ResetApp () {
		await Main.config.Reset ();

		await new Snippet ().DeleteAll ();

		app.relaunch ();
		app.quit ();
	}

	/**
	 * Open url in default browser.
	 */
	static OpenUrl (event, message) {
		if (typeof (message.url) !== 'undefined') {
			opn (message.url);
		}
	}

	/**
	 * Send contact message to web API.
	 */
	static async SendMessage (event, message) {
		try {
			const appPackage = require ('../../package');
			message.app = appPackage.productName;

			const response = await axios.post (`${config.api.url}?action=contact_message_new`, message);

			event.sender.send ('contact-message-send', response.data);
		} catch (error) {
			event.sender.send ('contact-message-send', {
				error: true
			});
		}
	}
}

module.exports = Api;
