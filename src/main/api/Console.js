const { ipcMain } = require ('electron');
const ConsoleWindow = require ('../Console');

let Main = undefined;

const Console_static = {
	lastPayload: undefined
};

class Console {
	/**
	 * Console Api initialization.
	 */
	static Init (main) {
		Main = main;

		ipcMain.on ('console-show', Console.OpenConsole);

		ipcMain.on ('payload-last', Console.LastPayload);
	}

	/**
	 * Open console window and pass parameters.
	 */
	static OpenConsole (event, message) {
		ConsoleWindow.Open (Main.window);

		Console_static.lastPayload = message;
	}

	/**
	 * Get last payload from Main.
	 */
	static LastPayload (event) {
		event.sender.send ('payload-last', Console_static.lastPayload);
	}
}

module.exports = Console;
