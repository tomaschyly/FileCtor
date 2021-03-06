import './settings.css';

import React, {Component} from 'react';
import Form from '../component/Form';
import Button from '../component/Button';
import Popup from '../component/Popup';
import {THEMES_AS_OPTIONS} from '../component/CodeMirrorEditor';

const {ipcRenderer} = window.require ('electron');
const extend = window.require ('extend');

const defaults = {
	controls: {
		execute: 'ctrl+r',
		snippetLoad: 'ctrl+l',
		snippetSave: 'ctrl+s'
	},
	console: {
		theme: 'default',
		executeConfirm: true,
		tinypngApiKey: '',
		pro: false
	},
	theme: {
		fancyFont: false,
		darkMode: null
	}
};

class Settings extends Component {
	/**
	 * Settings initialization.
	 */
	constructor (props) {
		super (props);

		this.formTheme = undefined;
		this.formConsole = undefined;
		this.formControls = undefined;

		this.formsValues = {};
		
		this.state = {
			current: window.TCH.mainParameters.settings !== null ? extend (true, {}, defaults, window.TCH.mainParameters.settings) : defaults,
			reset: false
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Settings');

		document.querySelector ('#content .settings').addEventListener ('scroll', window.ButtonSelect_static.globalHideOptionsListener);
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		this.formTheme = undefined;
		this.formConsole = undefined;
		this.formControls = undefined;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {current} = this.state;

		this.formTheme = React.createRef ();
		this.formConsole = React.createRef ();
		this.formControls = React.createRef ();

		return <div className="settings">
			<div className="container">
				<div className="row">
					<div className="col-10">
						<Button className="f-right" onClick={this.FormsSubmit.bind (this)}>Save</Button>
					</div>

					<div className="col-10">
						<div className="panel">
							<h2>Theme</h2>

							<Form ref={this.formTheme} inputs={{
								fancyFont: {
									label: 'Fancy Font',
									type: 'checkbox',
									value: current.theme.fancyFont
								},
								darkMode: {
									label: 'Dark Mode',
									type: 'checkbox',
									value: current.theme.darkMode !== null ? current.theme.darkMode : window.TCH.mainParameters.osDarkMode
								}
							}} onSubmit={values => this.formsValues.theme = values}/>
						</div>
					</div>

					<div className="col-10">
						<div className="panel">
							<h2>Console</h2>

							<Form ref={this.formConsole} inputs={{
								theme: {
									label: 'Editor Theme',
									type: 'select',
									value: current.console.theme,
									options: THEMES_AS_OPTIONS
								},
								executeConfirm: {
									label: 'Confirm Execute',
									type: 'checkbox',
									value: current.console.executeConfirm
								},
								tinypngApiKey: {
									label: 'TinyPNG API Key',
									type: 'text',
									value: current.console.tinypngApiKey
								},
								pro: {
									label: 'Pro Mode',
									type: 'checkbox',
									value: current.console.pro,
									description: (
										<span>
											Normally you are limited to sandbox with limited functionality. Enabling <strong>Pro Mode</strong> adds <strong>require</strong> to the sandbox, this gives you ability to use any <strong>Node</strong> and included <strong>packages</strong> functionality.<br/>It is preferable for you to <strong>request</strong> additional functionality instead of using the <strong>Pro Mode</strong>.
										</span>
									)
								}
							}} onSubmit={values => this.formsValues.console = values}/>
						</div>
					</div>

					<div className="col-10">
						<div className="panel">
							<h2>Controls</h2>

							<Form ref={this.formControls} inputs={{
								execute: {
									label: 'Console Execute',
									type: 'text',
									value: current.controls.execute
								},
								snippetLoad: {
									label: 'Console Load Snippet',
									type: 'text',
									value: current.controls.snippetLoad
								},
								snippetSave: {
									label: 'Console Save Snippet',
									type: 'text',
									value: current.controls.snippetSave
								}
							}} onSubmit={values => this.formsValues.controls = values}/>
						</div>
					</div>

					<div className="col-10">
						<Button className="button-red" onClick={this.ResetApp.bind (this)}>Reset</Button>
						<Button className="f-right" onClick={this.FormsSubmit.bind (this)}>Save</Button>
					</div>
				</div>
			</div>

			<Popup className="auto red" visible={this.state.reset} headline="Reset App" content={
				<div>
					<p>Are you sure you want to reset App config and data?</p>
					<p>This will delete all of your own saved Snippets, but it will reinstall App's included Snippets.</p>
				</div>
			} onClose={this.ResetAppClosed.bind (this)} acceptVisible={true} acceptClassName="button-red" accept="Confirm" onAccept={this.ResetAppAccepted.bind (this)}/>
		</div>;
	}

	/**
	 * Get config defaults.
	 */
	static Defaults () {
		return defaults;
	}

	/**
	 * Save all forms to Config.
	 */
	FormsSubmit () {
		this.formTheme.current.Submit ();
		this.formConsole.current.Submit ();
		this.formControls.current.Submit ();

		ipcRenderer.send ('app-settings-save', this.formsValues);
	}

	/**
	 * Ask user to cofirm and then if yes, reset the app config and data.
	 */
	ResetApp () {
		this.setState ({reset: true});
	}

	/**
	 * Reset app popup closed.
	 */
	ResetAppClosed () {
		this.setState ({reset: false});
	}

	/**
	 * Reset app popup accepted, reset the app.
	 */
	ResetAppAccepted () {
		ipcRenderer.send ('app-reset');
	}
}

export default Settings;
