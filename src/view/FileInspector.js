/* eslint-disable no-whitespace-before-property */
import './fileInspector.css';
import { ReactComponent as Code } from '../icon/code.svg';
import { ReactComponent as LevelUpAlt } from '../icon/level-up-alt.svg';

import React, { Component } from 'react';
import Tabs from '../component/Tabs';
import Files from '../component/fileInspector/Files';

const { ipcRenderer } = window.require ('electron');
const path = window.require ('path');

class FileInspector extends Component {
	/**
	 * FileInspector initialization.
	 */
	constructor (props) {
		super (props);

		this.files = undefined;
		this.selectedTabId = undefined;
		this.selectedTabParams = undefined;
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Files');

		this.directoryContentsListener = this.RenderFiles.bind (this);
		ipcRenderer.on ('directory-contents', this.directoryContentsListener);
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		this.files = undefined;
		this.selectedTabId = undefined;
		this.selectedTabParams = undefined;
		
		ipcRenderer.removeListener ('directory-contents', this.directoryContentsListener);
		delete this.directoryContentsListener;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <div className="file-inspector">
			<Tabs startWith="1" tabParameters={this.TabParameters.bind (this)} onTabSelected={this.TabSelected.bind (this)} />
			<div className="container bottom">
				<div className="row">
					<div className="col-10">
						<div className="current-directory-actions">
							<input id="current-directory" type="text" onChange={this.DirectoryChanged.bind (this)} />
							<div className="current-directory-actions-container">
								<button type="button" className="button icon"><Code /></button>
								<button type="button" className="button icon" onClick={this.DirectoryToParent.bind (this)}><LevelUpAlt /></button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>;
	}

	/**
	 * Return parameters for Tab.
	 */
	TabParameters (params) {
		params.tag = 'FileInspector';

		if (typeof (params.directory) === 'undefined') {
			params.directory = window.TCH.mainParameters.directory.documents;
		}

		params.title = path.basename (params.directory);

		params.content = this.TabContent.bind (this);

		return params;
	}

	/**
	 * Return content for Tab.
	 */
	TabContent (params) {
		this.selectedTabId = params.id;
		this.selectedTabParams = params;

		setTimeout (() => {
			ipcRenderer.send ('directory-contents', {
				id: params.id,
				directory: params.directory,
				statistics: true
			});
		}, 1);

		this.files = React.createRef ();
		return <div id={`file-inspector-files-${params.id}`}>
			<Files ref={this.files} onFileAction={this.FileAction.bind (this)} />
		</div>;
	}

	/**
	 * Receive contents of directory and render.
	 */
	RenderFiles (event, message) {
		console.log ('RenderFiles'); //TODO remove
		if (this.selectedTabId === message.id && this.selectedTabParams.directory === message.directory && typeof (this.files) !== 'undefined') {
			if (typeof (message.contents) !== 'undefined' && Array.isArray (message.contents)) {
				for (let index in message.contents) {
					message.contents [index].reactId = encodeURIComponent (`${this.selectedTabParams.directory}-${message.contents [index].name}`);
				}
			}
			
			this.files.current.setState ({
				contents: message.contents
			});
		}
	}

	/**
	 * Callback for when Tab is selected.
	 */
	TabSelected (params) {
		console.log ('TabSelected'); //TODO remove
		if (typeof (params) !== 'undefined') {
			let input = document.getElementById ('current-directory');
			input.value = params.directory;
			input.dataset.value = encodeURIComponent (params.directory);
		}
	}

	/**
	 * Handle actions on files.
	 */
	FileAction (action, params) {
		switch (action) {
			case 'directory': {
				let newDirectory = path.join (this.selectedTabParams.directory, params.name);
				
				let input = document.getElementById ('current-directory');
				input.value = newDirectory;

				this.DirectoryChanged ();
				break;
			}
			case 'directory-parent': {
				let newDirectory = this.selectedTabParams.directory.split (path.sep);

				if (newDirectory.length > 1) {
					newDirectory.pop ();

					newDirectory = newDirectory.join (path.sep);
					if (newDirectory === '') {
						newDirectory = path.sep;
					}

					let input = document.getElementById ('current-directory');
					input.value = newDirectory;

					this.DirectoryChanged ();
				}
				break;
			}
			case 'file':
				ipcRenderer.send ('file-open', {
					directory: this.selectedTabParams.directory,
					file: params.name
				});
				break;
			default:
				console.error (`FileInspector - FileAction - unsupported action: ${action}`);
				break;
		}
	}

	/**
	 * Input changed directory, update files.
	 */
	DirectoryChanged () {
		console.log ('TabSelected'); //TODO remove
		let input = document.getElementById ('current-directory');

		if (input.value !== input.dataset.value) {
			this.selectedTabParams.directory = input.value;

			ipcRenderer.send ('directory-contents', {
				id: this.selectedTabParams.id,
				directory: this.selectedTabParams.directory,
				statistics: true
			});
		}
	}

	/**
	 * Change directory to parent.
	 */
	DirectoryToParent () {
		this.FileAction ('directory-parent', this.selectedTabParams);
	}
}

export default FileInspector;