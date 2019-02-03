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
	static CreateWindow () {
		if (Console_static.port === null) {
			Console_static.port = process.env.FILECTOR_PORT;
		}

		switch (process.platform) {
			case 'linux':
				Console_static.window = new BrowserWindow ({
					width: 640,
					minWidth: 320,
					height: 480,
					minHeight: 240,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.png')
				});
				break;
			case 'darwin':
				Console_static.window = new BrowserWindow ({
					width: 640,
					minWidth: 320,
					height: 480,
					minHeight: 240,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.icns')
				});
				break;
			default:
				Console_static.window = new BrowserWindow ({
					width: 640,
					minWidth: 320,
					height: 480,
					minHeight: 240,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.ico')
				});
		}

		if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
			Console_static.window.loadURL (`http://127.0.0.1:${Console_static.port}/#/console`);
		} else {
			Console_static.window.loadURL (`file://${path.join (__dirname, '../build/index.html/#/console')}`);
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
	static Open () {
		if (Console_static.window === null) {
			Console.CreateWindow ();
		}

		Console_static.window.focus ();
	}
}

module.exports = Console;
