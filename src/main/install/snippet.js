const Snippet = require ('../model/Snippet');

module.exports = async function (config) {
	const installed = config.Get ('install-snippet');

	if (installed === null || !installed) {
		const simpleExampleSnippet = {
			name: 'Simple Example',
			description: 'This is just a basic script example that does almost nothing, but demonstrate that execution works.',
			script: `result = 'this will be script result output';

let variable = 2 * 3;
console.log ('2 * 3 equals ' + variable);`
		};

		await new Snippet ().LoadFromData (simpleExampleSnippet).Save ();

		const renameExampleSnippet = {
			name: 'Rename Files',
			description: 'Rename files to a new name and append with number if there are more than one.',
			script: `const newName = NEW_NAME;
const files = await ReadDirectory (directory);
result = await RenameFiles (directory, files, newName);`
		};

		await new Snippet ().LoadFromData (renameExampleSnippet).Save ();

		config.Set ('install-snippet', true);
	}

	let version = config.Get ('install-snippet-version');
	if (version === null) {
		version = 0;
	}
	version = parseInt (version);

	for (let index in updates) {
		if (updates.hasOwnProperty (index)) {
			if (index > version) {
				await updates [index] ();

				config.Set ('install-snippet-version', index);
			}
		}
	}
};

const updates = {
	1: async function () {
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

		await new Snippet ().LoadFromData (renameHostSql).Save ();
	},
	/*2: async function () {
		const resizeImages = {
			name: 'Resize Image/s',
			description: 'Script for resizing/croping images. Choose target size and format to be applied to selected files.',
			script: `const targetSize = {width: WIDTH, height: HEIGHT};
const changeFormat = null; // formats: null/jpg/png/webp
const jpgQuality = 100;

if (files.length === 0) {
	throw Error ('Make sure to open the console by selecting images you want to edit');
}

let imagesEdited = 0;
let imagesFailed = 0;

async function ProcessJpg (filePath) {
	//TODO
}

async function ProcessPng (filePath) {
	//TODO
}

async function ProcessWebP (filePath) {
	//TODO
}

for (let i = 0; i < files.length; i++) {
	//TODO
}

result = 'Edited ' + imagesEdited + ' images\\nFailed at ' + imagesFailed + ' images';`
		};

		await new Snippet ().LoadFromData (resizeImages).Save ();
	}*/
};
