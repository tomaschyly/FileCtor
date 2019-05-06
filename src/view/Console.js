/* eslint-disable no-whitespace-before-property */
import './console.css';
import { ReactComponent as FolderOpen } from '../icon/folder-open.svg';
import { ReactComponent as Save } from '../icon/save.svg';
import { ReactComponent as Question } from '../icon/question.svg';
import { ReactComponent as ExpandArrows } from '../icon/expand-arrows.svg';
import {ReactComponent as Cog} from '../icon/cog.svg';

import React, { Component } from 'react';
import Button from '../component/Button';
import CodeMirrorEditor from '../component/CodeMirrorEditor';
import Popup from '../component/Popup';

const { ipcRenderer, remote } = window.require ('electron');

window.Console_static = {
	parameters: undefined
};

class Console extends Component {
	/**
	 * Console initialization.
	 */
	constructor (props) {
		super (props);

		this.editor = undefined;

		this.state = {
			mainClasses: '',
			directory: undefined,
			files: [],
			snippet: undefined,
			loadEnabled: true,
			loadSnippetName: '',
			snippetsByName: [],
			selectedSnippetId: null,
			script: '',
			scriptExecuting: false,
			log: '',
			logIsError: false,
			currentInfo: '',
			warning: false,
			loadPopup: false,
			savePopup: false
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
				files: files,
				snippet: message.snippet,
				loadEnabled: !(typeof (message.loadEnabled) !== 'undefined' && !message.loadEnabled),
				script: typeof (message.snippet) !== 'undefined' && typeof (message.snippet.script) !== 'undefined' ? message.snippet.script : ''
			});

			this.UpdateCurrentInfo ({
				files: files
			});
		};
		ipcRenderer.on ('payload-last', this.parametersListener);
		ipcRenderer.send ('payload-last');

		this.executionResultListener = this.ExecutionResult.bind (this);
		ipcRenderer.on ('script-execute', this.executionResultListener);

		this.configGetListener = (event, message) => {
			if (message.key === 'console-warning') {
				if (message.value === null || !message.value) {
					this.setState ({warning: true});
				}
			}
		};
		ipcRenderer.on ('config-get', this.configGetListener);
		setTimeout (() => {
			ipcRenderer.send ('config-get', {key: 'console-warning'});
		}, 1);

		this.snippetByNameListener = (event, message) => {
			this.setState ({snippetsByName: message.list});
		};
		ipcRenderer.on ('snippet-list-name', this.snippetByNameListener);

		this.snippetLoadListener = (event, message) => {
			if (typeof (message.error) === 'undefined') {
				this.editor.current.ChangeScript (message.script);

				this.setState ({
					snippet: message,
					script: message.script
				});
			}
		};
		ipcRenderer.on ('snippet-load', this.snippetLoadListener);

		this.keyboardActionsListener = this.KeyboardActions.bind (this);
		window.addEventListener ('keyup', this.keyboardActionsListener);
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		this.editor = undefined;

		ipcRenderer.removeListener ('payload-last', this.parametersListener);
		delete this.parametersListener;

		ipcRenderer.removeListener ('script-execute', this.executionResultListener);
		delete this.executionResultListener;

		ipcRenderer.removeListener ('config-get', this.configGetListener);
		delete this.configGetListener;

		ipcRenderer.removeListener ('snippet-list-name', this.snippetByNameListener);
		delete this.snippetByNameListener;

		ipcRenderer.removeListener ('snippet-load', this.snippetLoadListener);
		delete this.snippetLoadListener;

		window.removeEventListener ('keyup', this.keyboardActionsListener);
		delete this.keyboardActionsListener;
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
			const {scriptExecuting} = this.state;

			this.editor = React.createRef ();

			return <div className={`console ${this.state.mainClasses}`}>
				<div className="container">
					<div className="row">
						<div className="col-10">
							<div className="panel current-script-container">
								<div id="current-script">
									<CodeMirrorEditor ref={this.editor} script={this.state.script} onChange={this.ScriptChanged.bind (this)}/>
								</div>
								<div className="current-script-actions-top-container">
									<Button type="button" className="button icon enlarge" onClick={this.Enlarge.bind (this)} data-value="0"><ExpandArrows/></Button>
								</div>
							</div>
							<div className="current-script-actions-container">
								{
									scriptExecuting ? 
										<div className="panel no-white loading">
											<Cog className="spin"/>
										</div>
										:
										<div className="panel no-white">
											<Button type="button" className="button" onClick={this.Execute.bind (this)}>Execute</Button>
											<Button type="button" className={`button icon${this.state.loadEnabled ? '' : ' hidden'}`} onClick={this.LoadSnippet.bind (this)}><FolderOpen/></Button>
											<Button type="button" className="button icon" onClick={this.SaveSnippet.bind (this)}><Save/></Button>
											<Button type="button" className="button icon" onClick={this.ShowApi.bind (this)}><Question/></Button>
										</div>
								}
							</div>
							<div className="panel current-console-log-container">
								<div id="current-console-log" className={(this.state.logIsError ? 'error' : '')} dangerouslySetInnerHTML={{__html: this.state.log}}/>
								<div className="current-console-log-actions-container">
									<Button type="button" className="button icon enlarge" onClick={this.Enlarge.bind (this)} data-value="1"><ExpandArrows/></Button>
								</div>
							</div>
							<div className="current-console-info-container">
								<input id="current-directory" type="text" value={this.state.directory} onChange={this.DirectoryChanged.bind (this)} />
								<div className="current-console-info-actions-container">
									<Button type="button" className="button icon enlarge" onClick={this.Enlarge.bind (this)} data-value="2"><ExpandArrows/></Button>
								</div>
								<div id="current-console-info" dangerouslySetInnerHTML={{__html: this.state.currentInfo}}/>
							</div>
						</div>
					</div>
				</div>

				<Popup visible={this.state.warning} headline="Security Warning" content={
					<div>
						<p>Please, do not run untrusted code. You may cause harm to your computer.</p>
						<p>Especially be wary of copy pasting code from internet that you do not understand.</p>
						<p>And be sure that you are in the correct directory and have correct selected files before you execute the script. I will NOT be responsible for any damage that you cause to yor own PC.</p>
					</div>
				} close="Back" onClose={this.WarningClose.bind (this)} accept="I Understand" acceptVisible={true} onAccept={this.WarningAccept.bind (this)}/>

				<Popup visible={this.state.loadPopup} headline="Load a Snippet" content={this.RenderLoadPopup ()} onClose={this.LoadSnippetClose.bind (this)} acceptVisible={true} accept="Load" onAccept={this.LoadSnippetAccept.bind (this)} />

				<Popup visible={this.state.savePopup} headline="Save as Snippet" content={
					<div>
						<label className="smaller" htmlFor="snippet-name">Name</label>
						<input type="text" value={(typeof (this.state.snippet) === 'object' ? this.state.snippet.name : '')} name="snippet-name" id="snippet-name" placeholder="Snippet name" onChange={e => { this.UpdateSnippet ('name', e.target.value); }} />
						<label className="smaller" htmlFor="snippet-description">Description</label>
						<input type="text" value={(typeof (this.state.snippet) === 'object' ? this.state.snippet.description : '')} name="snippet-description" id="snippet-description" placeholder="Snippet description" onChange={e => { this.UpdateSnippet ('description', e.target.value); }} />
					</div>
				} onClose={this.SavePopupClose.bind (this)} accept="Save & Close" acceptVisible={true} onAccept={this.SavePopupAccept.bind (this)}/>
			</div>;
		}
	}

	/**
	 * Render Load a Snippet Popup content.
	 */
	RenderLoadPopup () {
		const {loadSnippetName, snippetsByName, selectedSnippetId} = this.state;

		let items = undefined;
		if (snippetsByName.length > 0) {
			let rows = [];

			for (let i = 0; i < snippetsByName.length; i++) {
				(snippet => {
					rows.push (<Button key={`snippet-load-button-${snippet.id}`} type="button" className={`snippet-load-button${snippet.id === selectedSnippetId ? ' active' : ''}`} onClick={() => { this.setState ({selectedSnippetId: snippet.id}); }}>{snippet.name}</Button>);
				}) (snippetsByName [i]);
			}

			items = <div className="panel no-white">{rows}</div>;
		}

		return <div>
			<input type="text" value={loadSnippetName} name="snippet-load-name" id="snippet-load-name" placeholder="Snippet name" onChange={e => this.SnippetsByName (e.target.value)}/>
			{items}
		</div>;
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
		const {console} = window.TCH.mainParameters.settings;

		const action = () => {
			this.setState ({scriptExecuting: true});

			ipcRenderer.send ('script-execute', {
				parameters: {
					directory: this.state.directory,
					files: this.state.files
				},
				script: this.state.script
			});
		};

		if (console.executeConfirm) {
			window.TCH.Main.ConfirmAction (action);
		} else {
			action ();
		}
	}

	/**
	 * Handle response after script executed.
	 */
	ExecutionResult (event, message) {
		if (typeof (message.error) !== 'undefined') {
			this.setState ({scriptExecuting: false, log: message.error, logIsError: true});
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

			this.setState ({scriptExecuting: false, log: log, logIsError: false});
		}
	}

	/**
	 * Show list of snippets to open one.
	 */
	LoadSnippet () {
		this.setState ({loadPopup: true, savePopup: false});

		ipcRenderer.send ('snippet-list-name', {
			name: this.state.loadSnippetName,
			limit: 10
		});
	}

	/**
	 * Close load Snippet popup.
	 */
	LoadSnippetClose () {
		this.setState ({loadPopup: false});
	}

	/**
	 * Load selected Snippet.
	 */
	LoadSnippetAccept () {
		if (this.state.selectedSnippetId !== null) {
			this.setState ({loadPopup: false});

			ipcRenderer.send ('snippet-load', {
				id: this.state.selectedSnippetId
			});
		}
	}

	/**
	 * Load a Snippet popup, list Snippets by name.
	 */
	SnippetsByName (value) {
		this.setState ({loadSnippetName: value, selectedSnippetId: null});

		ipcRenderer.send ('snippet-list-name', {
			name: value,
			limit: 10
		});
	}

	/**
	 * Save script as snippet.
	 */
	SaveSnippet () {
		this.setState ({savePopup: true, loadPopup: false});
	}

	/**
	 * Update Snippet parameter.
	 */
	UpdateSnippet (parameter, value) {
		let snippet = this.state.snippet;

		if (typeof (snippet) !== 'object') {
			snippet = {
				id: null,
				name: '',
				description: ''
			};
		}

		snippet [parameter] = value;

		this.setState ({snippet: snippet});
	}

	/**
	 * Close save Snippet popup.
	 */
	SavePopupClose () {
		this.setState ({savePopup: false});
	}

	/**
	 * Save current script as Snippet.
	 */
	SavePopupAccept () {
		let parameters = {
			id: this.state.snippet.id,
			name: this.state.snippet.name,
			description: this.state.snippet.description,
			script: this.state.script
		};
		ipcRenderer.send ('script-save', parameters);

		remote.getCurrentWindow ().close ();
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

		info.push (`<p>${files.length} selected files (not yet fully implemented)</p>`);

		if (typeof (this.state.snippet) === 'object') {
			if (this.state.snippet.id !== null) {
				info.push (`<p>Snippet: ${this.state.snippet.name} is open</p>`);

				if (typeof (this.state.snippet.description) !== 'undefined') {
					info.push (`<p>${this.state.snippet.description}</p>`);
				}

				//TODO compare content to know ich unsaved progress? num of lines of code?
			} else {
				info.push ('<p>Snippet: you are coding a new Snippet</p>');
			}
		} else {
			info.push ('<p>Snippet: none is open</p>');
		}

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

	/**
	 * On warning close, close window.
	 */
	WarningClose () {
		remote.getCurrentWindow ().close ();
	}

	/**
	 * On warning accept, hide popup and save config.
	 */
	WarningAccept () {
		ipcRenderer.send ('config-set', {key: 'console-warning', value: true});

		this.setState ({warning: false});
	}

	/**
	 * Listen to keyboard actions and execute them.
	 */
	KeyboardActions (e) {
		const {controls} = window.TCH.mainParameters.settings;
		const combination = e.ctrlKey ? `ctrl+${e.key}` : e.key;

		if (combination === controls.execute) {
			this.Execute ();
		} else if (combination === controls.snippetLoad) {
			this.LoadSnippet ();
		} else if (combination === controls.snippetSave) {
			this.SaveSnippet ();
		}
	}
}

export default Console;
