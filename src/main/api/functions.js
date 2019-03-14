/* eslint-disable */
function Init () {
	console = {
		log: function (string) {
			if (arguments.length > 0) {
				let eol = log === '' ? '' : '\n';

				let output = [];
				for (let i = 0; i < arguments.length; i++) {
					output.push (arguments [i].toString ());
				}

				log += `${eol}${output.join (', ')}`;
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

async function RenameFiles (directory, files, newName) {
	for (let i = 0; i < files.length; i++) {
		let extension = files [i].split ('.');
		extension = extension.length > 1 ? `.${extension.pop ()}` : '';

		let fileNewName = `${newName}${i > 0 ? i : ''}${extension}`;

		await renameFilePromise (path.join (directory, files [i]), path.join (directory, fileNewName));
	}

	return files.length;
}

/*async function ResizeImage () {

}*/

module.exports = {
	Init,
	ReadDirectory,
	RenameFiles
};
