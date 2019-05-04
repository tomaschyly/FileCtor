/* eslint-disable no-whitespace-before-property */
import {ReactComponent as Cog} from '../../icon/cog.svg';
import {ReactComponent as FolderOpen} from '../../icon/folder-open.svg';
import {ReactComponent as Eye} from '../../icon/eye.svg';
import {ReactComponent as Code} from '../../icon/code.svg';
import {ReactComponent as Ellipsis} from '../../icon/ellipsis-v.svg';

import React, {Component} from 'react';
import Server from 'react-dom/server';
import Button from '../Button';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import {VariableSizeList} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

class Files extends Component {
	/**
	 * Files initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			loading: true,
			contents: undefined
		};
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {loading, contents} = this.state;

		const duration = 400;
		let content = undefined;

		if (loading) {
			content = <CSSTransition key="files-loading" timeout={duration} classNames="general-flex-fade" unmountOnExit>
				<div className="tch-grid-row general-flex-fade">
					<div className="tch-grid-col loading">
						<Cog className="spin"/>
					</div>
				</div>
			</CSSTransition>;
		} else {
			content = <CSSTransition key="files-contents" timeout={duration} classNames="general-fade" unmountOnExit>
				<div className="general-fade">
					<AutoSizer>
						{({width, height}) => (<VariableSizeList width={width} height={height} itemCount={typeof contents !== 'undefined' && Array.isArray (contents) ? contents.length : 0} estimatedItemSize={42} itemKey={this.ListRowKey.bind (this)} itemSize={this.ListRowSize.bind (this)}>
							{this.RenderListRow.bind (this)}
						</VariableSizeList>)}
					</AutoSizer>
					<div className="calculate-row-size"/>
				</div>
			</CSSTransition>;
		}

		return <div className="tch-grid">
			<div className="tch-grid-body">
				<TransitionGroup appear>
					{content}
				</TransitionGroup>
			</div>
		</div>;
	}

	/**
	 * Get key for row.
	 */
	ListRowKey (index) {
		const {contents} = this.state;
		const rowData = contents [index];
		
		return rowData.reactId;
	}

	/**
	 * Calculate list row size for index.
	 */
	ListRowSize (index) {
		const container = document.querySelector ('.file-inspector .calculate-row-size');
		const row = this.RenderListRow ({index});
		container.innerHTML = Server.renderToStaticMarkup (row);

		const containerOffset = container.getBoundingClientRect ();
		const height = containerOffset.height;

		container.innerHTML = '';

		return height;
	}

	/**
	 * Render list row for index.
	 */
	RenderListRow ({index, style}) {
		const {contents} = this.state;
		const rowData = contents [index];
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

		return <div className={`tch-grid-row tch-grid-action-row tch-grid-action-row-${index} ${typeof (rowData.selected) && rowData.selected ? ' active' : ''}`} style={style} onClick={this.FileAction.bind (this)} data-reactid={rowData.reactId} data-action="row">
			{row}
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
