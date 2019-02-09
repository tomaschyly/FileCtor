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

module.exports = {
	Init
};
