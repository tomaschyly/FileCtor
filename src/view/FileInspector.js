/* eslint-disable no-whitespace-before-property */
import './fileInspector.css';

import React, { Component } from 'react';
import Tabs from '../component/Tabs';
import Files from '../component/fileInspector/Files';

const { ipcRenderer } = window.require ('electron');

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
						<input id="current-directory" type="text" />
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

		if (params.directory.includes ('\\')) {
			params.title = params.directory.split ('\\').pop ();
		} else {
			params.title = params.directory.split ('/').pop ();
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
				directory: params.directory
			});
		}, 1);

		this.files = React.createRef ();
		return <div id={`file-inspector-files-${params.id}`}>
			<Files ref={this.files} />
		</div>;
	}

	/**
	 * Receive contents of directory and render.
	 */
	RenderFiles (event, message) {
		console.log ('RenderFiles'); //TODO remove
		if (this.selectedTabId === message.id && typeof (this.files) !== 'undefined') {
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
}

export default FileInspector;
