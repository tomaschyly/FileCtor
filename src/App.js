import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import TitleBar from './Titlebar';
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

			if (typeof (message.platform) !== 'undefined') {
				let classes = this.state.classes;
				classes.push (message.platform);

				this.setState ({classes: classes});
			}
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
				<div className={this.state.classes.join (' ')}>
					<TitleBar />
					<Router />
				</div>
			</HashRouter>;
		}
	}
}

export default App;
