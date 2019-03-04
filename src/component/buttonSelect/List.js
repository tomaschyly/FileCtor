/* eslint-disable no-whitespace-before-property */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import CSSTransition from 'react-transition-group/CSSTransition';

class List extends Component {
	/**
	 * List initialization.
	 */
	constructor (props) {
		super (props);

		this.container = undefined;

		const root = document.getElementById ('button-select-lists');
		if (root === null) {
			const element = document.createElement ('div');
			element.id = 'button-select-lists';

			document.querySelector ('body').appendChild (element);
		}
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		this.container = undefined;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		let options = [];
		if (typeof (this.props.options) !== 'undefined' && Array.isArray (this.props.options)) {
			for (let index in this.props.options) {
				if (this.props.options.hasOwnProperty (index)) {
					let rowData = this.props.options [index];

					options.push (<button type="button" key={rowData.id} data-value={rowData.value} onClick={this.props.onClickItem}>{rowData.label}</button>);
				}
			}
		}

		this.container = React.createRef ();

		return ReactDOM.createPortal (
			<CSSTransition in={this.props.visible} timeout={400} classNames="general-fade">
				<div ref={this.container} className="button-select-list general-fade">{options}</div>
			</CSSTransition>,
			document.getElementById ('button-select-lists')
		);
	}
}

export default List;
