const findFreePort = require ('find-free-port');
const shell = require ('shelljs');

let Starter = {
	/**
	 * Start the react and electron for dev.
	 */
	async Start () {
		let port = await findFreePort (3000, 5001, '127.0.0.1');

		process.env.FILECTOR_PORT = port;

		shell.exec (`concurrently "cross-env BROWSER=none yarn react-scripts start" "wait-on http://localhost:${port} && electron ."`);
	}
};

Starter.Start ();
