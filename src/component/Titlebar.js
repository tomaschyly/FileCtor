import './titlebar.css';
import { ReactComponent as Minimize } from '../icon/minimize.svg';
import { ReactComponent as MaximizeSquare } from '../icon/maximize-square.svg';
import { ReactComponent as MaximizeClone } from '../icon/maximize-clone.svg';
import { ReactComponent as Close } from '../icon/close.svg';

import React, { Component } from 'react';

const { remote } = window.require ('electron');

class TitleBar extends Component {
	/**
	 * TitleBar initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			title: document.title
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.titleBar = this;

		this.currentWindow = remote.getCurrentWindow ();

		let maximize = document.getElementById ('titlebar-maximize');
		if (this.currentWindow.isMaximized ()) {
			maximize.classList.add ('minimize');
		} else {
			maximize.classList.remove ('minimize');
		}
	}

	/**
	 * Will be removed from DOM.
	 */
	componentWillUnmount () {
		window.TCH.Main.titleBar = null;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		let elements;

		switch (window.TCH.mainParameters.platform) {
			case 'linux':
				elements = <div id="titlebar">
					<div id="title">{this.state.title}</div>
					<div id="titlebar-actions">
						<button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize /></button>
						<button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}><MaximizeSquare /><MaximizeClone /></button>
						<button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close /></button>
					</div>
				</div>;
				break;
			case 'darwin':
				elements = <div id="titlebar">
					<div id="titlebar-actions">
						<button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close /></button>
						<button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize /></button>
						<button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}><MaximizeSquare /><MaximizeClone /></button>
					</div>
					<div id="title">{this.state.title}</div>
				</div>;
				break;
			default:
				elements = <div id="titlebar">
					<div id="title">{this.state.title}</div>
					<div id="titlebar-actions">
						<button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize /></button>
						<button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}><MaximizeSquare /><MaximizeClone /></button>
						<button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close /></button>
					</div>
				</div>;
				break;
		}

		return elements;
	}

	/**
	 * Minimize window.
	 */
	Minimize () {
		this.currentWindow.minimize ();

		setTimeout (() => {
			document.getElementById ('titlebar-minimize').blur ();
		}, 1);
	}

	/**
	 * Maximize window.
	 */
	Maximize () {
		let maximize = document.getElementById ('titlebar-maximize');

		if (this.currentWindow.isMaximized ()) {
			this.currentWindow.unmaximize ();
			maximize.classList.remove ('minimize');
		} else {
			this.currentWindow.maximize ();
			maximize.classList.add ('minimize');
		}

		setTimeout (() => {
			maximize.blur ();
		}, 1);
	}

	/**
	 * Close window.
	 */
	Close () {
		this.currentWindow.close ();

		setTimeout (() => {
			document.getElementById ('titlebar-close').blur ();
		}, 1);
	}
}

export default TitleBar;
