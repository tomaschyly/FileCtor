const {BrowserWindow} = require ('electron');
const path = require ('path');

const Console_static = {
	default: {
		width: 640,
		height: 480
	},
	window: null,
	port: null
};

let Main = undefined;

class Console {
	/**
	 * Create console window.
	 */
	static CreateWindow () {
		if (Console_static.port === null) {
			Console_static.port = process.env.FILECTOR_PORT;
		}

		let windowParameters = Main.LoadWindow ('console');
		let width = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.width : Console_static.default.width;
		let height = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.height : Console_static.default.height;

		switch (process.platform) {
			case 'linux':
				Console_static.window = new BrowserWindow ({
					width: width,
					minWidth: 640,
					height: height,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.png'),
					webPreferences: {
						nodeIntegration: true
					}
				});
				break;
			case 'darwin':
				Console_static.window = new BrowserWindow ({
					width: width,
					minWidth: 640,
					height: height,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.icns'),
					webPreferences: {
						nodeIntegration: true
					}
				});
				break;
			default:
				Console_static.window = new BrowserWindow ({
					width: width,
					minWidth: 640,
					height: height,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.ico'),
					webPreferences: {
						nodeIntegration: true
					}
				});
		}

		if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
			Console_static.window.loadURL (`http://127.0.0.1:${Console_static.port}/#/console`);
		} else {
			Console_static.window.loadURL (`file://${path.join (__dirname, '../../build/index.html')}#/console`);
		}

		Console_static.window.once ('ready-to-show', () => {
			Console_static.window.setMenu (null);

			if (windowParameters !== null && typeof (windowParameters.maximized) !== 'undefined' && windowParameters.maximized) {
				Console_static.window.maximize ();
			}

			Console_static.window.show ();

			if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
				Console_static.window.webContents.openDevTools ();
			}

			let size = Console_static.window.getSize ();

			if (size [0] !== Console_static.default.width || size [1] !== Console_static.default.height) {
				Console_static.window.send ('reset-show', {window: 'console'});
			} else {
				Console_static.window.send ('reset-hide');
			}
		});

		Console_static.window.on ('closed', () => {
			Console_static.window = null;
		});

		Console_static.window.on ('maximize', () => {
			Main.SaveWindow ('console', 'maximized', true);
		});
		Console_static.window.on ('unmaximize', () => {
			Main.SaveWindow ('console', 'maximized', false);
		});

		Console_static.window.on ('resize', () => {
			let size = Console_static.window.getSize ();

			Main.SaveWindow ('console', 'size', {
				width: size [0],
				height: size [1]
			});

			if (size [0] !== Console_static.default.width || size [1] !== Console_static.default.height) {
				Console_static.window.send ('reset-show', {window: 'console'});
			} else {
				Console_static.window.send ('reset-hide');
			}
		});
	}

	/**
	 * Open console, create if not exists.
	 */
	static Open (main, lastPayloadCallback) {
		Main = main;

		let alreadyInitialized = true;
		if (Console_static.window === null) {
			Console.CreateWindow ();

			alreadyInitialized = false;
		}

		Console_static.window.focus ();

		if (alreadyInitialized) {
			lastPayloadCallback (undefined, Console_static.window);
		}
	}
}

module.exports = {
	Console,
	Console_static
};
