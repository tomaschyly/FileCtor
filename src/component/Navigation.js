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
							<nav>
								<div className="dummy" />
								<NavLink exact to="/" className="button">Files</NavLink>
								<NavLink to="/snippet" className="button">Snippets</NavLink>
								<NavLink to="/about" className="button">About</NavLink>
								<div className="dummy" />
							</nav>
						</div>
					</div>
				</div>
			</div>;
		}
	}

	/**
	 * Disable TitleBar.
	 */
	Disable () {
		this.setState ({disabled: true});

		document.getElementById ('app').classList.add ('navigation-disabled');
	}
}

export default Navigation;
