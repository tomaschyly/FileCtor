import React, {Component} from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';

class TextInput extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		const {className, name, label, value, description, error, errorMessage} = this.props;
		let {id} = this.props;

		if (typeof (id) === 'undefined') {
			id = name;
		}

		const descriptionJsx = description ? (
			<div className="general-form-description">
				{description}
			</div>
		) : null;

		return <div className={`general-form-input${typeof (className) !== 'undefined' ? ` ${className}` : ''}`}>
			<label htmlFor={id}>{label}</label>
			<input type="text" name={name} id={id} value={value} onChange={this.OnChange.bind (this)}/>

			{descriptionJsx}

			<CSSTransition in={typeof (error) !== 'undefined' && error} timeout={400} classNames="general-fade">
				<p className="general-form-error general-fade">{errorMessage}</p>
			</CSSTransition>
		</div>;
	}

	/**
	 * OnChange update value of formData.
	 */
	OnChange (e) {
		this.props.onChange (this.props.name, e.target.value);
	}
}

export default TextInput;
