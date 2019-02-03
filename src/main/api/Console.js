const { ipcMain } = require ('electron');
const ConsoleWindow = require ('../Console');

class Console {
	/**
	 * Console Api initialization.
	 */
	static Init () {
		ipcMain.on ('console-show', Console.OpenConsole);
	}

	/**
	 * Open console window and pass parameters.
	 */
	static OpenConsole () {
		ConsoleWindow.Open ();

		//TODO pass parameters?!?!
	}
}

module.exports = Console;
