/* eslint-disable no-whitespace-before-property */
import './tabs.css';
import { ReactComponent as Plus } from '../icon/plus.svg';

import React, { Component } from 'react';
import Navigation from './tabs/Navigation';
import Content from './tabs/Content';

const uuidV4 = window.require ('uuid/v4');
const extend = window.require ('extend');

class Tabs extends Component {
	/**
	 * Tabs initialization.
	 */
	constructor (props) {
		super (props);

		let startWith = typeof (props.startWith) !== 'undefined' ? parseInt (props.startWith) : 0;
		let tabs = [];
		if (tabs.length < startWith) {
			for (let i = 0; i < startWith; i++) {
				tabs.push (this.AddTab ());
			}
		}

		let selectedTab = tabs.length > 0 ? tabs [0].id : undefined;

		this.state = {
			tabs: tabs,
			selectedTab: selectedTab
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		if (typeof (this.props.onTabSelected) === 'function') {
			this.props.onTabSelected (this.SelectedTabParams ());
		}
	}

	/**
	 * Component was updated.
	 */
	componentDidUpdate () {
		if (typeof (this.props.onTabSelected) === 'function') {
			this.props.onTabSelected (this.SelectedTabParams ());
		}
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

		for (let index in this.state.tabs) {
			navigation.push (<Navigation key={this.state.tabs [index].id} params={this.state.tabs [index]} selectCallback={this.SelectTabNavigation.bind (this)} removeCallback={this.RemoveTabNavigation.bind (this)} />);
		}

		return <div className="panel no-white">
			<div className="tch-tabs-navigation">
				{navigation}
				<button type="button" className="button icon" onClick={this.AddTabNavigation.bind (this)}><Plus /></button>
			</div>
		</div>;
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
	AddTab () {
		let params = {
			id: uuidV4 (),
			tag: undefined,
			title: 'Tab',
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

		let id = e.target.dataset.id;

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
		let id = typeof (e) !== 'undefined' ? e.target.dataset.id : undefined;

		this.setState ({selectedTab: id});
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
