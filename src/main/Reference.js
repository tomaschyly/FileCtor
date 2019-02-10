const {BrowserWindow} = require ('electron');
const path = require ('path');

const Reference_static = {
	window: null,
	port: null
};

class Reference {
	/**
	 * Create reference window.
	 */
	static CreateWindow (parentWindow) {
		if (Reference_static.port === null) {
			Reference_static.port = process.env.FILECTOR_PORT;
		}

		switch (process.platform) {
			case 'linux':
				Reference_static.window = new BrowserWindow ({
					width: 640,
					minWidth: 640,
					height: 480,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.png'),
					parent: parentWindow,
					modal: true
				});
				break;
			case 'darwin':
				Reference_static.window = new BrowserWindow ({
					width: 640,
					minWidth: 640,
					height: 480,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.icns'),
					parent: parentWindow,
					modal: true
				});
				break;
			default:
				Reference_static.window = new BrowserWindow ({
					width: 640,
					minWidth: 640,
					height: 480,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.ico'),
					parent: parentWindow,
					modal: true
				});
		}

		if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
			Reference_static.window.loadURL (`http://127.0.0.1:${Reference_static.port}/#/reference`);
		} else {
			Reference_static.window.loadURL (`file://${path.join (__dirname, '../../build/index.html')}#/reference`);
		}

		Reference_static.window.once ('ready-to-show', () => {
			Reference_static.window.setMenu (null);

			Reference_static.window.show ();

			if (typeof (process.env.FILECTOR_DEV) !== 'undefined' && process.env.FILECTOR_DEV === 'true') {
				Reference_static.window.webContents.openDevTools ();
			}
		});

		Reference_static.window.on ('closed', () => {
			Reference_static.window = null;
		});
	}

	/**
	 * Open reference, create if not exists.
	 */
	static Open (parentWindow) {
		if (Reference_static.window === null) {
			Reference.CreateWindow (parentWindow);
		}

		Reference_static.window.focus ();
	}
}

module.exports = Reference;
