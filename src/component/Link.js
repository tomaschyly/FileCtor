import './link.css';

import React, {Component} from 'react';

const {ipcRenderer} = window.require ('electron');

class Link extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		const {className, children} = this.props;

		return <span className={`link${typeof (className) !== 'undefined' ? ` ${className}` : ''}`} onClick={this.Open.bind (this)}>
			{children}
		</span>;
	}

	/**
	 * On click open default browser.
	 */
	Open () {
		const {href} = this.props;

		if (typeof (href) !== 'undefined') {
			ipcRenderer.send ('url-open', {url: href});
		}
	}
}

export default Link;
