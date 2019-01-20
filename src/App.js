import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import TitleBar from './component/Titlebar';
import Navigation from './component/Navigation';
import Router from './Router';

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
		ipcRenderer.on ('main-parameters', (event, message) => {
			window.TCH.mainParameters = message;

			let classes = this.state.classes;
			if (typeof (message.platform) !== 'undefined') {
				classes.push (message.platform);
			}
			this.setState ({classes: classes});
		});
		ipcRenderer.send ('main-parameters');
	}

	/**
	 * Render the component into html.
	 */
	render () {
		if (typeof (window.TCH.mainParameters) === 'undefined') {
			return <div></div>;
		} else {
			return <HashRouter>
				<div id="app" className={this.state.classes.join (' ')}>
					<TitleBar />
					<Navigation />
					<div id="content">
						<Router />
					</div>
				</div>
			</HashRouter>;
		}
	}
}

export default App;
