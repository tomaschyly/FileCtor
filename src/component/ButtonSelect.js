/* eslint-disable no-whitespace-before-property */
import './buttonSelect.css';

import React, { Component } from 'react';

window.ButtonSelect_static = {
	globalHideOptionsListener: undefined,
	buttonSelects: []
};

class ButtonSelect extends Component {
	/**
	 * ButtonSelect initialization.
	 */
	constructor (props) {
		super (props);

		if (typeof (window.ButtonSelect_static.globalHideOptionsListener) === 'undefined') {
			window.ButtonSelect_static.globalHideOptionsListener = ButtonSelect.GlobalHideAllOptions;
			document.querySelector ('body').addEventListener ('click', window.ButtonSelect_static.globalHideOptionsListener);
		}
		window.ButtonSelect_static.buttonSelects.push (this);

		this.container = undefined;

		this.state = {
			options: props.options,
			optionsVisible: false
		};
	}

	/**
	 * Component was updated.
	 */
	componentDidUpdate () {
		if (this.state.optionsVisible) {
			this.OptionsPosition ();
		}
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		let myIndex = window.ButtonSelect_static.buttonSelects.indexOf (this);
		if (myIndex >= 0) {
			window.ButtonSelect_static.buttonSelects.splice (myIndex, 1);
		}

		this.container = undefined;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		let options = [];
		if (typeof (this.state.options) !== 'undefined' && Array.isArray (this.state.options)) {
			for (let index in this.state.options) {
				let rowData = this.state.options [index];

				options.push (<button type="button" key={rowData.id} data-value={rowData.value} onClick={this.SelectOption.bind (this)}>{rowData.label}</button>);
			}
		}

		this.container = React.createRef ();

		return <div ref={this.container} className={`button-select-container ${this.props.className}`}>
			<button className="button icon" type="button" onClick={this.ToggleOptions.bind (this)}>{this.props.icon}</button>
			<div className={`button-select-list${this.state.optionsVisible ? ' visible' : ''}`}>{options}</div>
		</div>;
	}

	/**
	 * Toggle options visibility.
	 */
	ToggleOptions () {
		this.setState ({
			optionsVisible: !this.state.optionsVisible
		});
	}

	/**
	 * Hide options of all ButtonSelects.
	 */
	static GlobalHideAllOptions (e) {
		let current = e.target.classList.contains ('button-select-container') ? e.target : null;
		if (current === null) {
			current = window.TCH.Main.Utils.FindNearestParent (e.target, 'button-select-container');
		}

		for (let index in window.ButtonSelect_static.buttonSelects) {
			if (current !== null && window.ButtonSelect_static.buttonSelects [index].container.current === current) {
				continue;
			}

			window.ButtonSelect_static.buttonSelects [index].setState ({
				optionsVisible: false
			});
		}
	}

	/**
	 * Set correct position to options.
	 */
	OptionsPosition () {
		let list = this.container.current.querySelector ('.button-select-list');
		list.style.opacity = 0;

		setTimeout (() => {
			let containerWidth = this.container.current.offsetWidth;
			let containerLeft = this.container.current.offsetLeft;
			let containerHeight = this.container.current.offsetHeight;
			let containerTop = this.container.current.offsetTop;

			list.style.width = '';
			list.style.left = '0px';
			let listWidth = list.offsetWidth;

			list.style.width = `${listWidth}px`;
			list.style.left = `${containerLeft + (containerWidth / 2) - (list.offsetWidth / 2)}px`;
			list.style.top = `${containerHeight + containerTop - 4}px`;
			list.style.opacity = 1;

			let overflowX = document.getElementById ('content').offsetWidth - list.offsetWidth - list.offsetLeft;
			
			if (overflowX < 0) {
				list.style.left = `${containerLeft + (containerWidth / 2) - (list.offsetWidth / 2) - Math.abs (overflowX)}px`;
			}
		}, 1);
	}

	/**
	 * Select item from options.
	 */
	SelectOption (e) {
		if (typeof (this.props.onSelectItem) === 'function') {
			this.props.onSelectItem (e);
		}

		this.setState ({
			optionsVisible: false
		});
	}
}

export default ButtonSelect;
