import React, { Component } from 'react';

class FileInspector extends Component {
	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Files');
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <p>Test</p>;
	}
}

export default FileInspector;
