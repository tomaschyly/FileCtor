import './titlebar.css';
import { ReactComponent as Minimize } from '../icon/minimize.svg';
import { ReactComponent as MaximizeSquare } from '../icon/maximize-square.svg';
import { ReactComponent as MaximizeClone } from '../icon/maximize-clone.svg';
import { ReactComponent as Close } from '../icon/close.svg';
import { ReactComponent as Home } from '../icon/home.svg';

import React, { Component } from 'react';

const { remote, ipcRenderer } = window.require ('electron');

class TitleBar extends Component {
	/**
	 * TitleBar initialization.
	 */
	constructor (props) {
		super (props);

		this.onResizeListener = undefined;

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

		this.IsMaximized ();
		this.onResizeListener = this.IsMaximized.bind (this);
		window.addEventListener ('resize', this.onResizeListener);

		this.mainClosedListener = () => {
			window.TCH.Main.ShowMainButton ();
		};
		ipcRenderer.on ('main-closed', this.mainClosedListener);

		this.mainOpenedListener = () => {
			window.TCH.Main.HideMainButton ();
		};
		ipcRenderer.on ('main-opened', this.mainOpenedListener);
	}

	/**
	 * Will be removed from DOM.
	 */
	componentWillUnmount () {
		window.TCH.Main.titleBar = null;

		window.removeEventListener ('resize', this.onResizeListener);
		this.onResizeListener = undefined;

		ipcRenderer.removeListener ('main-closed', this.mainClosedListener);
		delete this.mainClosedListener;

		ipcRenderer.removeListener ('main-opened', this.mainOpenedListener);
		delete this.mainOpenedListener;
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
						<button type="button" id="titlebar-home" onClick={this.Main.bind (this)}><Home /></button>
						<button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize /></button>
						<button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}><MaximizeSquare /><MaximizeClone /></button>
						<button type="button" id="titlebar-main" onClick={this.Main.bind (this)}><Home /></button>
					</div>
				</div>;
				break;
			case 'darwin':
				elements = <div id="titlebar">
					<div id="titlebar-actions">
						<button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close /></button>
						<button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize /></button>
						<button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}><MaximizeSquare /><MaximizeClone /></button>
						<button type="button" id="titlebar-main" onClick={this.Main.bind (this)}><Home /></button>
					</div>
					<div id="title">{this.state.title}</div>
				</div>;
				break;
			default:
				elements = <div id="titlebar">
					<div id="title">{this.state.title}</div>
					<div id="titlebar-actions">
						<button type="button" id="titlebar-main" onClick={this.Main.bind (this)}><Home /></button>
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
	 * Check is maximized and update button.
	 */
	IsMaximized () { 
		let maximize = document.getElementById ('titlebar-maximize');
		if (this.currentWindow.isMaximized ()) {
			maximize.classList.add ('minimize');
		} else {
			maximize.classList.remove ('minimize');
		}
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

	/**
	 * Open main window.
	 */
	Main () {
		ipcRenderer.send ('main-open');
	}
}

export default TitleBar;
