import './navigation.css';

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class Navigation extends Component {
	/**
	 * Navigation initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			disabled: false
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.navigation = this;
	}

	/**
	 * Will be removed from DOM.
	 */
	componentWillUnmount () {
		window.TCH.Main.navigation = null;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		if (this.state.disabled) {
			return '';
		} else {
			return <div className="container">
				<div className="row">
					<div className="col-10">
						<div className="panel no-white header-panel">
							<nav id="navigation">
								<div className="dummy" />
								<NavLink exact to="/" className="button" onClick={this.OnClick.bind (this)}>Files</NavLink>
								<NavLink to="/snippet" className="button" onClick={this.OnClick.bind (this)}>Snippets</NavLink>
								<NavLink to="/settings" className="button" onClick={this.OnClick.bind (this)}>Settings</NavLink>
								<NavLink to="/about" className="button" onClick={this.OnClick.bind (this)}>About</NavLink>
								<div className="dummy" />
							</nav>
						</div>
					</div>
				</div>
			</div>;
		}
	}

	/**
	 * OnClick remove focus.
	 */
	OnClick () {
		setTimeout (() => {
			try {
				document.getElementById ('navigation').querySelector (':focus').blur ();
			} catch (e) {
				console.error (e);
			}
		}, 400);
	}

	/**
	 * Disable TitleBar.
	 */
	Disable () {
		this.setState ({disabled: true});

		window.TCH.Main.app.ToggleClass ('navigation-disabled');
	}
}

export default Navigation;
