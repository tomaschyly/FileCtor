import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import TitleBar from './component/Titlebar';
import Navigation from './component/Navigation';
import Router from './Router';
import Popups from './component/Popups';
import Settings from './view/Settings';

const { ipcRenderer } = window.require ('electron');

class App extends Component {
	/**
	 * App initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			classes: []
		};

		window.TCH.mainParameters = undefined;
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.app = this;

		this.mainParametersListener = (event, message) => {
			window.TCH.mainParameters = message;

			window.TCH.mainParameters.settings = window.TCH.mainParameters.settings !== null ? window.TCH.mainParameters.settings : Settings.Defaults ();

			let classes = this.state.classes;
			if (typeof (message.platform) !== 'undefined') {
				classes.push (message.platform);

				document.querySelector ('html').classList.add (message.platform);
			}
			this.setState ({classes: classes});

			setTimeout (() => {
				this.ClassesBySettings ();
			}, 1);
		};
		ipcRenderer.on ('main-parameters', this.mainParametersListener);
		ipcRenderer.send ('main-parameters');

		this.appSettingsSaveListener = (event, message) => {
			window.TCH.mainParameters.settings = message !== null ? message : Settings.Defaults ();

			this.ClassesBySettings ();
		};
		ipcRenderer.on ('app-settings-save', this.appSettingsSaveListener);
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		window.TCH.Main.app = null;

		ipcRenderer.removeListener ('main-parameters', this.mainParametersListener);
		delete this.mainParametersListener;
		
		ipcRenderer.removeListener ('app-settings-save', this.appSettingsSaveListener);
		delete this.appSettingsSaveListener;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		if (typeof (window.TCH.mainParameters) === 'undefined') {
			return '';
		} else {
			return <HashRouter>
				<div id="app" className={this.state.classes.join (' ')}>
					<TitleBar />
					<Navigation />
					<div id="content">
						<Router />
					</div>
					<Popups/>
				</div>
			</HashRouter>;
		}
	}

	/**
	 * Toggle class on app.
	 */
	ToggleClass (className) {
		let classes = this.state.classes;
		if (classes.includes (className)) {
			const index = classes.indexOf (className);
			classes.splice (index, 1);
		} else {
			classes.push (className);
		}

		this.setState ({classes: classes});
	}

	/**
	 * Update app classes by app settings.
	 */
	ClassesBySettings () {
		const {settings} = window.TCH.mainParameters;

		let classes = this.state.classes;
		if (classes.includes ('fancy-font-disabled') && settings.theme.fancyFont) {
			this.ToggleClass ('fancy-font-disabled');
		} else if (!classes.includes ('fancy-font-disabled') && !settings.theme.fancyFont) {
			this.ToggleClass ('fancy-font-disabled');
		}
	}
}

export default App;
