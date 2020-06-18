const {BrowserWindow} = require ('electron');
const path = require ('path');
const uuid = require ('uuid');

const Console_static = {
	IDENTIFIER: 'console',

	default: {
		width: 640,
		height: 480
	},
	window: null,
	uuid: null,
	port: null,
	main: undefined
};

class Console {
	/**
	 * Create console window.
	 */
	static CreateWindow () {
		if (Console_static.port === null) {
			Console_static.port = process.env.FILECTOR_PORT;
		}

		let windowParameters = Console_static.main.LoadWindow (Console_static.IDENTIFIER);
		const width = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.width : Console_static.default.width;
		const height = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.height : Console_static.default.height;

		Console_static.uuid = uuid.v4 ();

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
			uuid: Console_static.uuid
		};

		switch (process.platform) {
			case 'linux':
				windowParameters.icon = path.join (__dirname, '..', '..', 'icon.png');
				break;
			case 'darwin':
				windowParameters.icon = path.join (__dirname, '..', '..', 'icon.icns');
				break;
			default:
				windowParameters.icon = path.join (__dirname, '..', '..', 'icon.ico');
		}

		Console_static.window = new BrowserWindow (windowParameters);
		Console_static.window.uuid = Console_static.uuid;

		if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
			Console_static.window.loadURL (`http://127.0.0.1:${Console_static.port}/#/console`);
		} else {
			Console_static.window.loadURL (`file://${path.join (__dirname, '../../build/index.html')}#/console`);
		}

		Console_static.window.once ('ready-to-show', () => {
			Console_static.window.setMenu (null);

			if (windowParameters !== null && typeof (windowParameters.maximized) !== 'undefined' && windowParameters.maximized) {
				Console_static.window.setBounds ({width: Console_static.default.width, height: Console_static.default.height});
				Console_static.window.center ();
				Console_static.window.maximize ();
			}

			Console_static.window.show ();

			if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
				Console_static.window.webContents.openDevTools ();
			}

			Console.ShouldShowReset (Console_static.window);
		});

		Console_static.window.on ('closed', () => {
			Console_static.window = null;
		});

		Console_static.window.on ('maximize', () => {
			Console_static.main.SaveWindow (Console_static.IDENTIFIER, 'maximized', true);
		});
		Console_static.window.on ('unmaximize', () => {
			Console_static.main.SaveWindow (Console_static.IDENTIFIER, 'maximized', false);
		});

		Console_static.window.on ('resize', () => {
			let size = Console_static.window.getSize ();

			Console_static.main.SaveWindow (Console_static.IDENTIFIER, 'size', {
				width: size [0],
				height: size [1]
			});

			Console.ShouldShowReset (Console_static.window);
		});
	}

	/**
	 * Open console, create if not exists.
	 */
	static Open (main, lastPayloadCallback) {
		Console_static.main = main;

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

	/**
	 * Check if window should show reset and notify.
	 */
	static ShouldShowReset (window) {
		const size = window.getSize ();

		if (Math.abs (size [0] - Console_static.default.width) > 4 || Math.abs (size [1] - Console_static.default.height) > 4) {
			window.send ('reset-show', {window: Console_static.IDENTIFIER});
		} else {
			window.send ('reset-hide');
		}
	}
}

module.exports = {
	Console,
	Console_static
};
