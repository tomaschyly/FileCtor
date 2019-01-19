import React, { Component } from 'react';

class About extends Component {
	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('About');
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <p>WIP - about</p>;
	}
}

export default About;
