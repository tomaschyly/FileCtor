/* eslint-disable no-console */
const {app, BrowserWindow} = require ('electron');
const path = require ('path');
const Api = require ('./main/Api');
const Config = require ('./main/Config');
const installSnippet = require ('./main/install/snippet');

const singleAppLock = app.requestSingleInstanceLock ();

if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
	process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
}

const Main = {
	default: {
		width: 800,
		height: 600
	},
	window: null,
	port: null,
	config: null,

	/**
	 * Create main app window.
	 */
	async CreateWindow () {
		if (this.port === null) {
			this.port = process.env.FILECTOR_PORT;
		}

		this.config = new Config ();
		await this.config.Load ();

		await installSnippet (this.config);

		let windowParameters = this.LoadWindow ('main');
		let width = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.width : this.default.width;
		let height = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.height : this.default.height;

		switch (process.platform) {
			case 'linux':
				this.window = new BrowserWindow ({
					width: width,
					minWidth: 640,
					height: height,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, '../icon.png'),
					webPreferences: {
						nodeIntegration: true
					}
				});
				break;
			case 'darwin':
				this.window = new BrowserWindow ({
					width: width,
					minWidth: 640,
					height: height,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, '../icon.icns'),
					webPreferences: {
						nodeIntegration: true
					}
				});
				break;
			default:
				this.window = new BrowserWindow ({
					width: width,
					minWidth: 640,
					height: height,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, '../icon.ico'),
					webPreferences: {
						nodeIntegration: true
					}
				});
		}

		if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
			this.window.loadURL (`http://127.0.0.1:${this.port}/`);

			const {default: installExtension, REACT_DEVELOPER_TOOLS/*, REDUX_DEVTOOLS*/} = require ('electron-devtools-installer');

			await installExtension (REACT_DEVELOPER_TOOLS);

			/*await installExtension (REDUX_DEVTOOLS);*/
		} else {
			this.window.loadURL (`file://${path.join (__dirname, '../build/index.html')}`);
		}

		this.window.once ('ready-to-show', () => {
			this.window.setMenu (null);

			if (windowParameters !== null && typeof (windowParameters.maximized) !== 'undefined' && windowParameters.maximized) {
				this.window.setBounds ({width: this.default.width, height: this.default.height});
				this.window.center ();
				this.window.maximize ();
			}

			this.window.show ();

			if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
				this.window.webContents.openDevTools ();
			}

			let size = this.window.getSize ();

			if (Math.abs (size [0] - this.default.width) > 4 || Math.abs (size [1] - this.default.height) > 4) {
				this.window.send ('reset-show', {window: 'main'});
			} else {
				this.window.send ('reset-hide');
			}
		});

		this.window.on ('closed', () => {
			this.window = null;

			Api.ClosedMain ();
		});

		this.window.on ('maximize', () => {
			this.SaveWindow ('main', 'maximized', true);
		});
		this.window.on ('unmaximize', () => {
			this.SaveWindow ('main', 'maximized', false);
		});

		this.window.on ('resize', () => {
			let size = this.window.getSize ();

			this.SaveWindow ('main', 'size', {
				width: size [0],
				height: size [1]
			});

			if (Math.abs (size [0] - this.default.width) > 4 || Math.abs (size [1] - this.default.height) > 4) {
				this.window.send ('reset-show', {window: 'main'});
			} else {
				this.window.send ('reset-hide');
			}
		});
	},

	/**
	 * Load BrowserWindow parameters.
	 * @param {string} which Identifier for window
	 * @return {Object|null}
	 */
	LoadWindow (which) {
		let windows = this.config.Get ('windows');
		if (windows !== null && typeof (windows [which]) !== 'undefined') {
			return windows [which];
		}

		return null;
	},

	/**
	 * Save BrowserWindow parameters.
	 */
	SaveWindow (which, key, value) {
		let windows = this.config.Get ('windows');
		if (windows === null) {
			windows = {};
		}

		if (typeof (windows [which]) === 'undefined') {
			windows [which] = {};
		}

		windows [which] [key] = value;

		this.config.Set ('windows', windows);
	}
};

if (singleAppLock) {
	Api.Init (Main);

	app.on ('ready', () => {
		Main.CreateWindow ();
	});
	
	app.on ('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit ();
		}
	});
	
	app.on ('activate', () => {
		if (Main.window === null) {
			Main.CreateWindow ();
		}
	});

	app.on ('second-instance', () => {
		if (Main.window !== null) {
			if (Main.window.isMinimized ()) {
				Main.window.restore ();
			}

			Main.window.focus ();
		}
	});
} else {
	app.quit ();
}
