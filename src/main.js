/* eslint-disable no-console */
const {app, BrowserWindow} = require ('electron');
const path = require ('path');
const Api = require ('./main/Api');

const singleAppLock = app.requestSingleInstanceLock ();

if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
	process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
}

let Main = {
	window: null,
	port: null,

	/**
	 * Create main app window.
	 */
	async CreateWindow () {
		if (this.port === null) {
			this.port = process.env.FILECTOR_PORT;
		}

		switch (process.platform) {
			case 'linux':
				this.window = new BrowserWindow ({
					width: 800,
					minWidth: 640,
					height: 600,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.png')
				});
				break;
			case 'darwin':
				this.window = new BrowserWindow ({
					width: 800,
					minWidth: 640,
					height: 600,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.icns')
				});
				break;
			default:
				this.window = new BrowserWindow ({
					width: 800,
					minWidth: 640,
					height: 600,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.ico')
				});
		}

		if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
			this.window.loadURL (`http://127.0.0.1:${this.port}/`);

			const {default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} = require ('electron-devtools-installer');

			await installExtension (REACT_DEVELOPER_TOOLS);

			await installExtension (REDUX_DEVTOOLS);
		} else {
			this.window.loadURL (`file://${path.join (__dirname, '../build/index.html')}`);
		}

		this.window.once ('ready-to-show', () => {
			this.window.setMenu (null);

			this.window.show ();

			if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
				this.window.webContents.openDevTools ();
			}
		});

		this.window.on ('closed', () => {
			this.window = null;
		});
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
