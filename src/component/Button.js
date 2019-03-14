import React, {Component} from 'react';

class Button extends Component {
	/**
	 * Button initialization.
	 */
	constructor (props) {
		super (props);

		this.button = undefined;
		this.blurTimeout = null;
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		this.button = undefined;

		if (this.blurTimeout !== null) {
			clearTimeout (this.blurTimeout);
			this.blurTimeout = null;
		}
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {type, children} = this.props;

		this.button = React.createRef ();

		return <button {...this.props} ref={this.button} type={typeof (type) !== 'undefined' ? type : 'button'} onClick={this.OnClick.bind (this)}>
			{children}
		</button>;
	}

	/**
	 * OnClick execute onClick action of present and remove focus.
	 */
	OnClick (e) {
		if (typeof (this.props.onClick) !== 'undefined') {
			this.props.onClick (e);
		}

		if (this.blurTimeout !== null) {
			clearTimeout (this.blurTimeout);
			this.blurTimeout = null;
		}

		this.blurTimeout = setTimeout (() => {
			if (typeof (this.button) !== 'undefined') {
				this.button.current.blur ();
			}
		}, 400);
	}
}

export default Button;
