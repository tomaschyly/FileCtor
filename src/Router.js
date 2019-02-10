import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import FileInspector from './view/FileInspector';
import Snippet from './view/Snippet';
import About from './view/About';
import Console from './view/Console';
import Reference from './view/Reference';

class Router extends Component {
	/**
	 * Render the component into html.
	 */
	render () {
		return <Switch>
			<Route exact path="/" component={FileInspector} />
			<Route path="/snippet" component={Snippet} />
			<Route path="/about" component={About} />
			<Route path="/console" component={Console} />
			<Route path="/reference" component={Reference} />
		</Switch>;
	}
}

export default Router;
