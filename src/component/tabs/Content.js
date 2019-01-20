import React, { Component } from 'react';

class Content extends Component {
	/**
	 * Content the component into html.
	 */
	render () {
		return <div className="panel tabs-panel">
			{this.props.params.content (this.props.params)}
		</div>;
	}
}

export default Content;
