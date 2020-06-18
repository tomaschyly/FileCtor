const {BrowserWindow} = require ('electron');
const path = require ('path');
const uuid = require ('uuid');

const Reference_static = {
	IDENTIFIER: 'reference',

	default: {
		width: 640,
		height: 480
	},
	window: null,
	uuid: null,
	port: null,
	main: undefined
};

class Reference {
	/**
	 * Create reference window.
	 */
	static CreateWindow () {
		if (Reference_static.port === null) {
			Reference_static.port = process.env.FILECTOR_PORT;
		}

		let windowParameters = Reference_static.main.LoadWindow (Reference_static.IDENTIFIER);
		const width = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.width : Reference_static.default.width;
		const height = windowParameters !== null && typeof (windowParameters.size) !== 'undefined' ? windowParameters.size.height : Reference_static.default.height;

		Reference_static.uuid = uuid.v4 ();

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
			uuid: Reference_static.uuid
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

		Reference_static.window = new BrowserWindow (windowParameters);
		Reference_static.window.uuid = Reference_static.uuid;

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

			Reference.ShouldShowReset (Reference_static.window);
		});

		Reference_static.window.on ('closed', () => {
			Reference_static.window = null;
		});

		Reference_static.window.on ('maximize', () => {
			Reference_static.main.SaveWindow (Reference_static.IDENTIFIER, 'maximized', true);
		});
		Reference_static.window.on ('unmaximize', () => {
			Reference_static.main.SaveWindow (Reference_static.IDENTIFIER, 'maximized', false);
		});

		Reference_static.window.on ('resize', () => {
			let size = Reference_static.window.getSize ();

			Reference_static.main.SaveWindow (Reference_static.IDENTIFIER, 'size', {
				width: size [0],
				height: size [1]
			});

			Reference.ShouldShowReset (Reference_static.window);
		});
	}

	/**
	 * Open reference, create if not exists.
	 */
	static Open (main) {
		Reference_static.main = main;

		if (Reference_static.window === null) {
			Reference.CreateWindow ();
		}

		Reference_static.window.focus ();
	}

	/**
	 * Check if window should show reset and notify.
	 */
	static ShouldShowReset (window) {
		const size = window.getSize ();

		if (Math.abs (size [0] - Reference_static.default.width) > 4 || Math.abs (size [1] - Reference_static.default.height) > 4) {
			window.send ('reset-show', {window: Reference_static.IDENTIFIER});
		} else {
			window.send ('reset-hide');
		}
	}
}

module.exports = {
	Reference,
	Reference_static
};
