import { ReactComponent as Close } from '../../icon/close.svg';

import React, { Component } from 'react';

class Navigation extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		return <button type="button" className="button" onClick={this.props.selectCallback} data-id={this.props.params.id}>{this.props.params.title} <Close onClick={this.props.removeCallback} data-id={this.props.params.id} /></button>;
	}
}

export default Navigation;
