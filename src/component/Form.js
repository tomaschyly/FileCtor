/* eslint-disable no-whitespace-before-property */
import './form.css';

import React, {Component} from 'react';
import TextInput from './form/TextInput';
import EmailInput from './form/EmailInput';
import Textarea from './form/Textarea';
import Checkbox from './form/Checkbox';

const uuidV4 = window.require ('uuid/v4');
const emailValidator = window.require ('email-validator');

class Form extends Component {
	/**
	 * Form initialization.
	 */
	constructor (props) {
		super (props);

		let {id} = this.props;

		if (typeof (id) === 'undefined') {
			id = `form-${uuidV4 ()}`;
		}

		this.state = {
			formData: this.props.inputs,
			id: id
		};
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {className} = this.props;
		const {id} = this.state;

		return <div className={`general-form${typeof (className) !== 'undefined' ? ` ${className}` : ''}`} id={id}>
			{this.RenderInputs (id)}
		</div>;
	}

	/**
	 * Render inputs based on parameters.
	 */
	RenderInputs (id) {
		const inputs = this.state.formData;
		let children = [];

		if (typeof (inputs) === 'object') {
			for (let index in inputs) {
				if (inputs.hasOwnProperty (index)) {
					const input = inputs [index];

					input.name = index;
					input.onChange = this.ValueChanged.bind (this);

					switch (input.type) {
						case 'text':
							children.push (<TextInput key={`${id}-${index}`} id={`${id}-${index}`} {...input}/>);
							break;
						case 'email':
							children.push (<EmailInput key={`${id}-${index}`} id={`${id}-${index}`} {...input}/>);
							break;
						case 'textarea':
							children.push (<Textarea key={`${id}-${index}`} id={`${id}-${index}`} {...input}/>);
							break;
						case 'checkbox':
							children.push (<Checkbox key={`${id}-${index}`} id={`${id}-${index}`} {...input}/>);
							break;
						default:
							throw Error ('Unsupported form input type');
					}
				}
			}
		}

		return children;
	}

	/**
	 * Update value of input.
	 */
	ValueChanged (input, value) {
		let formData = this.state.formData;

		formData [input].value = value;

		this.setState ({
			formData: formData
		});
	}

	/**
	 * Validate formData.
	 */
	Validate () {
		const inputs = this.state.formData;
		let valid = true;

		if (typeof (inputs) === 'object') {
			for (let index in inputs) {
				if (inputs.hasOwnProperty (index)) {
					const input = inputs [index];

					if (typeof (input.error) !== 'undefined') {
						delete input.error;
					}

					if (typeof (input.required) !== 'undefined' && input.required) {
						if (input.type === 'checkbox') {
							if (!input.value) {
								input.error = `${input.label} is required field.`;
								valid = false;
							}
						} else {
							if (input.value.length === 0) {
								input.error = `${input.label} is required field.`;
								valid = false;
							}
						}
					}

					if (input.value.length > 0) {
						switch (input.type) {
							case 'email':
								if (!emailValidator.validate (input.value)) {
									input.error = `${input.label} is not valid email address.`;
									valid = false;
								}
								break;
							default:
								//do nothing
								break;
						}
					}
				}
			}
		}

		this.setState ({
			formData: inputs
		});

		return valid;
	}

	/**
	 * Submit the form, first validate, then send values to callback.
	 */
	Submit () {
		if (this.Validate ()) {
			this.props.onSubmit (window.TCH.Main.Utils.Object.Map (this.state.formData, element => {
				return element.value;
			}));
		}
	}
}

export default Form;
