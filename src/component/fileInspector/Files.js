/* eslint-disable no-whitespace-before-property */
import { ReactComponent as FolderOpen } from '../../icon/folder-open.svg';
import { ReactComponent as Eye } from '../../icon/eye.svg';
import { ReactComponent as Code } from '../../icon/code.svg';
import { ReactComponent as Ellipsis } from '../../icon/ellipsis-v.svg';

import React, { Component } from 'react';
import Button from '../Button';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

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
				if (!this.state.contents.hasOwnProperty (index)) {
					continue;
				}

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
						row.push (<div className="tch-grid-col actions right" key={`${rowData.reactId}-${2}`}/>);
					} else {
						let openDirectory = undefined;
						if (rowData.isDirectory) {
							openDirectory = <Button type="button" className="tch-grid-action icon" data-reactid={rowData.reactId} data-action="directory"><FolderOpen /></Button>;
						}
		
						let execute = undefined;
						if (!rowData.isDirectory) {
							execute = <Button type="button" className="tch-grid-action icon" data-reactid={rowData.reactId} data-action="file"><Eye /></Button>;
						}
						
						row.push (<div className="tch-grid-col actions right" key={`${rowData.reactId}-${2}`}>
							{openDirectory}
							{execute}
							<Button type="button" className="tch-grid-action icon" data-reactid={rowData.reactId} data-action="console"><Code /></Button>
							<Button type="button" className="tch-grid-action icon" data-reactid={rowData.reactId} data-action="options"><Ellipsis /></Button>
						</div>);
					}
				}

				contents.push (<CSSTransition key={rowData.reactId} timeout={400} classNames="general-flex-fade" unmountOnExit>
					<div className={`tch-grid-row tch-grid-action-row general-flex-fade ${typeof (rowData.selected) && rowData.selected ? ' active' : ''}`} onClick={this.FileAction.bind (this)} data-reactid={rowData.reactId} data-action="row">{row}</div>
				</CSSTransition>);
			}
		}

		return <div className="tch-grid">
			<TransitionGroup className="tch-grid-body">{contents}</TransitionGroup>
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
					if (this.state.contents.hasOwnProperty (index)) {
						let rowData = this.state.contents [index];

						if (rowData.reactId === target.dataset.reactid) {
							params = rowData;
							break;
						}
					}
				}

				this.props.onFileAction (target.dataset.action, params);
			}
		}
	}
}

export default Files;
