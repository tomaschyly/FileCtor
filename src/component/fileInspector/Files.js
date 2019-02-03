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

				row.push (<div className="tch-grid-col no-grow" key={`${rowData.reactId}-${1}`}><span>{this.FileSize (rowData.size)}</span></div>);

				if (typeof (this.props.onFileAction) !== 'undefined') {
					if (typeof (rowData.error) !== 'undefined') {
						row.push (<div className="tch-grid-col actions right" key={`${rowData.reactId}-${2}`}></div>);
					} else {
						let openDirectory = undefined;
						if (rowData.isDirectory) {
							openDirectory = <button type="button" className="tch-grid-action icon" data-reactid={rowData.reactId} data-action="directory"><FolderOpen /></button>;
						}
		
						let execute = undefined;
						if (!rowData.isDirectory) {
							execute = <button type="button" className="tch-grid-action icon" data-reactid={rowData.reactId} data-action="file"><Eye /></button>;
						}
						
						row.push (<div className="tch-grid-col actions right" key={`${rowData.reactId}-${2}`}>
							{openDirectory}
							{execute}
							<button type="button" className="tch-grid-action icon" data-reactid={rowData.reactId} data-action="console"><Code /></button>
							<button type="button" className="tch-grid-action icon" data-reactid={rowData.reactId} data-action="options"><Ellipsis /></button>
						</div>);
					}
				}

				contents.push (<div className={`tch-grid-row tch-grid-action-row${typeof (rowData.selected) && rowData.selected ? ' active' : ''}`} key={rowData.reactId} onClick={this.FileAction.bind (this)} data-reactid={rowData.reactId} data-action="row">{row}</div>);
			}
		}

		return <div className="tch-grid">
			<div className="tch-grid-body">{contents}</div>
		</div>;
	}

	/**
	 * Output formated file size.
	 */
	FileSize (size) {
		if (typeof (size) !== 'undefined') {
			let bytes = parseInt (size);

			if (bytes >= (1024 * 1024 * 1024)) {
				return `${Math.round (bytes / (1024 * 1024 * 1024))} GB`;
			} else if (bytes >= (1024 * 1024)) {
				return `${Math.round (bytes / (1024 * 1024))} MB`;
			} else if (bytes >= 1024) {
				return `${Math.round (bytes / 1024)} KB`;
			} else {
				return `${bytes} B`;
			}
		}

		return '';
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

			if (target === null) {
				target = window.TCH.Main.Utils.FindNearestParent (e.target, 'tch-grid-action-row');
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
