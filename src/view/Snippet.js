import React, { Component } from 'react';

class Snippet extends Component {
	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Snippets');
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <p>WIP - view/create/edit code snippets</p>;
	}
}

export default Snippet;
