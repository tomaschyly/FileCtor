import './checkbox.css';
import {ReactComponent as Check} from '../../icon/check.svg';

import React, {Component} from 'react';

class Checkbox extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		const {className, name, label, value, error} = this.props;
		let {id} = this.props;

		if (typeof (id) === 'undefined') {
			id = name;
		}

		let errorLabel = undefined;
		if (typeof (error) !== 'undefined') {
			errorLabel = <p className="general-form-error">{error}</p>;
		}

		return <div className={`general-form-checkbox${typeof (className) !== 'undefined' ? ` ${className}` : ''}${value ? ' checked' : ''}`}>
			<div>
				<button type="button" className="button icon" onClick={this.Toggle.bind (this)}><Check/></button>
			</div>
			<label htmlFor={id} onClick={this.Toggle.bind (this)}>{label}</label>
			{errorLabel}
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
