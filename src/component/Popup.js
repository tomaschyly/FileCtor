import './popup.css';

import React, {Component} from 'react';

class Popup extends Component {
	/**
	 * Popup initialization.
	 */
	constructor (props) {
		super (props);

		this.headline = typeof (this.props.headline) !== 'undefined' ? this.props.headline : '';

		this.close = typeof (this.props.close) !== 'undefined' ? this.props.close : 'Close';

		this.accept = typeof (this.props.accept) !== 'undefined' ? this.props.accept : 'Accept';
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <div className={`general-popup-container${this.props.visible ? ' visible' : ''}${typeof (this.props.className) !== 'undefined' ? ` ${this.props.className}` : ''}`}>
			<div className="general-popup">
				<div className="general-popup-header">
					<h2>{this.headline}</h2>
				</div>

				<div className="general-popup-content">{typeof (this.props.content) !== 'undefined' ? this.props.content : ''}</div>

				<div className="general-popup-footer">
					<button type="button" className="button general-popup-close" onClick={this.Close.bind (this)}>{this.close}</button>
					<button type="button" className={`button general-popup-confirm f-right${this.props.acceptVisible ? '' : ' hidden'}`} onClick={this.Accept.bind (this)}>{this.accept}</button>
				</div>
			</div>
		</div>;
	}

	/**
	 * Close the popup.
	 */
	Close () {
		if (typeof (this.props.onClose) === 'function') {
			this.props.onClose ();
		}
	}

	/**
	 * Accept the popup.
	 */
	Accept () {
		if (typeof (this.props.onAccept) === 'function') {
			this.props.onAccept ();
		}
	}
}

export default Popup;
