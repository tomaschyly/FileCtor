import './console.css';

import React, { Component } from 'react';
import CodeMirrorEditor from '../component/CodeMirrorEditor';

const { ipcRenderer } = window.require ('electron');

window.Console_static = {
	parameters: undefined
};

class Console extends Component {
	/**
	 * Console initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			directory: undefined,
			files: [],
			script: '',
			log: '',
			currentInfo: ''
		};

		window.Console_static.parameters = undefined;
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Console');

		window.TCH.Main.HideNavigation ();

		this.parametersListener = (event, message) => {
			window.Console_static.parameters = message;

			let files = [];
			if (typeof (message.file) !== 'undefined') {
				files.push (message.file);
			}

			this.setState ({
				directory: message.directory,
				files: files
			});
		};
		ipcRenderer.on ('payload-last', this.parametersListener);
		ipcRenderer.send ('payload-last');
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		ipcRenderer.removeListener ('payload-last', this.parametersListener);
		delete this.parametersListener;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		if (typeof (window.Console_static.parameters) === 'undefined') {
			return '';
		} else {
			return <div className="console">
				<div className="container">
					<div className="row">
						<div className="col-10">
							<div className="panel current-script-container">
								<div id="current-script">
									<CodeMirrorEditor/>
								</div>
							</div>
							<div className="panel current-console-log-container">
								<div id="current-console-log">{this.state.log}</div>
							</div>
							<div className="current-console-info-container">
								<input id="current-directory" type="text" value={this.state.directory} onChange={e => { console.log ('WIP dir change', e.target); }} />
								<div id="current-console-info">{this.state.currentInfo}</div>
							</div>
						</div>
					</div>
				</div>
			</div>;
		}
	}

	/**
	 * Script changed.
	 */
	/*ScriptChanged (e) {
		this.setState ({script: e.target.value});
	}*/
}

export default Console;
