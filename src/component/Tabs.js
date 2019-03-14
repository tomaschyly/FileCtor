/* eslint-disable no-whitespace-before-property */
import './tabs.css';
import { ReactComponent as Plus } from '../icon/plus.svg';
import { ReactComponent as CaretDown } from '../icon/caret-down.svg';

import React, { Component } from 'react';
import Button from './Button';
import Navigation from './tabs/Navigation';
import Content from './tabs/Content';
import ButtonSelect from './ButtonSelect';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

const uuidV4 = window.require ('uuid/v4');
const extend = window.require ('extend');

class Tabs extends Component {
	/**
	 * Tabs initialization.
	 */
	constructor (props) {
		super (props);

		this.onResizeListener = undefined;

		let tabs = [];
		let selectedTab = undefined;

		if (typeof (this.props.startTabs) !== 'undefined' && this.props.startTabs !== null && Array.isArray (this.props.startTabs)) {
			for (let i = 0; i < this.props.startTabs.length; i++) {
				tabs.push (this.AddTab (this.props.startTabs [i]));

				if (typeof (this.props.startSelectedTab) !== 'undefined' && this.props.startTabs [i].id === this.props.startSelectedTab) {
					selectedTab = this.props.startSelectedTab;
				}
			}
		} else {
			let startWith = typeof (props.startWith) !== 'undefined' ? parseInt (props.startWith) : 0;
			if (tabs.length < startWith) {
				for (let i = 0; i < startWith; i++) {
					tabs.push (this.AddTab ());
				}
			}
		}

		if (typeof (selectedTab) === 'undefined') {
			selectedTab = tabs.length > 0 ? tabs [0].id : undefined;
		}

		this.state = {
			tabs: tabs,
			selectedTab: selectedTab,
			additionalTabs: []
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		if (typeof (this.props.onTabSelected) === 'function') {
			this.props.onTabSelected (this.SelectedTabParams ());
		}

		this.NavigationAdditionalList ();
		document.fonts.ready.then (this.NavigationAdditionalList.bind (this));
		this.onResizeListener = this.NavigationAdditionalList.bind (this);
		window.addEventListener ('resize', this.onResizeListener);

		this.UpdateActiveNavigation ();
	}

	/**
	 * Component was updated.
	 */
	componentDidUpdate () {
		if (typeof (this.props.onTabSelected) === 'function') {
			this.props.onTabSelected (this.SelectedTabParams ());
		}

		this.NavigationAdditionalList ();

		this.UpdateActiveNavigation ();

		if (typeof (this.props.tabsSave) === 'function') {
			this.props.tabsSave (this.state.tabs, this.state.selectedTab);
		}
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		window.removeEventListener ('resize', this.onResizeListener);
		this.onResizeListener = undefined;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <div className="container">
			<div className="row">
				<div className="col-10">
					<div className="tabs">
						{this.RenderNavigation ()}

						{this.RenderContent ()}
					</div>
				</div>
			</div>
		</div>;
	}

	/**
	 * Render Tabs navigation.
	 */
	RenderNavigation () {
		let navigation = [];
		const duration = 400;

		for (let index in this.state.tabs) {
			if (this.state.tabs.hasOwnProperty (index)) {
				navigation.push (<CSSTransition key={this.state.tabs [index].id} timeout={duration} classNames="general-fade" onExited={this.NavigationAdditionalList.bind (this)}>
					<Navigation className="general-fade" params={this.state.tabs [index]} selectCallback={this.SelectTabNavigation.bind (this)} removeCallback={this.RemoveTabNavigation.bind (this)} />
				</CSSTransition>);
			}
		}

		return <div className="panel no-white">
			<div className="tch-tabs-navigation">
				<TransitionGroup className="tch-tabs-navigation-items" appear>
					{navigation}
				</TransitionGroup>

				<Button type="button" className="button icon tch-tabs-navigation-add" onClick={this.AddTabNavigation.bind (this)}><Plus /></Button>

				<CSSTransition in={this.state.additionalTabs.length > 0} timeout={duration} classNames="general-fade">
					<ButtonSelect className="tch-tabs-navigation-additional general-fade" icon={<CaretDown />} options={this.state.additionalTabs} onSelectItem={this.SelectTabAdditional.bind (this)} />
				</CSSTransition>
			</div>
		</div>;
	}

	/**
	 * Check if should show button for additional tabs and move them to list.
	 */
	NavigationAdditionalList () {
		let navigation = document.querySelector ('.tch-tabs-navigation');
		navigation.classList.remove ('fill');
		let navigationItems = document.querySelectorAll ('.tch-tabs-navigation-item');
		navigationItems = Array.from (navigationItems);

		let totalWidth = 0;
		for (let i = 0; i < navigationItems.length; i++) {
			navigationItems [i].style.display = '';
			totalWidth += navigationItems [i].offsetWidth;
		}

		let maxWidth = document.querySelector ('.tch-tabs-navigation').offsetWidth;
		maxWidth -= document.querySelector ('.tch-tabs-navigation-add').offsetWidth;

		let additionalButton = document.querySelector ('.tch-tabs-navigation-additional');
		additionalButton.style.display = 'block';
		maxWidth -= additionalButton.offsetWidth;
		
		let additionalItems = [];
		if (totalWidth > maxWidth) {
			while (totalWidth > maxWidth) {
				let lastItem = navigationItems.pop ();

				totalWidth -= lastItem.offsetWidth;
				lastItem.style.display = 'none';

				additionalItems.push (lastItem);
			}
		}

		if (additionalItems.length > 0) {
			navigation.classList.add ('fill');
			additionalButton.style.display = '';

			let options = [];
			for (let i = 0; i < additionalItems.length; i++) {
				for (let index in this.state.tabs) {
					if (this.state.tabs [index].id === additionalItems [i].dataset.id) {
						let params = this.state.tabs [index];
						
						options.push ({
							id: `tch-tabs-navigation-additional-${params.id}`,
							value: params.id,
							label: params.title
						});
						break;
					}
				}
			}

			let update = false;
			for (let i = 0; i < options.length; i++) {
				const _option = options [i];

				for (let j = 0; j < this.state.additionalTabs.length; j++) {
					if (_option.id === this.state.additionalTabs [j].id && _option.label !== this.state.additionalTabs [j].label) {
						update = true;
					}
				}
			}

			if (this.state.additionalTabs.length !== options.length || update) {
				this.setState ({
					additionalTabs: options
				});
			}
		} else {
			additionalButton.style.display = '';
			if (this.state.additionalTabs.length !== 0) {
				this.setState ({
					additionalTabs: []
				});
			}
		}
	}

	/**
	 * Render Tabs content.
	 */
	RenderContent () {
		if (typeof (this.state.selectedTab) === 'undefined') {
			return '';
		} else {
			return <Content params={this.SelectedTabParams ()} />;
		}
	}

	/**
	 * Add new Tab.
	 */
	AddTab (startParams = null) {
		let params = startParams !== null ? startParams : {
			id: uuidV4 (),
			tag: undefined,
			title: undefined,
			content: undefined
		};

		params = extend (params, this.props.tabParameters (params));

		return params;
	}

	/**
	 * Add new Tab from Navigation.
	 */
	AddTabNavigation () {
		let tabs = this.state.tabs;

		let params = this.AddTab ();
		tabs.push (params);

		this.setState ({
			tabs: tabs,
			selectedTab: typeof (this.state.selectedTab) === 'undefined' ? params.id : this.state.selectedTab
		});
	}

	/**
	 * Remove Tab from Navigation.
	 */
	RemoveTabNavigation (e) {
		e.stopPropagation ();

		let target = e.target;
		if (target.tagName !== 'svg') {
			target = window.TCH.Main.Utils.FindNearestParent (target, undefined, 'svg');
		}

		let id = target.dataset.id;

		let newTabs = [];
		for (let index in this.state.tabs) {
			if (this.state.tabs [index].id !== id) {
				newTabs.push (this.state.tabs [index]);
			}
		}

		this.setState ({tabs: newTabs});

		if (id === this.state.selectedTab) {
			this.setState ({selectedTab: newTabs.length > 0 ? newTabs [0].id : undefined});
		}
	}

	/**
	 * Select Tab from Navigation.
	 */
	SelectTabNavigation (e) {
		console.log (e); //TODO remove
		let id = typeof (e) !== 'undefined' ? e.target.dataset.id : undefined;

		this.setState ({selectedTab: id});
	}

	/**
	 * Select Tab from additional tabs.
	 */
	SelectTabAdditional (e) {
		let id = e.target.dataset.value;

		this.setState ({selectedTab: id});
	}

	/**
	 * Update Tab Navigation to show correct active Tab.
	 */
	UpdateActiveNavigation () {
		let items = document.querySelectorAll ('.tch-tabs-navigation-item');

		for (let index in items) {
			if (items.hasOwnProperty (index)) {
				if (items [index].dataset.id === this.state.selectedTab) {
					items [index].classList.add ('active');
				} else {
					items [index].classList.remove ('active');
				}
			}
		}
	}

	/**
	 * Get params of selected Tab.
	 */
	SelectedTabParams () {
		let params = undefined;

		if (typeof (this.state.selectedTab) !== 'undefined') {
			for (let index in this.state.tabs) {
				if (this.state.tabs [index].id === this.state.selectedTab) {
					params = this.state.tabs [index];
					break;
				}
			}
		}

		return params;
	}
}

export default Tabs;
