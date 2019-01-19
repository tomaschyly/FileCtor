import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import FileInspector from './view/FileInspector';

class Router extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		return <Switch>
			<Route exact path="/" component={FileInspector} />
		</Switch>;
	}
}

export default Router;
