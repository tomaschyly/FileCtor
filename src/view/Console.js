/* eslint-disable no-whitespace-before-property */
import './console.css';
import { ReactComponent as FolderOpen } from '../icon/folder-open.svg';
import { ReactComponent as Save } from '../icon/save.svg';
import { ReactComponent as Question } from '../icon/question.svg';
import { ReactComponent as ExpandArrows } from '../icon/expand-arrows.svg';

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
			mainClasses: '',
			directory: undefined,
			files: [],
			script: '',
			log: '',
			logIsError: false,
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

			this.UpdateCurrentInfo ({
				files: files
			});
		};
		ipcRenderer.on ('payload-last', this.parametersListener);
		ipcRenderer.send ('payload-last');

		this.executionResultListener = this.ExecutionResult.bind (this);
		ipcRenderer.on ('script-execute', this.executionResultListener);
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		ipcRenderer.removeListener ('payload-last', this.parametersListener);
		delete this.parametersListener;

		ipcRenderer.removeListener ('script-execute', this.executionResultListener);
		delete this.executionResultListener;
	}

	/**
	 * Called when component state is updated.
	 */
	componentDidUpdate (prevProps, prevState) {
		this.UpdateCurrentInfo ({}, prevState);
	}

	/**
	 * Render the component into html.
	 */
	render () {
		if (typeof (window.Console_static.parameters) === 'undefined') {
			return '';
		} else {
			return <div className={`console ${this.state.mainClasses}`}>
				<div className="container">
					<div className="row">
						<div className="col-10">
							<div className="panel current-script-container">
								<div id="current-script">
									<CodeMirrorEditor onChange={this.ScriptChanged.bind (this)}/>
								</div>
								<div className="current-script-actions-top-container">
									<button type="button" className="button icon enlarge" onClick={this.Enlarge.bind (this)} data-value="0"><ExpandArrows/></button>
								</div>
							</div>
							<div className="current-script-actions-container">
								<div className="panel no-white">
									<button type="button" className="button" onClick={this.Execute.bind (this)}>Execute</button>
									<button type="button" className="button icon" onClick={this.LoadSnippet.bind (this)}><FolderOpen/></button>
									<button type="button" className="button icon" onClick={this.SaveSnippet.bind (this)}><Save/></button>
									<button type="button" className="button icon" onClick={this.ShowApi.bind (this)}><Question/></button>
								</div>
							</div>
							<div className="panel current-console-log-container">
								<div id="current-console-log" className={(this.state.logIsError ? 'error' : '')} dangerouslySetInnerHTML={{__html: this.state.log}}/>
								<div className="current-console-log-actions-container">
									<button type="button" className="button icon enlarge" onClick={this.Enlarge.bind (this)} data-value="1"><ExpandArrows/></button>
								</div>
							</div>
							<div className="current-console-info-container">
								<input id="current-directory" type="text" value={this.state.directory} onChange={this.DirectoryChanged.bind (this)} />
								<div className="current-console-info-actions-container">
									<button type="button" className="button icon enlarge" onClick={this.Enlarge.bind (this)} data-value="2"><ExpandArrows/></button>
								</div>
								<div id="current-console-info" dangerouslySetInnerHTML={{__html: this.state.currentInfo}}/>
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
	ScriptChanged (script) {
		this.setState ({script: script});
	}

	/**
	 * Execute the script.
	 */
	Execute () {
		ipcRenderer.send ('script-execute', {
			parameters: {
				directory: this.state.directory,
				files: this.state.files
			},
			script: this.state.script
		});
	}

	/**
	 * Handle response after script executed.
	 */
	ExecutionResult (event, message) {
		if (typeof (message.error) !== 'undefined') {
			this.setState ({log: message.error, logIsError: true});
		} else {
			let log = message.log;

			if (typeof (message.result) !== 'undefined') {
				if (log !== '') {
					log += '\n';
				}

				log += `Result: ${message.result.toString ()}`;
			}

			if (log !== '') {
				log = log.split ('\n');

				for (let i = 0; i < log.length; i++) {
					log [i] = `<p>${log [i]}</p>`;
				}

				log = log.join ('');
			}

			this.setState ({log: log, logIsError: false});
		}
	}

	/**
	 * Show list of snippets to open one.
	 */
	LoadSnippet () {
		//TODO
	}

	/**
	 * Save script as snippet.
	 */
	SaveSnippet () {
		//TODO
	}

	/**
	 * Show API reference.
	 */
	ShowApi () {
		ipcRenderer.send ('console-reference');
	}

	/**
	 * Input changed directory.
	 */
	DirectoryChanged () {
		let input = document.getElementById ('current-directory');

		if (input.value !== this.state.directory) {
			this.setState ({directory: input.value});
		}
	}

	/**
	 * Update current info based on console state.
	 */
	UpdateCurrentInfo (parameters = {}, prevState = null) {
		let info = [];

		let files = this.state.files;
		if (typeof (parameters.files) !== 'undefined') {
			files = parameters.files;
		}

		info.push (`<p>${files.length} selected files</p>`);

		info.push ('<p>Snippet is wip</p>');

		info = info.join ('');

		if (prevState === null || info !== prevState.currentInfo) {
			this.setState ({
				currentInfo: info
			});
		}
	}

	/**
	 * Enlarge certain section, smaller all the rest.
	 */
	Enlarge (e) {
		let target = e.target;
		if (!target.classList.contains ('enlarge')) {
			target = window.TCH.Main.Utils.FindNearestParent (target, 'enlarge');
		}

		let value = typeof (target) !== 'undefined' && target !== null ? target.dataset.value : 0;

		switch (value) {
			case '1':
			case 1:
				this.setState ({mainClasses: 'current-console-log-enlarge'});
				break;
			case '2':
			case 2:
				this.setState ({mainClasses: 'current-console-info-enlarge'});
				break;
			default:
				this.setState ({mainClasses: ''});
				break;
		}
	}
}

export default Console;
