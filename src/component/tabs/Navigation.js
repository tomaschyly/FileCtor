import { ReactComponent as Close } from '../../icon/close.svg';

import React, { Component } from 'react';
import Button from '../Button';

class Navigation extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		return <Button type="button" className={`button tch-tabs-navigation-item${typeof (this.props.className) !== 'undefined' ? ` ${this.props.className}` : ''}`} onClick={this.props.selectCallback} data-id={this.props.params.id}>{this.props.params.title} <Close onClick={this.props.removeCallback} data-id={this.props.params.id} /></Button>;
	}
}

export default Navigation;
