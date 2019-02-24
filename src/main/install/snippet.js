const Snippet = require ('../model/Snippet');

module.exports = function (config) {
	const installed = config.Get ('install-snippet');

	if (installed === null || !installed) {
		const simpleExampleSnippet = {
			name: 'Simple Example',
			description: 'This is just a basic script example that does almost nothing, but demonstrate that execution works.',
			script: `result = 'this will be script result output';

let variable = 2 * 3;
console.log ('2 * 3 equals ' + variable);`
		};

		new Snippet ().LoadFromData (simpleExampleSnippet).Save ();

		const renameExampleSnippet = {
			name: 'Rename Files',
			description: 'Rename files to a new name and append with number if there are more than one.',
			script: `let newName = NEW_NAME;
let files = await ReadDirectory (directory);
result = await RenameFiles (directory, files, newName);`
		};

		new Snippet ().LoadFromData (renameExampleSnippet).Save ();

		config.Set ('install-snippet', true);
	}
};
