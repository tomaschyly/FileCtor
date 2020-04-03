const Snippet = require ('../model/Snippet');
const RxSnippet = require ('../model/RxSnippet');

module.exports = async function (config) {
	let version = config.Get ('install-snippet-version');
	if (version === null) {
		version = 0;
	}
	version = parseInt (version);

	if (version < 3) {
		version = 4;
	}

	for (let index in updates) {
		if (updates.hasOwnProperty (index)) {
			if (index > version) {
				if (await updates [index] (config)) {
					config.Set ('install-snippet-version', index);
				} else {
					version = config.Get ('install-snippet-version');
					version = parseInt (version);
				}
			}
		}
	}
};

const updates = {
	4: async function (config) {
		const existing = await new Snippet ().Collection ();
		
		for (const snippet of existing) {
			snippet.id = undefined;

			await new RxSnippet ().LoadFromData (snippet).Save ();
		}

		config.Set ('install-snippet-version', 5);
		return false;
	},
	5: async function (config) {
		const simpleExampleSnippet = {
			name: 'Simple Example',
			description: 'This is just a basic script example that does almost nothing, but demonstrate that execution works.',
			script: `result = 'this will be script result output';

let variable = 2 * 3;
console.log ('2 * 3 equals ' + variable);`
		};

		await new RxSnippet ().LoadFromData (simpleExampleSnippet).Save ();

		const renameExampleSnippet = {
			name: 'Rename Files',
			description: 'Rename files to a new name and append with number if there are more than one.',
			script: `const newName = NEW_NAME;
const files = await ReadDirectory (directory);
result = '# files renamed ' + await RenameFiles (directory, files, newName);`
		};

		await new RxSnippet ().LoadFromData (renameExampleSnippet).Save ();

		const renameHostSql = {
			name: 'Rename Host Sql',
			description: 'Script for renaming host inside Sql query. E.g. rename host of WP website when migrating from Dev to Prod. Should work on large Sql files.',
			script: `const currentHost = CURRENT_HOSTNAME;
const newHost = NEW_HOSTNAME;

if (files.length !== 1) {
	throw Error ('Make sure to open the console by selecting the Sql file you want to edit');
}

const fileExtension = path.extname (files [0]);
if (fileExtension !== '.sql') {
	throw Error ('Make sure the selected file is Sql file you want to edit');
}

const source = path.join (directory, files [0]);
const destination = path.join (directory, files [0].replace (fileExtension, '.edited.sql'));

const sourceStream = fs.createReadStream (source);
const destinationStream = fs.createWriteStream (destination, {flags: 'a'});
const readInterface = readline.createInterface ({
	input: sourceStream,
	crlfDelay: Infinity
});

async function ProcessLineByLine () {
	return new Promise ((resolve, reject) => {
		readInterface.on ('line', line => {
			try {
				const newLine = line.replace (new RegExp (currentHost, 'g'), newHost);
				
				destinationStream.write (newLine + '\\n');
			} catch (error) {
				reject (error);
			}
		});
		
		readInterface.on ('close', () => {
			resolve ();
		});
	});
}

await ProcessLineByLine ();

result = 'Saved new file to: ' + destination;`
		};

		await new RxSnippet ().LoadFromData (renameHostSql).Save ();

		const renameFilesPart = {
			name: 'Rename Files (part of name)',
			description: 'Rename files to a new name by changing part of name with provided new part.',
			script: `const removePart = REMOVE_PART;
const newPart = NEW_PART;
const files = await ReadDirectory (directory);
result = '# files renamed ' + await RenameFilesPart (directory, files, removePart, newPart);`
		};

		await new RxSnippet ().LoadFromData (renameFilesPart).Save ();

		const compressImages = {
			name: 'Compress Images (TinyPNG)',
			description: 'Compress PNG & JPG images using TinyPNG API. You have to have TinyPNG API key set in settings.',
			script: `const files = await ReadDirectory (directory, /(.png|.jpg)$/);

if (files.length < 1) {
	throw Error ('The directory does not contain any images');
}

for (let i = 0; i < files.length; i++) {
	await TinyPNGCompressFile (path.join (directory, files [i]));
}

result = '# compressed images ' + files.length;`
		};

		await new RxSnippet ().LoadFromData (compressImages).Save ();

		const resizeCropImages = {
			name: 'Resize/Crop Images (TinyPNG)',
			description: 'Resize or crop PNG & JPG images using TinyPNG API. You have to have TinyPNG API key set in settings.',
			script: `const method = 'fit'; //"fit" => resize, "cover" => intelligently crop
const width = WIDTH;
const height = HEIGHT;

const files = await ReadDirectory (directory, /(.png|.jpg)$/);

if (files.length < 1) {
	throw Error ('The directory does not contain any images');
}

for (let i = 0; i < files.length; i++) {
	await TinyPNGResizeCropFile (path.join (directory, files [i]), {method: method, width: width, height: height});
}

result = '# resized/cropped images ' + files.length;`
		};

		await new RxSnippet ().LoadFromData (resizeCropImages).Save ();

		return true;
	},
	6: async function (config) {
		const filterFilesWriteResultSnippet = {
			name: 'Filter Files & Write Result',
			description: 'Filter files in directory by name and contests, write result to file.',
			script: `const filterFileName = REGEXP_FILTER_FILENAME;
const filterFileContents = REGEXP_FILTER_FILE_CONTENTS;

const files = await ReadDirectoryRecursive (directory, {fullFilePath: true, filterFile: filterFileName, filterFileContents: filterFileContents});

await WriteFileContents (path.join (directory, 'result.txt'), files.join ('\\n'));

result = 'Result contains ' + files.length + ' files';`
		};

		await new RxSnippet ().LoadFromData (filterFilesWriteResultSnippet).Save ();

		return true;
	}
};
