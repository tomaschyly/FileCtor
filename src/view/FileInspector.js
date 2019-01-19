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
		return <p>WIP - Tabs with files, bottom current directory path</p>;
	}
}

export default FileInspector;
