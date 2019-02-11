const { ipcMain } = require ('electron');
const vm = require ('vm');
const extend = require ('extend');
const ConsoleWindow = require ('../Console').Console;
const ReferenceWindow = require ('../Reference').Reference;

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

		ipcMain.on ('console-reference', Console.OpenConsoleReference);
	}

	/**
	 * Open console window and pass parameters.
	 */
	static OpenConsole (event, message) {
		Console_static.lastPayload = message;

		ConsoleWindow.Open (Main.window, Console.LastPayload);
	}

	/**
	 * Get last payload from Main.
	 */
	static LastPayload (event, window = null) {
		let sender = window !== null ? window : event.sender;

		sender.send ('payload-last', Console_static.lastPayload);
	}

	/**
	 * Execute script inside VM with custom sandbox.
	 */
	static ExecuteScript (event, message) {
		let sandbox = {
			log: ''
			//require: require //TODO this works, but do not give full access, only functions that are needed
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

	/**
	 * Open console reference window.
	 */
	static OpenConsoleReference () {
		ReferenceWindow.Open (Main.window);
	}
}

module.exports = Console;
