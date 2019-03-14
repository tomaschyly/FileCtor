/* eslint-disable no-whitespace-before-property */
import './buttonSelect.css';

import React, { Component } from 'react';
import Button from './Button';
import List from './buttonSelect/List';

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
			window.addEventListener ('resize', window.ButtonSelect_static.globalHideOptionsListener);
		}
		window.ButtonSelect_static.buttonSelects.push (this);

		this.container = undefined;
		this.list = undefined;

		this.state = {
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
		this.list = undefined;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		let current = typeof (this.props.icon) !== 'undefined' ? this.props.icon : this.props.value;

		this.container = React.createRef ();
		this.list = React.createRef ();

		return <div ref={this.container} className={`button-select-container ${typeof (this.props.className) !== 'undefined' ? this.props.className : ''}`}>
			<Button className="button icon" type="button" onClick={this.ToggleOptions.bind (this)}>{current}</Button>

			<List ref={this.list} options={this.props.options} visible={this.state.optionsVisible} onClickItem={this.SelectOption.bind (this)}/>
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
		let current = typeof (e.target) !== 'undefined' && typeof (e.target.classList) !== 'undefined' && e.target.classList.contains ('button-select-container') ? e.target : null;
		if (current === null && typeof (e.target) !== 'undefined' && typeof (e.target.classList) !== 'undefined') {
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
		const container = this.container.current;
		const list = this.list.current.container.current;

		list.style.left = '';
		list.style.top = '';

		const containerOffset = container.getBoundingClientRect ();
		const listOffset = list.getBoundingClientRect ();

		let x = containerOffset.x + (containerOffset.width / 2) - (listOffset.width / 2);
		let y = containerOffset.y + containerOffset.height;

		const overflowX = window.innerWidth - listOffset.width - x - 2;
		if (overflowX < 0) {
			x = x - Math.abs (overflowX);
		}

		const overflowY = window.innerHeight - listOffset.height - y - 2;
		if (overflowY < 0) {
			y = y - Math.abs (overflowY);
		}

		list.style.left = `${x}px`;
		list.style.top = `${y}px`;
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
