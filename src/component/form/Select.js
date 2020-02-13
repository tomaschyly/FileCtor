/* eslint-disable no-whitespace-before-property */
import './select.css';

import React, {Component} from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import ButtonSelect from '../ButtonSelect';

class Select extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		const {className, name, label, value, options, error, errorMessage} = this.props;
		let {id} = this.props;

		if (typeof (id) === 'undefined') {
			id = name;
		}

		const listOptions = options.map (element => {return {label: element.label, value: element.value, id: element.value};});

		const valueLabel = options.filter (element => element.value === value);

		return <div className={`general-form-select${typeof (className) !== 'undefined' ? ` ${className}` : ''}`}>
			<label htmlFor={id}>{label}</label>
			<ButtonSelect value={valueLabel [0].label} options={listOptions} onSelectItem={this.OnSelectItem.bind (this)}/>

			<CSSTransition in={typeof (error) !== 'undefined' && error} timeout={400} classNames="general-fade">
				<p className="general-form-error general-fade">{errorMessage}</p>
			</CSSTransition>
		</div>;
	}

	/**
	 * OnSelectItem update value of formData.
	 */
	OnSelectItem (e) {
		this.props.onChange (this.props.name, e.target.dataset.value);
	}
}

export default Select;
