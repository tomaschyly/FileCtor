/* eslint-disable */
function Init () {
	console = {
		log: function (string) {
			if (arguments.length > 0) {
				let output = [];
				for (let i = 0; i < arguments.length; i++) {
					output.push (arguments [i].toString ());
				}

				_log.push (output.join (', '));
			}
		}
	};
}

async function ReadDirectory (directory, filter = null) {
	let files = await readDirPromise (directory);

	if (filter !== null) {
		files = files.filter (file => {
			return filter.test (file);
		});
	}

	return files;
}

async function ReadDirectoryRecursive (directory, filter = {}) {
	let files = [];

	for (let file of await readDirPromise (directory)) {
		const filePath = path.join (directory, file);
		let stat = await statPromise (filePath);

		if (stat.isDirectory ()) {
			files.push (...await ReadDirectoryRecursive (filePath, filter));
		} else {
			files.push (file);
		}
	}

	return files;
}

async function RenameFiles (directory, files, newName) {
	for (let i = 0; i < files.length; i++) {
		let extension = files [i].split ('.');
		extension = extension.length > 1 ? `.${extension.pop ()}` : '';

		let fileNewName = `${newName}${i > 0 ? i : ''}${extension}`;

		await renameFilePromise (path.join (directory, files [i]), path.join (directory, fileNewName));
	}

	return files.length;
}

async function RenameFilesPart (directory, files, removePart, newPart) {
	for (let i = 0; i < files.length; i++) {
		let extension = files [i].split ('.');
		extension = extension.length > 1 ? `.${extension.pop ()}` : '';

		let newName = files [i].replace (extension, '');
		let fileNewName = `${newName.replace (new RegExp (removePart, 'i'), newPart)}${extension}`;

		await renameFilePromise (path.join (directory, files [i]), path.join (directory, fileNewName));
	}

	return files.length;
}

async function TinyPNGCompressFile (file) {
	let extension = file.split ('.');
	extension = extension.length > 1 ? `.${extension.pop ()}` : '';

	let newName = file.replace (extension, `.compressed${extension}`);

	await tinify.fromFile (file).preserve ('copyright', 'creation').toFile (newName);
}

async function TinyPNGResizeCropFile (file, params) {
	let extension = file.split ('.');
	extension = extension.length > 1 ? `.${extension.pop ()}` : '';

	let newName = file.replace (extension, `.processed${extension}`);

	await tinify.fromFile (file).preserve ('copyright', 'creation').resize (params).toFile (newName);
}

async function Fetch (url, type = 'GET', params = null, skipSanitize = false) {
	let response = null;

	switch (type) {
		case 'GET':
			response = await axios.get (url);
			break;
		case 'POST':
			response = await axios.post (url, params || {});
			break;
	}

	if (response) {
		response = !skipSanitize ? sanitizeHtml (response.data) : response.data;
	}

	return response;
}

async function Sleep (ms) {
	return new Promise (resolve => setTimeout (resolve, ms));
}

module.exports = {
	Init,
	ReadDirectory,
	ReadDirectoryRecursive,
	RenameFiles,
	RenameFilesPart,
	TinyPNGCompressFile,
	TinyPNGResizeCropFile,
	Fetch,
	Sleep
};
