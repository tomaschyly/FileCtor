import React, { Component } from 'react';

class Console extends Component {
	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Console');

		window.TCH.Main.HideNavigation ();
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <p>WIP - console</p>;
	}
}

export default Console;
