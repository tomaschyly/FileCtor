/* eslint-disable no-whitespace-before-property */
import { ReactComponent as FolderOpen } from '../../icon/folder-open.svg';
import { ReactComponent as Eye } from '../../icon/eye.svg';
import { ReactComponent as Code } from '../../icon/code.svg';
import { ReactComponent as Ellipsis } from '../../icon/ellipsis-v.svg';

import React, { Component } from 'react';

class Files extends Component {
	/**
	 * Files initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			contents: undefined
		};
	}

	/**
	 * Render the component into html.
	 */
	render () {
		let contents = [];

		if (typeof (this.state.contents) !== 'undefined' && Array.isArray (this.state.contents)) {
			for (let index in this.state.contents) {
				let rowData = this.state.contents [index];
				let row = [];

				if (typeof (rowData.error) !== 'undefined') {
					switch (rowData.error) {
						case 'ENOENT':
							rowData.name = 'No such directory found.';
							break;
						case 'NO_ITEMS':
							rowData.name = 'No files found in directory.';
							break;
						default:
							console.error (`Files - render - unsupported error: ${rowData.error}`);
							break;
					}
				}

				row.push (<div className="tch-grid-col" key={`${rowData.reactId}-${0}`}><span>{rowData.name}</span></div>);

				if (typeof (this.props.onFileAction) !== 'undefined') {
					if (typeof (rowData.error) !== 'undefined') {
						row.push (<div className="tch-grid-col actions right" key={`${rowData.reactId}-${1}`}></div>);
					} else {
						let openDirectory = undefined;
						if (rowData.isDirectory) {
							openDirectory = <button type="button" className="tch-grid-action icon" onClick={this.FileAction.bind (this)} data-reactid={rowData.reactId} data-action="directory"><FolderOpen /></button>;
						}
		
						let execute = undefined;
						if (!rowData.isDirectory) {
							execute = <button type="button" className="tch-grid-action icon" onClick={this.FileAction.bind (this)} data-reactid={rowData.reactId} data-action="file"><Eye /></button>;
						}
						
						row.push (<div className="tch-grid-col actions right" key={`${rowData.reactId}-${1}`}>
							{openDirectory}
							{execute}
							<button type="button" className="tch-grid-action icon" onClick={this.FileAction.bind (this)} data-reactid={rowData.reactId} data-action="console"><Code /></button>
							<button type="button" className="tch-grid-action icon" onClick={this.FileAction.bind (this)} data-reactid={rowData.reactId} data-action="options"><Ellipsis /></button>
						</div>);
					}
				}

				contents.push (<div className="tch-grid-row" key={rowData.reactId}>{row}</div>);
			}
		}

		return <div className="tch-grid">
			<div className="tch-grid-body">{contents}</div>
		</div>;
	}

	/**
	 * Handle actions on files.
	 */
	FileAction (e) {
		if (typeof (this.props.onFileAction) !== 'undefined') {
			let target = e.target;

			if (target.tagName !== 'BUTTON') {
				target = window.TCH.Main.Utils.FindNearestParent (target, undefined, 'BUTTON');
			}

			if (target !== null) {
				let params = undefined;

				for (let index in this.state.contents) {
					let rowData = this.state.contents [index];

					if (rowData.reactId === target.dataset.reactid) {
						params = rowData;
						break;
					}
				}

				this.props.onFileAction (target.dataset.action, params);
			}
		}
	}
}

export default Files;
