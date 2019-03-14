/* eslint-disable no-whitespace-before-property */
import './fileInspector.css';
import { ReactComponent as Code } from '../icon/code.svg';
import { ReactComponent as LevelUpAlt } from '../icon/level-up-alt.svg';
import { ReactComponent as Ellipsis } from '../icon/ellipsis-v.svg';
import { ReactComponent as Hdd } from '../icon/hdd.svg';

import React, { Component } from 'react';
import Button from '../component/Button';
import Tabs from '../component/Tabs';
import Files from '../component/fileInspector/Files';
import ButtonSelect from '../component/ButtonSelect';

const { ipcRenderer } = window.require ('electron');
const path = window.require ('path');

class FileInspector extends Component {
	/**
	 * FileInspector initialization.
	 */
	constructor (props) {
		super (props);

		this.tabs = undefined;
		this.files = undefined;
		this.selectedTabId = undefined;
		this.selectedTabParams = undefined;
		this.selectedRows = [];

		this.state = {
			startTabs: undefined,
			startSelectedTab: undefined,
			drives: []
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Files');

		this.directoryContentsListener = this.RenderFiles.bind (this);
		ipcRenderer.on ('directory-contents', this.directoryContentsListener);

		this.drivesListListener = this.DrivesList.bind (this);
		ipcRenderer.on ('drives-list', this.drivesListListener);

		this.startTabsListener = (event, message) => {
			if (message.key === 'app-beta') {
				if (message.value === null || !message.value) {
					window.TCH.Main.Beta ();
				}
			} else if (message.key === 'file-inspector-tabs') {
				this.setState ({startTabs: message.value});
			} else if (message.key === 'file-inspector-tab-selected') {
				this.setState ({startSelectedTab: message.value});
			}
		};
		ipcRenderer.on ('config-get', this.startTabsListener);
		setTimeout (() => {
			ipcRenderer.send ('config-get', {key: 'app-beta'});
			ipcRenderer.send ('config-get', {key: 'file-inspector-tabs'});
			ipcRenderer.send ('config-get', {key: 'file-inspector-tab-selected'});
		}, 1);

		setTimeout (() => {
			ipcRenderer.send ('drives-list');
		}, 1);
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		this.tabs = undefined;
		this.files = undefined;
		this.selectedTabId = undefined;
		this.selectedTabParams = undefined;
		this.selectedRows = [];
		
		ipcRenderer.removeListener ('directory-contents', this.directoryContentsListener);
		delete this.directoryContentsListener;

		ipcRenderer.removeListener ('config-get', this.startTabsListener);
		delete this.startTabsListener;
		
		ipcRenderer.removeListener ('drives-list', this.drivesListListener);
		delete this.drivesListListener;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		if (typeof (this.state.startTabs) === 'undefined' || typeof (this.state.startSelectedTab) === 'undefined') {
			return '';
		}

		this.tabs = React.createRef ();

		let changeDrive = undefined;
		if (this.state.drives.length > 0) {
			let drives = this.state.drives.map (element => {
				return {
					id: element.identifier,
					value: element.mount,
					label: typeof (element.name) !== 'undefined' ? `${element.label} (${element.name})` : element.label
				};
			});

			changeDrive = <ButtonSelect icon={<Hdd />} options={drives} onSelectItem={this.DirectoryChangeDrive.bind (this)} />;
		}

		return <div className="file-inspector">
			<Tabs ref={this.tabs} startTabs={this.state.startTabs} startSelectedTab={this.state.startSelectedTab} startWith="1" tabsSave={this.TabsSave.bind (this)} tabParameters={this.TabParameters.bind (this)} onTabSelected={this.TabSelected.bind (this)} />
			<div className="container bottom">
				<div className="row">
					<div className="col-10">
						<div className="current-directory-actions">
							<input id="current-directory" className={(typeof (changeDrive) !== 'undefined' ? 'drives' : '')} type="text" onChange={this.DirectoryChanged.bind (this)} />
							<div className="current-directory-actions-container">
								<Button type="button" className="button icon" onClick={this.DirectoryToParent.bind (this)}><LevelUpAlt /></Button>
								{changeDrive}
								<Button type="button" className="button icon" onClick={this.DirectoryConsole.bind (this)}><Code /></Button>
								<Button type="button" className="button icon"><Ellipsis /></Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>;
	}

	/**
	 * Save Tabs to config.
	 */
	TabsSave (tabs, selectedTab) {
		ipcRenderer.send ('config-set', {key: 'file-inspector-tabs', value: tabs});
		ipcRenderer.send ('config-set', {key: 'file-inspector-tab-selected', value: selectedTab});
	}

	/**
	 * Return parameters for Tab.
	 */
	TabParameters (params) {
		params.tag = 'FileInspector';

		if (typeof (params.directory) === 'undefined') {
			params.directory = window.TCH.mainParameters.directory.documents;
		}

		if (typeof (params.title) === 'undefined') {
			params.title = path.basename (params.directory);
		}

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
		if (this.selectedTabId === message.id && this.selectedTabParams.directory === message.directory && typeof (this.files) !== 'undefined') {
			if (typeof (message.contents) !== 'undefined' && Array.isArray (message.contents)) {
				if (message.contents.length === 0) {
					message.contents.push (
						{error: 'NO_ITEMS'}
					);
				}

				for (let index in message.contents) {
					message.contents [index].reactId = encodeURIComponent (`${this.selectedTabParams.directory}-${message.contents [index].name}`);
				}
			}
			
			this.selectedRows = [];
			this.files.current.setState ({
				contents: this.SortFiles (message.contents)
			});
		}
	}

	/**
	 * Sort files by type and name.
	 */
	SortFiles (contents) {
		contents.sort ((a, b) => {
			let aName = typeof (a.name) !== 'undefined' ? a.name : '';
			let bName = typeof (b.name) !== 'undefined' ? b.name : '';

			return aName.localeCompare (bName);
		});

		let directories = [];
		let files = [];
		for (let index in contents) {
			if (contents.hasOwnProperty (index)) {
				if (typeof (contents [index].isDirectory) !== 'undefined' && contents [index].isDirectory) {
					directories.push (contents [index]);
				} else {
					files.push (contents [index]);
				}
			}
		}

		return directories.concat (files);
	}

	/**
	 * Receive drives list and update state.
	 */
	DrivesList (event, message) {
		if (typeof (message.drives) !== 'undefined' && Array.isArray (message.drives)) {
			this.setState ({drives: message.drives});
		}
	}

	/**
	 * Callback for when Tab is selected.
	 */
	TabSelected (params) {
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
					if (newDirectory.indexOf (path.sep) < 0) {
						newDirectory += path.sep;
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
			case 'row':
				//this.FileRowAction (action, params); //TODO disabled since it messes up animations
				break;
			case 'console':
				this.DirectoryConsole (params);
				break;
			default:
				console.error (`FileInspector - FileAction - unsupported action: ${action}`);
				break;
		}
	}

	/**
	 * Handle actions on file rows.
	 */
	FileRowAction (action, params) {
		if (typeof (params.selected) === 'undefined') {
			params.selected = false;
		}

		params.selected = !params.selected;
		let targetIndex = this.selectedRows.indexOf (params);
		if (!params.selected && targetIndex >= 0) {
			this.selectedRows.splice (targetIndex, 1);
		} else if (params.selected && targetIndex < 0) {
			this.selectedRows.push (params);
		}

		this.files.current.setState ({
			contents: this.files.current.state.contents
		});
	}

	/**
	 * Input changed directory, update files.
	 */
	DirectoryChanged () {
		let input = document.getElementById ('current-directory');

		if (encodeURIComponent (input.value) !== input.dataset.value) {
			this.selectedTabParams.directory = input.value;
			this.selectedTabParams.title = path.basename (this.selectedTabParams.directory);
			if (this.selectedTabParams.title === '') {
				let title = this.selectedTabParams.directory.split (path.sep);

				this.selectedTabParams.title = title.pop ();

				if (this.selectedTabParams.title === '' && title.length > 0) {
					this.selectedTabParams.title = title.pop ();
				} else {
					this.selectedTabParams.title = path.sep;
				}
			}

			this.tabs.current.setState ({
				selectedTab: this.tabs.current.state.selectedTab
			});

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

	/**
	 * Change directory to different drive.
	 */
	DirectoryChangeDrive (e) {
		let newDirectory = e.target.dataset.value;

		if (newDirectory.indexOf (path.sep) < 0) {
			newDirectory += path.sep;
		}

		let input = document.getElementById ('current-directory');
		input.value = newDirectory;

		this.DirectoryChanged ();
	}

	/**
	 * Open Console for current directory.
	 */
	DirectoryConsole (actionParams = null) {
		let params = {
			directory: this.selectedTabParams.directory
		};

		if (actionParams !== null && !actionParams.isDirectory) {
			params.file = actionParams.name;
		}

		window.TCH.Main.OpenConsole (params);
	}
}

export default FileInspector;
