import './navigation.css';

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class Navigation extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		return <div className="container">
			<div className="row">
				<div className="col-10">
					<div className="panel no-white header-panel">
						<nav>
							<NavLink exact to="/" className="button">Files</NavLink>
							<NavLink to="/snippet" className="button">Snippets</NavLink>
							<NavLink to="/about" className="button">About</NavLink>
						</nav>
					</div>
				</div>
			</div>
		</div>;
	}
}

export default Navigation;
