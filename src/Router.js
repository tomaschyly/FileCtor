import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import FileInspector from './view/FileInspector';
import Snippet from './view/Snippet';
import About from './view/About';

class Router extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		return <Switch>
			<Route exact path="/" component={FileInspector} />
			<Route path="/snippet" component={Snippet} />
			<Route path="/about" component={About} />
		</Switch>;
	}
}

export default Router;
