const { ipcMain } = require ('electron');
const vm = require ('vm');
const path = require ('path');
const {promisify} = require ('util');
const fs = require ('fs');
const readline = require ('readline');
const extend = require ('extend');
const ConsoleWindow = require ('../Console').Console;
const ReferenceWindow = require ('../Reference').Reference;
const Snippet = require ('../model/Snippet');
const {WHERE_CONDITIONS} = require ('tch-database');
const tinify = require ('tinify');
const axios = require ('axios');
const sanitizeHtml = require ('sanitize-html');

const Console_static = {
	main: undefined,
	lastPayload: undefined
};

class Console {
	/**
	 * Console Api initialization.
	 */
	static Init (main) {
		Console_static.main = main;

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

		ConsoleWindow.Open (Console_static.main, Console.LastPayload);
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
	static async ExecuteScript (event, message) {
		let settings = Console_static.main.config.Get ('app-settings');
		tinify.key = settings !== null ? settings.console.tinypngApiKey : null;

		let sandbox = {
			fs: {
				createReadStream: fs.createReadStream,
				createWriteStream: fs.createWriteStream
			},
			log: '',
			path: {
				extname: path.extname,
				join: path.join
			},
			readDirPromise: promisify (fs.readdir),
			readline: {
				createInterface: readline.createInterface
			},
			renameFilePromise: promisify (fs.rename),
			tinify: tinify,
			axios: {
				get: axios.get,
				post: axios.post
			},
			sanitizeHtml: sanitizeHtml
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

			await vm.runInContext (`${functionsScript}(async function () {
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

		if (Console_static.main.window !== null) {
			Console_static.main.window.send ('snippet-saved');
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
		ReferenceWindow.Open (Console_static.main);
	}
}

module.exports = Console;
