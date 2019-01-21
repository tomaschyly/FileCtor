/* eslint-disable no-whitespace-before-property */
import React, { Component } from 'react';

class Files extends Component {
	/**
	 * Files initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			contents: undefined
		};
	}

	/**
	 * Render the component into html.
	 */
	render () {
		let contents = [];

		if (typeof (this.state.contents) !== 'undefined' && Array.isArray (this.state.contents)) {
			for (let index in this.state.contents) {
				let row = [];

				row.push (<div className="tch-grid-col" key={`${this.state.contents [index].reactId}-${0}`}>{this.state.contents [index].name}</div>);

				contents.push (<div className="tch-grid-col" key={this.state.contents [index].reactId}>{row}</div>);
			}
		}

		return <div className="tch-grid">
			<div className="tch-grid-body">{contents}</div>
		</div>;
	}
}

export default Files;
