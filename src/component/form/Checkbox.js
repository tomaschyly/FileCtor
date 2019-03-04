import './checkbox.css';
import {ReactComponent as Check} from '../../icon/check.svg';

import React, {Component} from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';

class Checkbox extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		const {className, name, label, value, error, errorMessage} = this.props;
		let {id} = this.props;

		if (typeof (id) === 'undefined') {
			id = name;
		}

		return <div className={`general-form-checkbox${typeof (className) !== 'undefined' ? ` ${className}` : ''}${value ? ' checked' : ''}`}>
			<div>
				<button type="button" className="button icon" onClick={this.Toggle.bind (this)}><Check/></button>
			</div>
			<label htmlFor={id} onClick={this.Toggle.bind (this)}>{label}</label>

			<CSSTransition in={typeof (error) !== 'undefined' && error} timeout={400} classNames="general-fade">
				<p className="general-form-error general-fade">{errorMessage}</p>
			</CSSTransition>
		</div>;
	}

	/**
	 * Toggle checked value of formData.
	 */
	Toggle () {
		this.props.onChange (this.props.name, !this.props.value);
	}
}

export default Checkbox;
