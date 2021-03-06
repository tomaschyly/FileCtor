const { app, ipcMain, shell, nativeTheme } = require ('electron');
const { promisify } = require ('util');
const fs = require ('fs');
const path = require ('path');
const systemInformation = require ('systeminformation');
const consoleApi = require ('./api/Console');
const gridApi = require ('./api/Grid');
const ConsoleWindow_static = require ('./Console').Console_static;
const ReferenceWindow_static = require ('./Reference').Reference_static;
const open = require ('open');
const axios = require ('axios');
const Snippet = require ('./model/Snippet');

const readDirPromise = promisify (fs.readdir);
const statPromise = promisify (fs.stat);
const config = require ('../../config');

const Api_static = {
	initialized: false,
	main: undefined
};

class Api {
	/**
	 * Api initialization.
	 */
	static Init (main) {
		if (Api_static.initialized) {
			return;
		}
		Api_static.initialized = true;
		
		Api_static.main = main;

		ipcMain.on ('main-parameters', Api.MainParameters);

		nativeTheme.on ('updated', Api.NativeThemeUpdated);

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

		ipcMain.on ('version-check-update', Api.CheckVersion);

		consoleApi.Init (main);
		gridApi.Init ();
	}

	/**
	 * Send main process (Electron) parameters to renderer.
	 */
	static MainParameters (event) {
		const appPackage = require ('../../package');

		const parameters = {
			windowUuid: event.sender.browserWindowOptions.uuid,
			apiUrl: config.api.url,
			directory: {
				documents: app.getPath ('documents')
			},
			platform: process.platform,
			name: appPackage.productName,
			version: appPackage.version,
			settings: Api_static.main.config.Get ('app-settings')
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

		parameters.osDarkMode = nativeTheme.shouldUseDarkColors;

		event.sender.send ('main-parameters', parameters);
	}

	/**
	 * Notify renderers about OS theme update.
	 */
	static NativeThemeUpdated () {
		const data = {
			osDarkMode: nativeTheme.shouldUseDarkColors
		};

		if (Api_static.main.window !== null) {
			Api_static.main.window.send ('native-theme-updated', data);
		}

		if (ConsoleWindow_static.window !== null) {
			ConsoleWindow_static.window.send ('native-theme-updated', data);
		}

		if (ReferenceWindow_static.window !== null) {
			ReferenceWindow_static.window.send ('native-theme-updated', data);
		}
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
					shell.openPath (filePath);
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
		if (Api_static.main.window === null) {
			Api_static.main.CreateWindow ();

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
				if (Api_static.main.window !== null) {
					if (Api_static.main.window.isMaximized ()) {
						Api_static.main.window.unmaximize ();
					}

					Api_static.main.window.setSize (Api_static.main.default.width, Api_static.main.default.height);
					Api_static.main.window.center ();
				}
				break;
			case 'console':
				if (ConsoleWindow_static.window !== null) {
					if (ConsoleWindow_static.window.isMaximized ()) {
						ConsoleWindow_static.window.unmaximize ();
					}

					ConsoleWindow_static.window.setSize (ConsoleWindow_static.default.width, ConsoleWindow_static.default.height);
					ConsoleWindow_static.window.center ();
				}
				break;
			case 'reference':
				if (ReferenceWindow_static.window !== null) {
					if (ReferenceWindow_static.window.isMaximized ()) {
						ReferenceWindow_static.window.unmaximize ();
					}

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
			let value = Api_static.main.config.Get (message.key);

			event.sender.send ('config-get', {
				key: message.key,
				value: value
			});
		} else {
			let data = Api_static.main.config.Get ();

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
			Api_static.main.config.Set (message.key, message.value);
		}
	}

	/**
	 * Save app settings to config.
	 */
	static SaveAppSettings (event, message) {
		Api_static.main.config.Set ('app-settings', message);

		if (Api_static.main.window !== null) {
			Api_static.main.window.send ('app-settings-save', message);
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
		await Api_static.main.config.Reset ();

		await new Snippet ().DeleteAll ();

		app.relaunch ();
		app.quit ();
	}

	/**
	 * Open url in default browser.
	 */
	static OpenUrl (event, message) {
		if (typeof (message.url) !== 'undefined') {
			open (message.url);
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

	/**
	 * Check if there is new version available.
	 */
	static async CheckVersion (event) {
		try {
			const appPackage = require ('../../package');
			const appID = appPackage.name;
			let currentVersion = appPackage.version;

			const response = await axios.get (`${config.api.url}?action=app_version&app_id=${encodeURIComponent (appID)}`);

			if (typeof response.data === 'object' && response.data.app_id === appID) {
				if (typeof response.data.version === 'string' && currentVersion !== response.data.version) {
					const newVersion = parseFloat (response.data.version.replace (/\./g, ''));
					currentVersion = parseFloat (currentVersion.replace (/\./g, ''));

					if (newVersion > currentVersion) {
						let downloadUrl = null;
						switch (process.platform) {
							case 'linux':
								downloadUrl = response.data.download_ubuntu;
								break;
							case 'darwin':
								downloadUrl = response.data.download_macos;
								break;
							default:
								downloadUrl = response.data.download_windows;
								break;
						}

						event.sender.send ('version-check-update', {
							newVersion: response.data.version,
							downloadUrl: downloadUrl
						});
					}
				}
			} else {
				event.sender.send ('version-check-update', {
					error: true
				});
			}
		} catch (error) {
			event.sender.send ('version-check-update', {
				error: true
			});
		}
	}
}

module.exports = Api;
