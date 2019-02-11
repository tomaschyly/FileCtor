const {BrowserWindow} = require ('electron');
const path = require ('path');

const Console_static = {
	window: null,
	port: null
};

class Console {
	/**
	 * Create console window.
	 */
	static CreateWindow (parentWindow) {
		if (Console_static.port === null) {
			Console_static.port = process.env.FILECTOR_PORT;
		}

		switch (process.platform) {
			case 'linux':
				Console_static.window = new BrowserWindow ({
					width: 640,
					minWidth: 640,
					height: 480,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.png')/*,
					parent: parentWindow*/
				});
				break;
			case 'darwin':
				Console_static.window = new BrowserWindow ({
					width: 640,
					minWidth: 640,
					height: 480,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.icns')/*,
					parent: parentWindow*/
				});
				break;
			default:
				Console_static.window = new BrowserWindow ({
					width: 640,
					minWidth: 640,
					height: 480,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.ico')/*,
					parent: parentWindow*/
				});
		}

		if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
			Console_static.window.loadURL (`http://127.0.0.1:${Console_static.port}/#/console`);
		} else {
			Console_static.window.loadURL (`file://${path.join (__dirname, '../../build/index.html')}#/console`);
		}

		Console_static.window.once ('ready-to-show', () => {
			Console_static.window.setMenu (null);

			Console_static.window.show ();

			if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
				Console_static.window.webContents.openDevTools ();
			}
		});

		Console_static.window.on ('closed', () => {
			Console_static.window = null;
		});
	}

	/**
	 * Open console, create if not exists.
	 */
	static Open (parentWindow, lastPayloadCallback) {
		let alreadyInitialized = true;
		if (Console_static.window === null) {
			Console.CreateWindow (parentWindow);

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
