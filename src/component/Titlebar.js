import './titlebar.css';
import { ReactComponent as Minimize } from '../icon/minimize.svg';
import { ReactComponent as MaximizeSquare } from '../icon/maximize-square.svg';
import { ReactComponent as MaximizeClone } from '../icon/maximize-clone.svg';
import { ReactComponent as Close } from '../icon/close.svg';
import { ReactComponent as Home } from '../icon/home.svg';
import { ReactComponent as ExpandArrowsAlt } from '../icon/expand-arrows-alt.svg';

import React, { Component } from 'react';
import Button from './Button';

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

		this.resetShowListener = (event, message) => {
			window.TCH.Main.ShowResetButton ();

			this.whichWindow = message.window;
		};
		ipcRenderer.on ('reset-show', this.resetShowListener);

		this.resetHideListener = () => {
			window.TCH.Main.HideResetButton ();
		};
		ipcRenderer.on ('reset-hide', this.resetHideListener);
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

		ipcRenderer.removeListener ('reset-show', this.resetShowListener);
		delete this.resetShowListener;

		ipcRenderer.removeListener ('reset-hide', this.resetHideListener);
		delete this.resetHideListener;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		let elements;

		switch (window.TCH.mainParameters.platform) {
			case 'linux':
				elements = <div id="titlebar">
					<div id="titlebar-actions-other">
						<Button type="button" id="titlebar-reset" onClick={this.Reset.bind (this)}><ExpandArrowsAlt /></Button>
						<Button type="button" id="titlebar-main" onClick={this.Main.bind (this)}><Home /></Button>
					</div>
					<div id="title">{this.state.title}</div>
					<div id="titlebar-actions">
						<Button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize /></Button>
						<Button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}><MaximizeSquare /><MaximizeClone /></Button>
						<Button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close /></Button>
					</div>
				</div>;
				break;
			case 'darwin':
				elements = <div id="titlebar">
					<div id="titlebar-actions">
						<Button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close /></Button>
						<Button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize /></Button>
						<Button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}><MaximizeSquare /><MaximizeClone /></Button>
					</div>
					<div id="title">{this.state.title}</div>
					<div id="titlebar-actions-other">
						<Button type="button" id="titlebar-main" onClick={this.Main.bind (this)}><Home /></Button>
						<Button type="button" id="titlebar-reset" onClick={this.Reset.bind (this)}><ExpandArrowsAlt /></Button>
					</div>
				</div>;
				break;
			default:
				elements = <div id="titlebar">
					<div id="titlebar-actions-other">
						<Button type="button" id="titlebar-reset" onClick={this.Reset.bind (this)}><ExpandArrowsAlt /></Button>
						<Button type="button" id="titlebar-main" onClick={this.Main.bind (this)}><Home /></Button>
					</div>
					<div id="title">{this.state.title}</div>
					<div id="titlebar-actions">
						<Button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize /></Button>
						<Button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}><MaximizeSquare /><MaximizeClone /></Button>
						<Button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close /></Button>
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
	}

	/**
	 * Close window.
	 */
	Close () {
		this.currentWindow.close ();
	}

	/**
	 * Open main window.
	 */
	Main () {
		ipcRenderer.send ('main-open');
	}

	/**
	 * Reset window to default.
	 */
	Reset () {
		ipcRenderer.send ('window-reset', {window: this.whichWindow});
	}
}

export default TitleBar;
