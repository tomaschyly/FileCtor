import React, {Component} from 'react';

class Textarea extends Component {
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

		return <div className={`general-form-textarea${typeof (className) !== 'undefined' ? ` ${className}` : ''}`}>
			<label htmlFor={id}>{label}</label>
			<textarea name={name} id={id} value={value} onChange={this.OnChange.bind (this)}/>
			{errorLabel}
		</div>;
	}

	/**
	 * OnChange update value of formData.
	 */
	OnChange (e) {
		this.props.onChange (this.props.name, e.target.value);
	}
}

export default Textarea;
