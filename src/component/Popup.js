import './popup.css';
import {ReactComponent as Cog} from '../icon/cog.svg';

import React, {Component} from 'react';
import Button from './Button';
import CSSTransition from 'react-transition-group/CSSTransition';

class Popup extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		const {close, acceptClassName, accept, loading} = this.props;

		let acceptContent = typeof (accept) !== 'undefined' ? accept : 'Accept';
		if (loading) {
			acceptContent = <Cog className="spin"/>;
		}

		return <CSSTransition in={this.props.visible} timeout={400} classNames="general-flex-fade">
			<div className={`general-popup-container${typeof (this.props.className) !== 'undefined' ? ` ${this.props.className}` : ''} general-flex-fade`}>
				<div className="general-popup">
					<div className="general-popup-header">
						<h2>{typeof (this.props.headline) !== 'undefined' ? this.props.headline : ''}</h2>
					</div>

					<div className="general-popup-content">{typeof (this.props.content) !== 'undefined' ? this.props.content : ''}</div>

					<div className="general-popup-footer">
						<Button type="button" className="button general-popup-close" onClick={this.Close.bind (this)}>{typeof (close) !== 'undefined' ? close : 'Close'}</Button>
						<Button type="button" className={`button general-popup-confirm f-right${this.props.acceptVisible ? '' : ' hidden'}${typeof (acceptClassName) !== 'undefined' ? ` ${acceptClassName}` : ''}`} onClick={this.Accept.bind (this)}>
							{acceptContent}
						</Button>
					</div>
				</div>
			</div>
		</CSSTransition>;
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
