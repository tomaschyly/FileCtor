const {BrowserWindow} = require ('electron');
const path = require ('path');

const Reference_static = {
	default: {
		width: 640,
		height: 480
	},
	window: null,
	port: null
};

let Main = undefined;

class Reference {
	/**
	 * Create reference window.
	 */
	static CreateWindow () {
		if (Reference_static.port === null) {
			Reference_static.port = process.env.FILECTOR_PORT;
		}

		let windowParameters = Main.LoadWindow ('reference');
		let width = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.width : Reference_static.default.width;
		let height = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.height : Reference_static.default.height;

		switch (process.platform) {
			case 'linux':
				Reference_static.window = new BrowserWindow ({
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
				Reference_static.window = new BrowserWindow ({
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
				Reference_static.window = new BrowserWindow ({
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
			Reference_static.window.loadURL (`http://127.0.0.1:${Reference_static.port}/#/reference`);
		} else {
			Reference_static.window.loadURL (`file://${path.join (__dirname, '../../build/index.html')}#/reference`);
		}

		Reference_static.window.once ('ready-to-show', () => {
			Reference_static.window.setMenu (null);

			if (windowParameters !== null && typeof (windowParameters.maximized) !== 'undefined' && windowParameters.maximized) {
				Reference_static.window.setBounds ({width: Reference_static.default.width, height: Reference_static.default.height});
				Reference_static.window.center ();
				Reference_static.window.maximize ();
			}

			Reference_static.window.show ();

			if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
				Reference_static.window.webContents.openDevTools ();
			}

			let size = Reference_static.window.getSize ();

			if (Math.abs (size [0] - Reference_static.default.width) > 4 || Math.abs (size [1] - Reference_static.default.height) > 4) {
				Reference_static.window.send ('reset-show', {window: 'reference'});
			} else {
				Reference_static.window.send ('reset-hide');
			}
		});

		Reference_static.window.on ('closed', () => {
			Reference_static.window = null;
		});

		Reference_static.window.on ('maximize', () => {
			Main.SaveWindow ('reference', 'maximized', true);
		});
		Reference_static.window.on ('unmaximize', () => {
			Main.SaveWindow ('reference', 'maximized', false);
		});

		Reference_static.window.on ('resize', () => {
			let size = Reference_static.window.getSize ();

			Main.SaveWindow ('reference', 'size', {
				width: size [0],
				height: size [1]
			});

			if (Math.abs (size [0] - Reference_static.default.width) > 4 || Math.abs (size [1] - Reference_static.default.height) > 4) {
				Reference_static.window.send ('reset-show', {window: 'reference'});
			} else {
				Reference_static.window.send ('reset-hide');
			}
		});
	}

	/**
	 * Open reference, create if not exists.
	 */
	static Open (main) {
		Main = main;

		if (Reference_static.window === null) {
			Reference.CreateWindow ();
		}

		Reference_static.window.focus ();
	}
}

module.exports = {
	Reference,
	Reference_static
};
