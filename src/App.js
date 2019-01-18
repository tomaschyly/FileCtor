import React, { Component } from 'react';
import TitleBar from './Titlebar';

const { ipcRenderer } = window.require ('electron');

window.mainParameters = undefined;

class App extends Component {
	/**
	 * App initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			classes: []
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		ipcRenderer.on ('main-parameters', (event, message) => {
			if (typeof (message.platform) !== 'undefined') {
				window.mainParameters = message;

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
		if (typeof (window.mainParameters) === 'undefined') {
			return <div></div>;
		} else {
			return <div className={this.state.classes.join (' ')}>
				<TitleBar />
				<p>WIP content</p>
			</div>;
		}
	}
}

export default App;
