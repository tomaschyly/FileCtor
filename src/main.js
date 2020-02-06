/* eslint-disable no-console */
const {app, BrowserWindow} = require ('electron');
const path = require ('path');
const Api = require ('./main/Api');
const Config = require ('./main/Config');
const installSnippet = require ('./main/install/snippet');
const uuidV4 = require ('uuid/v4');

const singleAppLock = app.requestSingleInstanceLock ();

if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
	process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
}

const Main = {
	IDENTIFIER: 'main',

	default: {
		width: 800,
		height: 600
	},
	window: null,
	uuid: null,
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

		Api.Init (this);

		let windowParameters = this.LoadWindow (Main.IDENTIFIER);
		const width = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.width : this.default.width;
		const height = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.height : this.default.height;

		this.uuid = uuidV4 ();

		windowParameters = {
			width: width,
			minWidth: 640,
			height: height,
			minHeight: 480,
			frame: false,
			center: true,
			show: false,
			webPreferences: {
				nodeIntegration: true
			},
			uuid: this.uuid
		};

		switch (process.platform) {
			case 'linux':
				windowParameters.icon = path.join (__dirname, '../icon.png');
				break;
			case 'darwin':
				windowParameters.icon = path.join (__dirname, '../icon.icns');
				break;
			default:
				windowParameters.icon = path.join (__dirname, '../icon.ico');
		}

		this.window = new BrowserWindow (windowParameters);
		this.window.uuid = this.uuid;

		if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
			this.window.loadURL (`http://127.0.0.1:${this.port}/`);

			//const {default: installExtension, REACT_DEVELOPER_TOOLS} = require ('electron-devtools-installer'); // does not work with current Electron versions after v5

			//await installExtension (REACT_DEVELOPER_TOOLS);
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

			this.ShouldShowReset (this.window);
		});

		this.window.on ('closed', () => {
			this.window = null;

			Api.ClosedMain ();
		});

		this.window.on ('maximize', () => {
			this.SaveWindow (Main.IDENTIFIER, 'maximized', true);
		});
		this.window.on ('unmaximize', () => {
			this.SaveWindow (Main.IDENTIFIER, 'maximized', false);
		});

		this.window.on ('resize', () => {
			let size = this.window.getSize ();

			this.SaveWindow (Main.IDENTIFIER, 'size', {
				width: size [0],
				height: size [1]
			});

			this.ShouldShowReset (this.window);
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
	},

	/**
	 * Check if window should show reset and notify.
	 */
	ShouldShowReset (window) {
		const size = window.getSize ();

		if (Math.abs (size [0] - this.default.width) > 4 || Math.abs (size [1] - this.default.height) > 4) {
			window.send ('reset-show', {window: Main.IDENTIFIER});
		} else {
			window.send ('reset-hide');
		}
	}
};

if (singleAppLock) {
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

//TODo remove this testing
// setTimeout (async () => {
// 	const RxSnippet = require ('./main/model/RxSnippet');
//
// 	const model = new RxSnippet ();
// 	/*await model.Load ('d8ef8a4a-e1fd-47fc-b6e6-fbc226239e55');
// 	await model.Delete ();
// 	await model.Load ('514a14c4-1184-4d9c-921d-99208d125fbb');
// 	await model.Delete ();*/
//
// 	model.data = {
// 		name: 'Delete test'
// 	};
// 	await model.Save ();
//
// 	/*model.data.description = 'Lorem ipsum dolor sit amet';
// 	await model.Save ();*/
//
// 	//console.log (model.id, model.data);
//
// 	// console.log (await model.List ({
// 	// 	sort: 'created',
// 	// 	sortBy: 1,
// 	// 	//limit: 1,
// 	// 	//page: 1
// 	// 	/*where: {
// 	// 		name: {
// 	// 			comparison: 'regex',
// 	// 			value: new RegExp ('s', 'i')
// 	// 		}
// 	// 	}*/
// 	// }));
// 	console.log (await model.Count ());
// }, 2000);
