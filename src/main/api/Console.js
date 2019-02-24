const { ipcMain } = require ('electron');
const vm = require ('vm');
const extend = require ('extend');
const ConsoleWindow = require ('../Console').Console;
const ReferenceWindow = require ('../Reference').Reference;
const Snippet = require ('../model/Snippet');
const {WHERE_CONDITIONS} = require ('tch-database');

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

		ipcMain.on ('snippet-load', Console.LoadSnippet);

		ipcMain.on ('script-save', Console.SaveScriptSnippet);

		ipcMain.on ('snippet-delete', Console.DeleteSnippet);

		ipcMain.on ('snippet-list-name', Console.SnippetsByName);

		ipcMain.on ('console-reference', Console.OpenConsoleReference);
	}

	/**
	 * Open console window and pass parameters.
	 */
	static OpenConsole (event, message) {
		Console_static.lastPayload = message;

		ConsoleWindow.Open (Main, Console.LastPayload);
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
	 * Load Snippet for id.
	 */
	static async LoadSnippet (event, message) {
		let snippet = await new Snippet ().Load (message.id);

		if (snippet.id !== null) {
			event.sender.send ('snippet-load', snippet.data);
		} else {
			event.sender.send ('snippet-load', {
				error: true,
				message: 'Snippet does not exist.'
			});
		}
	}

	/**
	 * Save current script as Snippet.
	 */
	static async SaveScriptSnippet (event, message) {
		let snippet = new Snippet ();
		snippet.LoadFromData ({
			id: typeof (message.id) !== 'undefined' ? message.id : null,
			name: message.name,
			description: message.description,
			script: message.script
		});

		await snippet.Save ();

		if (Main.window !== null) {
			Main.window.send ('snippet-saved');
		}
	}

	/**
	 * Delete Snippet by id.
	 */
	static async DeleteSnippet (event, message) {
		let snippet = await new Snippet ().Load (message.id);

		if (snippet.id !== null) {
			let deleted = await snippet.Delete ();

			event.sender.send ('snippet-delete', {
				deleted: deleted
			});
		} else {
			event.sender.send ('snippet-delete', {
				error: true,
				message: 'Snippet does not exist.'
			});
		}
	}

	/**
	 * Load list of Snippets by name.
	 */
	static async SnippetsByName (event, message) {
		let filter = {
			name: {
				value: message.name,
				condition: WHERE_CONDITIONS.Like
			}
		};
		let sort = {
			index: 'name',
			direction: 'ASC'
		};
		let limit = {
			limit: typeof (message.limit) !== 'undefined' ? message.limit : -1,
			offset: -1
		};

		let list = await new Snippet ().Collection (filter, sort, limit);
		event.sender.send ('snippet-list-name', {
			list: list
		});
	}

	/**
	 * Open console reference window.
	 */
	static OpenConsoleReference () {
		ReferenceWindow.Open (Main);
	}
}

module.exports = Console;
