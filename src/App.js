import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import TitleBar from './component/Titlebar';
import Navigation from './component/Navigation';
import Router from './Router';
import Popups from './component/Popups';
import Settings from './view/Settings';

const { ipcRenderer } = window.require ('electron');
const extend = window.require ('extend');

window.App_static = {
	Instance: null
};

class App extends Component {
	/**
	 * App initialization.
	 */
	constructor (props) {
		super (props);

		window.App_static.Instance = this;

		this.state = {
			classes: [],
			updateAvailable: null
		};

		window.TCH.mainParameters = undefined;
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		this.mainParametersListener = (event, message) => {
			window.TCH.mainParameters = message;

			window.TCH.mainParameters.settings = window.TCH.mainParameters.settings !== null ? extend (true, {}, Settings.Defaults (), window.TCH.mainParameters.settings) : Settings.Defaults ();

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

		this.nativeThemeUpdatedListener = (event, message) => {
			if (typeof window.TCH.mainParameters !== 'undefined') {
				window.TCH.mainParameters.osDarkMode = message.osDarkMode;

				setTimeout (() => {
					this.ClassesBySettings ();
				}, 1);
			}
		};
		ipcRenderer.on ('native-theme-updated', this.nativeThemeUpdatedListener);

		this.appSettingsSaveListener = (event, message) => {
			window.TCH.mainParameters.settings = message !== null ? extend (true, {}, Settings.Defaults (), message) : Settings.Defaults ();

			this.ClassesBySettings ();
		};
		ipcRenderer.on ('app-settings-save', this.appSettingsSaveListener);

		this.checkVersionListener = (event, message) => {
			if (typeof message.newVersion !== 'undefined') {
				this.setState ({
					updateAvailable: {
						newVersion: message.newVersion,
						downloadUrl: message.downloadUrl
					}
				});
			}
		};
		ipcRenderer.on ('version-check-update', this.checkVersionListener);
		ipcRenderer.send ('version-check-update');
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		ipcRenderer.removeListener ('main-parameters', this.mainParametersListener);
		delete this.mainParametersListener;

		ipcRenderer.removeListener ('native-theme-updated', this.nativeThemeUpdatedListener);
		delete this.nativeThemeUpdatedListener;
		
		ipcRenderer.removeListener ('app-settings-save', this.appSettingsSaveListener);
		delete this.appSettingsSaveListener;

		ipcRenderer.removeListener ('version-check-update', this.checkVersionListener);
		delete this.checkVersionListener;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {classes, updateAvailable} = this.state;

		if (typeof (window.TCH.mainParameters) === 'undefined') {
			return '';
		} else {
			return <HashRouter>
				<div id="app" className={classes.join (' ')}>
					<TitleBar />
					<Navigation />
					<div id="content">
						<Router/>
					</div>
					<Popups updateAvailable={updateAvailable}/>
				</div>
			</HashRouter>;
		}
	}

	/**
	 * Toggle class on app.
	 */
	ToggleClass (className) {
		const classes = this.state.classes;

		if (classes.includes (className)) {
			const index = classes.indexOf (className);
			classes.splice (index, 1);
		} else {
			classes.push (className);
		}

		document.querySelector ('body').classList.toggle (className);

		this.setState ({classes: classes});
	}

	/**
	 * Update app classes by app settings.
	 */
	ClassesBySettings () {
		const {settings} = window.TCH.mainParameters;

		const classes = this.state.classes;

		if (classes.includes ('fancy-font-disabled') && settings.theme.fancyFont) {
			this.ToggleClass ('fancy-font-disabled');
		} else if (!classes.includes ('fancy-font-disabled') && !settings.theme.fancyFont) {
			this.ToggleClass ('fancy-font-disabled');
		}

		const darkMode = settings.theme.darkMode !== null ? settings.theme.darkMode : window.TCH.mainParameters.osDarkMode;
		if (classes.includes ('dark-mode') && !darkMode) {
			this.ToggleClass ('dark-mode');
		} else if (!classes.includes ('dark-mode') && darkMode) {
			this.ToggleClass ('dark-mode');
		}
	}
}

export default App;
