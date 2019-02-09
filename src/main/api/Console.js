const { ipcMain } = require ('electron');
const vm = require ('vm');
const extend = require ('extend');
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

		ipcMain.on ('script-execute', Console.ExecuteScript);
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

	/**
	 * Execute script inside VM with custom sandbox.
	 */
	static ExecuteScript (event, message) {
		let sandbox = {
			log: ''
		};

		sandbox = extend (sandbox, message.parameters);

		vm.createContext (sandbox);

		let error = undefined;
		try {
			const functions = require ('./functions');
			let functionsScript = '/*** VM API FUNCTIONS ***/\n\n';
			for (let index in functions) {
				if (functions.hasOwnProperty (index)) {
					functionsScript += `${functions [index].toString ()}\n\n`;
				}
			}
			functionsScript += 'Init ();\n\n';
			functionsScript += '/*** VM API FUNCTIONS END ***/\n\n';

			vm.runInContext (`${functionsScript}(function () {
	${message.script}
})();`, sandbox);
		} catch (e) {
			console.error (e);
			error = `${e.name}: ${e.message}`;
		}

		let response = {
			log: sandbox.log,
			error: error,
			result: sandbox.result
		};

		event.sender.send ('script-execute', response);
	}
}

module.exports = Console;
